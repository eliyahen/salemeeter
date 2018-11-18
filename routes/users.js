const express = require('express');
const omit = require('lodash/omit');
const authorizeMiddleware = require('./helpers/auth.middleware').authorize;
const asyncErrorHandler = require('./helpers/error.decorator').asyncErrorHandler;
const dbUtils = require('../db/utils');
const validators = require('../utils/validators');
const commonValidators = require('../utils/validators.common');
const applyDocumentSchema = require('../utils/schema').applyDocumentSchema;
const usersModel = require('../models/users.model');

const router = express.Router({strict: true});

const userSchema = [
    'email', 'password', 'name', 'firstName', 'lastName',
];

router.get('/me', (req, res) => {
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        res.sendStatus(401);
    }
});

router.get('/:uid', authorizeMiddleware(), asyncErrorHandler(async (req, res) => {
    const uid = req.params.uid;
    const user = await usersModel.findOne({_id: dbUtils.ObjectId(uid)}, {password: false});
    if (user) {
        res.status(200).json(user);
    } else {
        res.sendStatus(404);
    }
}));

router.post('/', authorizeMiddleware(), asyncErrorHandler(async (req, res) => {
    const userData = applyDocumentSchema({schema: userSchema}, req.body);

    const errors = validators.validate(userData,
        validators.createValidator({
            email: commonValidators.requiredNotEmpty(),
            firstName: commonValidators.requiredNotEmpty(),
            password: commonValidators.requiredNotEmpty(),
        })
    );

    if (errors) {
        res.status(400).json(errors);
        return;
    }
        
    // check that email doesn't yet exist
    if (await usersModel.findOne({email: userData.email}, {_id: true})) {
        res.sendStatus(409);
        return;
    }

    // update user fields before save
    userData.name = [userData.firstName, userData.lastName].join(' ');
    userData.password = usersModel.encryptPassword(userData.password);
    
    const user = await usersModel.insert(userData);
    
    res.status(201).json(omit(user, ['password']));
}));

module.exports = router;

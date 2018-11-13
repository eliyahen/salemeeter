const express = require('express');
const pick = require('lodash/pick');
const omit = require('lodash/omit');
const authorizeMiddleware = require('./helpers/auth.middleware').authorize;
const asyncErrorHandler = require('./helpers/error.decorator').asyncErrorHandler;
const dbUtils = require('../db/utils');
const usersModel = require('../models/users.model');

const router = express.Router({strict: true});

router.get('/me', (req, res) => {
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        res.sendStatus(401);
    }
});

router.get('/:uid', asyncErrorHandler(async (req, res) => {
    const uid = req.params.uid;
    const user = await usersModel.findOne({_id: dbUtils.ObjectId(uid)}, {password: false});
    if (user) {
        res.status(200).json(user);
    } else {
        res.sendStatus(404);
    }
}));

router.post('/', authorizeMiddleware(), asyncErrorHandler(async (req, res) => {
    const userData = pick(req.body, ['email', 'firstName', 'lastName', 'password']);

    // check that email doesn't yet exist
    const existingUser = await usersModel.findOne({email: userData.email}, {_id: true});
    if (existingUser) {
        res.sendStatus(409);
        return;
    }
    
    // validate user data
    const errors = {};
    if (!userData.email) {
        errors.email = '"email" is required.';
    }
    if (!userData.firstName) {
        errors.firstName = '"firstName" is required.';
    }
    if (!userData.password) {
        errors.password = '"password" is required.';
    }
    if (Object.keys(errors).length) {
        res.status(403).json(errors);
        return;
    }
    
    // update user fields before save
    userData.name = [userData.firstName, userData.lastName].join(' ');
    userData.password = usersModel.encryptPassword(userData.password);
    
    const user = await usersModel.insert(userData);
    
    res.status(201).json(omit(user, ['password']));
}));

module.exports = router;

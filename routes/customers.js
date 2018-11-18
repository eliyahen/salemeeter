const express = require('express');
const authorizeMiddleware = require('./helpers/auth.middleware').authorize;
const asyncErrorHandler = require('./helpers/error.decorator').asyncErrorHandler;
const dbUtils = require('../db/utils');
const validators = require('../utils/validators');
const applyDocumentSchema = require('../utils/schema').applyDocumentSchema;
const commonValidators = require('../utils/validators.common');
const customersModel = require('../models/customers.model');

const router = express.Router({strict: true});

customerSchema = [
    'name', 'address',
    ['contacts', {isArray: true, schema: ['type', 'contact', 'info']}],
];

router.get('/:uid', asyncErrorHandler(async (req, res) => {
    const uid = req.params.uid;
    const customer = await customersModel.findOne({_id: dbUtils.ObjectId(uid)});
    if (customer) {
        res.status(200).json(customer);
    } else {
        res.sendStatus(404);
    }
}));

router.post('/', authorizeMiddleware(), asyncErrorHandler(async (req, res) => {
    const customerData = applyDocumentSchema({schema: customerSchema}, req.body);
    
    const errors = validators.validate(customerData,
        validators.createValidator({
            name: commonValidators.notEmpty(),
            contacts: [commonValidators.validateIfExists(validators.createValidator({
                type: commonValidators.oneOf(['phone', 'email', 'other']),
                contact: commonValidators.notEmpty(),
            }))]
        })
    );

    if (errors) {
        res.status(400).json(errors);
    } else {
        // check that customer name doesn't yet exist
        if (await customersModel.findOne({name: customerData.name}, {_id: true})) {
            res.sendStatus(409);
            return;
        }

        const customer = await customersModel.insert(customerData);
        res.status(201).json(customer);
    }
}));

module.exports = router;

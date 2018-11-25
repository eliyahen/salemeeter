const express = require('express');
const authorizeMiddleware = require('./helpers/auth.middleware').authorize;
const asyncErrorHandler = require('./helpers/error.decorator').asyncErrorHandler;
const dbUtils = require('../db/utils');
const validators = require('../utils/validators');
const applyDocumentSchema = require('../utils/schema').applyDocumentSchema;
const commonValidators = require('../utils/validators.common');
const dealsModel = require('../models/deals.model');
const customersModel = require('../models/customers.model');

const router = express.Router({strict: true});

dealSchema = [
    'userId', 'customerId',
    'totalAmount', 'brand', 'datetime',
    ['payments', {isArray: true, schema: ['amount', 'datetime', 'form']}],
];

router.get('/:id', authorizeMiddleware(), asyncErrorHandler(async (req, res) => {
    const id = req.params.id;
    const customer = await dealsModel.findOne({_id: dbUtils.ObjectId(id), userId: req.user.id});
    if (customer) {
        res.status(200).json(customer);
    } else {
        res.sendStatus(404);
    }
}));

router.post('/', authorizeMiddleware(), asyncErrorHandler(async (req, res) => {
    let dealData = applyDocumentSchema({schema: dealSchema}, req.body, {
        datetime: new Date(),
        payments: [],
    });

    dealData = Object.assign({
        datetime: new Date(),
        payments: [],
    }, dealData);
    dealData.payments = dealData.payments.map((payment) => Object.assign({}, {
        datetime: new Date(),
    }, payment));

    let errors = validators.validate(dealData,
        validators.createValidator({
            customerId: commonValidators.requiredNotEmpty(),
            totalAmount: commonValidators.requiredNotEmpty(),
            brand: commonValidators.oneOf(['kitchen', 'accessories', 'other']),
            datetime: commonValidators.requiredNotEmpty(),
            payments: [commonValidators.validateIfExists(validators.createValidator({
                amount: commonValidators.requiredNotEmpty(),
                form: commonValidators.oneOf(['cash', 'creditCard', 'check']),
                datetime: commonValidators.requiredNotEmpty(),
            }))]
        })
    );

    // fetch customer
    let customer = null;
    if (!errors) {
        const customerId = dbUtils.ObjectId(dealData.customerId);
        customer = await customersModel.findOne({_id: customerId});
        if (!customer) {
            errors = validators.mergeErrors(errors, {
                customerId: `Customer '${customerId}' was not found.`,
            });
        }
    }

    if (errors) {
        res.status(400).json(errors);
    } else {
        const deal = await dealsModel.insert(dealData);
        
        res.status(201).json(deal);
    }
}));

module.exports = router;

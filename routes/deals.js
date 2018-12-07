const express = require('express');
const authorizeMiddleware = require('./helpers/auth.middleware').authorize;
const asyncErrorHandler = require('./helpers/error.decorator').asyncErrorHandler;
const dbUtils = require('../db/utils');
const validators = require('../utils/validators');
const applyDocumentSchema = require('../utils/schema').applyDocumentSchema;
const getQuerySearch = require('../utils/search').getQuerySearch;
const commonValidators = require('../utils/validators.common');
const dealsModel = require('../models/deals.model');
const customersModel = require('../models/customers.model');

const router = express.Router({strict: true});

const dealSchema = [
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

router.get('/', authorizeMiddleware(), asyncErrorHandler(async (req, res) => {
    const search = getQuerySearch(req.query.q);

    if (search.totalAmount) {
        search.totalAmount = Object.keys(search.totalAmount).reduce((acc, k) => {
            acc[k] = +search.totalAmount[k];
            return acc;
        }, {});
    }
    
    const resCursor = dealsModel.findAll(search);
    const deals = await resCursor.toArray();
    
    res.status(200).json({search, deals});
}));

router.post('/', authorizeMiddleware(), asyncErrorHandler(async (req, res) => {
    let dealData = applyDocumentSchema({schema: dealSchema}, req.body);

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

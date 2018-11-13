const express = require('express');
const asyncErrorHandler = require('./helpers/error.decorator').asyncErrorHandler;
const usersModel = require('../models/users.model');
const sessionsModel = require('../models/sessions.model');

const router = express.Router({strict: true});

router.post('/login', asyncErrorHandler(async (req, res) => {
    const {email, password} = req.body;
    const user = await usersModel.findOne({email});
    if (user && usersModel.matchPassword(password, user.password)) {
        const token = await sessionsModel.generateUserToken(user._id);
        res.status(200).json({
            token
        });
    } else {
        res.sendStatus(401);
    }
}));

module.exports = router;

const express = require('express');
const authenticateMiddleware = require('./helpers/auth.middleware').authenticate;
const errorHandlerMiddlware = require('./helpers/error.middleware').errorHandlerMiddlware;
const rootRouter = require('./root');
const authRouter = require('./auth');
const usersRouter = require('./users');
const customersRouter = require('./customers');
const dealsRouter = require('./deals');

const appRouter = express({strict: true});

appRouter.use(express.json());
appRouter.use(authenticateMiddleware);

appRouter.use('', rootRouter);
appRouter.use('/auth', authRouter);
appRouter.use('/users', usersRouter);
appRouter.use('/customers', customersRouter);
appRouter.use('/deals', dealsRouter);

// error handling middleware
appRouter.use(errorHandlerMiddlware);

module.exports = appRouter;

const express = require('express');
const rootRouter = require('./root');
const authRouter = require('./auth');
const usersRouter = require('./users');
const authenticateMiddleware = require('./helpers/auth.middleware').authenticate;
const errorHandlerMiddlware = require('./helpers/error.middleware').errorHandlerMiddlware;

const appRouter = express({strict: true});

appRouter.use(express.json());
appRouter.use(authenticateMiddleware);

appRouter.use('', rootRouter);
appRouter.use('/auth', authRouter);
appRouter.use('/users', usersRouter);

// error handling middleware
appRouter.use(errorHandlerMiddlware);

module.exports = appRouter;

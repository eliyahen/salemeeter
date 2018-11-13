const errorHandlerMiddlware = (err, req, res, next) => {
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err.message
    });
    next(err);
    throw err;  // for debug
};

module.exports = {
    errorHandlerMiddlware,
};

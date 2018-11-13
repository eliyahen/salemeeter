const sessionsModel = require('../../models/sessions.model');
const usersModel = require('../../models/users.model');

const authenticate = async (req, res, next) => {
    // add user to req object
    req.user = null;

    // get user by auth token
    const token = req.get('AuthToken');
    if (token) {
        const userId = await sessionsModel.matchUserToken(token);
        if (userId) {
            req.user = await usersModel.findOne({_id: userId});
            sessionsModel.extendToken(token);
        }
    }

    // random garbage collector for stale tokens
    if (Math.random() > 0.9) {
        console.info('* Cleaned stale session tokens.');
        sessionsModel.removeStaleTokens();
    }

    next();
};

const authorize = (authorizeFn = (req) => Promise.resolve(!!req.user)) => (
    async (req, res, next) => {
        if (await authorizeFn(req, res)) {
            next();
        } else {
            res.sendStatus(403);
        }
    }
);

module.exports = {
    authenticate,
    authorize,
};

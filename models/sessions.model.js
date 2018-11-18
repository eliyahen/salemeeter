const bcrypt = require('bcrypt');
const db = require('../db');
const dbUtils = require('../db/utils');

const sessionsDb = db.collection('sessions');
const defaultExpiredDeltaSeconds = 30 * 60;

const getExpiredDate = (delta = defaultExpiredDeltaSeconds, date) => {
    date = new Date(date && date.getTime());  // copy or create new date
    date.setSeconds(date.getSeconds() + delta);
    return date;
}

const matchUserToken = (token) => {
    return sessionsDb.findOne({
        token,
        expired: {$gt: new Date()}
    }, {
        userId: true,
    }).then((session) => session ? session.userId : null);
}

const generateUserToken = (userId, expireDelta) => {
    const now = new Date();
    return sessionsDb.insertOne({
        userId: dbUtils.ObjectId(userId),
        updated: now,
        expired: getExpiredDate(expireDelta, now)
    }).then(({insertedId}) => {
        const token = bcrypt.hashSync(String(insertedId), '$2a$10$L4R0O8MCWyUWBzloI1YYUudPuvBIB2vwQH4W424shYP6ckxa8E.Pa');
        return sessionsDb.findOneAndUpdate(
            {_id: insertedId},
            {$set: {token}},
            {projection: {_id: true}}
        ).then(() => token);
    });
};

const extendToken = (token, expireDelta) => {
    const now = new Date();
    return sessionsDb.findOneAndUpdate(
        {token},
        {$set: {updated: now, expired: getExpiredDate(expireDelta, now)}},
        {projection: {_id: true}}
    ).then(() => true);
};

const removeToken = (token) => {
    return sessionsDb.deleteOne({
        _id: dbUtils.ObjectId(token)
    }).then(({deletedCount}) => deletedCount === 1);
};

const removeUserTokens = (userId) => {
    return sessionsDb.deleteMany({
        userId: dbUtils.ObjectId(userId)
    }).then(({deletedCount}) => deletedCount);
};

const removeStaleTokens = () => {
    return sessionsDb.deleteMany({
        expired: {$lt: new Date()}
    }).then(({deletedCount}) => deletedCount)
};

module.exports = {
    matchUserToken,
    generateUserToken,
    extendToken,
    removeToken,
    removeUserTokens,
    removeStaleTokens,
};

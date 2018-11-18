const bcrypt = require('bcrypt');
const db = require('../db');

const usersDb = db.collection('users');

const userProjection = {password: false};  // default user project to omit password

const findOne = (query, projection) => {
    projection = {...userProjection, ...projection};
    return usersDb.findOne(query, projection);
};

const findAll = (query, projection) => {
    projection = {...userProjection, ...projection};
    return usersDb.find(query, projection);
};

const insert = (data) => {
    return usersDb.insertOne(data).then(({insertedId}) => ({...data, ...{_id: insertedId}}));
};

const update = (id, data) => {
    return usersDb.findOneAndUpdate({_id: id}, {$set: data}, {returnNewDocument: true});
};

const remove = (id) => {
    return usersDb.findOneAndDelete({_id: id}, {projection: {_id}});
};

const encryptPassword = (password, salt = '$2a$10$7V3rXZOvRdeWcd60C2QyPOJmV3hYzpQ0FZuImIP.4EfeFsGm4OfyK') => {
    return bcrypt.hashSync(password, salt);
};

const matchPassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

module.exports = {
    findOne,
    findAll,
    insert,
    update,
    remove,
    encryptPassword,
    matchPassword,
};

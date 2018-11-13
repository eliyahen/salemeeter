const bcrypt = require('bcrypt');
const db = require('../db');

const users = db.collection('users');

const userProjection = {password: false};  // default user project to omit password

const findOne = (query, projection) => {
    projection = {...userProjection, ...projection};
    return users.findOne(query, projection);
};

const findAll = (query, projection) => {
    projection = {...userProjection, ...projection};
    return users.find(query, projection);
};

const insert = (data) => {
    return users.insertOne(data).then(({insertedId}) => ({...data, ...{_id: insertedId}}));
};

const update = (id, data) => {
    return users.findOneAndUpdate({_id: id}, {$set: data}, {returnNewDocument: true});
};

const remove = (id) => {
    return users.findOneAndDelete({_id: id}, {projection: {_id}});
};

const id = (id) => {
    return db.ObjectId(id);
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
    id,
    encryptPassword,
    matchPassword,
};

const db = require('../db');

const customersDb = db.collection('deals');

const findOne = (query, projection) => {
    return customersDb.findOne(query, projection);
};

const findAll = (query, projection) => {
    return customersDb.find(query, projection);
};

const insert = (data) => {
    return customersDb.insertOne(data).then(({insertedId}) => ({...data, ...{_id: insertedId}}));
};

const update = (id, data) => {
    return customersDb.findOneAndUpdate({_id: id}, {$set: data}, {returnNewDocument: true});
};

const remove = (id) => {
    return customersDb.findOneAndDelete({_id: id}, {projection: {_id}});
};

module.exports = {
    findOne,
    findAll,
    insert,
    update,
    remove,
};

var MongoDB = require('mongodb');

const ObjectId = (id) => {
    try {
        return id ? MongoDB.ObjectId(id) : null;
    } catch (error) {
        return null;
    }
};

module.exports = {
    ObjectId: ObjectId,
};

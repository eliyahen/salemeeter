var MongoClient = require('mongodb').MongoClient;

let db;

async function initDB(mongoDatabase) {
    try {
        db = (await MongoClient.connect(mongoDatabase)).db();
    } catch (err) {
        console.error('FATAL ERROR: Failed to connect to DB', err);
        throw err;
    }
}

function getDB() {
    return db;
}

module.exports = {
    initDB,
    getDB
};

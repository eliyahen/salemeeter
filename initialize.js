// load configuration from .env:
require('dotenv').config();

const initDB = require('./db/connet').initDB;

// in this function put all the initialization process needed
const initialize = async () => {
    try {
        const dbNamespace = process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017/salemeeter';
        await initDB(dbNamespace);
    } catch (err) {
        console.error('FATAL ERROR: Failed to connect to DB', err);
        throw err;
    }
};

module.exports = initialize;

const initDB = require('./db/connet').initDB;

// in this function put all the initialization process needed
const initialize = async () => {
    try {
        await initDB();
    } catch (err) {
        console.error('FATAL ERROR: Failed to connect to DB', err);
        throw err;
    }
};

module.exports = initialize;

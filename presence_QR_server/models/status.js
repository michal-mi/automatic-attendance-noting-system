const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getStatusesList() {
    const data = await db.query(
        `SELECT id, status_name
        FROM status`
    );
    return data
}

module.exports = {
    getStatusesList
}
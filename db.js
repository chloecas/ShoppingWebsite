const { Pool } = require("pg");

const client = new Pool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_NAME || 'projectdb',
    port: 5432
});


module.exports = client;
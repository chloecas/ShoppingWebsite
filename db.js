const { Client } = require("pg");

const client = new Client({
    host: 'db',
    user: 'user',
    password: 'pass',
    database: 'projectdb',
    port: 5432
});

client.connect();

module.exports = client;
const mysql = require('mysql');

// Craete connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root@2229',
    database: 'KPoetry'
});

module.exports = db;
module.exports.secret = "mysecret";

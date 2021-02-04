const db = require('../config/connection');
const bcrypt = require('bcryptjs')

// Find user by id
module.exports.findUserById = function(id, callback) {
    const sql = `SELECT * FROM users WHERE id = '${id}'`;
    db.query(sql, callback);
}

// Find user by email/username
module.exports.findUserByEmail = function(email, callback) {
    const sql = `SELECT * FROM users WHERE email = '${email}'`;
    db.query(sql, callback);
}

module.exports.comparePasswords = function(userPassword, hash, callback) {
    bcrypt.compare(userPassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    })
}
const express = require('express');
const db = require('../config/connection');
const jwt = require('jsonwebtoken');
const passport = require('passport');
// For password encrypt
const bcrypt = require('bcrypt');

const router = express.Router();

// Create table "users" if it doesn't exist
router.get('/createUsersTable', (req, res) => {
    const sql = `SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'kpoetry'
        AND table_name = 'users';`;

    const sqlCreateTable = `CREATE TABLE users (
        id INT AUTO_INCREMENT UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        PRIMARY KEY(id)
    );`;

    db.query(sql, (err, result) => {
        if (err) throw err;
        // If table "users" doesn't exist
        if(result.length < 1) {
            // Create table "users"
            db.query(sqlCreateTable, (err, result) => {
                if (err) throw err;
                res.status(200).send("Table 'users' created succesfully...");
            });
        } else {
            res.send("Table 'users' already exists...");
        }
    });
});

// Add a new user
router.post('/register', (req, res) => {
    let newUser = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password
    }
    const sql = 'INSERT INTO users SET?';
    if(!req.body.first_name || !req.body.last_name || !req.body.email || !req.body.password) {
        res.status(400).json({
            success: false,
            message: "Bad Request! Please enter the required information."
        });
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            if(err) throw err;
            // Encrypt password
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) throw err;
                newUser.password = hash;
                // Add user
                db.query(sql, newUser, err => {
                    if(err) throw err;
                    res.status(200).json({
                        success: true,
                        message: "User registered succesfully."
                    });
                });
            });
        });
    }
});

// Authenticate user on login
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Get user by email
    require('../models/user').findUserByEmail(email, (err, user) => {
        // User we get would be a SQL query result which would be an array with one element i.e the actual user
        // To get the user object, access user properties as 'user[0].property_name'
        // Here console.log(user); will result following
        // [
        //     RowDataPacket {
        //       id: 6,
        //       first_name: 'Kamal',
        //       last_name: 'Verma',
        //       email: 'kamal3@gmail.com',
        //       password: '$2b$10$Dp4gew.U01DM9prm911LLOqTiFnSpN9TxLZVhCETpymUTHhaDftoS'
        //     }
        //  ]

        if(err) throw err;

        // If user not found
        if(!user || user.length <= 0) {
            res.status(404).json({success: false, message: 'User not found. Please register the user.'});
        } else {
            // compare passwords between the password entered in login form and the password returned inside user object in 'findUserByEmail()' method
            require('../models/user').comparePasswords(password, user[0].password, (err, isMatch) => {
                // console.log(password);
                console.log(user);
                if(err) throw err;
                // If password matches
                if(isMatch) {
                    // Generate a token
                    // One may store this token into cookies or local_storage at client side and send it with requests for protected routes
                    const token = jwt.sign({ user }, db.secret, {
                        // In how much time token will be expired, here 1 week
                        expiresIn: 604800
                    });
                    // send a response back to client
                    res.json({
                        success: true,
                        token: `bearer ${token}`,
                        user: {
                            id: user[0].id,
                            first_name: user[0].first_name,
                            last_name: user[0].last_name,
                            email: user[0].email
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: 'Wrong Password. Please try again.'
                    });
                }
            });
        }
    });
});

// Create a protected route
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log(req.session)
    res.send({user: req.user});
});

module.exports = router;
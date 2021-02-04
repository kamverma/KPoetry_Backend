const express = require('express');
const db = require('../config/connection');
const router = express.Router();
const passport = require('passport');

// Create Database
// router.get('/createDB', (req, res) => {
//     const sql = "CREATE DATABASE KPoetry";
//     db.query(sql, (err, result) => {
//         if(err) {
//             throw err;
//         } else {
//             res.status(200).send("Database created succesfully");
//         }
//     })
// });

// Create Table 'workitems'
router.get('/createTable', (req, res) => {
    const sql = `SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'kpoetry'
        AND table_name = 'workitems';`;

    const sqlCreateTable = `CREATE TABLE workitems (
        id INT AUTO_INCREMENT UNIQUE,
        title VARCHAR(255) DEFAULT 'Untitled',
        body LONGTEXT NOT NULL,
        posted_by VARCHAR(100) NOT NULL,
        posted_on DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(id)
    );`;

    db.query(sql, (err, result) => {
        if (err) throw err;
        // If table "workitems" doesn't exist
        if(result.length < 1) {
            db.query(sqlCreateTable, (err, result) => {
                if (err) throw err;
                // Create table "workitems"
                res.status(200).send("Table 'workitems' created succesfully...");
            });
        } else {
            res.send("Table 'workitems' already exists...");
        }
    });
});

// Get all workitems
router.get('/workitems', passport.authenticate('jwt', { session: false }), (req, res) => {
    const sql = `SELECT * FROM workitems WHERE user_id = ${req.user[0].id};` 
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json(result);
    });
});

// Add new workitem
router.post('/workitems', passport.authenticate('jwt', { session: false }), (req, res) => {
    const sql = `INSERT INTO workitems SET?`;
    if(!req.body.body || !req.body.posted_by) {
        // Bad request
        res.status(400).send("Workitem body or posted_by cannot be empty");
    } else {
        db.query(sql, req.body, err => {
            if (err) throw err;
            db.query(`SELECT * FROM workitems;`, (err, result) => {
                if (err) throw err;
                res.status(200).json({success: true, message: "Workitem Submitted!", result});
            });
        });
    }
});

// Update existing workitem
router.put('/workitems/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id;
    var title;
    var body;
    db.query(`SELECT title FROM workitems WHERE id = ${id};`, (err, result) => {
        if (err) throw err;
        title = result[0].title;
    });
    db.query(`SELECT body FROM workitems WHERE id = ${id};`, (err, result) => {
        if (err) throw err;
        body = result[0].body;
    });
    const sql = `UPDATE workitems SET title=?, body=?, posted_on = CURRENT_TIMESTAMP WHERE id = ${id}`;
    db.query(`SELECT id FROM workitems WHERE id = ${id}`, (err, result) => {
        if (err) throw err;
        // Check if workitem id exists 
        if(result.length > 0) {
            // If exists, update workitem
            db.query(sql, [req.body.title ? req.body.title : title, req.body.body ? req.body.body : body], (err, result) => {
                if (err) throw err;
                res.status(200).json({ success: true,  message: "Workitem updated succesfully", result });
            });
        } else {
            res.status(400).json({ success: false, message: `Bad Request! Workitem of id ${id} doesn't exist` });
        }
    });
});

// Delete workitem
router.delete('/workitems/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const sql = `DELETE FROM workitems WHERE id = ${req.params.id}`;
    db.query(`SELECT id FROM workitems WHERE id = ${req.params.id}`, (err, result) => {
        if (err) throw err;
        // Check if workitem id exists 
        if(result.length > 0) {
            // If exists delete workitem
            db.query(sql, (err, result) => {
                if (err) throw err;
                res.status(200).json({ success: true, message: "Workitem Deleted!", result });
            });
        } else {
            res.status(400).json({ success: true, message: `Bad Request! Workitem of id ${req.params.id} doesn't exist` });
        }
    });
});

module.exports = router;
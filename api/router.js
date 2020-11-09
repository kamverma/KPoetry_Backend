const express = require('express');
const db = require('../connection');
const router = express.Router();

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
router.get('/workitems', (req, res) => {
    const sql = `SELECT * FROM workitems;` 
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json(result);
    });
});

// Add new workitem
router.post('/workitems', (req, res) => {
    const sql = `INSERT INTO workitems SET?`;
    if(!req.body.body || !req.body.posted_by) {
        // Bad request
        res.status(400).send("Workitem body or posted_by cannot be empty");
    } else {
        db.query(sql, req.body, err => {
            if (err) throw err;
            db.query(`SELECT * FROM workitems;`, (err, result) => {
                if (err) throw err;
                res.json(result);
            });
        });
    }
});

// Update existing workitem
router.put('/workitems/:id', (req, res) => {
    const updatedWorkitem = req.body;
    const sql = `UPDATE workitems SET? WHERE id = ${req.params.id}`;
    db.query(`SELECT id FROM workitems WHERE id = ${req.params.id}`, (err, result) => {
        if (err) throw err;
        // Check if workitem id exists 
        if(result.length > 0) {
            // If exists update workitem
            db.query(sql, updatedWorkitem, (err, result) => {
                if (err) throw err;
                res.status(200).json({ msg: "Workitem updated succesfully", result });
            });
        } else {
            res.status(400).json({ msg: `Bad Request! Workitem of id ${req.params.id} doesn't exist` });
        }
    });
});

// Delete workitem
router.delete('/workitems/:id', (req, res) => {
    const sql = `DELETE FROM workitems WHERE id = ${req.params.id}`;
    db.query(`SELECT id FROM workitems WHERE id = ${req.params.id}`, (err, result) => {
        if (err) throw err;
        // Check if workitem id exists 
        if(result.length > 0) {
            // If exists delete workitem
            db.query(sql, (err, result) => {
                if (err) throw err;
                res.status(200).json({ msg: "Workitem Deleted!", result });
            });
        } else {
            res.status(400).json({ msg: `Bad Request! Workitem of id ${req.params.id} doesn't exist` });
        }
    });
});

module.exports = router;
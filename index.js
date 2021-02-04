const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./api/router');
const users = require('./api/users');
const passport = require('passport');
const db = require('./config/connection');
const session = require('express-session');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: db.secret, resave: false, saveUninitialized: false}));
// In an Express-based application, passport.initialize() middleware is required to be initialized
app.use(passport.initialize());
// Invoke passport.session() middleware for application to persist sessions for a user
app.use(passport.session());
app.use('/api/users', users);
app.use('/api', router);

// Set configuration for passport-jwt
require('./config/passport')(passport);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on Port: ${PORT}`));

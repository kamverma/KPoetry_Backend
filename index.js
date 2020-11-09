const { json, urlencoded } = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./api/router');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/api', router);

app.listen(PORT, () => console.log(`Server is running on Port: ${PORT}`));

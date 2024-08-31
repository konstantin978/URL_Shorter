const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const mainRouter = require('./api/route');

const app = express();
const PORT = dotenv.parsed.PORT;

app.use(bodyParser.json());
app.use('/', mainRouter);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT} port`);
});

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { register, login } = require('./controllers/authController');

const app = express();
app.use(bodyParser.json());

app.post('/auth/register', register);
app.post('/auth/login', login);

module.exports = app;
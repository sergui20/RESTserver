const express = require('express');

const app = express();

app.use(require('./usuario')); //Requiring the web routes
app.use(require('./login'));

module.exports = app;
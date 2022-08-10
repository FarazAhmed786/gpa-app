var express = require('express');
const usersRouter = require('./users');
const placesRouter = require('./places');
const helpRouter = require('./help');
const passwordRouter = require('./resetPassword');
const callHistoryRouter = require('./callHistory');
const partyRouter = require('./hostParty');
const paymentRouter = require('./payment');
var app = express();
/* GET home page. */

app.use('/user', usersRouter);
app.use('/password', passwordRouter);
app.use('/places', placesRouter);
app.use('/help', helpRouter);
app.use('/callHistory', callHistoryRouter);
app.use('/party', partyRouter);
app.use('/payment', paymentRouter);
module.exports = app;

const express = require('express');
const { PaymentData } = require("../../Models/payment.model");
const auth = require('../../middleware/auth');

const app = express();

app.get('/', auth, async (req, res) => {

  const payments = await PaymentData.find({ userId: req.user._id });

  if (payments.length == 0) {
    var success = {
      success: true,
      msg: 'No Payment found!'
    };
    res.status(404).send(success);
  }

  var success = {
    success: true,
    msg: 'Payments found',
    data: payments
  };
  res.send(success);
  return;
})

module.exports = app;
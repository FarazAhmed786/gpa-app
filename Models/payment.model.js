
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentDetails: {
    payer_id: {
      type: String,
      required: true
    },
    transactions: {
      type: [Object],
      required: true,

      amount: {
        type: Object,
        required: true,

        currency: {
          type: String,
          required: true
        },
        total: {
          type: Number,
          required: true
        }
      }
    },
  },
  createdDate:
    { type: Date, default: Date.now },
},
  { strict: false });

const PaymentData = mongoose.model('payment', paymentSchema);


exports.PaymentData = PaymentData;
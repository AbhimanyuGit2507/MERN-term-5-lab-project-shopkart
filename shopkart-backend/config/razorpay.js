const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxxxx'
});

module.exports = razorpay;

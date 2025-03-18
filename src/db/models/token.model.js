const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema(
  {
    _userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'admin',
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['forgot_password'],
    },
    expireAt: {
      type: Date,
      default: new Date(Date.now() + 600000),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    receiver: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('token', TokenSchema);

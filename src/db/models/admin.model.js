const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('@enums/adminRoles.enum');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 255,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      minlength: 5,
      maxlength: 255,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      minlength: 8,
      maxlength: 255,
    },
    role: {
      type: String,
      required: [true, 'role is required'],
      enum: Object.values(ROLES),
    },
  },
  {
    timestamps: true,
  },
);

adminSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.comparePassword = async function (condidatePassowrd) {
  const isMatch = await bcrypt.compare(condidatePassowrd, this.password);
  return isMatch;
};

module.exports = mongoose.model('admin', adminSchema);

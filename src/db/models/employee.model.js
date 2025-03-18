const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    empNo: {
      type: String,
      unique: true,
    },
    empName: {
      type: String,
    },
    locationGroup: {
      type: String,
    },
    locationName: {
      type: String,
    },
    hireDate: {
      type: Date,
    },
    position: {
      type: String,
      required: true,
    },
    attendance: {
      type: Number,
      required: true,
    },
    latest: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Employee', EmployeeSchema);

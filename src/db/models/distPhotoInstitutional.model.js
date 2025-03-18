const mongoose = require('mongoose');

const DistPhotoInstitutionalSchema = new mongoose.Schema({
  year: {
    type: Number,
  },
  month: {
    type: Number,
  },
  employeesPercentage: [
    {
      _empId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
      percentage: {
        type: Number,
      },
    },
  ],
});

module.exports = mongoose.model(
  'DistPhotoInstitutional',
  DistPhotoInstitutionalSchema,
);

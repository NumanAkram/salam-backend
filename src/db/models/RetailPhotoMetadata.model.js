const mongoose = require('mongoose');

const RetailPhotoMetadataSchema = new mongoose.Schema({
  items: [
    {
      Products: { type: String, required: [true, 'Products is  required'] },
      itemIncentive: {
        type: Number,
        required: [true, 'item incentive required'],
      },
      unitsSold: {
        type: Number,
        required: [true, 'units sold incentive required'],
      },
    },
  ],
  employees: [
    {
      _empId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, '_empId required'],
      },
      percentage: {
        type: Number,
        required: [true, 'percentage required'],
        default: 0,
      },
    },
  ],
  year: { type: Number, required: [true, 'year is required'] },
  month: { type: Number, required: [true, 'year is required'] },
});

module.exports = mongoose.model(
  'RetailPhotoMetadata',
  RetailPhotoMetadataSchema,
);

const mongoose = require('mongoose');

const DistPhotoWorkshopSchema = new mongoose.Schema({
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

  totalIncentive: { type: Number },
  year: { type: Number, required: [true, 'year is required'] },
  month: { type: Number, required: [true, 'year is required'] },
});

DistPhotoWorkshopSchema.pre('save', async function (next) {
  const items = this.items;
  this.totalIncentive = items.reduce((acc, cur) => {
    if (cur?.itemIncentive && cur?.unitsSold) {
      return acc + cur.itemIncentive * cur?.unitsSold;
    } else {
      return acc;
    }
  }, 0);
  next();
});

module.exports = mongoose.model('DistPhotoWorkshop', DistPhotoWorkshopSchema);

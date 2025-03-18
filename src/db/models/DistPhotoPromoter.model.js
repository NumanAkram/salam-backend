const mongoose = require('mongoose');

const DistPhotoPromoterSchema = new mongoose.Schema({
  salesName: { type: String },
  empNo: {
    type: String,
  },
  products: [
    {
      productName: { type: String },
      productIncentive: { type: Number },
      productQuantity: { type: Number },
    },
  ],

  totalIncentive: { type: Number },
  year: { type: Number, required: [true, 'year is required'] },
  month: { type: Number, required: [true, 'year is required'] },
});

DistPhotoPromoterSchema.pre('save', async function (next) {
  const products = this.products;

  this.totalIncentive = products.reduce((acc, cur) => {
    if (cur?.productIncentive && cur?.productQuantity) {
      return acc + cur.productIncentive * cur?.productQuantity;
    } else {
      return acc;
    }
  }, 0);

  next();
});

module.exports = mongoose.model('DistPhotoPromoter', DistPhotoPromoterSchema);

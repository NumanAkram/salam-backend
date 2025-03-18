const mongoose = require('mongoose');

const perfumerySalesDataSchema = new mongoose.Schema({
  month: { type: String, trim: true },
  date: {type: Date},
  expenseType: { type: String, trim: true },
  division: { type: String, trim: true },
  brand: { type: String, trim: true },
  staffCode: { type: String, trim: true },
  name: { type: String, trim: true },
  location: { type: String, trim: true },
  shopBudget: { type: String, default: 0 },
  shopSales: { type: String, default: 0 },
  shopAchievement: { type: String, trim: true },
  fragrance: { type: String, default: 0 },
  makeUp: { type: String, default: 0 },
  skinCare: { type: String, default: 0 },
  totalValuesOfItemsSold: { type: String, default: 0 },
  rate: { type: String, default: 0 },
  qtyOfItemSold: { type: String, default: 0 },
  totalPinMoneyIncentives: { type: String, default: 0 },
  rank: { type: String, trim: true },
  rankIncentives: { type: String, trim: true },
  otherIncentiveDescription: { type: String, trim: true },
  otherIncentives: { type: String, trim: true }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create and export the model
module.exports = mongoose.model('PerfumerySalesData', perfumerySalesDataSchema);

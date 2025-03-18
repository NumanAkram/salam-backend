const mongoose = require('mongoose');
const { SECTOR_ENUM, CHAIN_NAME_ENUM } = require('../enums/sector.enum');

const BudgetSchema = new mongoose.Schema(
  {
    sector: {
      type: String,
      enum: Object.values(SECTOR_ENUM),
      required: [true, 'sector is required'],
    },
    year: {
      type: Number,
      required: [true, 'year is required'],
    },
    chainName: {
      type: String,
      enum: Object.values(CHAIN_NAME_ENUM),
      default: null,
    },
    budgetCode: {
      type: String,
    },
    storeName3: {
      type: String,
      default: null,
    },
    divisionName: {
      type: String,
      default: null,
    },
    deptGroup: {
      type: String,
      default: null,
    },
    legacyDepartment: {
      type: String,
      default: null,
    },
    locationCode: {
      type: String,
      //required: [true, 'Location code is required'], //TODO check that with Leah
    },
    months: {
      jan: { type: Number, required: [true, 'JAN is required'] },
      feb: { type: Number, required: [true, 'FEB is required'] },
      mar: { type: Number, required: [true, 'MAR is required'] },
      apr: { type: Number, required: [true, 'APR is required'] },
      may: { type: Number, required: [true, 'MAY is required'] },
      jun: { type: Number, required: [true, 'JUN is required'] },
      jul: { type: Number, required: [true, 'JULY is required'] },
      aug: { type: Number, required: [true, 'AUG is required'] },
      sep: { type: Number, required: [true, 'SEP is required'] },
      oct: { type: Number, required: [true, 'OCT is required'] },
      nov: { type: Number, required: [true, 'NOV is required'] },
      dec: { type: Number, required: [true, 'DEC is required'] },
    },
    total: { type: Number },
  },
  { timestamps: true },
);

BudgetSchema.pre('save', function (next) {
  const months = this.months;
  this.total = Object.values(months).reduce((acc, cur) => acc + cur, 0);
  next();
});

BudgetSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  const isMonthUpdated = Object.keys(update).some(
    (key) => key.startsWith('months.') || key === 'months',
  );

  if (isMonthUpdated) {
    const docToUpdate = await this.model.findOne(this.getQuery()).lean();

    const updatedMonths = { ...docToUpdate.months, ...update.months };
    for (const key of Object.keys(update)) {
      if (key.startsWith('months.')) {
        const monthName = key.split('.')[1];
        updatedMonths[monthName] = update[key];
      }
    }

    const total = Object.values(updatedMonths).reduce(
      (acc, cur) => acc + cur,
      0,
    );

    this.set({ total });
  }

  next();
});

module.exports = mongoose.model('Budget', BudgetSchema);

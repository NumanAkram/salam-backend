const mongoose = require('mongoose');
const { SECTOR_ENUM } = require('../enums/sector.enum');

const IncentiveSchema = new mongoose.Schema(
  {
    sector: { type: String, required: true, enum: Object.values(SECTOR_ENUM) },

    date: { type: Date, required: true }, // Store as "YYYY-MM-01"

    _employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    position: {
      type: String,
    },

    attendance: {
      type: Number,
    },
    totalSales: { type: Number },
    totalBudgets: { type: Number },
    percentageAchieved: { type: [Number] },

    monthlyIncentive: { type: Number, required: true },
    quarterlyIncentive: { type: Number },
    individualIncentive: [
      { amount: { type: Number }, deptGroup: { type: String } },
    ],
    teamIncentive: { type: Number },
    supportTeamIncentive: { type: Number },
    distHomeInstitutional: { type: Number },

    totalIncentive: { type: Number, default: 0 },
  },
  { timestamps: true },
);

IncentiveSchema.pre('save', function (next) {
  let totalIncentive = this.monthlyIncentive;
  if (this.quarterlyIncentive) {
    totalIncentive += this.quarterlyIncentive;
  }
  this.totalIncentive = totalIncentive;
  next();
});

IncentiveSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  let newTotalInc = 0;
  const docToUpdate = await this.model.findOne(this.getQuery()).exec();
  if (docToUpdate) {
    newTotalInc += docToUpdate.totalIncentive;
  }

  if (update.monthlyIncentive !== undefined) {
    newTotalInc += parseFloat(update.monthlyIncentive);
  }
  if (update.quarterlyIncentive !== undefined) {
    newTotalInc += parseFloat(update.quarterlyIncentive);
  }

  if (update.$push && update.$push.individualIncentive) {
    newTotalInc += parseFloat(update.$push.individualIncentive.amount);
  }
  if (update.teamIncentive !== undefined) {
    newTotalInc += parseFloat(update.teamIncentive);
  }
  if (update.supportTeamIncentive !== undefined) {
    newTotalInc += parseFloat(update.supportTeamIncentive);
  }
  if (update.distHomeInstitutional !== undefined) {
    newTotalInc += parseFloat(update.distHomeInstitutional);
  }

  update.totalIncentive = newTotalInc;
  next();
});

module.exports = mongoose.model('Incentive', IncentiveSchema);

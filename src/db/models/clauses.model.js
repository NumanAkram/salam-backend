const mongoose = require('mongoose');
const {
  SECTOR_ENUM,
  DP_POSITIONS,
  FMCG_POSITIONS,
  FASHION_AND_HOME_POSITIONS,
  DIST_HOME,
  RETAIL_PERFUMERY_POSITIONS,
  DIST_PERFUMERY_POSITIONS,
} = require('../enums/sector.enum');

const ClausesSchema = new mongoose.Schema({
  sector: {
    type: String,
    enum: Object.values(SECTOR_ENUM),
    required: [true, 'Sector is required'],
  },
  probationTrainingPeriod: {
    type: Number,
    required: [true, 'Probation training period is required'],
  },

  employees: [
    {
      position: {
        type: String,
        enum: [
          ...Object.keys(DP_POSITIONS),
          ...Object.keys(FMCG_POSITIONS),
          ...Object.keys(FASHION_AND_HOME_POSITIONS),
          ...Object.keys(DIST_HOME),
          ...Object.keys(RETAIL_PERFUMERY_POSITIONS),
          ...Object.keys(DIST_PERFUMERY_POSITIONS)
        ],
      },
      selectedEmp: {
        type: [
          { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', _id: false },
        ],
      },
      _id: false,
    },
  ],
  backOffice: [
    {
      backOfficeDeptGroup: {
        type: String,
      },
      deptGroup: [{ type: String /*TODO add enum */, _id: false }],
      _id: false,
    },
  ],
  storeMgrDeptFashionHome: [
    {
      budgetCode: {
        type: String,
      },
      selectedEmp: {
        type: [
          { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', _id: false },
        ],
      },
      _id: false,
    },
  ],
  customerName: [{ type: String, _id: false }],
});

module.exports = mongoose.model('Clauses', ClausesSchema);

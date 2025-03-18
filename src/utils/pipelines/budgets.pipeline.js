const moment = require('moment');
const { SECTOR_ENUM } = require('@enums/sector.enum');

const getRetailFashionAndHomePipeline = (year, excludeMtm) => {
  const pipeline = [];
  pipeline.push({ $match: { sector: SECTOR_ENUM.RETAIL_FASHION_AND_HOME } });

  pipeline.push({
    $match: { year: year ? parseInt(year) : parseInt(moment().year() + 1) },
  });

  if (excludeMtm) {
    pipeline.push({
      $match: { deptGroup: { $ne: 'GEZ - MTM' } },
    });
  }

  pipeline.push({
    $group: {
      _id: '$budgetCode',
      budgets: { $push: '$$ROOT' },
    },
  });
  return pipeline;
};

const getDeptGroupsPipeline = (year, sector) => {
  const pipeline = [];

  pipeline.push({ $match: { sector } });

  pipeline.push({
    $match: { year: year ? parseInt(year) : parseInt(moment().year() + 1) },
  });

  pipeline.push({
    $group: {
      _id: '$deptGroup',
    },
  });
  return pipeline;
};

const getBudgetCodesPipeline = (year, sector) => {
  const pipeline = [];

  pipeline.push({ $match: { sector } });

  pipeline.push({
    $match: { year: year ? parseInt(year) : parseInt(moment().year() + 1) },
  });

  pipeline.push({
    $group: {
      _id: '$budgetCode',
    },
  });
  return pipeline;
};

module.exports = { getRetailFashionAndHomePipeline, getDeptGroupsPipeline, getBudgetCodesPipeline };

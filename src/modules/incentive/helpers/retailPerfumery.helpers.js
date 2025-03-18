const { TOP_NOTES_STORES } = require('@enums/sector.enum');
const { getNumberOfDays } = require('@utils/date');
const {
  StoreManager: StoreManagerJson,
  StoreSupervisor: StoreSupervisorJson,
  Minimum: MinimumJson,
  CategoryName: CategoryNameJson,
  Cashier: CashierJson,
  RetailGeFr: RetailGeFrJson,
} = require('@json/metadata.json')['RetailPerfumery'];
const { RETAIL_PERFUMERY_POSITIONS_REGEX } = require('@utils/regex');
const { RETAIL_PERFUMERY_POSITIONS } = require('@enums/sector.enum');
const { calculateAmountFromPercentage } = require('@utils/percentage');

const findKey = (value) => {
  if (value >= 95 && value < 120) {
    return '95';
  } else if (value >= 120) {
    return '120';
  } else {
    return undefined;
  }
};

const findCategory = (locationCode) => {
  if (TOP_NOTES_STORES.includes(locationCode)) {
    return CategoryNameJson['TopNoteStore'];
  } else {
    return CategoryNameJson['4U'];
  }
};

const findPositionRegex = (position) => {
  if (RETAIL_PERFUMERY_POSITIONS.STORE_MANAGER == position)
    return RETAIL_PERFUMERY_POSITIONS_REGEX.STORE_MANAGER;
  else if (RETAIL_PERFUMERY_POSITIONS.STORE_SUPERVISOR == position)
    return RETAIL_PERFUMERY_POSITIONS_REGEX.STORE_SUPERVISOR;
  else if (RETAIL_PERFUMERY_POSITIONS.CASHIER == position)
    return RETAIL_PERFUMERY_POSITIONS_REGEX.CASHIER;
  else if (RETAIL_PERFUMERY_POSITIONS.RETAIL_GENERAL_FRAGRANCE == position)
    return RETAIL_PERFUMERY_POSITIONS_REGEX.RETAIL_GENERAL_FRAGRANCE;
};

const findMinimumJson = (position) => {
  if (RETAIL_PERFUMERY_POSITIONS.STORE_MANAGER == position)
    return MinimumJson.StoreManager;
  else if (RETAIL_PERFUMERY_POSITIONS.STORE_SUPERVISOR == position)
    return MinimumJson.StoreSupervisor;
  else if (RETAIL_PERFUMERY_POSITIONS.CASHIER == position)
    return MinimumJson.Cashier;
  else if (RETAIL_PERFUMERY_POSITIONS.RETAIL_GENERAL_FRAGRANCE == position)
    return MinimumJson.RetailGeFr;
};

const findAmountByPosition = (position, category, key) => {
  if (RETAIL_PERFUMERY_POSITIONS.STORE_MANAGER == position)
    return parseInt(StoreManagerJson[category][key]);
  else if (RETAIL_PERFUMERY_POSITIONS.STORE_SUPERVISOR == position)
    return parseInt(StoreSupervisorJson[category][key]);
  else if (RETAIL_PERFUMERY_POSITIONS.CASHIER == position)
    return parseInt(CashierJson[category][key]);
};

function extractEmpNumber(input) {
  const parts = input.split('-');
  const numberPart = parts[parts.length - 1];

  const cleanedNumber = numberPart.replace(/^0+/, '');

  return cleanedNumber;
}

const updateRotation = (emp, rotation) => {
  if (!rotation.length)
    return [{ _id: emp?.locationName, uniqueDaysCount: emp?.attendance || 0 }];
  const updatedRotation = rotation.map((ele) => {
    if (ele?._id == emp?.locationName) {
      return { ...ele, uniqueDaysCount: emp?.attendance || uniqueDaysCount };
    } else {
      return ele;
    }
  });
  return updatedRotation;
};

const calculateAmountByNumberOfDay = (
  incentive,
  uniqueDaysCount,
  year,
  month,
) => {
  if (incentive == 0) return 0;
  const daysInMonth = getNumberOfDays(year, month);
  const attendance = uniqueDaysCount || daysInMonth;
  const amount = (incentive * attendance) / daysInMonth;
  return amount;
};

const calculateRetailGeneralFragranceAmount = (
  totalSalesInNormalDay,
  totalSalesInSalesPeriod,
  uniqueDaysCount,
  year,
  month,
  key,
  category,
) => {
  const daysInMonth = getNumberOfDays(year, month);
  const attendance = uniqueDaysCount || daysInMonth;

  const amountNormalPeriod = parseFloat(
    calculateAmountFromPercentage(
      totalSalesInNormalDay,
      RetailGeFrJson[category].NormalPeriod[key],
    ),
  );
  const amountSalesPeriod = parseFloat(
    calculateAmountFromPercentage(
      totalSalesInSalesPeriod,
      RetailGeFrJson[category].SalesPeriod[key],
    ),
  );

  return (
    (amountNormalPeriod + amountSalesPeriod) *
    parseFloat(attendance / daysInMonth)
  );
};

const getBudgetAndSalesData4U = (budgetAndSalesData) => {
  const budgetAndSalesData4U = Object.keys(budgetAndSalesData).reduce(
    (result, key) => {
      if (!TOP_NOTES_STORES.includes(key)) {
        result[key] = budgetAndSalesData[key];
      }
      return result;
    },
    {},
  );
  return budgetAndSalesData4U;
};

module.exports = {
  findKey,
  extractEmpNumber,
  updateRotation,
  findCategory,
  calculateAmountByNumberOfDay,
  findPositionRegex,
  findMinimumJson,
  findAmountByPosition,
  getBudgetAndSalesData4U,
  calculateRetailGeneralFragranceAmount,
};

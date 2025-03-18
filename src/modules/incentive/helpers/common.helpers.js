const { decimalConverter } = require('@utils/decimalConverter');
const monthJson = require('@json/month.json');
const { Minimum: MinimumJson } = require('@json/metadata.json')[
  'DistPhotography'
];
const { getNumberOfDays } = require('@utils/date');

const calculateTotalSales = (sales) => {
  const total = sales.reduce((accumulator, currentValue) => {
    if (!isNaN(currentValue?.resaValue)) {
      return accumulator + parseInt(currentValue.resaValue);
    }
  }, 0);

  return total;
};

const calculateTotalBudgetForMonth = (budget, month) => {
  const { abbreviate: monthAbbreviate } = monthJson[(month - 1).toString()];

  const total = budget.reduce((accumulator, currentValue) => {
    if (currentValue['months'][monthAbbreviate.toLowerCase()] != undefined) {
      return (
        accumulator +
        parseInt(currentValue['months'][monthAbbreviate.toLowerCase()])
      );
    }
  }, 0);
  return total;
};

const incentiveFormat = (
  incentive,
  employee,
  percentage,
  position,
  totalSales,
  totalBudgets,
  any = {},
) => {
  const result = {
    employeeId: employee?._id,
    ...any,
  };

  if (incentive !== undefined) {
    result.incentive = decimalConverter(incentive);
  }
  if (employee?.attendance !== undefined) {
    result.attendance = employee?.attendance;
  }
  if (percentage !== undefined) {
    result.percentage = percentage;
  }
  if (position !== undefined) {
    result.position = position;
  }
  if (totalSales !== undefined) {
    result.totalSales = totalSales;
  }
  if (totalBudgets !== undefined) {
    result.totalBudgets = totalBudgets;
  }

  return result;
};

const calculateEmployeeIncentiveByAttendance = (
  incentive,
  employee,
  year,
  month,
) => {
  try {
    if (incentive == 0) return 0;
    const daysInMonth = getNumberOfDays(year, month);
    const attendance = employee?.attendance || daysInMonth;
    const amount = (incentive * attendance) / daysInMonth;
    return amount;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateQuarterIncentiveByAttendance = (
  totalIncentive,
  year,
  month,
  {
    currentMonthAttendance,
    previousMonthAttendance,
    prePreviousMonthMonthAttendance,
  },
) => {
  const daysInCurrentMonth = getNumberOfDays(year, month);
  const daysInPreviousMonth = getNumberOfDays(year, month - 1);
  const daysInPrePreviousMonth = getNumberOfDays(year, month - 2);

  const totalDays = sum(
    daysInCurrentMonth,
    daysInPreviousMonth,
    daysInPrePreviousMonth,
  );

  const totalAttendance = sum(
    currentMonthAttendance,
    previousMonthAttendance,
    prePreviousMonthMonthAttendance,
  );

  if (totalDays - totalAttendance <= MinimumJson.QuarterAttendance) {
    return totalIncentive;
  }
  return (totalIncentive * totalAttendance) / totalDays;
};

const totalSum = (...test) => {
  const total = test.reduce((prev, curr) => {
    if (!isNaN(curr)) {
      return prev + curr;
    }
    return prev;
  }, 0);
};

const getUpdatedFields = (incentive) => {
  const updateFields = {};

  if (incentive?.percentage) {
    updateFields.$push = { percentageAchieved: incentive.percentage };
  }

  if (incentive?.attendance) {
    updateFields.attendance = incentive?.attendance;
  }

  if (incentive?.individualIncentive) {
    updateFields.$push = { individualIncentive: incentive.individualIncentive };
  }
  if (incentive?.totalSales) {
    updateFields.totalSales = incentive?.totalSales;
  }
  if (incentive?.totalBudgets) {
    updateFields.totalBudgets = incentive?.totalBudgets;
  }
  if (incentive?.teamIncentive) {
    updateFields.teamIncentive = incentive?.teamIncentive;
  }
  if (incentive?.supportTeamIncentive) {
    updateFields.supportTeamIncentive = incentive?.supportTeamIncentive;
  }
  if (incentive?.position) {
    updateFields.position = incentive?.position;
  }
  if (incentive?.attendance) {
    updateFields.attendance = incentive?.attendance;
  }
  if (incentive?.incentive) {
    updateFields.monthlyIncentive = incentive?.incentive;
  }
  if (incentive?.quarterlyIncentive) {
    updateFields.quarterlyIncentive = incentive?.quarterlyIncentive;
  }
  if (incentive?.distHomeInstitutional) {
    updateFields.distHomeInstitutional = incentive?.distHomeInstitutional;
  }
  if (incentive?.fixedIncentive) {
    if (updateFields.monthlyIncentive === undefined) { updateFields.monthlyIncentive = 0; }
    updateFields.monthlyIncentive = Number(updateFields.monthlyIncentive) + Number(incentive?.fixedIncentive);
  }
  if (incentive?.variableIncentive) {
    if (updateFields.monthlyIncentive === undefined) { updateFields.monthlyIncentive = '0'; }
    updateFields.monthlyIncentive = Number(updateFields.monthlyIncentive) + Number(incentive?.variableIncentive);
  }

  return updateFields;
};

module.exports = {
  calculateTotalSales,
  calculateTotalBudgetForMonth,
  incentiveFormat,
  calculateEmployeeIncentiveByAttendance,
  totalSum,
  calculateQuarterIncentiveByAttendance,
  getUpdatedFields,
};

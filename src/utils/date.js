const moment = require('moment');

const isEndOfQuarter = (month) => {
  if (month < 1 || month > 12) {
    return false;
  }

  return [3, 6, 9, 12].includes(month);
};

const probationTrainingPeriodDate = (probationTrainingPeriod) => {
  const beforeDate = moment()
    .subtract(parseInt(probationTrainingPeriod), 'days')
    .toDate();

  return beforeDate;
};

const getNumberOfDays = (year, month) => {
  return moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
};

module.exports = {
  isEndOfQuarter,
  probationTrainingPeriodDate,
  getNumberOfDays,
};

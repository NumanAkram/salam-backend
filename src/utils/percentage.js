const { decimalConverter } = require('@utils/decimalConverter');

const calculatePercentage = (part, whole) => {
  return (part / whole) * 100;
};

const calculateAmountFromPercentage = (
  baseNumber,
  percentage,
  afterComma = 2,
) => {
  const amount = (baseNumber * percentage) / 100;
  return decimalConverter(amount, afterComma);
};

module.exports = {
  calculatePercentage,
  calculateAmountFromPercentage,
};

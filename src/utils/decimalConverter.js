const decimalConverter = (number, afterComma = 2) => {
  return parseFloat(number).toFixed(afterComma);
};

module.exports = { decimalConverter };

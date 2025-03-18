const {
  RetailPhotography: RetailPhotographyJson,
} = require('@json/metadata.json');

const calculateTotalIncentiveMetadata = (items = []) => {
  return items.reduce((accumulator, currentValue) => {
    if (typeof(currentValue?.itemIncentive) && typeof(currentValue?.unitsSold)) {
      return (
        accumulator + currentValue?.itemIncentive * currentValue?.unitsSold
      );
    }
  }, 0);
};

const getIncentivesPercentageRP = (targetPercentage) => {
  const keys = Object.keys(RetailPhotographyJson.Percentage).sort(
    (a, b) => Number(b) - Number(a),
  );
  const foundKey = keys.find((key) => targetPercentage >= key);
  return RetailPhotographyJson.Percentage[foundKey];
};

module.exports = {
  calculateTotalIncentiveMetadata,
  getIncentivesPercentageRP,
};

const fmcgFindKey = (value) => {
  if (value >= 90 && value < 100) {
    return '95';
  } else if (value >= 100 && value < 110) {
    return '100';
  } else if (value >= 110 && value < 120) {
    return '110';
  } else if (value >= 125) {
    return '125';
  } else {
    return undefined;
  }
};

module.exports = {
  fmcgFindKey,
};

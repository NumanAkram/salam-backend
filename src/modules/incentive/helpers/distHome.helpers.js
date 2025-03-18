const salesRepFindKey = (value) => {
  if (value >= 90 && value < 100) {
    return '90';
  } else if (value >= 100 && value < 110) {
    return '100';
  } else if (value >= 110 && value < 120) {
    return '110';
  } else if (value >= 120) {
    return '120';
  } else {
    return undefined;
  }
};
const managerAndSupervisorFindKey = (value) => {
  if (value >= 90 && value < 100) {
    return '90';
  } else if (value >= 100 && value < 110) {
    return '100';
  } else if (value >= 110 && value < 120) {
    return '110';
  } else if (value >= 120) {
    return '120';
  } else {
    return undefined;
  }
};
const merchandiserFindKey = (value) => {
  if (value >= 90 && value < 100) {
    return '90';
  } else if (value >= 100 && value < 110) {
    return '100';
  } else if (value >= 110 && value < 120) {
    return '110';
  } else if (value >= 120) {
    return '120';
  } else {
    return undefined;
  }
};
const backOfficeFindKey = (value) => {
  if (value >= 90 && value < 100) {
    return '90';
  } else if (value >= 100 && value < 110) {
    return '100';
  } else if (value >= 110 && value < 120) {
    return '110';
  } else if (value >= 120) {
    return '120';
  } else {
    return undefined;
  }
};

module.exports = {
  salesRepFindKey,
  managerAndSupervisorFindKey,
  merchandiserFindKey,
  backOfficeFindKey,
};

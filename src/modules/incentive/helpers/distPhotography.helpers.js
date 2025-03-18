const { DP_POSITIONS } = require('@enums/sector.enum');
const {
  TeamA: TeamAJson,
  TeamB: TeamBJson,
  TeamB2: TeamB2Json,
  TeamC: TeamCJson,
  Merchandiser: MerchandiserJson,
  ManagerCanon: ManagerCanonJson,
  BackOfficeCanon: BackOfficeCanonJson,
  ManagerEnergizer: ManagerEnergizerJson,
  BackOfficeEnergizer: BackOfficeEnergizerJson,
  TechSupport: TechSupportJson,
} = require('@json/metadata.json')['DistPhotography'];

const checkQuarterPositions = (...positions) => {
  const allowedQuarterPositions = [
    DP_POSITIONS.TEAM_A,
    DP_POSITIONS.TEAM_B,
    DP_POSITIONS.TEAM_B2,
    DP_POSITIONS.TEAM_C,
    DP_POSITIONS.MERCHANDISER,
    DP_POSITIONS.MANAGER_CANON,
    DP_POSITIONS.BACK_OFFICE_CANON,
    DP_POSITIONS.MANAGER_ENERGIZER,
    DP_POSITIONS.BACK_OFFICE_ENERGIZER,
    DP_POSITIONS.VAN_SALES,
  ];

  const isIncludes = positions
    .map((item) => {
      if (allowedQuarterPositions.includes(item)) {
        return true;
      } else {
        return false;
      }
    })
    .every((ele) => ele == true);

  return isIncludes;
};
const checkVanSalesPosition = (...positions) => {
  const allowedQuarterPositions = [DP_POSITIONS.VAN_SALES];

  const isIncludes = positions
    .map((item) => {
      if (allowedQuarterPositions.includes(item)) {
        return true;
      } else {
        return false;
      }
    })
    .every((ele) => ele == true);

  return isIncludes;
};
const checkTechSupportPosition = (...positions) => {
  const allowedQuarterPositions = [DP_POSITIONS.TECH_SUPPORT];

  const isIncludes = positions
    .map((item) => {
      if (allowedQuarterPositions.includes(item)) {
        return true;
      } else {
        return false;
      }
    })
    .every((ele) => ele == true);

  return isIncludes;
};

const findPositionMonthlyAmount = (position) => {
  return position == DP_POSITIONS.TEAM_A
    ? TeamAJson[100]
    : position == DP_POSITIONS.TEAM_B
      ? TeamBJson[100]
      : position == DP_POSITIONS.TEAM_B2
        ? TeamB2Json[100]
        : position == DP_POSITIONS.TEAM_C
          ? TeamCJson[100]
          : position == DP_POSITIONS.MERCHANDISER
            ? MerchandiserJson[100]
            : position == DP_POSITIONS.MANAGER_CANON
              ? ManagerCanonJson[100]
              : position == DP_POSITIONS.BACK_OFFICE_CANON
                ? BackOfficeCanonJson[100]
                : position == DP_POSITIONS.MANAGER_ENERGIZER
                  ? ManagerEnergizerJson[100]
                  : position == DP_POSITIONS.BACK_OFFICE_ENERGIZER
                    ? BackOfficeEnergizerJson[100]
                    : position == DP_POSITIONS.TECH_SUPPORT
                      ? TechSupportJson[100]
                      : 0;
};

const salesRepresentativeFindKey = (value) => {
  if (value >= 95 && value < 100) {
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
const techSupportFindKey = (value) => {
  if (value >= 95 && value < 100) {
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
const energizerMerchandiserFindKey = (value) => {
  if (value >= 95 && value < 100) {
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

const backOfficeFindKey = (value) => {
  if (value >= 90 && value < 100) {
    return '90';
  } else if (value >= 100 && value < 115) {
    return '100';
  } else if (value >= 115) {
    return '115';
  } else {
    return undefined;
  }
};

module.exports = {
  salesRepresentativeFindKey,
  techSupportFindKey,
  energizerMerchandiserFindKey,
  backOfficeFindKey,
  checkQuarterPositions,
  findPositionMonthlyAmount,
  checkVanSalesPosition,
  checkTechSupportPosition,
};

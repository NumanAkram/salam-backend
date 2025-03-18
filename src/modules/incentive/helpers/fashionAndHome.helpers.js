const { calculateAmountFromPercentage } = require('@utils/percentage');
const { getNumberOfDays } = require('@utils/date');

const salesAchievedFindKey = (value) => {
  if (value >= 80 && value < 100) {
    return '80';
  } else if (value >= 100 && value < 120) {
    return '100';
  } else if (value >= 120 && value < 150) {
    return '120';
  } else if (value >= 150) {
    return '150';
  } else {
    return undefined;
  }
};

const mtmFindKey = (value) => {
  if (value >= 80 && value < 100) {
    return '80';
  } else if (value >= 100 && value < 120) {
    return '100';
  } else if (value >= 120 && value < 150) {
    return '120';
  } else if (value >= 150) {
    return '150';
  } else {
    return undefined;
  }
};

const fixedIncentiveFindKey = (value) => {
  if (value < 500000) {
    return '0';
  } else if (value >= 500000 && value < 1000000) {
    return '1';
  } else if (value >= 1000000 && value < 1500000) {
    return '2';
  } else if (value >= 1500000 && value < 3000000) {
    return '3';
  } else if (value >= 3000000 && value < 5000000) {
    return '4';
  } else if (value >= 5000000) {
    return '5';
  }
};

const variableIncentiveFindKey = (value) => {
  if (value >= 90 && value < 100) {
    return '90';
  } else if (value >= 100 && value < 120) {
    return '100';
  } else if (value >= 120 && value < 150) {
    return '120';
  } else if (value >= 150 && value < 180) {
    return '150';
  } else if (value >= 180) {
    return '180';
  } else {
    return undefined;
  }
};

const excludeEmpIds = (clause, individual = true) => {
  const exclude = [];
  if (Array.isArray(clause?.supportTeamFashionHome)) {
    exclude.push(...clause.supportTeamFashionHome);
  }

  if (clause?.storeMgrDeptFashionHome && individual) {
    clause.storeMgrDeptFashionHome.map((item) => {
      if (Array.isArray(item?.selectedEmp)) {
        exclude.push(...item.selectedEmp);
      }
    });
  }

  return exclude;
};

const isExcludeEmpId = (id, excludeIds = []) => {
  if (excludeIds.includes(id)) return true;
  return false;
};

const getStoreManagerDeptEmployees = (budgetCode, clauses) => {
  const { selectedEmp } = clauses?.storeMgrDeptFashionHome.find((item) => {
    if (item?.budgetCode == budgetCode) {
      return item;
    }
  }) || { selectedEmp: [] };

  return selectedEmp;
};

const calculateVariableIncentiveAmount = ({
  totalSales,
  percentage,
  isPromotion,
  promotionPercentage,
  startPromotionDay,
  endPromotionDay,
  isSalesPeriod,
  salesPeriodPercentage,
  startSalesPeriodDay,
  endSalesPeriodDay,
  year,
  month,
}) => {
  try {
    const dailyAmount =
      calculateAmountFromPercentage(totalSales, percentage) /
      getNumberOfDays(year, month);

    const dailyIncentive = Array(getNumberOfDays(year, month)).fill(
      dailyAmount,
    );

    if (
      isPromotion &&
      startPromotionDay > 0 &&
      startPromotionDay <= dailyIncentive.length &&
      endPromotionDay > 0 &&
      endPromotionDay <= dailyIncentive.length &&
      startPromotionDay <= endPromotionDay
    ) {
      const dailyPromotionAmount =
        calculateAmountFromPercentage(totalSales, promotionPercentage) /
        getNumberOfDays(year, month);

      dailyIncentive.splice(
        startPromotionDay - 1,
        endPromotionDay - startPromotionDay + 1,
        ...Array(endPromotionDay - startPromotionDay + 1).fill(
          dailyPromotionAmount,
        ),
      );
    }

    if (
      isSalesPeriod &&
      startSalesPeriodDay > 0 &&
      startSalesPeriodDay <= dailyIncentive.length &&
      endSalesPeriodDay > 0 &&
      endSalesPeriodDay <= dailyIncentive.length &&
      startSalesPeriodDay <= endSalesPeriodDay
    ) {
      const dailySalesAmount =
        calculateAmountFromPercentage(totalSales, salesPeriodPercentage) /
        getNumberOfDays(year, month);

      dailyIncentive.splice(
        startSalesPeriodDay - 1,
        endSalesPeriodDay - startSalesPeriodDay + 1,
        ...Array(endSalesPeriodDay - startSalesPeriodDay + 1).fill(
          dailySalesAmount,
        ),
      );
    }

    return dailyIncentive.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateSupportTeamIncentiveAmount = ({
  position,
  isPromotion,
  startPromotionDay,
  endPromotionDay,
  isSalesPeriod,
  startSalesPeriodDay,
  endSalesPeriodDay,
  SupportTeamJson,
  fashionAndHomePositions,
  year,
  month,
}) => {
  try {
    const dailyAmount =
      SupportTeamJson.NormalPeriod[fashionAndHomePositions[position]] /
      getNumberOfDays(year, month);

    const dailyIncentive = Array(getNumberOfDays(year, month)).fill(
      dailyAmount,
    );

    if (
      isPromotion &&
      startPromotionDay > 0 &&
      startPromotionDay <= dailyIncentive.length &&
      endPromotionDay > 0 &&
      endPromotionDay <= dailyIncentive.length &&
      startPromotionDay <= endPromotionDay
    ) {
      const dailyPromotionAmount =
        SupportTeamJson.PromotionPeriod[fashionAndHomePositions[position]] /
        getNumberOfDays(year, month);

      dailyIncentive.splice(
        startPromotionDay - 1,
        endPromotionDay - startPromotionDay + 1,
        ...Array(endPromotionDay - startPromotionDay + 1).fill(
          dailyPromotionAmount,
        ),
      );
    }

    if (
      isSalesPeriod &&
      startSalesPeriodDay > 0 &&
      startSalesPeriodDay <= dailyIncentive.length &&
      endSalesPeriodDay > 0 &&
      endSalesPeriodDay <= dailyIncentive.length &&
      startSalesPeriodDay <= endSalesPeriodDay
    ) {
      const dailySalesAmount =
        SupportTeamJson.SalesPeriod[fashionAndHomePositions[position]] /
        getNumberOfDays(year, month);

      dailyIncentive.splice(
        startSalesPeriodDay - 1,
        endSalesPeriodDay - startSalesPeriodDay + 1,
        ...Array(endSalesPeriodDay - startSalesPeriodDay + 1).fill(
          dailySalesAmount,
        ),
      );
    }

    return dailyIncentive.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  mtmFindKey,
  salesAchievedFindKey,
  excludeEmpIds,
  isExcludeEmpId,
  getStoreManagerDeptEmployees,
  fixedIncentiveFindKey,
  variableIncentiveFindKey,
  calculateVariableIncentiveAmount,
  calculateSupportTeamIncentiveAmount,
};

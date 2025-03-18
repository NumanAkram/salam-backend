const SalesDataProviders = require('@modules/sales-data/salesData.providers');
const EmployeesProviders = require('@modules/employees/employees.providers');
const {
  calculateTotalSales,
  calculateTotalBudgetForMonth,
  calculateEmployeeIncentiveByAttendance,
  incentiveFormat,
} = require('../helpers/common.helpers');

const { calculatePercentage } = require('@utils/percentage');

const {
  findKey,
  findCategory,
  extractEmpNumber,
  updateRotation,
  calculateAmountByNumberOfDay,
  findPositionRegex,
  findMinimumJson,
  findAmountByPosition,
  getBudgetAndSalesData4U,
  calculateRetailGeneralFragranceAmount,
} = require('../helpers/retailPerfumery.helpers');

const { Minimum: MinimumJson, BackOffice: BackOfficeJson } =
  require('@json/metadata.json')['RetailPerfumery'];
const { RETAIL_PERFUMERY_POSITIONS,DIST_PERFUMERY_POSITIONS } = require('@enums/sector.enum');
const { BACK_OFFICE_REGEX } = require('@utils/regex');

const calculateRetailPerfumeryIncentive = async (
  budgets,
  clauses,
  year,
  month,
  { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
) => {
  try {
    const budgetAndSalesData = await calculateBudgetAndSales(
      budgets,
      year,
      month,
      { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
    );

    const backOfficeInc = await calculateBackOfficeInc(
      clauses,
      budgets,
      budgetAndSalesData,
      year,
      month,
    );

    const storeManagerInc = await calculateIncentivesWithRotation(
      clauses,
      budgetAndSalesData,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.STORE_MANAGER,
    );

    const storeSupervisorInc = await calculateIncentivesWithRotation(
      clauses,
      budgetAndSalesData,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.STORE_SUPERVISOR,
    );

    const cashierInc = await calculateIncentivesWithRotation(
      clauses,
      budgetAndSalesData,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.CASHIER,
    );

    const budgetAndSalesData4U = getBudgetAndSalesData4U(budgetAndSalesData);
    const stockKeeperInc = await calculateIncentivesWithRotation(
      clauses,
      budgetAndSalesData4U,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.CASHIER,
    );

    const retailGeneralFragranceInc = await calculateRetailGeneralFragrance(
      clauses,
      budgetAndSalesData,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.RETAIL_GENERAL_FRAGRANCE,
    );

    return [
      ...backOfficeInc,
      ...storeManagerInc,
      ...storeSupervisorInc,
      ...cashierInc,
      ...stockKeeperInc,
      ...retailGeneralFragranceInc,
    ];
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateDistPerfumeryIncentive = async (
  budgets,
  clauses,
  year,
  month,
  { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
) => {
  try {
    const budgetAndSalesData = await calculateBudgetAndSales(
      budgets,
      year,
      month,
      { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
    );

    const backOfficeInc = await calculateBackOfficeInc(
      clauses,
      budgets,
      budgetAndSalesData,
      year,
      month,
    );

    const storeManagerInc = await calculateIncentivesWithRotation(
      clauses,
      budgetAndSalesData,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.STORE_MANAGER,
    );

    const storeSupervisorInc = await calculateIncentivesWithRotation(
      clauses,
      budgetAndSalesData,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.STORE_SUPERVISOR,
    );

    const cashierInc = await calculateIncentivesWithRotation(
      clauses,
      budgetAndSalesData,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.CASHIER,
    );

    const budgetAndSalesData4U = getBudgetAndSalesData4U(budgetAndSalesData);
    const stockKeeperInc = await calculateIncentivesWithRotation(
      clauses,
      budgetAndSalesData4U,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.CASHIER,
    );

    const retailGeneralFragranceInc = await calculateRetailGeneralFragrance(
      clauses,
      budgetAndSalesData,
      year,
      month,
      RETAIL_PERFUMERY_POSITIONS.RETAIL_GENERAL_FRAGRANCE,
    );

    return [
      ...backOfficeInc,
      ...storeManagerInc,
      ...storeSupervisorInc,
      ...cashierInc,
      ...stockKeeperInc,
      ...retailGeneralFragranceInc,
    ];
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateBudgetAndSales = async (
  budgets,
  year,
  month,
  { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
) => {
  try {
    const data = {};
    for (const budget of budgets) {
      if (BACK_OFFICE_REGEX.test(budget.deptGroup)) continue;

      const totalBudget = calculateTotalBudgetForMonth([budget], month);

      const sales =
        await SalesDataProviders.getSalesByStoreName3AndLegacyDepartment(
          year,
          month,
          [budget],
        );

      const totalSales = calculateTotalSales(sales);
      let totalSalesInSalesPeriod = 0;
      if (isSalesPeriod) {
        totalSalesInSalesPeriod = await SalesDataProviders.getSalesByDays(
          budget?.storeName3,
          budget?.legacyDepartment,
          year,
          month,
          startSalesPeriodDay,
          endSalesPeriodDay,
        );
      }
      const totalSalesInNormalPeriod = totalSales - totalSalesInSalesPeriod;
      const percentage = calculatePercentage(totalSales, totalBudget);

      data[budget?.locationCode] = {
        totalBudget,
        totalSales,
        percentage,
        locationCode: budget?.locationCode,
        totalSalesInSalesPeriod,
        totalSalesInNormalPeriod,
      };
    }

    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateBackOfficeInc = async (
  clauses,
  budgets,
  budgetAndSalesData,
  year,
  month,
) => {
  try {
    const incentives = [];
    const budget = budgets.find((ele) => BACK_OFFICE_REGEX.test(ele.deptGroup));
    const totalBudget = calculateTotalBudgetForMonth([budget], month);
    const totalSales = Object.values(budgetAndSalesData).reduce((acc, cur) => {
      if (!isNaN(cur?.totalSales)) {
        return acc + cur.totalSales;
      } else {
        return acc;
      }
    }, 0);

    const percentage = calculatePercentage(totalSales, totalBudget);
    if (percentage < MinimumJson.BackOffice) return [];

    const { selectedEmp } =
      clauses?.employees.find((item) => {
        if (item?.position == DIST_PERFUMERY_POSITIONS.BACK_OFFICE) {
          return item;
        }
      }) || [];

    const employees = await EmployeesProviders.getEmployeesByIds(
      selectedEmp,
      clauses.probationTrainingPeriod,
    );

    if (!Array.isArray(employees) || !employees.length) return [];
    const key = findKey(percentage);

    for (const emp of employees) {
      const amount = calculateEmployeeIncentiveByAttendance(
        parseInt(BackOfficeJson[key]),
        emp,
        year,
        month,
      );

      incentives.push(
        incentiveFormat(
          amount,
          emp,
          percentage,
          RETAIL_PERFUMERY_POSITIONS.BACK_OFFICE,
          totalSales,
          totalBudget,
        ),
      );
    }
    return incentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateIncentivesWithRotation = async (
  clauses,
  budgetAndSalesData,
  year,
  month,
  position,
) => {
  try {
    const incentives = [];
    const employees = await EmployeesProviders.getRetailPerfumeryEmployees(
      findPositionRegex(position),
      clauses?.probationTrainingPeriod,
      Object.keys(budgetAndSalesData),
    );
    for (const emp of employees) {
      let rotation = await SalesDataProviders.getRetailPerfumeryRotation(
        extractEmpNumber(emp?.empNo),
        Object.keys(budgetAndSalesData),
        year,
        month,
      );

      rotation = updateRotation(emp, rotation);

      let incentiveAmount = 0;
      for (const ele of rotation) {
        if (ele?._id in budgetAndSalesData) {
          if (
            budgetAndSalesData[ele._id].percentage >= findMinimumJson(position)
          ) {
            const key = findKey(budgetAndSalesData[ele._id].percentage);
            const category = findCategory(
              budgetAndSalesData[ele._id].locationCode,
            );

            const amount = calculateAmountByNumberOfDay(
              findAmountByPosition(position, category, key),
              ele.uniqueDaysCount,
              year,
              month,
            );

            incentiveAmount += amount;
          }
        }
      }
      incentives.push(
        incentiveFormat(
          incentiveAmount,
          emp,
          undefined,
          position,
          undefined,
          undefined,
        ),
      );
    }
    return incentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateRetailGeneralFragrance = async (
  clauses,
  budgetAndSalesData,
  year,
  month,
  position,
) => {
  try {
    const incentives = [];
    const employees = await EmployeesProviders.getRetailPerfumeryEmployees(
      findPositionRegex(position),
      clauses?.probationTrainingPeriod,
      Object.keys(budgetAndSalesData),
    );

    for (const emp of employees) {
      let rotation = await SalesDataProviders.getRetailPerfumeryRotation(
        extractEmpNumber(emp?.empNo),
        Object.keys(budgetAndSalesData),
        year,
        month,
      );

      rotation = updateRotation(emp, rotation);

      let incentiveAmount = 0;
      for (const ele of rotation) {
        if (ele?._id in budgetAndSalesData) {
          if (
            budgetAndSalesData[ele._id].percentage >= findMinimumJson(position)
          ) {
            const key = findKey(budgetAndSalesData[ele._id].percentage);
            const category = findCategory(
              budgetAndSalesData[ele._id].locationCode,
            );

            const amount = calculateRetailGeneralFragranceAmount(
              budgetAndSalesData[ele._id].totalSalesInNormalPeriod,
              budgetAndSalesData[ele._id].totalSalesInSalesPeriod,
              ele?.uniqueDaysCount,
              year,
              month,
              key,
              category,
            );
            incentiveAmount += amount;
          }
        }
      }

      incentives.push(
        incentiveFormat(
          incentiveAmount,
          emp,
          undefined,
          position,
          undefined,
          undefined,
        ),
      );
    }
    return incentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = { calculateRetailPerfumeryIncentive,calculateDistPerfumeryIncentive };

const { calculatePercentage } = require('@utils/percentage');
const { DIST_PERFUMERY_POSITIONS } = require('@enums/sector.enum');
const EmployeesProviders = require('@modules/employees/employees.providers');
const { PrefumerySales } = require('@models');
const { findKey } = require('../helpers/retailPerfumery.helpers');
const { incentiveFormat } = require('../helpers/common.helpers');
const {
  Minimum: MinimumJson,
  FragranceAdvisor: fragranceAdvisorJson,
  // ManagerAndSupervisor: ManagerAndSupervisorJson,
  // Merchandiser: MerchandiserJson,
  // BackOffice: BackOfficeJson,
  // Institutional: InstitutionalJson,
} = require('@json/metadata.json')['DistPerfumery'];

// const {
//   findKey,
//   findCategory,
//   extractEmpNumber,
//   updateRotation,
//   calculateAmountByNumberOfDay,
//   findPositionRegex,
//   findMinimumJson,
//   findAmountByPosition,
//   getBudgetAndSalesData4U,
//   calculateRetailGeneralFragranceAmount,
// } = require('../helpers/distPerfumery.helpers');

// const { Minimum: MinimumJson, BackOffice: BackOfficeJson } =
//   require('@json/metadata.json')['DistPerfumery'];
// const { RETAIL_PERFUMERY_POSITIONS,DIST_PERFUMERY_POSITIONS } = require('@enums/sector.enum');
// const { BACK_OFFICE_REGEX } = require('@utils/regex');

const calculateDistPerfumeryIncentive = async (
  clauses,
  year,
  month,
) => {
  try {
    const fragranceAdvisor = await calculateFragranceAdvisorInc(
      clauses,
      year,
      month
    );

    return [
      ...fragranceAdvisor
    ]

  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateFragranceAdvisorInc = async (
  clauses,
  year,
  month,
) => {
  try {
    const employeesIncentives = [];
    // const key = salesRepFindKey(percentage);

    const { selectedEmp } =
      clauses?.employees.find((item) => {
        if (item?.position == DIST_PERFUMERY_POSITIONS.FRAGRANCE_ADVISOR) {
          return item;
        }
      }) || [];

    const employees = await EmployeesProviders.getEmployeesByIds(
      selectedEmp,
      clauses.probationTrainingPeriod,
    );
    // console.log("-------------", month, year)
    const date = new Date(Date.UTC(year, month, 0, 14, 0, 0));
    const formattedDate = date.toISOString();
    console.log("Date Formant: ", formattedDate)
    for (const emp of employees) {
      // year month
      const empSale = await PrefumerySales.find({ name: emp.empName.toUpperCase(), date: formattedDate });
      let totalIncentive = 0;
      let totalSales = 0;
      let totalBudget = 0;
      const filteredSales = empSale.filter((item) => item.division.includes(emp.locationGroup));
      for (const sale of filteredSales) {
        if (sale.shopAchievement && sale.shopAchievement * 100 >= MinimumJson.FragranceAdvisor) {
          let incentive = 0;
          totalSales += parseInt(sale.shopSales.replace(/,/g, ''));
          totalBudget += parseInt(sale.shopBudget.replace(/,/g, ''));
          const key = findKey(sale.shopAchievement * 100);
          // console.log(Number(sale.fragrance.replace(/,/g, '')), sale.makeUp, sale.skinCare);
          if (Number(sale.fragrance.replace(/,/g, '')) > 0) {
            const incentivePercentage = fragranceAdvisorJson.Fragrance[key];
            const fragranceIncentive = (Number(sale.shopSales.replace(/,/g, '')) * incentivePercentage / 100)
            incentive += fragranceIncentive;
          }
          if (Number(sale.makeUp.replace(/,/g, '')) > 0) {
            const incentivePercentage = fragranceAdvisorJson.MakeUp[key];
            const makeupIncentive = (Number(sale.shopSales.replace(/,/g, '')) * incentivePercentage / 100)
            incentive += makeupIncentive;
          }
          if (Number(sale.skinCare.replace(/,/g, '')) > 0) {
            const incentivePercentage = fragranceAdvisorJson.MakeUp[key];
            const skinCareIncentive = (Number(sale.shopSales.replace(/,/g, '')) * incentivePercentage / 100)
            incentive += skinCareIncentive;
          }
          if (incentive < Number(sale.totalPinMoneyIncentives.replace(/,/g, ''))) {
            totalIncentive += Number(sale.totalPinMoneyIncentives.replace(/,/g, ''))
          } else {
            totalIncentive += incentive;
          }
        }
      }
      const percentage = calculatePercentage(totalSales, totalBudget);
      employeesIncentives.push(
        incentiveFormat(
          totalIncentive,
          emp,
          percentage,
          DIST_PERFUMERY_POSITIONS.FRAGRANCE_ADVISOR,
          totalSales,
          totalBudget,
        ),
      );
    }

    // for (const emp of employees) {
    //   const amount = calculateEmployeeIncentiveByAttendance(
    //     SalesRepresentativeJson[key],
    //     emp,
    //     year,
    //     month,
    //   );
    //   employeesIncentives.push(
    //     incentiveFormat(
    //       amount,
    //       emp,
    //       percentage,
    //       DIST_HOME.SALES_REPRESENTATIVE,
    //       totalSale,
    //       totalBudget,
    //     ),
    //   );
    // }
    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = { calculateDistPerfumeryIncentive };


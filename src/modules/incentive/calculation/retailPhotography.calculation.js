const { BadRequestError } = require('@utils/api-error');
const {
  calculatePercentage,
  calculateAmountFromPercentage,
} = require('@utils/percentage');
const {
  calculateTotalSales,
  calculateTotalBudgetForMonth,
  calculateEmployeeIncentiveByAttendance,
  incentiveFormat,
} = require('../helpers/common.helpers');
const {
  getIncentivesPercentageRP,
  calculateTotalIncentiveMetadata,
} = require('../helpers/retailPhotography.helpers');

const {
  RetailPhotography: RetailPhotographyJson,
} = require('@json/metadata.json');
const { EmployeesProviders } = require('@modules/employees');

const calculateIncentive = async (
  sales,
  budget,
  employees,
  metadata,
  clauses,
  year,
  month,
) => {
  try {
    if (!employees.length) return [];

    const employeesIncentives = [];
    const totalSales = calculateTotalSales(sales);
    const totalBudget = calculateTotalBudgetForMonth([budget], month);
    const percentage = calculatePercentage(totalSales, totalBudget);

    if (percentage >= RetailPhotographyJson.Minimum) {
      const incentivePercentage = getIncentivesPercentageRP(percentage);

      const totalIncentive = calculateAmountFromPercentage(
        totalSales,
        incentivePercentage,
      );
      const empIncentive = totalIncentive / employees.length;
      employees.map((emp) => {
        const amount = calculateEmployeeIncentiveByAttendance(
          empIncentive,
          emp,
          year,
          month,
        );
        employeesIncentives.push(
          incentiveFormat(
            amount,
            emp,
            [percentage],
            undefined,
            totalSales,
            totalBudget,
          ),
        );
      });

      return employeesIncentives;
    } else {
      if (!metadata) {
        return Promise.reject(
          new BadRequestError({
            en: 'Retail Photography does not achieve the budgets, upload metadata',
            ar: 'التصوير التجاري لا يحقق الميزانيات، قم بتحميل البيانات الوصفية',
          }),
        );
      }

      const { items, employees: empMetadata } = metadata;
      const totalIncentive = calculateTotalIncentiveMetadata(items);
      await Promise.all(
        empMetadata.map(async (item) => {
          const { percentage, _empId } = item;

          const emp = await EmployeesProviders.getEmployeeById(
            _empId,
            clauses.probationTrainingPeriod,
          );

          const amount = calculateAmountFromPercentage(
            totalIncentive,
            percentage,
          );

          employeesIncentives.push(
            incentiveFormat(
              amount,
              emp,
              [percentage],
              undefined,
              totalSales,
              totalBudget,
            ),
          );
        }),
      );

      return employeesIncentives;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = calculateIncentive;

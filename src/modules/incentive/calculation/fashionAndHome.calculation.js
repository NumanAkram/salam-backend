const SalesDataProviders = require('@modules/sales-data/salesData.providers');
const EmployeesProviders = require('@modules/employees/employees.providers');
const {
  calculateTotalSales,
  calculateTotalBudgetForMonth,
  calculateEmployeeIncentiveByAttendance,
  incentiveFormat,
} = require('../helpers/common.helpers');
const {
  calculatePercentage,
  calculateAmountFromPercentage,
} = require('@utils/percentage');

const {
  salesAchievedFindKey,
  fixedIncentiveFindKey,
  variableIncentiveFindKey,
  excludeEmpIds,
  isExcludeEmpId,
  getStoreManagerDeptEmployees,
  calculateVariableIncentiveAmount,
  calculateSupportTeamIncentiveAmount,
  mtmFindKey,
} = require('../helpers/fashionAndHome.helpers');
const { decimalConverter } = require('@utils/decimalConverter');

const {
  Minimum: MinimumJson,
  SalesAchieved: SalesAchievedJson,
  Individual: IndividualJson,
  Team: TeamJson,
  StoreManagerDepartmentStore: StoreManagerDepartmentStoreJson,
  SupportTeam: SupportTeamJson,
  MTM: MTMJson,
} = require('@json/metadata.json')['FashionAndHome'];

const { FASHION_AND_HOME_POSITIONS } = require('@enums/sector.enum');

const calculateBudgetAndSales = async (budgets, year, month) => {
  const totalBudgets = calculateTotalBudgetForMonth(budgets, month);
  const sales =
    await SalesDataProviders.getSalesByStoreName3AndLegacyDepartment(
      year,
      month,
      budgets,
    ); // now we use store name 3 but probably we need to use location code
  const totalSales = calculateTotalSales(sales);
  return { totalBudgets, totalSales };
};

const calculateIndividualIncentive = async (
  budgets,
  totalBudgets,
  totalSales,
  year,
  month,
  clauses,
) => {
  try {
    const incentives = [];
    const percentage = calculatePercentage(totalSales, totalBudgets);
    const exclude = excludeEmpIds(clauses);

    if (percentage >= MinimumJson.Individual) {
      const key = salesAchievedFindKey(percentage);
      const totalAmount = calculateAmountFromPercentage(
        totalSales,
        parseFloat(SalesAchievedJson[key]),
      );
      const totalIndAmount = calculateAmountFromPercentage(
        totalAmount,
        IndividualJson.Percentage,
      );

      const employees = await SalesDataProviders.getEmpBySales(
        year,
        month,
        budgets,
      );

      await Promise.all(
        employees.map(async (item) => {
          const emp = await EmployeesProviders.selectEmpByNo(item?._id, {
            probationTrainingPeriod: clauses?.probationTrainingPeriod,
          });

          if (!emp || isExcludeEmpId(emp?._id, exclude)) {
            return;
          }

          const empTotalSales = item?.totalSales > 0 ? item?.totalSales : 0;
          const empPercentage = calculatePercentage(empTotalSales, totalSales);
          const empIncentive = calculateAmountFromPercentage(
            totalIndAmount,
            empPercentage,
          );
          incentives.push(
            incentiveFormat(
              undefined,
              emp,
              empPercentage,
              emp.position,
              undefined,
              undefined,
              {
                individualIncentive: {
                  amount: decimalConverter(empIncentive),
                  deptGroup: budgets[0]?.deptGroup,
                },
              },
            ),
          );
        }),
      );
    }
    return incentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateTeamIncentive = async (
  budgets,
  totalBudgets,
  totalSales,
  year,
  month,
  clauses,
) => {
  try {
    const incentives = [];
    const percentage = calculatePercentage(totalSales, totalBudgets);
    const exclude = excludeEmpIds(clauses, false);

    if (percentage >= MinimumJson.Team) {
      const key = salesAchievedFindKey(percentage);
      const totalAmount = calculateAmountFromPercentage(
        totalSales,
        parseFloat(SalesAchievedJson[key]),
      );
      const totalTeamAmount = calculateAmountFromPercentage(
        totalAmount,
        TeamJson.Percentage,
      );
      const locationCodes = budgets
        .map((budget) => {
          if (budget?.locationCode) {
            return budget?.locationCode;
          } else {
            return null;
          }
        })
        .filter((item) => item != null);
      const employees = await EmployeesProviders.getEmployeesByLocationCode(
        locationCodes,
        clauses?.probationTrainingPeriod,
      );

      if (Array.isArray(employees) && employees.length) {
        const empIncentive = totalTeamAmount / employees.length;

        await Promise.all(
          employees.map(async (emp) => {
            const amount = calculateEmployeeIncentiveByAttendance(
              empIncentive,
              emp,
              year,
              month,
            );

            if (isExcludeEmpId(emp?._id, exclude)) {
              return;
            }
            incentives.push(
              incentiveFormat(
                undefined,
                emp,
                percentage,
                undefined,
                totalSales,
                totalBudgets,
                {
                  teamIncentive: decimalConverter(amount),
                },
              ),
            );
          }),
        );
      }
    }
    return incentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateStoreManagerDepartmentStoreInc = async (
  budgetCode,
  totalBudgets,
  totalSales,
  year,
  month,
  clauses,
  {
    isPromotion,
    startPromotionDay,
    endPromotionDay,
    isSalesPeriod,
    startSalesPeriodDay,
    endSalesPeriodDay,
  },
) => {
  try {
    const incentives = [];
    const employees = getStoreManagerDeptEmployees(budgetCode, clauses);
    const percentage = calculatePercentage(totalSales, totalBudgets);

    if (
      Array.isArray(employees) &&
      employees.length &&
      percentage >= MinimumJson.storeManagerDepartmentStore
    ) {
      const fixedIncentiveKey = fixedIncentiveFindKey(totalBudgets);
      const variableIncentiveKey = variableIncentiveFindKey(percentage);
      const MonthlyPercentage =
        StoreManagerDepartmentStoreJson.MonthlyAchievement[
        variableIncentiveKey
        ];
      const promotionPercentage =
        StoreManagerDepartmentStoreJson.MonthlyAchievementPromotion[
        variableIncentiveKey
        ];
      const salesPeriodPercentage =
        StoreManagerDepartmentStoreJson.MonthlyAchievementSalesPeriod[
        variableIncentiveKey
        ];

      await Promise.all(
        employees.map(async (_empId) => {
          const emp = await EmployeesProviders.getEmployeeById(
            _empId,
            clauses?.probationTrainingPeriod,
          );
          if (!emp) return;

          const fixedIncentive = parseInt(
            StoreManagerDepartmentStoreJson.FixedIncentive[fixedIncentiveKey],
          );

          const variableIncentive = calculateVariableIncentiveAmount({
            totalSales,
            percentage: MonthlyPercentage,
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
          });

          incentives.push(
            incentiveFormat(
              undefined,
              emp,
              percentage,
              undefined,
              totalSales,
              totalBudgets,
              {
                fixedIncentive: decimalConverter(fixedIncentive),
                variableIncentive: decimalConverter(variableIncentive),
                employeeNumber: emp?.empNo,
              },
            ),
          );
        }),
      );
    }
    return incentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateSupportTeamInc = async (
  year,
  month,
  clauses,
  {
    isPromotion,
    startPromotionDay,
    endPromotionDay,
    isSalesPeriod,
    startSalesPeriodDay,
    endSalesPeriodDay,
  },
) => {
  try {
    const incentives = [];
    if (Array.isArray(clauses?.employees)) {
      await Promise.all(
        clauses.employees.map(async (item) => {
          if (
            Object.keys(FASHION_AND_HOME_POSITIONS).includes(item?.position) &&
            Array.isArray(item?.selectedEmp)
          ) {
            const totalAmount = calculateSupportTeamIncentiveAmount({
              position: item?.position,
              isPromotion,
              startPromotionDay,
              endPromotionDay,
              isSalesPeriod,
              startSalesPeriodDay,
              endSalesPeriodDay,
              SupportTeamJson,
              fashionAndHomePositions: FASHION_AND_HOME_POSITIONS,
              year,
              month,
            });

            await Promise.all(
              item.selectedEmp.map(async (_id) => {
                const emp = await EmployeesProviders.getEmployeeById(
                  _id,
                  clauses?.probationTrainingPeriod,
                );
                if (emp) {
                  const supportTeamIncentive =
                    calculateEmployeeIncentiveByAttendance(
                      totalAmount,
                      emp,
                      year,
                      month,
                    );

                  incentives.push(
                    incentiveFormat(
                      undefined,
                      emp,
                      undefined,
                      undefined,
                      undefined,
                      undefined,
                      {
                        supportTeamIncentive:
                          decimalConverter(supportTeamIncentive),
                      },
                    ),
                  );
                }
              }),
            );
          }
        }),
      );
    }
    return incentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateConcreteSalesIncentive = async (year, month) => {
  try {
    let finalIncentives = [];
    const sales = await SalesDataProviders.getCustomSales(year, month);
    const employees = await Promise.all(
      [...new Set(sales.map((item) => item.salespersonId))].map((id) =>
        EmployeesProviders.selectEmpByNo(id, 0)
      )
    );

    const Incentive = (employees.map((employee) => ({
      employee,
      totalResaValue: sales
        .filter((sale) => sale?.salespersonId === employee?.empNo)
        .reduce((sum, sale) => sum + (sale.resaValue /2 || 0), 0),
    })));
    
    Incentive.map((item)=>{
      finalIncentives.push(
        incentiveFormat(
          item?.totalResaValue,
          item?.employee,
          undefined,
          item?.employee?.position,
          item.resaValue,
          undefined,
        ),
      );
    })
    return finalIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};



const calculateMTMInc = async (budget, year, month, clauses) => {
  try {
    const incentives = [];
    const totalBudget = calculateTotalBudgetForMonth([budget], month);
    if (!totalBudget) return incentives;
    const totalSales =
      await SalesDataProviders.getMtmSales(
        year,
        month,
        6,
        1,
      );
    const percentage = calculatePercentage(totalSales, totalBudget);
    if (percentage < MinimumJson.MTM) return incentives;
    const key = mtmFindKey(percentage);
    const totalIncentive = calculateAmountFromPercentage(
      totalSales,
      MTMJson.SalesAchieved[key],
    );
    const totalIndInc = calculateAmountFromPercentage(
      totalIncentive,
      IndividualJson.Percentage,
    );

    const employeesIndInc = await SalesDataProviders.getEmpBySales(
      year,
      month,
      [budget],
      6,
      1,
    );
    await Promise.all(
      employeesIndInc.map(async (item) => {
        const emp = await EmployeesProviders.selectEmpByNo(item?._id, {
          probationTrainingPeriod: clauses?.probationTrainingPeriod,
        });

        //check that
        // if (!emp || isExcludeEmpId(emp?._id, exclude)) {
        //   return;
        // }

        const empTotalSales = item?.totalSales > 0 ? item?.totalSales : 0;
        const empPercentage = calculatePercentage(empTotalSales, totalSales);
        const empIncentive = calculateAmountFromPercentage(
          totalIndInc,
          empPercentage,
        );
        incentives.push(
          incentiveFormat(
            undefined,
            emp,
            empPercentage,
            undefined,
            totalSales,
            totalBudget,
            {
              individualIncentive: {
                amount: decimalConverter(empIncentive),
                deptGroup: budget?.deptGroup,
              },
            },
          ),
        );
      }),
    );

    const teamIndInc = calculateAmountFromPercentage(
      totalIncentive,
      TeamJson.Percentage,
    );

    const locationCodes = [budget]
      .map((budget) => {
        if (budget?.locationCode) {
          return budget?.locationCode;
        } else {
          return null;
        }
      })
      .filter((item) => item != null);
    const employeesTeamInc =
      await EmployeesProviders.getEmployeesByLocationCode(
        locationCodes,
        clauses?.probationTrainingPeriod,
      );

    if (Array.isArray(employeesTeamInc) && employeesTeamInc.length) {
      const empIncentive = teamIndInc / employeesTeamInc?.length;
      await Promise.all(
        employeesTeamInc.map(async (emp) => {
          const amount = calculateEmployeeIncentiveByAttendance(
            empIncentive,
            emp,
            year,
            month,
          );
          //check that with client
          // if (isExcludeEmpId(emp?._id, exclude)) {
          //   return;
          // }

          incentives.push(
            incentiveFormat(
              undefined,
              emp,
              percentage,
              undefined,
              totalSales,
              totalBudget,
              {
                teamIncentive: decimalConverter(amount),
              },
            ),
          );
        }),
      );
    }
    return incentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  calculateBudgetAndSales,
  calculateIndividualIncentive,
  calculateTeamIncentive,
  calculateStoreManagerDepartmentStoreInc,
  calculateSupportTeamInc,
  calculateConcreteSalesIncentive,
  calculateMTMInc,
};

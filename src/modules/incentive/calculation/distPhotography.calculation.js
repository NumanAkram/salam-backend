const { Incentive } = require('@models');
const moment = require('moment');
const SalesDataProviders = require('@modules/sales-data/salesData.providers');
const EmployeesProviders = require('@modules/employees/employees.providers');
const { Employee } = require('@models');
const BudgetProvider = require('@modules/budget/budget.providers');
const { decimalConverter } = require('@utils/decimalConverter');

const {
  calculateTotalBudgetForMonth,
  calculateEmployeeIncentiveByAttendance,
  incentiveFormat,
  totalSum,
  calculateQuarterIncentiveByAttendance,
} = require('../helpers/common.helpers');

const {
  salesRepresentativeFindKey,
  backOfficeFindKey,
  energizerMerchandiserFindKey,
  checkQuarterPositions,
  findPositionMonthlyAmount,
  checkVanSalesPosition,
  checkTechSupportPosition,
} = require('../helpers/distPhotography.helpers');

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
  Minimum: MinimumJson,
  VanSales: VanSalesJson,
  Institutional: InstitutionalJson,
  TechSupport: TechSupportJson,
  LocationIncentive: LocationIncentiveJson,
} = require('@json/metadata.json')['DistPhotography'];

const {
  calculateAmountFromPercentage,
  calculatePercentage,
} = require('@utils/percentage');

const { DP_POSITIONS } = require('@enums/sector.enum');

const { VAN_SALES } = require('@utils/regex');

const calculateLocationIncentive = async (budget, clauses, year, month) => {
  try {
    const totalSales = await SalesDataProviders.getTotalSalesByStoreName3(
      budget?.storeName3,
      year,
      month,
    );

    const employees = await EmployeesProviders.getEmployeesByLocationCode(
      [budget?.locationCode],
      clauses?.probationTrainingPeriod,
    );

    const totalBudget = calculateTotalBudgetForMonth([budget], month);

    const incentivePercentage = calculatePercentage(totalSales, totalBudget);

    const totalAmount = calculateAmountFromPercentage(
      totalSales,
      parseInt(LocationIncentiveJson.percentage),
    );

    const totalAmountPerEmp = employees.length
      ? totalAmount / employees.length
      : totalAmount;

    const employeesIncentives = employees.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.LocationIncentive
          ? calculateEmployeeIncentiveByAttendance(
              totalAmountPerEmp,
              emp,
              year,
              month,
            )
          : 0;
      return incentiveFormat(
        amount,
        emp,
        undefined,
        undefined,
        totalSales,
        totalBudget,
      );
    });

    return employeesIncentives;
  } catch (error) {
    Promise.reject(error);
  }
};

const calculateWorkshopIncentive = async (
  totalIncentive,
  clauses,
  budget,
  year,
  month,
) => {
  try {
    const employees = await EmployeesProviders.getEmployeesByLocationCode(
      [budget?.locationCode],
      clauses?.probationTrainingPeriod,
    );

    const totalAmountPerEmp = employees.length
      ? totalIncentive / employees.length
      : totalIncentive;

    const employeesIncentives = employees.map((emp) => {
      const amount = calculateEmployeeIncentiveByAttendance(
        totalAmountPerEmp,
        emp,
        year,
        month,
      );
      return incentiveFormat(
        amount,
        emp,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
    return employeesIncentives;
  } catch (error) {
    Promise.reject(error);
  }
};

const calculateVanSalesIncentive = async (budget, clauses, year, month) => {
  const employee = await EmployeesProviders.findEmployeeByLocationCode(
    budget.locationCode,
    clauses?.probationTrainingPeriod,
    { position: { $regex: VAN_SALES } },
  );

  if (employee) {
    const employeesIncentives = [];
    const totalSales = await SalesDataProviders.getTotalSalesByLocationCode(
      budget?.locationCode,
      year,
      month,
    );

    const totalBudget = calculateTotalBudgetForMonth([budget], month);
    const incentivePercentage = calculatePercentage(totalSales, totalBudget);

    const amount =
      incentivePercentage >= MinimumJson.VanSales
        ? calculateAmountFromPercentage(totalSales, VanSalesJson.percentage)
        : 0;
    employeesIncentives.push(
      incentiveFormat(
        amount,
        employee,
        [incentivePercentage],
        DP_POSITIONS.VAN_SALES,
        totalSales,
        totalBudget,
      ),
    );
    return employeesIncentives;
  } else {
    return [];
  }
};

const calculateTeamCanonIncentive = async (
  budget,
  clauses,
  year,
  month,
  teamNikonAndCanonPercentage,
) => {
  try {
    const employeesIncentives = [];

    const totalSales = await SalesDataProviders.getTotalSalesByLocationCode(
      budget?.locationCode,
      year,
      month,
      { brandName: 'CANON' },
    );

    const totalBudget = calculateTotalBudgetForMonth([budget], month);
    const incentivePercentage = calculatePercentage(totalSales, totalBudget);

    const { selectedEmp } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.TEAM_A) {
          return item;
        }
      }) || [];

    const employees = await EmployeesProviders.getEmployeesByIds(
      selectedEmp,
      clauses.probationTrainingPeriod,
    );

    const key = salesRepresentativeFindKey(incentivePercentage);
    teamNikonAndCanonPercentage.canon.key = key;
    teamNikonAndCanonPercentage.canon.percentage = incentivePercentage;

    employees.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.TeamCanon
          ? calculateEmployeeIncentiveByAttendance(
              TeamAJson[key],
              emp,
              year,
              month,
            )
          : 0;
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [incentivePercentage],
          DP_POSITIONS.TEAM_A,
          totalSales,
          totalBudget,
        ),
      );
    });

    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateTeamNikonIncentive = async (
  budget,
  clauses,
  year,
  month,
  teamNikonAndCanonPercentage,
) => {
  try {
    const employeesIncentives = [];

    const totalSales = await SalesDataProviders.getTotalSalesByLocationCode(
      budget?.locationCode,
      year,
      month,
      { brandName: 'NIKON' },
    );

    const totalBudget = calculateTotalBudgetForMonth([budget], month);
    const incentivePercentage = calculatePercentage(totalSales, totalBudget);

    const { selectedEmp: selectedEmpB } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.TEAM_B) {
          return item;
        }
      }) || [];

    const { selectedEmp: selectedEmpB2 } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.TEAM_B2) {
          return item;
        }
      }) || [];

    const employeesTeamB = await EmployeesProviders.getEmployeesByIds(
      selectedEmpB,
      clauses.probationTrainingPeriod,
    );
    const employeesTeamB2 = await EmployeesProviders.getEmployeesByIds(
      selectedEmpB2,
      clauses.probationTrainingPeriod,
    );

    const key = salesRepresentativeFindKey(incentivePercentage);
    teamNikonAndCanonPercentage.nikon.key = key;
    teamNikonAndCanonPercentage.nikon.percentage = incentivePercentage;

    employeesTeamB.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.TeamNikon
          ? calculateEmployeeIncentiveByAttendance(
              TeamBJson[key],
              emp,
              year,
              month,
            )
          : 0;
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [incentivePercentage],
          DP_POSITIONS.TEAM_B,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesTeamB2.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.TeamNikon
          ? calculateEmployeeIncentiveByAttendance(
              TeamB2Json[key],
              emp,
              year,
              month,
            )
          : 0;
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [incentivePercentage],
          DP_POSITIONS.TEAM_B2,
          totalSales,
          totalBudget,
        ),
      );
    });

    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateTeamEnergizerIncentive = async (
  budget,
  clauses,
  year,
  month,
) => {
  try {
    const employeesIncentives = [];

    const totalSales = await SalesDataProviders.getTotalSalesByLocationCode(
      budget?.locationCode,
      year,
      month,
    );
    const totalBudget = calculateTotalBudgetForMonth([budget], month);

    const incentivePercentage = calculatePercentage(totalSales, totalBudget);

    const { selectedEmp: selectedEmpTeamC } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.TEAM_C) {
          return item;
        }
      }) || [];
    const { selectedEmp: selectedEmpMerchandiser } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.MERCHANDISER) {
          return item;
        }
      }) || [];

    const employeesTeamC = await EmployeesProviders.getEmployeesByIds(
      selectedEmpTeamC,
      clauses.probationTrainingPeriod,
    );
    const employeesMerchandiser = await EmployeesProviders.getEmployeesByIds(
      selectedEmpMerchandiser,
      clauses.probationTrainingPeriod,
    );

    const key = energizerMerchandiserFindKey(incentivePercentage);

    employeesTeamC.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.TeamEnergizer
          ? calculateEmployeeIncentiveByAttendance(
              TeamCJson[key],
              emp,
              year,
              month,
            )
          : 0;
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [incentivePercentage],
          DP_POSITIONS.TEAM_C,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesMerchandiser.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.TeamEnergizer
          ? calculateEmployeeIncentiveByAttendance(
              MerchandiserJson[key],
              emp,
              year,
              month,
            )
          : 0;
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [incentivePercentage],
          DP_POSITIONS.MERCHANDISER,
          totalSales,
          totalBudget,
        ),
      );
    });

    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateBackOfficeIncentive = async (budget, clauses, year, month) => {
  try {
    const employeesIncentives = [];

    const { deptGroup } =
      clauses.backOffice.find((item) => {
        if (item?.backOfficeDeptGroup == budget?.deptGroup) {
          return item;
        }
      }) || [];

    if (!Array.isArray(deptGroup) && !deptGroup?.length) {
      return employeesIncentives;
    }

    const budgets = await BudgetProvider.getBudgetsByDeptGroups(deptGroup);
    const totalBudget = calculateTotalBudgetForMonth([budget], month);

    const budgetsCodes = budgets.map((item) => {
      return { locationCode: item?.locationCode, storeName3: item?.storeName3 };
    });
    const totalSales = await SalesDataProviders.getTotalSalesDP(
      budgetsCodes,
      year,
      month,
    );
    const incentivePercentage = calculatePercentage(totalSales, totalBudget);

    const { selectedEmp: selectedEmpManagerCanon } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.MANAGER_CANON) {
          return item;
        }
      }) || [];

    const { selectedEmp: selectedEmpBackOfficeCanon } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.BACK_OFFICE_CANON) {
          return item;
        }
      }) || [];

    const { selectedEmp: selectedEmpManagerEnergizer } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.MANAGER_ENERGIZER) {
          return item;
        }
      }) || [];

    const { selectedEmp: selectedEmpBackOfficeEnergizer } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.BACK_OFFICE_ENERGIZER) {
          return item;
        }
      }) || [];

    const employeesManagerCanon = await EmployeesProviders.getEmployeesByIds(
      selectedEmpManagerCanon,
      clauses.probationTrainingPeriod,
    );

    const employeesBackOfficeCanon = await EmployeesProviders.getEmployeesByIds(
      selectedEmpBackOfficeCanon,
      clauses.probationTrainingPeriod,
    );

    const employeesManagerEnergizer =
      await EmployeesProviders.getEmployeesByIds(
        selectedEmpManagerEnergizer,
        clauses.probationTrainingPeriod,
      );

    const employeesBackOfficeEnergizer =
      await EmployeesProviders.getEmployeesByIds(
        selectedEmpBackOfficeEnergizer,
        clauses.probationTrainingPeriod,
      );

    const key = backOfficeFindKey(incentivePercentage);

    employeesManagerCanon.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.BackOffice
          ? calculateEmployeeIncentiveByAttendance(
              ManagerCanonJson[key],
              emp,
              year,
              month,
            )
          : 0;
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [incentivePercentage],
          DP_POSITIONS.MANAGER_CANON,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesBackOfficeCanon.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.BackOffice
          ? calculateEmployeeIncentiveByAttendance(
              BackOfficeCanonJson[key],
              emp,
              year,
              month,
            )
          : 0;
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [incentivePercentage],
          DP_POSITIONS.BACK_OFFICE_CANON,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesManagerEnergizer.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.BackOffice
          ? calculateEmployeeIncentiveByAttendance(
              ManagerEnergizerJson[key],
              emp,
              year,
              month,
            )
          : 0;
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [incentivePercentage],
          DP_POSITIONS.MANAGER_ENERGIZER,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesBackOfficeEnergizer.map((emp) => {
      const amount =
        incentivePercentage >= MinimumJson.BackOffice
          ? calculateEmployeeIncentiveByAttendance(
              BackOfficeEnergizerJson[key],
              emp,
              year,
              month,
            )
          : 0;
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [incentivePercentage],
          DP_POSITIONS.BACK_OFFICE_ENERGIZER,
          totalSales,
          totalBudget,
        ),
      );
    });

    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateInstitutionalIncentive = async (
  budget,
  clauses,
  year,
  month,
) => {
  try {
    const totalSales = await SalesDataProviders.getTotalSalesByLocationCode(
      budget?.locationCode,
      year,
      month,
    );
    const totalBudget = calculateTotalBudgetForMonth([budget], month);

    const incentivePercentage = calculatePercentage(totalSales, totalBudget);

    if (incentivePercentage >= MinimumJson.Institutional) {
      const totalIncentive = calculateAmountFromPercentage(
        totalSales,
        InstitutionalJson.percentage,
      );

      return [
        {
          position: DP_POSITIONS.INSTITUTIONAL,
          incentive: decimalConverter(totalIncentive),
        },
      ];
    } else {
      return [
        {
          position: DP_POSITIONS.INSTITUTIONAL,
          incentive: 0,
        },
      ];
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateTechSupportIncentive = async (
  teamNikonAndCanonPercentage,
  clauses,
  year,
  month,
) => {
  try {
    const employeesIncentives = [];
    const { selectedEmp: selectedEmp } =
      clauses?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.TECH_SUPPORT) {
          return item;
        }
      }) || [];

    const employees = await EmployeesProviders.getEmployeesByIds(
      selectedEmp,
      clauses.probationTrainingPeriod,
    );

    if (
      !teamNikonAndCanonPercentage.canon.key &&
      !teamNikonAndCanonPercentage.nikon.key
    ) {
      employees.map((emp) => {
        employeesIncentives.push(
          incentiveFormat(
            0,
            emp,
            [
              teamNikonAndCanonPercentage.canon.percentage,
              teamNikonAndCanonPercentage.nikon.percentage,
            ],
            DP_POSITIONS.TECH_SUPPORT,
          ),
        );
      });
      return employeesIncentives;
    }

    employees.map((emp) => {
      let incentive = 0;
      if (teamNikonAndCanonPercentage.canon.percentage) {
        incentive += parseInt(
          TechSupportJson[teamNikonAndCanonPercentage.canon.key.toString()] / 2,
        );
      }
      if (teamNikonAndCanonPercentage.nikon.percentage) {
        incentive += parseInt(
          TechSupportJson[teamNikonAndCanonPercentage.nikon.key.toString()] / 2,
        );
      }
      const amount = calculateEmployeeIncentiveByAttendance(
        incentive,
        emp,
        year,
        month,
      );
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [
            teamNikonAndCanonPercentage.canon.percentage,
            teamNikonAndCanonPercentage.nikon.percentage,
          ],
          DP_POSITIONS.TECH_SUPPORT,
        ),
      );
    });

    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

const calculateInstitutionalIncentiveByPercentage = async (
  totalIncentive,
  employeesPercentage,
) => {
  try {
    if (!isNaN(totalIncentive)) {
      const employeesIncentives = [];
      await Promise.all(
        employeesPercentage.map(async (item) => {
          if (item?._empId && item?.percentage) {
            const amount = calculateAmountFromPercentage(
              totalIncentive,
              item.percentage,
            );
            const emp = await Employee.findById(item?._empId);
            if (emp) {
              employeesIncentives.push(
                incentiveFormat(
                  amount,
                  emp,
                  undefined,
                  DP_POSITIONS.INSTITUTIONAL,
                ),
              );
            }
          }
        }),
      );

      return employeesIncentives;
    } else {
      return null;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const quarterIncentiveCalculation = async (
  year,
  month,
  { currentMonth, previousMonth, prePreviousMonth },
) => {
  try {
    if (
      checkQuarterPositions(
        currentMonth?.position,
        previousMonth?.position,
        prePreviousMonth?.position,
      ) &&
      currentMonth?.position === previousMonth?.position &&
      previousMonth?.position === prePreviousMonth?.position
    ) {
      const totalSales = totalSum(
        currentMonth?.totalSales,
        previousMonth?.totalSales,
        prePreviousMonth?.totalSales,
      );
      const totalBudgets = totalSum(
        currentMonth?.totalBudgets,
        previousMonth?.totalBudgets,
        prePreviousMonth?.totalBudgets,
      );

      const quarterPercentage = calculatePercentage(totalSales, totalBudgets);
      if (quarterPercentage < MinimumJson.Quarter) {
        return;
      }
      let totalIncentive;
      if (checkVanSalesPosition(currentMonth?.position)) {
        totalIncentive = calculateAmountFromPercentage(
          totalSales,
          VanSalesJson.percentage,
        );
      } else {
        totalIncentive =
          parseInt(findPositionMonthlyAmount(currentMonth?.position)) * 3;
      }
      const amount = calculateQuarterIncentiveByAttendance(
        totalIncentive,
        year,
        month,
        {
          currentMonthAttendance: currentMonth?.attendance,
          previousMonthAttendance: previousMonth?.attendance,
          prePreviousMonthMonthAttendance: prePreviousMonth?.attendance,
        },
      );

      const totalOwnedIncentive = sum(
        currentMonthAttendance?.monthlyIncentive,
        prePreviousMonth?.monthlyIncentive,
        prePreviousMonth?.monthlyIncentive,
      );

      const quarterIncentive = totalIncentive - totalOwnedIncentive;
      if (quarterIncentive > 0) {
        await Incentive.findOneAndUpdate(
          { _id: currentMonth._id },
          { quarterlyIncentive: quarterIncentive },
        );
      }
    } else if (
      checkTechSupportPosition(
        currentMonth?.position,
        previousMonth?.position,
        prePreviousMonth?.position,
      ) &&
      currentMonth?.position === previousMonth?.position &&
      previousMonth?.position === prePreviousMonth?.position
    ) {
      const currentMonthDate = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();

      const prevMonthDate = moment
        .utc([year, month - 2])
        .startOf('month')
        .toDate();

      const prePrevMonthDate = moment
        .utc([year, month - 3])
        .startOf('month')
        .toDate();

      const teamNikonCurrentMonth = await Incentive.find({
        date: currentMonthDate,
        sector,
        position: DP_POSITIONS.TEAM_B,
      });
      const teamNikonPrevMonth = await Incentive.find({
        date: prevMonthDate,
        sector,
        position: DP_POSITIONS.TEAM_B,
      });
      const teamNikonPrePrevMonth = await Incentive.find({
        date: prePrevMonthDate,
        sector,
        position: DP_POSITIONS.TEAM_B,
      });

      const teamCanonCurrentMonth = await Incentive.find({
        date: currentMonthDate,
        sector,
        position: DP_POSITIONS.TEAM_A,
      });
      const teamCanonPrevMonth = await Incentive.find({
        date: prevMonthDate,
        sector,
        position: DP_POSITIONS.TEAM_A,
      });
      const teamCanonPrePrevMonth = await Incentive.find({
        date: prePrevMonthDate,
        sector,
        position: DP_POSITIONS.TEAM_A,
      });

      const totalSalesTeamNikon = sum(
        teamNikonCurrentMonth?.totalSales,
        teamNikonPrevMonth?.totalSales,
        teamNikonPrePrevMonth?.totalSales,
      );

      const totalBudgetsTeamNikon = sum(
        teamNikonCurrentMonth?.totalBudgets,
        teamNikonPrevMonth?.totalBudgets,
        teamNikonPrePrevMonth?.totalBudgets,
      );

      const totalSalesTeamCanon = sum(
        teamCanonCurrentMonth?.totalSales,
        teamCanonPrevMonth?.totalSales,
        teamCanonPrePrevMonth?.totalSales,
      );

      const totalBudgetsTeamCanon = sum(
        teamCanonCurrentMonth?.totalBudgets,
        teamCanonPrevMonth?.totalBudgets,
        teamCanonPrePrevMonth?.totalBudgets,
      );

      let quarterTotalIncentive;
      const totalIncentive = parseInt(TechSupportJson[100]) * 3;
      const amount = calculateQuarterIncentiveByAttendance(
        totalIncentive,
        year,
        month,
        {
          currentMonthAttendance: currentMonth?.attendance,
          previousMonthAttendance: previousMonth?.attendance,
          prePreviousMonthMonthAttendance: prePreviousMonth?.attendance,
        },
      );
      if (totalSalesTeamNikon >= totalBudgetsTeamNikon) {
        quarterTotalIncentive += amount;
      }
      if (totalSalesTeamCanon >= totalBudgetsTeamCanon) {
        quarterTotalIncentive += amount;
      }

      const totalOwnedIncentive = sum(
        currentMonthAttendance?.monthlyIncentive,
        prePreviousMonth?.monthlyIncentive,
        prePreviousMonth?.monthlyIncentive,
      );

      const quarterIncentive = quarterTotalIncentive - totalOwnedIncentive;
      if (quarterIncentive > 0) {
        await Incentive.findOneAndUpdate(
          { _id: currentMonth._id },
          { quarterlyIncentive: quarterIncentive },
        );
      }
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  calculateLocationIncentive,
  calculateWorkshopIncentive,
  calculateVanSalesIncentive,
  calculateTeamCanonIncentive,
  calculateTeamNikonIncentive,
  calculateTeamEnergizerIncentive,
  calculateBackOfficeIncentive,
  calculateInstitutionalIncentive,
  calculateTechSupportIncentive,
  calculateInstitutionalIncentiveByPercentage,
  quarterIncentiveCalculation,
};

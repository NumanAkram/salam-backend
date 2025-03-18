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
  Minimum: MinimumJson,
  SalesRepresentative: SalesRepresentativeJson,
  ManagerAndSupervisor: ManagerAndSupervisorJson,
  Merchandiser: MerchandiserJson,
  BackOffice: BackOfficeJson,
  Institutional: InstitutionalJson,
} = require('@json/metadata.json')['DistHome'];

const {
  salesRepFindKey,
  managerAndSupervisorFindKey,
  merchandiserFindKey,
  backOfficeFindKey,
} = require('../helpers/distHome.helpers');

const { DIST_HOME } = require('@enums/sector.enum');

const EmployeesProviders = require('@modules/employees/employees.providers');
const SalesDataProviders = require('@modules/sales-data/salesData.providers');

const calculateDistHomeIncentive = async (
  { luggageBudget, institutionalBudget, householdBudget },
  { luggageSales, institutionalSales, householdSales },
  clauses,
  year,
  month,
) => {
  try {
    const totalBudget = calculateTotalBudgetForMonth(
      [luggageBudget, institutionalBudget, householdBudget],
      month,
    );

    const totalSale = calculateTotalSales([
      ...luggageSales,
      ...institutionalSales,
      ...householdSales,
    ]);

    const percentage = calculatePercentage(totalSale, totalBudget);
    if (percentage < MinimumJson.Common) return [];

    const salesRepresentativeInc = await calculateSalesRepInc(
      clauses,
      percentage,
      year,
      month,
      { totalSale, totalBudget },
    );

    const managerAndSupervisorInc = await calculateManagerAndSupervisorInc(
      { luggageBudget, institutionalBudget, householdBudget },
      { luggageSales, institutionalSales, householdSales },
      clauses,
      year,
      month,
    );

    const merchandiserInc = await calculateMerchandiserInc(
      clauses,
      percentage,
      year,
      month,
      { totalSale, totalBudget },
    );

    const backOfficeInc = await calculateBackOfficeInc(
      clauses,
      percentage,
      year,
      month,
      { totalSale, totalBudget },
    );

    const InstitutionalStaffInc = await calculateInstitutionalStaffInc(
      institutionalBudget,
      institutionalSales,
      clauses,
      year,
      month,
    );

    return [
      ...salesRepresentativeInc,
      ...managerAndSupervisorInc,
      ...merchandiserInc,
      ...backOfficeInc,
      ...InstitutionalStaffInc,
    ];
  } catch (error) {
    return Promise.reject(error);
  }
};

// Calculate Sales Representative Incentive
const calculateSalesRepInc = async (
  clauses,
  percentage,
  year,
  month,
  { totalSale, totalBudget },
) => {
  try {
    const employeesIncentives = [];
    const key = salesRepFindKey(percentage);

    const { selectedEmp } =
      clauses?.employees.find((item) => {
        if (item?.position == DIST_HOME.SALES_REPRESENTATIVE) {
          return item;
        }
      }) || [];

    const employees = await EmployeesProviders.getEmployeesByIds(
      selectedEmp,
      clauses.probationTrainingPeriod,
    );

    for (const emp of employees) {
      const amount = calculateEmployeeIncentiveByAttendance(
        SalesRepresentativeJson[key],
        emp,
        year,
        month,
      );
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          percentage,
          DIST_HOME.SALES_REPRESENTATIVE,
          totalSale,
          totalBudget,
        ),
      );
    }

    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Calculate  Manager And Supervisor Incentive
const calculateManagerAndSupervisorInc = async (
  { luggageBudget, institutionalBudget, householdBudget },
  { luggageSales, institutionalSales, householdSales },
  clauses,
  year,
  month,
) => {
  try {
    const employeesIncentives = [];

    // Luggage
    const totalBudgetLuggage = calculateTotalBudgetForMonth(
      [luggageBudget],
      month,
    );
    const totalSaleLuggage = calculateTotalSales(luggageSales);
    const luggagePercentage = calculatePercentage(
      totalSaleLuggage,
      totalBudgetLuggage,
    );

    if (luggagePercentage >= MinimumJson.Common) {
      const key = managerAndSupervisorFindKey(luggagePercentage);
      const { selectedEmp: selectedEmpLuggage } =
        clauses?.employees.find((item) => {
          if (item?.position == DIST_HOME.MANAGER_SUPERVISOR_LUGGAGE) {
            return item;
          }
        }) || [];

      const employeesLuggage = await EmployeesProviders.getEmployeesByIds(
        selectedEmpLuggage,
        clauses.probationTrainingPeriod,
      );

      for (const emp of employeesLuggage) {
        const amount = calculateEmployeeIncentiveByAttendance(
          ManagerAndSupervisorJson[key],
          emp,
          year,
          month,
        );

        employeesIncentives.push(
          incentiveFormat(
            amount,
            emp,
            luggagePercentage,
            DIST_HOME.MANAGER_SUPERVISOR_LUGGAGE,
            totalSaleLuggage,
            totalBudgetLuggage,
          ),
        );
      }
    }
    // household
    const totalBudgetHousehold = calculateTotalBudgetForMonth(
      [householdBudget],
      month,
    );
    const totalSaleHousehold = calculateTotalSales(householdSales);
    const householdSalesPercentage = calculatePercentage(
      totalSaleHousehold,
      totalBudgetHousehold,
    );
    if (householdSalesPercentage >= MinimumJson.Common) {
      const key = managerAndSupervisorFindKey(householdSalesPercentage);
      const { selectedEmp: selectedEmpHouseHold } =
        clauses?.employees.find((item) => {
          if (item?.position == DIST_HOME.MANAGER_SUPERVISOR_HOUSEHOLD) {
            return item;
          }
        }) || [];

      const employeesHouseHold = await EmployeesProviders.getEmployeesByIds(
        selectedEmpHouseHold,
        clauses.probationTrainingPeriod,
      );

      for (const emp of employeesHouseHold) {
        const amount = calculateEmployeeIncentiveByAttendance(
          ManagerAndSupervisorJson[key],
          emp,
          year,
          month,
        );

        employeesIncentives.push(
          incentiveFormat(
            amount,
            emp,
            luggagePercentage,
            DIST_HOME.MANAGER_SUPERVISOR_HOUSEHOLD,
            totalSaleHousehold,
            totalBudgetHousehold,
          ),
        );
      }
    }

    // Institutional
    const totalBudgetInstitutional = calculateTotalBudgetForMonth(
      [institutionalBudget],
      month,
    );
    const totalSaleInstitutional = calculateTotalSales(institutionalSales);
    const InstitutionalPercentage = calculatePercentage(
      totalSaleInstitutional,
      totalBudgetInstitutional,
    );

    if (InstitutionalPercentage >= MinimumJson.Common) {
      const key = managerAndSupervisorFindKey(householdSalesPercentage);
      const { selectedEmp: selectedEmpInstitutional } =
        clauses?.employees.find((item) => {
          if (item?.position == DIST_HOME.MANAGER_SUPERVISOR_INSTITUTIONAL) {
            return item;
          }
        }) || [];
      const employeesInstitutional = await EmployeesProviders.getEmployeesByIds(
        selectedEmpInstitutional,
        clauses.probationTrainingPeriod,
      );

      for (const emp of employeesInstitutional) {
        const amount = calculateEmployeeIncentiveByAttendance(
          ManagerAndSupervisorJson[key],
          emp,
          year,
          month,
        );
        employeesIncentives.push(
          incentiveFormat(
            amount,
            emp,
            luggagePercentage,
            DIST_HOME.MANAGER_SUPERVISOR_INSTITUTIONAL,
            totalSaleInstitutional,
            totalBudgetInstitutional,
          ),
        );
      }
    }

    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Calculate Merchandiser
const calculateMerchandiserInc = async (
  clauses,
  percentage,
  year,
  month,
  { totalSale, totalBudget },
) => {
  try {
    const employeesIncentives = [];
    const key = merchandiserFindKey(percentage);

    const { selectedEmp } =
      clauses?.employees.find((item) => {
        if (item?.position == DIST_HOME.MERCHANDISER) {
          return item;
        }
      }) || [];

    const employees = await EmployeesProviders.getEmployeesByIds(
      selectedEmp,
      clauses.probationTrainingPeriod,
    );

    for (const emp of employees) {
      const amount = calculateEmployeeIncentiveByAttendance(
        MerchandiserJson[key],
        emp,
        year,
        month,
      );
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          percentage,
          DIST_HOME.MERCHANDISER,
          totalSale,
          totalBudget,
        ),
      );
    }
    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Calculate Back Office
const calculateBackOfficeInc = async (
  clauses,
  percentage,
  year,
  month,
  { totalSale, totalBudget },
) => {
  try {
    const employeesIncentives = [];
    const key = backOfficeFindKey(percentage);

    const { selectedEmp } =
      clauses?.employees.find((item) => {
        if (item?.position == DIST_HOME.BACK_OFFICE) {
          return item;
        }
      }) || [];

    const employees = await EmployeesProviders.getEmployeesByIds(
      selectedEmp,
      clauses.probationTrainingPeriod,
    );
    for (const emp of employees) {
      const amount = calculateEmployeeIncentiveByAttendance(
        BackOfficeJson[key],
        emp,
        year,
        month,
      );
      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          percentage,
          DIST_HOME.BACK_OFFICE,
          totalSale,
          totalBudget,
        ),
      );
    }
    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Calculate Institutional staff
const calculateInstitutionalStaffInc = async (
  institutionalBudget,
  institutionalSales,
  clauses,
  year,
  month,
) => {
  try {
    const employeesIncentives = [];

    const totalBudgetInstitutional = calculateTotalBudgetForMonth(
      [institutionalBudget],
      month,
    );
    const totalSaleInstitutional = calculateTotalSales(institutionalSales);
    const InstitutionalPercentage = calculatePercentage(
      totalSaleInstitutional,
      totalBudgetInstitutional,
    );

    if (InstitutionalPercentage < MinimumJson.Institutional) return [];

    const employeesWithSales = await SalesDataProviders.getEmpWithSalesDistHome(
      institutionalBudget,
      clauses?.customerName || [],
      year,
      month,
    );

    for (const emp of employeesWithSales) {
      const employee = await EmployeesProviders.selectEmpByNo(emp._id, {
        probationTrainingPeriod: clauses?.probationTrainingPeriod,
      });
      if (!employee) continue;
      const amount = calculateAmountFromPercentage(
        emp?.totalSales,
        InstitutionalJson.Percentage,
      );

      employeesIncentives.push(
        incentiveFormat(
          undefined,
          employee,
          undefined,
          DIST_HOME.Institutional,
          emp?.totalSales,
          undefined,
          { distHomeInstitutional: amount },
        ),
      );
    }
    return employeesIncentives;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = { calculateDistHomeIncentive };

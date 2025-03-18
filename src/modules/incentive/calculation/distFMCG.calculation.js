const BudgetProvider = require('@modules/budget/budget.providers');
const SalesDataProviders = require('@modules/sales-data/salesData.providers');
const ClausesProviders = require('@modules/clauses/clauses.providers');
const EmployeesProviders = require('@modules/employees/employees.providers');
const { SECTOR_ENUM, FMCG_POSITIONS } = require('@enums/sector.enum');

const {
  Minimum: MinimumJson,
  SalesRepresentative: SalesRepresentativeJson,
  Merchandiser: MerchandiserJson,
  BackOffice: BackOfficeJson,
  Manager: ManagerJson,
  Supervisor: SupervisorJson,
  VanSales: VanSalesJson,
} = require('@json/metadata.json')['DistFMCG'];

const {
  calculateTotalSales,
  calculateTotalBudgetForMonth,
  incentiveFormat,
  calculateEmployeeIncentiveByAttendance,
} = require('../helpers/common.helpers');

const { fmcgFindKey } = require('../helpers/distFMCG.helpers');

const { calculatePercentage } = require('@utils/percentage');

const calculateIncentive = async (year, month) => {
  try {
    const employeesIncentives = [];

    const clauses = await ClausesProviders.findClauses(
      SECTOR_ENUM.DISTRIBUTION_FMCG,
    );
    const budgets = await BudgetProvider.getDistFMCGBudgets(year);
    const totalBudget = calculateTotalBudgetForMonth(budgets, month);

    const sales =
      await SalesDataProviders.getSalesByStoreName3AndLegacyDepartment(
        year,
        month,
        budgets,
      ); // now we use store name 3 but probably we need to use location code
    const totalSales = calculateTotalSales(sales);

    const { selectedEmp: selectedEmpSalesRep } = clauses?.employees.find(
      (item) => {
        if (item?.position == FMCG_POSITIONS.SALES_REPRESENTATIVE) {
          return item;
        }
      },
    ) || { selectedEmp: [] };

    const { selectedEmp: selectedEmpVan } = clauses?.employees.find((item) => {
      if (item?.position == FMCG_POSITIONS.VAN_SALES) {
        return item;
      }
    }) || { selectedEmp: [] };

    const { selectedEmp: selectedEmpManager } = clauses?.employees.find(
      (item) => {
        if (item?.position == FMCG_POSITIONS.MANAGER) {
          return item;
        }
      },
    ) || { selectedEmp: [] };

    const { selectedEmp: selectedEmpSupervisor } = clauses?.employees.find(
      (item) => {
        if (item?.position == FMCG_POSITIONS.SUPERVISOR) {
          return item;
        }
      },
    ) || { selectedEmp: [] };

    const { selectedEmp: selectedEmpMerchandiser } = clauses?.employees.find(
      (item) => {
        if (item?.position == FMCG_POSITIONS.MERCHANDISER) {
          return item;
        }
      },
    ) || { selectedEmp: [] };

    const { selectedEmp: selectedEmpBackOffice } = clauses?.employees.find(
      (item) => {
        if (item?.position == FMCG_POSITIONS.BACK_OFFICE) {
          return item;
        }
      },
    ) || { selectedEmp: [] };

    const employeesSalesRep = await EmployeesProviders.getEmployeesByIds(
      selectedEmpSalesRep,
      clauses.probationTrainingPeriod,
    );

    const employeesVan = await EmployeesProviders.getEmployeesByIds(
      selectedEmpVan,
      clauses.probationTrainingPeriod,
    );

    const employeesManager = await EmployeesProviders.getEmployeesByIds(
      selectedEmpManager,
      clauses.probationTrainingPeriod,
    );

    const employeesSupervisor = await EmployeesProviders.getEmployeesByIds(
      selectedEmpSupervisor,
      clauses.probationTrainingPeriod,
    );

    const employeesMerchandiser = await EmployeesProviders.getEmployeesByIds(
      selectedEmpMerchandiser,
      clauses.probationTrainingPeriod,
    );

    const employeesBackOffice = await EmployeesProviders.getEmployeesByIds(
      selectedEmpBackOffice,
      clauses.probationTrainingPeriod,
    );

    const percentage = calculatePercentage(totalSales, totalBudget);
    const key = fmcgFindKey(percentage);

    employeesSalesRep.map((emp) => {
      const amount =
        percentage >= MinimumJson.common
          ? calculateEmployeeIncentiveByAttendance(
              SalesRepresentativeJson[key],
              emp,
              year,
              month,
            )
          : 0;

      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [percentage],
          FMCG_POSITIONS.SALES_REPRESENTATIVE,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesVan.map((emp) => {
      const amount =
        percentage >= MinimumJson.common
          ? calculateEmployeeIncentiveByAttendance(
              VanSalesJson[key],
              emp,
              year,
              month,
            )
          : 0;

      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [percentage],
          FMCG_POSITIONS.VAN_SALES,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesManager.map((emp) => {
      const amount =
        percentage >= MinimumJson.common
          ? calculateEmployeeIncentiveByAttendance(
              ManagerJson[key],
              emp,
              year,
              month,
            )
          : 0;

      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [percentage],
          FMCG_POSITIONS.MANAGER,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesSupervisor.map((emp) => {
      const amount =
        percentage >= MinimumJson.common
          ? calculateEmployeeIncentiveByAttendance(
              SupervisorJson[key],
              emp,
              year,
              month,
            )
          : 0;

      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [percentage],
          FMCG_POSITIONS.SUPERVISOR,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesMerchandiser.map((emp) => {
      const amount =
        percentage >= MinimumJson.common
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
          [percentage],
          FMCG_POSITIONS.MERCHANDISER,
          totalSales,
          totalBudget,
        ),
      );
    });

    employeesBackOffice.map((emp) => {
      const amount =
        percentage >= MinimumJson.common
          ? calculateEmployeeIncentiveByAttendance(
              BackOfficeJson[key],
              emp,
              year,
              month,
            )
          : 0;

      employeesIncentives.push(
        incentiveFormat(
          amount,
          emp,
          [percentage],
          FMCG_POSITIONS.BACK_OFFICE,
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

module.exports = calculateIncentive;

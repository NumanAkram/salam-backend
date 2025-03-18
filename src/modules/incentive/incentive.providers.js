const { Incentive } = require('@models');
const moment = require('moment');
const SalesDataProviders = require('@modules/sales-data/salesData.providers');
const BudgetProvider = require('@modules/budget/budget.providers');
const EmployeesProviders = require('@modules/employees/employees.providers');
const RetailPhotoMetadataProviders = require('@modules/retail-photo-metadata/RetailPhotoMetadata.providers');
const DistPhotographyProviders = require('@modules/dist-photography/DistPhotography.providers');
const ClausesProviders = require('@modules/clauses/clauses.providers');
const ExcelJS = require('exceljs');
const {
  calculateIncentiveRP,
  calculateIncentiveFMCG,
} = require('./calculation');
// dist photography calculation
const {
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
} = require('./calculation/distPhotography.calculation');
const {
  calculateBudgetAndSales,
  calculateIndividualIncentive,
  calculateTeamIncentive,
  calculateStoreManagerDepartmentStoreInc,
  calculateSupportTeamInc,
  calculateMTMInc,
  calculateConcreteSalesIncentive
} = require('./calculation/fashionAndHome.calculation');

const { getUpdatedFields } = require('./helpers/common.helpers');
const {
  calculateDistHomeIncentive,
} = require('./calculation/distHome.calculation');

const {
  calculateRetailPerfumeryIncentive,
} = require('./calculation/retailPerfumery.calculation');

const {
  calculateDistPerfumeryIncentive
} = require('./calculation/distPerfumery.calculation');

const {
  SECTOR_ENUM,
  CHAIN_NAME_ENUM,
  DIST_PHOTOGRAPHY_LOCATION_BUDGETS,
  DP_POSITIONS,
} = require('@enums/sector.enum');

const {
  BACK_OFFICE_REGEX,
  TEAM_CANON,
  TEAM_NIKON,
  WORKSHOP,
  TEAM_ENERGIZER,
  DEPT_INST,
  VAN_SALES_LOCATION_CODE,
} = require('@utils/regex');

const IncentiveProviders = {
  // =================== dist sector ==================== //
  async distPhotography(year, month) {
    try {
      const incentives = [];
      const budgets = await BudgetProvider.getDistPhotographyBudget(year);
      const clauses = await ClausesProviders.findClauses(
        SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
      );

      const workshopTotalIncentive =
        await DistPhotographyProviders.getWorkshopTotalIncentive(year, month);

      const teamNikonAndCanonPercentage = {
        canon: { key: null, percentage: null },
        nikon: { key: null, percentage: null },
      };
      for (const budget of budgets) {
        if (
          budget?.chainName == CHAIN_NAME_ENUM.RETAIL &&
          budget?.storeName3 in DIST_PHOTOGRAPHY_LOCATION_BUDGETS
        ) {
          const result = await calculateLocationIncentive(
            budget,
            clauses,
            year,
            month,
          );

          incentives.push(...result);
        } else if (WORKSHOP.test(budget?.deptGroup)) {
          const result = await calculateWorkshopIncentive(
            workshopTotalIncentive,
            clauses,
            budget,
            year,
            month,
          );

          incentives.push(...result);
        } else if (VAN_SALES_LOCATION_CODE.test(budget?.locationCode)) {
          const result = await calculateVanSalesIncentive(
            budget,
            clauses,
            year,
            month,
          );

          incentives.push(...result);
        } else if (TEAM_CANON.test(budget?.deptGroup)) {
          const result = await calculateTeamCanonIncentive(
            budget,
            clauses,
            year,
            month,
            teamNikonAndCanonPercentage,
          );

          incentives.push(...result);
        } else if (TEAM_NIKON.test(budget?.deptGroup)) {
          const result = await calculateTeamNikonIncentive(
            budget,
            clauses,
            year,
            month,
            teamNikonAndCanonPercentage,
          );

          incentives.push(...result);
        } else if (TEAM_ENERGIZER.test(budget?.deptGroup)) {
          const result = await calculateTeamEnergizerIncentive(
            budget,
            clauses,
            year,
            month,
          );

          incentives.push(...result);
        } else if (BACK_OFFICE_REGEX.test(budget.deptGroup)) {
          const result = await calculateBackOfficeIncentive(
            budget,
            clauses,
            year,
            month,
          );

          incentives.push(...result);
        } else if (DEPT_INST.test(budget.deptGroup)) {
          const result = await calculateInstitutionalIncentive(
            budget,
            clauses,
            year,
            month,
          );

          incentives.push(...result);
        }
      }
      // promoter incentive
      const promoterIncentive =
        await DistPhotographyProviders.getPromoterIncentive(year, month, clauses);

      incentives.push(...promoterIncentive);

      //tech support incentive
      const techSupportIncentive = await calculateTechSupportIncentive(
        teamNikonAndCanonPercentage,
        clauses,
        year,
        month,
      );

      incentives.push(...techSupportIncentive);

      return incentives;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async getInstitutionalIncentive(year, month) {
    try {
      const date = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const incentive = await Incentive.findOne({
        date,
        sector: SECTOR_ENUM.DISTRIBUTION_PHOTOGRAPHY,
        position: DP_POSITIONS.INSTITUTIONAL,
      });
      return incentive;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async removeInstitutionalIncentive(year, month) {
    try {
      const date = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const incentive = await Incentive.findOneAndDelete({
        date,
        sector: SECTOR_ENUM.DISTRIBUTION_PHOTOGRAPHY,
        position: DP_POSITIONS.INSTITUTIONAL,
      });
      return incentive;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async addInstitutionalIncentive(employeesPercentage, year, month) {
    try {
      await DistPhotographyProviders.addInstitutionalPercentage(
        year,
        month,
        employeesPercentage,
      );
      const { totalIncentive } = (await this.getInstitutionalIncentive(
        year,
        month,
      )) || { totalIncentive: null };

      const incentives = await calculateInstitutionalIncentiveByPercentage(
        totalIncentive,
        employeesPercentage,
      );

      return incentives;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async distPhotographyQuarter(year, month) {
    try {
      // const currentMonthIncentives = await this.getIncentive(
      //   year,
      //   month,
      //   SECTOR_ENUM.DISTRIBUTION_PHOTOGRAPHY,
      // );
      const date = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const currentMonthIncentives = await Incentive.find({ date, sector });
      
      await Promise.all(
        currentMonthIncentives.map(async (currentMonth) => {
          const previousMonth = await this.getOneIncentive(
            year,
            month - 1,
            SECTOR_ENUM.DISTRIBUTION_PHOTOGRAPHY,
            currentMonth?._employeeId,
          );

          const prePreviousMonth = await this.getOneIncentive(
            year,
            month - 2,
            SECTOR_ENUM.DISTRIBUTION_PHOTOGRAPHY,
            currentMonth?._employeeId,
          );

          if (!previousMonth || !prePreviousMonth) {
            return null;
          }

          await quarterIncentiveCalculation(year, month, {
            currentMonth,
            previousMonth,
            prePreviousMonth,
          });
        }),
      );
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // ^^^^^^^^^^^^^^^ retail photo ^^^^^^^^^^^^^^^ //
  async retailPhotography(year, month) {
    try {
      const sales = await SalesDataProviders.getRetailPhotographySales(
        year,
        month,
      );

      const budget = await BudgetProvider.getRetailPhotographyBudget(year);

      const clauses = await ClausesProviders.findClauses(
        SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
      );

      const employees = await EmployeesProviders.getEmployeesByLocationCode(
        [budget?.locationCode],
        clauses?.probationTrainingPeriod,
      );

      const metadata =
        await RetailPhotoMetadataProviders.getRetailPhotographyMetadata(
          year,
          month,
        );

      const result = await calculateIncentiveRP(
        sales,
        budget,
        employees,
        metadata,
        clauses,
        year,
        month,
      );

      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // SECTOR FMCG
  async distFMCG(year, month) {
    try {
      const result = await calculateIncentiveFMCG(year, month);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // SECTOR RETAIL FASHION AND HOME
  async retailFashionAndHome(
    year,
    month,
    {
      isPromotion,
      startPromotionDay,
      endPromotionDay,
      isSalesPeriod,
      startSalesPeriodDay,
      endSalesPeriodDay,
      isMTM,
    },
  ) {
    try {
      const individualIncentive = new Array();
      const teamIncentive = new Array();
      const storeManagerDepartmentStoreIncentive = new Array();
      const supportTeamIncentive = new Array();
      const mtmIncentive = new Array();

      const budgets = await BudgetProvider.getRetailFashionAndHome(year, true);
      const clauses = await ClausesProviders.findClauses(
        SECTOR_ENUM.RETAIL_FASHION_AND_HOME,
      );

      for (const iterator of budgets) {
        const { totalBudgets, totalSales } = await calculateBudgetAndSales(
          iterator?.budgets || [],
          year,
          month,
        );

        const resultIndividual = await calculateIndividualIncentive(
          iterator?.budgets || [],
          totalBudgets,
          totalSales,
          year,
          month,
          clauses,
        );
        individualIncentive.push(...resultIndividual);

        const resultTeam = await calculateTeamIncentive(
          iterator?.budgets || [],
          totalBudgets,
          totalSales,
          year,
          month,
          clauses,
        );
        teamIncentive.push(...resultTeam);

        const resultStoreManagerDepartmentStore =
          await calculateStoreManagerDepartmentStoreInc(
            iterator._id,
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
          );
        storeManagerDepartmentStoreIncentive.push(
          ...resultStoreManagerDepartmentStore,
        );
      }

      const resultSupportTeamIncentive = await calculateSupportTeamInc(
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
      );
      supportTeamIncentive.push(...resultSupportTeamIncentive);

      const customSalesConcrete = await calculateConcreteSalesIncentive( year, month );
      
      if (isMTM) {
        const mtmBudget = await BudgetProvider.getRetailFashionAndHomeMTM(year);
        const resultMTMIncentive = await calculateMTMInc(
          mtmBudget,
          year,
          month,
          clauses,
        );
        mtmIncentive.push(...resultMTMIncentive);
      }

      return [
        ...individualIncentive,
        ...teamIncentive,
        ...storeManagerDepartmentStoreIncentive,
        ...supportTeamIncentive,
        ...mtmIncentive,
        ...customSalesConcrete
      ];
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async addFashionAndHomeInc(sector, year, month, incentives) {
    try {
      const date = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      await Incentive.deleteMany({ sector, date });
      for (const ele of incentives) {
        if (!ele?.employeeId) continue;
        const updateFields = getUpdatedFields(ele);
        await Incentive.findOneAndUpdate(
          {
            sector,
            date,
            _employeeId: ele.employeeId,
          },
          {
            ...updateFields,
            sector,
            date,
            _employeeId: ele.employeeId,
          },
          { runValidators: true, new: true, upsert: true },
        );
      }
    } catch (error) {
      return Promise.reject(error);
    }
  },
  // dist home not ready TODO *****
  async distHome(year, month) {
    try {
      const clauses = await ClausesProviders.findClauses(
        SECTOR_ENUM.DISTRIBUTION_HOME,
      );

      const { luggageBudget, institutionalBudget, householdBudget } =
        await BudgetProvider.getDistHome();

      const luggageSales =
        await SalesDataProviders.getSalesByStoreName3AndLegacyDepartment(
          year,
          month,
          [luggageBudget],
          1,
          1,
          {
            customerNameArray: clauses?.customerName || [],
            isDistHome: true,
            isIns: false,
          },
        );

      const institutionalSales =
        await SalesDataProviders.getSalesByStoreName3AndLegacyDepartment(
          year,
          month,
          [institutionalBudget],
          1,
          1,
          {
            customerNameArray: clauses?.customerName || [],
            isDistHome: true,
            isIns: true,
          },
        );

      const householdSales =
        await SalesDataProviders.getSalesByStoreName3AndLegacyDepartment(
          year,
          month,
          [householdBudget],
        );

      const incentives = await calculateDistHomeIncentive(
        {
          luggageBudget,
          institutionalBudget,
          householdBudget,
        },
        { luggageSales, institutionalSales, householdSales },
        clauses,
        year,
        month,
      );

      return incentives;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // retail perfumery and beauty
  async retailPerfumeryAndBeauty(
    year,
    month,
    { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
  ) {
    try {
      const clauses = await ClausesProviders.findClauses(
        SECTOR_ENUM.RETAIL_PERFUMERY,
      );
      const budgets = await BudgetProvider.getBudgetsBySector(
        SECTOR_ENUM.RETAIL_PERFUMERY,
        year,
      );

      const incentives = calculateRetailPerfumeryIncentive(
        budgets,
        clauses,
        year,
        month,
        { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
      );

      return incentives;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  // distributury perfumery and beauty
  // async distPerfumeryAndBeauty(
  //   year,
  //   month,
  //   { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
  // ) {
  //   try {
  //     const clauses = await ClausesProviders.findClauses(
  //       SECTOR_ENUM.DISTRIBUTION_PERFUMERY,
  //     );
  //     const budgets = await BudgetProvider.getBudgetsBySector(
  //       SECTOR_ENUM.DISTRIBUTION_PERFUMERY,
  //       year,
  //     );


  //     const incentives = await calculateDistPerfumeryIncentive(
  //       budgets,
  //       clauses,
  //       year,
  //       month,
  //       { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },  
  //     );

  //     return incentives;
  //   } catch (error) {
  //     return Promise.reject(error);
  //   }
  // },

  async distPerfumeryAndBeauty(
    year,
    month,
  ) {
    try {
      // const budgets = await BudgetProvider.getBudgetsBySector(
      //   SECTOR_ENUM.DISTRIBUTION_PERFUMERY,
      //   year,
      // );
      const clauses = await ClausesProviders.findClauses(
        SECTOR_ENUM.DISTRIBUTION_PERFUMERY,
      );
      const incentives = await calculateDistPerfumeryIncentive(clauses, year, month);

      return incentives;


    } catch (error) {
      return Promise.reject(error);
    }
  },
  // COMMON
  async createIncentive(sector, year, month, incentives) {
    try {
      if (!Array.isArray(incentives)) return null;
      const date = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();

      await Incentive.deleteMany({ sector, date });

      await Promise.all(
        incentives.map(async (item) => {
          await Incentive.create({
            sector,
            _employeeId: item?.employeeId,
            monthlyIncentive: item?.incentive,
            date,
            position: item?.position,
            attendance: item?.attendance,
            percentageAchieved: item?.percentage,
          });
        }),
      );
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async findAndUpdate(sector, year, month, incentives) {
    try {
      if (!Array.isArray(incentives)) return null;
      const date = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();

      await Incentive.deleteMany({ sector, date });

      for (const inc of incentives) {
        const updateFields = getUpdatedFields(inc);
        await Incentive.findOneAndUpdate(
          {
            sector,
            date,
            _employeeId: inc.employeeId,
          },
          { ...updateFields, sector, date, _employeeId: inc.employeeId },
          { runValidators: true, new: true, upsert: true },
        );
      }
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async addIncentive(sector, year, month, incentives) {
    try {
      if (!Array.isArray(incentives)) return null;
      const date = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();

      await Promise.all(
        incentives.map(async (item) => {
          await Incentive.create({
            sector,
            _employeeId: item?.employeeId,
            monthlyIncentive: item?.incentive,
            date,
            position: item?.position,
            totalSales: item?.totalSales,
            totalBudgets: item?.totalBudgets,
          });
        }),
      );
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getIncentive(year, month, sector, sort, searchQuery, page, rowsPerPage) {
    try {
      // Calculate the offset based on the current page and rows per page
      const offset = (page - 1) * rowsPerPage;
      const date = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      
      const result = await Incentive.aggregate([
        {
          $match: {
            date,
            sector,
          },
        },
        {
          $lookup: {
            from: 'employees', // Ensure this matches your Employee collection name
            localField: '_employeeId',
            foreignField: '_id',
            as: 'employee',
          },
        },
        {
          $unwind: {
            path: '$employee',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Use $facet to run two pipelines in parallel: one for pagination and one for total count
        {
          $facet: {
            incentives: [
              {
                $match: {
                  $or: [
                    { 'employee.empName': { $regex: searchQuery, $options: 'i' } },  // Case-insensitive search for employee name
                    { 'position': { $regex: searchQuery, $options: 'i' } },  // Case-insensitive search for position
                    { 'employee.empNo': { $regex: searchQuery, $options: 'i' } }  // Case-insensitive search for employee code
                  ]
                }
              },
              // Sort by the 'createdAt' field
              {
                $sort: {
                  createdAt: Number(sort), // Sort in ascending or descending order based on the 'sort' value
                },
              },
              {
                $skip: offset, // Skip the appropriate number of documents for the current page
              },
              {
                $limit: Number(rowsPerPage), // Limit the number of documents returned based on rowsPerPage
              },
            ],
            totalCount: [
              // No need to repeat the match, lookup, and unwind stages
              {
                $match: {
                  date,
                  sector,
                },
              },
              {
                $lookup: {
                  from: 'employees',
                  localField: '_employeeId',
                  foreignField: '_id',
                  as: 'employee',
                },
              },
              {
                $unwind: {
                  path: '$employee',
                  preserveNullAndEmptyArrays: true,
                },
              },
              // Apply the same search query for total count
              {
                $match: {
                  'employee.empName': { $regex: searchQuery, $options: 'i' },
                },
              },
              // Count the total number of records (without pagination)
              {
                $count: 'totalCount', // Count the total number of records
              },
            ],
          },
        },
      ]);
      
      // Extract the incentives and total count from the result
      const incentives = result[0].incentives;
      const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].totalCount : 0;
      
      const totalPages = Math.ceil(totalCount / rowsPerPage);

      return {
        data: incentives,
        totalCount,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getYears(sector) {
    const dates = await Incentive.find({ sector }, { date: 1, _id: 0 });
    const years = Array.from(
      new Set(
        dates.map(({ date }) => {
          const d = new Date(date);
          return d.getFullYear(); // Extract the year
        })
      )
    );
    return { years };
  },

  async getMonths(sector, year) {
    const dates = await Incentive.find({ sector }, { date: 1, _id: 0 });
    const filteredDates = dates.filter(({ date }) => {
      const d = new Date(date);
      return d.getFullYear() == year;
    });
    const months = Array.from(
      new Set(
        filteredDates.map(({ date }) => {
          const d = new Date(date);
          return String(d.getMonth() + 1).padStart(2, '0'); // Extract the month
        })
      )
    );

    // Sort months in ascending order
    months.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))

    return { months };
  },

  async exportIncentivesToExcel(year, month, sector, sort, searchQuery) {
    try {
      const date = moment.utc([year, month - 1]).startOf('month').toDate();

      // Fetch the incentives data
      const incentives = await Incentive.aggregate([
        { $match: { date, sector } },
        { $lookup: { from: 'employees', localField: '_employeeId', foreignField: '_id', as: 'employee' } },
        { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
        { $match: { 'employee.empName': { $regex: searchQuery, $options: 'i' } } },
        { $sort: { createdAt: Number(sort) } },
      ]);

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Incentives');

      // Define the columns for the Excel sheet
      worksheet.columns = [
        { header: 'SL', key: 'sl', width: 10 },
        { header: 'Employee Code', key: 'empCode', width: 20 },
        { header: 'Employee Name', key: 'empName', width: 30 },
        { header: 'Year', key: 'year', width: 10 },
        { header: 'Month', key: 'month', width: 15 },
        { header: 'Incentive (QAR)', key: 'incentive', width: 15 },
        { header: 'Sector', key: 'sector', width: 20 },
        { header: 'Position', key: 'position', width: 20 },
      ];

      // Add rows to the worksheet
      incentives.forEach((item, index) => {
        worksheet.addRow({
          sl: index + 1,
          empCode: item.employee ? item.employee.empNo : 'N/A',
          empName: item.employee ? item.employee.empName : 'N/A',
          year: new Date(item.createdAt).getFullYear(),
          month: new Date(item.createdAt).toLocaleString('default', { month: 'long' }),
          incentive: item.totalIncentive,
          sector: item.sector,
          position: item.position,
        });
      });

      // Return the workbook object
      return workbook;
    } catch (error) {
      throw new Error('Error exporting incentives to Excel: ' + error.message);
    }
  },

  async getOneIncentive(year, month, sector, _employeeId) {
    try {
      const date = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const incentives = await Incentive.find({ date, sector, _employeeId });
      return incentives;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

module.exports = IncentiveProviders;

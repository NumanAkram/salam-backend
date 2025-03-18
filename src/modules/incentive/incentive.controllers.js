const { StatusCodes } = require('http-status-codes');
const IncentiveProviders = require('./incentive.providers');
const { SECTOR_ENUM } = require('@enums/sector.enum');
const EmployeesProviders = require('@modules/employees/employees.providers');
const ClausesProviders = require('@modules/clauses/clauses.providers');
const { isEndOfQuarter } = require('@utils/date');
const { Employee, Budget } = require('@models/index');
const { Incentive } = require('@models')

const IncentiveControllers = {
  async getIncentive(req, res) {
    const { year, month, sector, sort, searchQuery, page, rowsPerPage } = req.query;
    try {
      const incentives = await IncentiveProviders.getIncentive(
        year,
        month,
        sector,
        sort,
        searchQuery,
        page,
        rowsPerPage
      );

      res.status(StatusCodes.OK).json({
        data: {
          incentives,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  async getYears(req, res) {
    const { sector } = req.query;
    try {
      const years = await IncentiveProviders.getYears(sector);
      res.status(StatusCodes.OK).json(years);
    } catch (error) {
      throw error;
    }
  },

  async getMonths(req, res) {
    const { sector, year } = req.query;
    try {
      const years = await IncentiveProviders.getMonths(sector, year);
      res.status(StatusCodes.OK).json(years);
    } catch (error) {
      throw error;
    }
  },

  async downloadIncentive(req, res) {
    const { year, month, sector, sort = 1, searchQuery = '' } = req.query;
    try {
      const workbook = await IncentiveProviders.exportIncentivesToExcel(year, month, sector, sort, searchQuery);

      // Set the response headers to indicate it's an Excel file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=incentives.xlsx');

      // Write the Excel file to the response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error exporting incentives to Excel:', error);
      res.status(500).json({ message: 'An error occurred while exporting the incentives.' });
    }
  },
  // =================== dist sector ==================== //
  async calculateDistPhoto(req, res) {
    const { year, month } = req.query;

    try {
      const DPIncentive = await IncentiveProviders.distPhotography(year, month);

      await IncentiveProviders.createIncentive(
        SECTOR_ENUM.DISTRIBUTION_PHOTOGRAPHY,
        year,
        month,
        DPIncentive,
      );

      if (isEndOfQuarter(month)) {
        await IncentiveProviders.distPhotographyQuarter(year, month);
      }

      return res.status(StatusCodes.OK).json({
        data: {
          message: {
            en: 'dist photography incentive calculated successfully',
            ar: 'تم حساب حافز التصوير بنجاح',
          },
        },
      });
    } catch (error) {
      throw error;
    }
  },

  async getInstitutionalIncentive(req, res) {
    const { year, month } = req.query;

    const incentive = await IncentiveProviders.getInstitutionalIncentive(
      year,
      month,
    );
    const employeesIds = await ClausesProviders.getInstitutionalEmpIds();
    const employees = await EmployeesProviders.getEmployeesByIds(employeesIds);

    return res.status(StatusCodes.OK).json({
      data: {
        incentive,
        employees,
      },
    });
  },

  async addInstitutionalIncentive(req, res) {
    const { year, month } = req.query;
    const { employeesPercentage } = req.body;

    const incentive = await IncentiveProviders.addInstitutionalIncentive(
      employeesPercentage,
      year,
      month,
    );

    await IncentiveProviders.addIncentive(
      SECTOR_ENUM.DISTRIBUTION_PHOTOGRAPHY,
      year,
      month,
      incentive,
    );

    await IncentiveProviders.removeInstitutionalIncentive(year, month);

    res.status(StatusCodes.CREATED).json({
      data: {
        message: {
          en: 'dist photography institutional incentive calculated successfully',
          ar: 'تم حساب حافز التصوير بنجاح',
        },
      },
    });
  },

  // =================== Retail sector ==================== //
  async calculateRetailPhoto(req, res) {
    const { year, month } = req.query;

    const rpIncentives = await IncentiveProviders.retailPhotography(
      year,
      month,
    );

    await IncentiveProviders.createIncentive(
      SECTOR_ENUM.RETAIL_PHOTOGRAPHY,
      year,
      month,
      rpIncentives,
    );

    return res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'retail photography incentive calculated successfully',
          ar: 'تم حساب حافز التصوير بالتجزئة بنجاح',
        },
      },
    });
  },
  // =================== Dist FMCG ==================== //
  async calculateFMCG(req, res) {
    const { year, month } = req.query;

    const fmcgIncentive = await IncentiveProviders.distFMCG(year, month);

    await IncentiveProviders.createIncentive(
      SECTOR_ENUM.DISTRIBUTION_FMCG,
      year,
      month,
      fmcgIncentive,
    );
    return res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'FMCG incentive calculated successfully',
          ar: 'تم حساب حافز FMCG بنجاح',
        },
      },
    });
  },
  // =================== Retail F & H ==================== //
  async calculateRetailFashionAndHome(req, res) {
    const {
      year,
      month,
      isPromotion,
      startPromotionDay,
      endPromotionDay,
      isSalesPeriod,
      startSalesPeriodDay,
      endSalesPeriodDay,
      isMTM,
    } = req.query;

    const incentives = await IncentiveProviders.retailFashionAndHome(
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
    );

    await IncentiveProviders.addFashionAndHomeInc(
      SECTOR_ENUM.RETAIL_FASHION_AND_HOME,
      year,
      month,
      incentives,
    );

    return res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'Retail fashion and home incentive calculated successfully',
          ar: 'تم حساب حافز التجزئة للأزياء والمنزل بنجاح',
        },
      },
    });
  },

  // =================== Dist Home ==================== //
  async calculateDistHome(req, res) {
    const { year, month } = req.query;

    const incentives = await IncentiveProviders.distHome(year, month);
    await IncentiveProviders.findAndUpdate(
      SECTOR_ENUM.DISTRIBUTION_HOME,
      year,
      month,
      incentives,
    );
    return res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'Dist Home incentive calculated successfully',
          ar: 'تم حساب حافز المنزل الموزع بنجاح',
        },
      },
    });
  },

  // =================== Retail Perfumery/Beauty  ==================== //
  async calculateRetailPerfumeryAndBeauty(req, res) {
    const {
      year,
      month,
      isSalesPeriod,
      startSalesPeriodDay,
      endSalesPeriodDay,
    } = req.query;
    const incentives = await IncentiveProviders.retailPerfumeryAndBeauty(
      year,
      month,
      { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
    );
    await IncentiveProviders.createIncentive(
      SECTOR_ENUM.RETAIL_PERFUMERY,
      year,
      month,
      incentives,
    );
    return res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'Retail Perfumery And Beauty incentive calculated successfully',
          ar: 'تم حساب حوافز البيع بالتجزئة والعطور والجمال بنجاح',
        },
      },
    });
  },
  // =================== Distribute Perfumery/Beauty  ==================== //
  async calculateDistPerfumeryAndBeauty(req, res) {

    // const locationNameFromEmployee=await Employee.distinct('locationName')
    // const locationGroupFromBudget= await Budget.distinct('locationCode')
    // console.log(locationNameFromEmployee, locationGroupFromBudget)
    // const newArr=[]
    // locationGroupFromBudget.map((item)=>{
    //   if(locationNameFromEmployee.includes(item)){
    //     newArr.push(item)
    //   }
    // })
    // const {
    //   year,
    //   month,
    //   isSalesPeriod,
    //   startSalesPeriodDay,
    //   endSalesPeriodDay,
    // } = req.query;
    // const incentives = await IncentiveProviders.distPerfumeryAndBeauty(
    //   year,
    //   month,
    //   { isSalesPeriod, startSalesPeriodDay, endSalesPeriodDay },
    // );
    // await IncentiveProviders.createIncentive(
    //   SECTOR_ENUM.DISTRIBUTION_PERFUMERY,
    //   year,
    //   month,
    //   incentives,
    // );
    // return res.status(StatusCodes.OK).json({
    //   data: {
    //     message: {
    //       en: 'Distribution Perfumery And Beauty incentive calculated successfully',
    //       ar: 'تم حساب حوافز البيع بالتجزئة والعطور والجمال بنجاح',
    //     },
    //   },
    // });

    const { year, month } = req.query;
    const incentives = await IncentiveProviders.distPerfumeryAndBeauty(year, month,);
    await IncentiveProviders.createIncentive(
      SECTOR_ENUM.DISTRIBUTION_PERFUMERY,
      year,
      month,
      incentives,
    );
    return res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'Dist Perfumery And Beauty incentive calculated successfully',
          ar: 'تم حساب حوافز البيع بالتجزئة والعطور والجمال بنجاح',
        },
      },
    });
    return;
  },
};

module.exports = IncentiveControllers;

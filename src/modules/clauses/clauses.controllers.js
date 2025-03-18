const { StatusCodes } = require('http-status-codes');
const { Clauses } = require('@models');
const { SECTOR_ENUM } = require('@enums/sector.enum');
const { NotFoundError } = require('@utils/api-error');
const {
  DistRetailPhotography: DistRetailPhotographyJson,
  DistFMCG: DistFMCGJson,
  RetailFashionAndHome: RetailFashionAndHomeJson,
  DistHome: DistHomeJson,
  RetailPerfumeryAndBeauty: RetailPerfumeryAndBeautyJson,
  DistPerfumery: DistPerfumeryJson
} = require('@json/clauses.json');
const BudgetProvider = require('@modules/budget/budget.providers');
const {
  distPhotoFormat,
  distFMCGFormat,
  distFashionAndHomeFormat,
  addClausesFormat,
  DistHomeFormat,
  RetailPerfumeryAndBeautyFormat,
  DistPerfumeryAndBeautyFormat,
} = require('@utils/clausesFormat');
const ClausesProviders = require('./clauses.providers');

const ClausesControllers = {
  probationTrainingPeriodVerification(sector) {
    return async (req, res, next) => {
      const clause = await Clauses.findOne({
        sector,
      });
      if (!clause?.probationTrainingPeriod) {
        throw new NotFoundError({
          en: `Probation training period not exist in ${sector}`,
          ar: `فترة التدريب التجريبية غير موجودة في ${sector}`,
        });
      }
      next();
    };
  },

  async getClausesJson(req, res) {
    const { sector, year } = req.query;
    let clausesResponse = undefined;
    if (sector == SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY) {
      const budgets = await BudgetProvider.getDistPhotographyBudget(year);
      const clauses = await ClausesProviders.findClausesPopulate(
        SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
      );
      clausesResponse = distPhotoFormat(
        budgets,
        clauses,
        DistRetailPhotographyJson,
      );
    } else if (sector == SECTOR_ENUM.DISTRIBUTION_FMCG) {
      const clauses = await ClausesProviders.findClausesPopulate(
        SECTOR_ENUM.DISTRIBUTION_FMCG,
      );
      clausesResponse = distFMCGFormat(clauses, DistFMCGJson);
    } else if (sector == SECTOR_ENUM.RETAIL_FASHION_AND_HOME) {
      const budgetCodes = await BudgetProvider.getBudgetCodes(
        year,
        SECTOR_ENUM.RETAIL_FASHION_AND_HOME,
      );
      const clauses = await ClausesProviders.findClausesPopulate(
        SECTOR_ENUM.RETAIL_FASHION_AND_HOME,
      );
      clausesResponse = distFashionAndHomeFormat(
        budgetCodes,
        clauses,
        RetailFashionAndHomeJson,
      );
    } else if (sector == SECTOR_ENUM.DISTRIBUTION_HOME) {
      const clauses = await ClausesProviders.findClausesPopulate(
        SECTOR_ENUM.DISTRIBUTION_HOME,
      );

      clausesResponse = DistHomeFormat(clauses, DistHomeJson);
    } else if (sector == SECTOR_ENUM.RETAIL_PERFUMERY) {
      const clauses = await ClausesProviders.findClausesPopulate(
        SECTOR_ENUM.RETAIL_PERFUMERY,
      );

      clausesResponse = RetailPerfumeryAndBeautyFormat(
        clauses,
        RetailPerfumeryAndBeautyJson,
      );
    } else if (sector === SECTOR_ENUM.DISTRIBUTION_PERFUMERY){
      const clauses = await ClausesProviders.findClausesPopulate(
        SECTOR_ENUM.DISTRIBUTION_PERFUMERY,
      );
      clausesResponse = DistPerfumeryAndBeautyFormat(
        clauses,
        DistPerfumeryJson,
      );
    }
    else {
      return res.status(StatusCodes.NOT_FOUND).send('404');
    }

    res.status(StatusCodes.OK).json({
      data: {
        clauses: clausesResponse,
      },
    });
  },
  async addClauses(req, res) {
    const { sector } = req.query;
    const data = req.body;
    const {
      probationTrainingPeriod,
      employees,
      backOffice,
      storeManagerDepartmentStore,
      customerName,
    } = addClausesFormat(data);
    
    const updateFields = {};
    if (!isNaN(probationTrainingPeriod)) {
      updateFields.probationTrainingPeriod = probationTrainingPeriod;
    }

    if (sector == SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY) {
      if (Array.isArray(backOffice) && backOffice.length) {
        updateFields.backOffice = backOffice;
      }
    }
    if (
      sector == SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY ||
      sector == SECTOR_ENUM.DISTRIBUTION_FMCG ||
      sector == SECTOR_ENUM.RETAIL_FASHION_AND_HOME ||
      sector == SECTOR_ENUM.DISTRIBUTION_HOME ||
      sector == SECTOR_ENUM.RETAIL_PERFUMERY ||
      sector == SECTOR_ENUM.DISTRIBUTION_PERFUMERY
    ) {
      if (Array.isArray(employees) && employees.length) {
        updateFields.employees = employees;
      }
    }

    if (sector == SECTOR_ENUM.RETAIL_FASHION_AND_HOME) {
      if (
        Array.isArray(storeManagerDepartmentStore) &&
        storeManagerDepartmentStore.length
      ) {
        updateFields.storeMgrDeptFashionHome = storeManagerDepartmentStore;
      }
    }

    if (sector == SECTOR_ENUM.DISTRIBUTION_HOME) {
      if (Array.isArray(customerName) && customerName.length) {
        updateFields.customerName = customerName;
      }
    }
    
    await Clauses.findOneAndUpdate(
      {
        sector,
      },
      { ...updateFields },
      { upsert: true, new: true, runValidators: true },
    );

    res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'Clauses data added successfully',
          ar: 'تمت إضافة بيانات الشروط بنجاح',
        },
      },
    });
  },
};

module.exports = ClausesControllers;

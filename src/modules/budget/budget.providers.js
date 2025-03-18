const { Budget } = require('@models');
const { BadRequestError, NotFoundError } = require('@utils/api-error');
const {
  SECTOR_ENUM,
  CHAIN_NAME_ENUM,
  DIST_PHOTOGRAPHY_LOCATION_BUDGETS,
} = require('@enums/sector.enum');

const {
  getRetailFashionAndHomePipeline,
  getDeptGroupsPipeline,
  getBudgetCodesPipeline
} = require('@utils/pipelines/budgets.pipeline');

const BudgetProvider = {
  async getBudgetsBySector(sector, year) {
    try {
      const budgets = await Budget.find({ sector, year });
      if (!Array.isArray(budgets) || !budgets.length) {
        return Promise.reject(
          new NotFoundError({
            en: `Budget not exist in ${sector} at year ${year}`,
            ar: `الميزانية غير موجودة في ${sector} في سنة ${year}`,
          }),
        );
      }
      return budgets;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async getRetailPhotographyBudget(year) {
    try {
      const budgets = await Budget.findOne({
        sector: SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
        year,
        chainName: CHAIN_NAME_ENUM.RETAIL,
        storeName3: 'GHR',
      });

      if (!budgets) {
        return Promise.reject(
          new BadRequestError({
            en: `Budget not exist for sector RETAIL PHOTOGRAPHY at year ${year}`,
            ar: `الميزانية غير موجودة لقطاع التصوير الفوتوغرافي بالتجزئة في العام ${year}`,
          }),
        );
      }

      return budgets;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getDistPhotographyBudget(year) {
    try {
      const budgets = await Budget.find({
        sector: SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
        year,
      });

      if (!budgets.length) {
        return Promise.reject(
          new BadRequestError({
            en: `Budget not exist for sector DIST PHOTOGRAPHY at year ${year}`,
            ar: `الميزانية غير موجودة لقطاع التصوير الفوتوغرافي العام ${year}`,
          }),
        );
      }

      return budgets;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getDistFMCGBudgets(year) {
    try {
      const budgets = await Budget.find({
        sector: SECTOR_ENUM.DISTRIBUTION_FMCG,
        year,
      });

      if (!budgets.length) {
        return new BadRequestError({
          en: 'Budget not exist for sector DIST FMCG at year ${year}',
          ar: 'الميزانية غير موجودة لقطاع DIST FMCG في السنة ${year}',
        });
      }

      return budgets;
    } catch (error) {
      return Promise.reject();
    }
  },

  async getBudgetsByDeptGroups(deptGroups = []) {
    try {
      const budgets = await Budget.find({ deptGroup: { $in: deptGroups } });
      return budgets;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getRetailFashionAndHome(year, excludeMtm) {
    try {
      const pipeline = getRetailFashionAndHomePipeline(year, excludeMtm);
      const budgets = await Budget.aggregate(pipeline);
      return budgets;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getRetailFashionAndHomeMTM(year) {
    try {
      const budget = await Budget.findOne({ year, deptGroup: 'GEZ - MTM' });
      return budget;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getDeptGroups(year, sector) {
    try {
      const pipeline = getDeptGroupsPipeline(year, sector);
      const deptGroups = await Budget.aggregate(pipeline);
      return deptGroups;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getBudgetCodes(year, sector) {
    try {
      const pipeline = getBudgetCodesPipeline(year, sector);
      const budgetCodes = await Budget.aggregate(pipeline);
      return budgetCodes;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getDistHome() {
    try {
      const luggageBudget = await Budget.findOne({
        deptGroup: { $regex: '^LUGGAGE$', $options: 'i' },
      });
      const institutionalBudget = await Budget.findOne({
        deptGroup: { $regex: '^LUGGAGE - IST$', $options: 'i' },
      });
      const householdBudget = await Budget.findOne({
        deptGroup: { $regex: '^HOUSEHOLD$', $options: 'i' },
      });

      if (!luggageBudget) {
        return Promise.reject(new NotFoundError('luggage Budget not found'));
      }
      if (!institutionalBudget) {
        return Promise.reject(
          new NotFoundError('institutional Budget not found'),
        );
      }
      if (!luggageBudget) {
        return Promise.reject(new NotFoundError('household Budget not found'));
      }

      return { luggageBudget, institutionalBudget, householdBudget };
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

module.exports = BudgetProvider;

const {
  DistPhotoWorkshop,
  DistPhotoPromoter,
  DistPhotoInstitutional,
} = require('@models');
const { BadRequestError } = require('@utils/api-error');
const { incentiveFormat } = require('../incentive/helpers/common.helpers');
const EmployeesProviders = require('@modules/employees/employees.providers');

const DistPhotographyProviders = {
  async getWorkshopTotalIncentive(year, month) {
    try {
      const { totalIncentive } = await DistPhotoWorkshop.findOne({
        year,
        month,
      }).select('totalIncentive') || [];
      if (!totalIncentive) {
        throw new BadRequestError({
          en: `Total incentive for year ${year} and month ${month} not exist`,
          ar: ` المكافأة الإجمالية لسنة ${year} وشهر ${month} غير موجودة,`,
        });
      }
      return totalIncentive;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async addPromoterData(incentive, data, year, month) {
    try {
      for (const empIncentive of data) {
        const { SALESMAN, Code, ...items } = empIncentive;

        const products = [];

        Object.keys(items).map((item) => {
          if (incentive?.[item]) {
            products.push({
              productName: item,
              productIncentive: incentive?.[item],
              productQuantity: items?.[item],
            });
          }
        });
        const isAdded = await DistPhotoPromoter.find({
          salesName: SALESMAN,
          empNo: Code,
          year,
          month,
        });

        if (isAdded) {
          await DistPhotoPromoter.deleteMany({
            salesName: SALESMAN,
            empNo: Code,
            year,
            month,
          });
        }

        await DistPhotoPromoter.create({
          salesName: SALESMAN,
          empNo: Code,
          year,
          month,
          products,
        });
      }
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getPromoterIncentive(year, month, clauses) {
    try {
      const promoterIncentive = await DistPhotoPromoter.find({
        year,
        month,
      }).select('totalIncentive empNo');
      if (!promoterIncentive.length) {
        return [];
        // throw new BadRequestError({
        //   en: `Promoter incentive for year ${year} and month ${month} not exist`,
        //   ar: ` المكافأة لسنة ${year} وشهر ${month} غير موجودة,`,
        // });
      }

      const result = await Promise.all(
        promoterIncentive.map(async (item) => {
          const emp = await EmployeesProviders.selectEmpByNo(item?.empNo, clauses?.probationTrainingPeriod);
          return incentiveFormat(item.totalIncentive, emp, '', 'PROMOTER');
        }),
      );

      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async addInstitutionalPercentage(year, month, employeesPercentage) {
    try {
      await DistPhotoInstitutional.create({ year, month, employeesPercentage });
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

module.exports = DistPhotographyProviders;

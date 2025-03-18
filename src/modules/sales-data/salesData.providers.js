const { Sale, PrefumerySales} = require('@models');
const ExcelHandler = require('@utils/excel');
const {
  getSalesByStoreName3AndLegacyDepartmentPipeline,
  getEmployeesByStoreName3AndLegacyDepartmentPipeline,
  getEmployeesWithTotalSaleInstitutionalPipeline,
  getRetailPerfumeryRotationPipeline,
  getSalesByDaysPipeline,
} = require('@utils/pipelines/sales.pipeline');
const moment = require('moment');
const { calculateTotalSales } = require('../incentive/helpers/common.helpers');
const { DIST_PHOTOGRAPHY_LOCATION_BUDGETS } = require('@enums/sector.enum');
const { batchify } = require('@utils/batchify');

const SalesDataProviders = {
  async getRetailPhotographySales(year, month) {
    try {
      const startDate = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const endDate = moment
        .utc([year, month - 1])
        .endOf('month')
        .toDate();

      const sales = await Sale.find({
        chainName: 'RETAIL',
        divisionName: { $regex: '^CONSUMER ELECTRONICS$', $options: 'i' },
        tranType: { $regex: '^SALE$', $options: 'i' },
        businessDate: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      return sales;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getSalesByStoreName3AndLegacyDepartment(
    year,
    month,
    budgets,
    startMonthSubtract = 1,
    endMonthSubtract = 1,
    options = {},
  ) {
    const {
      customerNameArray = [],
      isIns = false,
      isDistHome = false,
    } = options;

    const startDate = moment
      .utc([year, month])
      .subtract(startMonthSubtract, 'months')
      .startOf('month')
      .toDate();
    const endDate = moment
      .utc([year, month])
      .subtract(endMonthSubtract, 'months')
      .endOf('month')
      .toDate();

    const pipeline = getSalesByStoreName3AndLegacyDepartmentPipeline(
      budgets,
      startDate,
      endDate,
      { customerNameArray, isIns, isDistHome },
    );

    if (!pipeline.length) {
      console.warn(
        `something wrong with get sales pipeline budgets ids ${budgets.map((item) => item?._id)} `,
      );
      return [];
    }

    const sales = await Sale.aggregate(pipeline);
    return sales;
  },

  async getTotalSalesByLocationCode(locationCode, year, month, rest = {}) {
    try {
      const startDate = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const endDate = moment
        .utc([year, month - 1])
        .endOf('month')
        .toDate();

      const sales = await Sale.find({
        locationCode,
        tranType: { $regex: '^SALE$', $options: 'i' },
        businessDate: {
          $gte: startDate,
          $lte: endDate,
        },
        ...rest,
      });

      const totalSales = calculateTotalSales(sales);

      return totalSales;
    } catch (error) {
      Promise.reject(error);
    }
  },
  async getTotalSalesDP(budgetsCodes, year, month, rest) {
    try {
      const startDate = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const endDate = moment
        .utc([year, month - 1])
        .endOf('month')
        .toDate();

      const locationsCodes = [];
      const storeName3 = [];
      budgetsCodes.map((item) => {
        if (
          Object.keys(DIST_PHOTOGRAPHY_LOCATION_BUDGETS).includes(
            item?.storeName3,
          )
        ) {
          storeName3.push(item?.storeName3);
        } else {
          locationsCodes.push(item?.locationCode);
        }
      });

      const sales = await Sale.find({
        $or: [
          { locationCode: { $in: locationsCodes } },
          { storeName3: { $in: storeName3 } },
        ],
        tranType: { $regex: '^SALE$', $options: 'i' },
        businessDate: {
          $gte: startDate,
          $lte: endDate,
        },
        ...rest,
      });
      const totalSales = calculateTotalSales(sales);

      return totalSales;
    } catch (error) {
      Promise.reject(error);
    }
  },

  async getTotalSalesByStoreName3(storeName3, year, month, rest) {
    try {
      const startDate = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const endDate = moment
        .utc([year, month - 1])
        .endOf('month')
        .toDate();

      const sales = await Sale.find({
        storeName3,
        tranType: { $regex: '^SALE$', $options: 'i' },
        businessDate: {
          $gte: startDate,
          $lte: endDate,
        },
        ...rest,
      });

      const totalSales = calculateTotalSales(sales);

      return totalSales;
    } catch (error) {
      Promise.reject(error);
    }
  },

  async getMtmSales(   
    year,
    month,
    startMonthSubtract = 1,
    endMonthSubtract = 1,
  ){
    try {
      const startDate = moment
      .utc([year, month])
      .subtract(startMonthSubtract, 'months')
      .startOf('month')
      .toDate();
    const endDate = moment
      .utc([year, month])
      .subtract(endMonthSubtract, 'months')
      .endOf('month')
      .toDate();

      const sales = await Sale.find({
        deptName: 'ERMENIGILDO Zegna Boutique',
        businessDate: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      const totalSales = calculateTotalSales(sales);
      return totalSales;
    } catch (error) {
      Promise.reject(error);
    }
  },

  async processAndSaveBatch(jsonData, fileId,  year, startDate, endDate) {
    return new Promise(async (resolve, reject) => {
      try {
        let preprocessedItems = [];

        for (const row of jsonData) {
          const preprocessedItem = ExcelHandler.extractDataFomSalesRow(
            row,
            fileId,
            year
          );
          preprocessedItems.push(preprocessedItem);
        }

        if(preprocessedItems[0].sector === 'DISTRIBUTION_PERFUMERY'){
          await await PrefumerySales.deleteMany({
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          });
          await PrefumerySales.insertMany(preprocessedItems);
          console.log('data added successfully');
          resolve('data added successfully');
          return;
        }
        // TODO: Add validation step before saving to the database

        for (const batch of batchify(preprocessedItems)) {
          await Sale.insertMany(batch);
        }
        console.log('data added successfully');
        resolve('data added successfully');
      } catch (error) {
        reject(error);
      }
    });
  },

  async getEmpBySales(
    year,
    month,
    budgets,
    startMonthSubtract = 1,
    endMonthSubtract = 1,
  ) {
    const startDate = moment
      .utc([year, month])
      .subtract(startMonthSubtract, 'months')
      .startOf('month')
      .toDate();
    const endDate = moment
      .utc([year, month])
      .subtract(endMonthSubtract, 'months')
      .endOf('month')
      .toDate();

    const pipeline = getEmployeesByStoreName3AndLegacyDepartmentPipeline(
      budgets,
      startDate,
      endDate,
    );

    if (!pipeline.length) {
      console.warn(
        `something wrong with get sales pipeline budgets ids ${budgets.map((item) => item?._id)} `,
      );
      return [];
    }

    const employees = await Sale.aggregate(pipeline);

    return employees;
  },

  async getEmpWithSalesDistHome(
    budgets,
    customerNameArray,
    year,
    month,
    startMonthSubtract = 1,
    endMonthSubtract = 1,
  ) {
    try {
      const startDate = moment
        .utc([year, month])
        .subtract(startMonthSubtract, 'months')
        .startOf('month')
        .toDate();
      const endDate = moment
        .utc([year, month])
        .subtract(endMonthSubtract, 'months')
        .endOf('month')
        .toDate();

      const pipeline = getEmployeesWithTotalSaleInstitutionalPipeline(
        budgets,
        customerNameArray,
        startDate,
        endDate,
      );

      if (!pipeline.length) {
        console.warn(
          `something wrong with get sales pipeline budgets ids ${budgets.map((item) => item?._id)} `,
        );
        return [];
      }
      const employees = await Sale.aggregate(pipeline);

      return employees;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async getRetailPerfumeryRotation(empNo, locationCodes, year, month) {
    try {
      const startDate = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const endDate = moment
        .utc([year, month - 1])
        .endOf('month')
        .toDate();
      const pipeline = getRetailPerfumeryRotationPipeline(empNo, locationCodes);
      const sales = await Sale.aggregate(pipeline);
      return sales;  
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getCustomSales(year, month){
    const startDate = moment
    .utc([year, month - 1])
    .startOf('month')
    .toDate();
  const endDate = moment
    .utc([year, month - 1])
    .endOf('month')
    .toDate();
    const sales = await Sale.find(
      {
        brandName: "Concrete- Custom sales",
        businessDate: {
          $gte: startDate,
          $lte: endDate,
        },

      }
    );
    return sales;
  },
  async getSalesByDays(
    storeName3,
    legacyDepartment,
    year,
    month,
    startDay,
    endDay,
    axis=false
  ) {
    try {
      const daysInMonth = moment.utc([year, month - 1]).daysInMonth();

      if (startDay < 1 || startDay > daysInMonth) {
        return Promise.reject(
          new Error(
            `Invalid startDay: ${startDay}. It must be between 1 and ${daysInMonth} for the month ${month} in the year ${year}.`,
          ),
        );
      }

      if (endDay < startDay || endDay > daysInMonth) {
        Promise.reject(
          new Error(
            `Invalid endDay: ${endDay}. It must be between ${startDay} and ${daysInMonth} for the month ${month} in the year ${year}.`,
          ),
        );
      }

      const startDate = moment
        .utc([year, month - 1, startDay])
        .startOf('day')
        .toDate();

      const endDate = moment
        .utc([year, month - 1, endDay || daysInMonth])
        .endOf('day')
        .toDate();

      const pipeline = getSalesByDaysPipeline(
        storeName3,
        legacyDepartment,
        startDate,
        endDate,
      );

      const sales = await Sale.aggregate(pipeline);

      let fragSales=0
      let makeupSales=0
      let skincareSales=0
      sales.forEach((item)=>{
        if(!isNaN(item?.resaValue)){
          if(item?.className=='FRAGRANCE'){
            fragSales=fragSales+parseInt(item.resaValue)
          }else if(item?.className=='MAKE-UP'){
            console.log('before',makeupSales,item.resaValue)
            makeupSales=makeupSales+parseInt(item.resaValue)
            console.log('makeupSales',makeupSales)
          }else if(item?.className=='SKINCARE'){
            skincareSales=skincareSales+parseInt(item.resaValue)
          }
        }
      })

      const totalSales = calculateTotalSales(sales) || 0;

      return axis?{fragSales,makeupSales,skincareSales,totalSales}:totalSales;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

module.exports = SalesDataProviders;

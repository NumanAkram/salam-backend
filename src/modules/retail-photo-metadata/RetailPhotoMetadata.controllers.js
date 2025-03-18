const { RetailPhotoMetadata } = require('@models');
const BudgetProvider = require('@modules/budget/budget.providers');
const EmployeesProviders = require('@modules/employees/employees.providers');
const ExcelHandler = require('@utils/excel');

const { StatusCodes } = require('http-status-codes');

const RetailPhotoMetadataControllers = {
  async getEmployees(req, res) {
    const { year } = req.body;
    const budgets = await BudgetProvider.getRetailPhotographyBudget(year);
    const employees = await EmployeesProviders.getEmployeesByLocationCode([
      budgets?.locationCode,
    ]);

    res
      .status(StatusCodes.OK)
      .json({ data: { employees }, total: employees.length });
  },

  async addMetaData(req, res) {
    const { employees, year, month } = req.body;
    const { file } = req;

    const jsonData = await ExcelHandler.convertSheetToJson(file.path);
    let preprocessedItems = [];
    try {
      const isAdded = await RetailPhotoMetadata.findOne({
        year,
        month,
      });
      if (isAdded) {
        await RetailPhotoMetadata.deleteMany({ year, month });
      }
      for (const row of jsonData) {
        const preprocessedItem = ExcelHandler.extractDataRPMetadata(row);
        if (preprocessedItem) preprocessedItems.push(preprocessedItem);
      }
      // TODO add validation step before save to db
      await RetailPhotoMetadata.create({
        items: preprocessedItems,
        employees: employees,
        year,
        month,
      });
    } catch (error) {
      await RetailPhotoMetadata.deleteMany({ year, month });
      throw error;
    } finally {
      ExcelHandler.removeFile(file.path);
    }
    return res.status(StatusCodes.CREATED).json({
      data: {
        message: {
          en: 'Metadata added successfully',
          ar: 'تمت إضافة البيانات الوصفية بنجاح',
        },
      },
    });
  },
};

module.exports = RetailPhotoMetadataControllers;

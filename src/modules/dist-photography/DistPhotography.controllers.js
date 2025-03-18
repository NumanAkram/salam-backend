const { StatusCodes } = require('http-status-codes');
const DistPhotographyProviders = require('./DistPhotography.providers');
const { DistPhotoWorkshop } = require('@models');
const ExcelHandler = require('@utils/excel');

const DistPhotographyControllers = {
  async addWorkshopData(req, res) {
    const { year, month } = req.body;
    const { file } = req;

    const jsonData = await ExcelHandler.convertSheetToJson(file.path);
    let preprocessedItems = [];

    try {
      const isAdded = await DistPhotoWorkshop.findOne({
        year,
        month,
      });
      if (isAdded) {
        await DistPhotoWorkshop.deleteMany({ year, month });
      }

      for (const row of jsonData) {
        const preprocessedItem = ExcelHandler.extractWorkshopDataDP(row);
        if (preprocessedItem) preprocessedItems.push(preprocessedItem);
      }
      // TODO add validation step before save to db

      await DistPhotoWorkshop.create({
        items: preprocessedItems,
        year,
        month,
      });
    } catch (error) {
      await DistPhotoWorkshop.deleteMany({ year, month });
      throw error;
    } finally {
      ExcelHandler.removeFile(file.path);
    }

    return res.status(StatusCodes.CREATED).json({
      data: {
        message: {
          en: 'workshop data added successfully',
          ar: 'تمت إضافة البيانات الوصفية بنجاح',
        },
      },
    });
  },

  async addPromoterData(req, res) {
    const { year, month } = req.body;
    const { file } = req;

    const jsonData = await ExcelHandler.convertSheetToJson(file.path);
    const { incentiveRow, data } = ExcelHandler.getIncentiveRowDP(jsonData);

    await DistPhotographyProviders.addPromoterData(
      incentiveRow,
      data,
      year,
      month,
    );
    return res.status(StatusCodes.CREATED).json({
      data: {
        message: {
          en: 'promoter data added successfully',
          ar: 'تمت إضافة بيانات المروج بنجاح',
        },
      },
    });
  },
};

module.exports = DistPhotographyControllers;

const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const ExcelHandler = require('@utils/excel');
const { Sale } = require('@models');
const { getSalesPipeline } = require('@utils/pipelines/sales.pipeline');
const { NotFoundError } = require('@utils/api-error');
const moment = require('moment');
const SalesDataProviders = require('./salesData.providers');

const SalesDataControllers = {
  async addSales(req, res) {
    const fileId = new mongoose.Types.ObjectId();
    const { file } = req;
    const { year, month } = req.body;
    try {
      const startDate = moment
        .utc([year, month - 1])
        .startOf('month')
        .toDate();
      const endDate = moment
        .utc([year, month - 1])
        .endOf('month')
        .toDate();

      await Sale.deleteMany({
        businessDate: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      await ExcelHandler.streamConvertSheetToJson(
        file.path,
        fileId,
        year,
        startDate, 
        endDate,
        SalesDataProviders.processAndSaveBatch,
      );
    } catch (error) {
      await Sale.deleteMany({ fileId });
      throw error;
    } finally {
      ExcelHandler.removeFile(file.path);
    }

    return res.status(StatusCodes.CREATED).json({
      data: {
        message: {
          en: 'sales data added successfully',
          ar: 'تمت إضافة بيانات المبيعات بنجاح',
        },
      },
    });
  },

  async getSales(req, res) {
    const limit = req?.query?.limit ?? 10;
    const skip = req?.query?.skip ?? 0;
    const pipeline = getSalesPipeline(req);
    const sales = await Sale.aggregate(pipeline);

    return res.status(StatusCodes.OK).json({
      data: {
        sales: sales.slice(skip, +skip + +limit),
        totalCount: sales.length,
      },
    });
  },

  async updateSale(req, res) {
    const { _id, ...updateFields } = req.body;
    const row = await Sale.findOneAndUpdate(
      { _id },
      { ...ExcelHandler.extractDataFomSalesRow(updateFields) },
      { runValidator: true, new: true },
    );

    if (!row) {
      throw new NotFoundError({
        en: `row not found`,
        ar: `لم يتم العثور على الصف`,
      });
    }

    res.status(StatusCodes.CREATED).json({
      data: {
        row,
        message: {
          en: 'row update successfully',
          ar: 'تم تحديث الصف بنجاح',
        },
      },
    });
  },

  async addRow(req, res) {
    const { row } = req.body;
    const fileId = new mongoose.Types.ObjectId();
    const addedRow = await Sale.create({
      ...ExcelHandler.extractDataFomSalesRow(row, fileId),
    });
    res.status(StatusCodes.CREATED).json({
      data: {
        row: addedRow,
        message: {
          en: 'row added successfully',
          ar: 'تمت إضافة الصف بنجاح',
        },
      },
    });
  },

  async removeRow(req, res) {
    const { _id } = req.body;
    await Sale.findOneAndDelete({ _id });
    res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'row deleted successfully',
          ar: 'تم حذف الصف بنجاح',
        },
      },
    });
  },

  async getLastUpdate(_, res) {
    const latestSale = await Sale.findOne({}, {}, { sort: { updatedAt: -1 } });

    // If an employee is found
    if (latestSale) {
      const formattedDate = moment(latestSale.updatedAt).format('DD/MM/YYYY');
      return res
        .status(StatusCodes.OK)
        .json({ data: { lastUpdate: formattedDate } });
    } else {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ data: { lastUpdate: null } });
    }
  },
};

module.exports = SalesDataControllers;

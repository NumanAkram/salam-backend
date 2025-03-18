const { StatusCodes } = require('http-status-codes');
const ExcelHandler = require('@utils/excel');
const { Budget } = require('@models');
const { batchify } = require('@utils/batchify');
const sectorJson = require('@json/sector.json');
const { NotFoundError } = require('@utils/api-error');

const BudgetControllers = {
  async addBudget(req, res) {
    const { sector, year } = req.body;
    const { file } = req;

    const jsonData = await ExcelHandler.convertSheetToJson(file.path);

    const preprocessedItems = [];

    try {
      for (const row of jsonData) {
        const preprocessedItem = ExcelHandler.extractDataFomBudgetRow(row);
        preprocessedItems.push({ sector, year, ...preprocessedItem });
      }

      // TODO add validation step before save to db

      await Budget.deleteMany({ sector, year });

      for (const batch of batchify(preprocessedItems)) {
        await Budget.insertMany(batch);
      }
    } catch (error) {
      await Budget.deleteMany({ sector, year });
      throw error;
    } finally {
      ExcelHandler.removeFile(file.path);
    }

    return res.status(StatusCodes.CREATED).json({
      data: {
        message: {
          en: 'budget added successfully',
          ar: 'تم إضافة الميزانية بنجاح.',
        },
      },
    });
  },

  async getBudget(req, res) {
    const { sector, year } = req.query;
    const limit = req?.query?.limit ?? 10;
    const skip = req?.query?.skip ?? 0;

    const total = await Budget.countDocuments({ year, sector });
    const budgets = await Budget.find({ year, sector }).skip(skip).limit(limit);
    return res.status(StatusCodes.OK).json({
      data: {
        budgets,
        total,
      },
    });
  },

  async updateBudget(req, res) {
    const { _id, ...updateFields } = req.body;

    let updateData = {};

    const monthFields = Object.keys(updateFields).filter((month) =>
      [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec',
      ].includes(month.toLowerCase()),
    );

    if (monthFields.length > 0) {
      updateData.$set = {};
      monthFields.forEach((month) => {
        updateData.$set[`months.${month.toLowerCase()}`] = updateFields[month];
      });
    }

    Object.keys(updateFields).forEach((key) => {
      if (!monthFields.includes(key)) {
        updateData[key] = updateFields[key];
      }
    });

    const row = await Budget.findOneAndUpdate(
      { _id },
      { ...updateData },
      { runValidators: true, new: true },
    );

    if (!row) {
      throw new NotFoundError({
        en: 'budget not found',
        ar: 'الميزانية غير موجودة',
      });
    }

    res.status(StatusCodes.CREATED).json({
      data: {
        row,
        message: { en: 'row update successfully', ar: 'تم تحديث الصف بنجاح' },
      },
    });
  },

  async addRow(req, res) {
    const { ...fields } = req.body;
    console.log(fields);

    let data = {};
    const monthFields = Object.keys(fields).filter((month) =>
      [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec',
      ].includes(month.toLowerCase()),
    );

    if (monthFields.length > 0) {
      data.months = {};
      monthFields.forEach((month) => {
        data.months[month.toLowerCase()] = fields[month];
      });
    }

    Object.keys(fields).forEach((key) => {
      if (!monthFields.includes(key)) {
        data[key] = fields[key];
      }
    });

    const addedRow = await Budget.create({
      ...data,
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
    const row = await Budget.findOneAndDelete({ _id });

    if (!row) {
      throw new NotFoundError({
        en: 'budget not found',
        ar: 'الميزانية غير موجودة',
      });
    }
    res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'row deleted successfully',
          ar: 'تم حذف الصف بنجاح',
        },
      },
    });
  },

  async getSector(req, res) {
    const { year } = req.query;
    const data = [];
    for (const sector of sectorJson) {
      const budget = await Budget.findOne({ year, sector: sector?.slug });
      if (budget) {
        data.push({ ...sector, file: true });
      } else {
        data.push({ ...sector, file: false });
      }
    }
    return res.status(StatusCodes.OK).json({ data: { sectors: data } });
  },
};

module.exports = BudgetControllers;

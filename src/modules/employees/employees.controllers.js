const { StatusCodes } = require('http-status-codes');
const ExcelHandler = require('@utils/excel');
const { Employee } = require('@models');
const { getEmployeesPipeline } = require('@utils/pipelines/employees.pipeline');
const { NotFoundError } = require('@utils/api-error');
const moment = require('moment');
const mongoose = require('mongoose')

const EmployeesControllers = {
  async addEmployees(req, res) {
    const { file } = req;
    const jsonData = await ExcelHandler.convertSheetToJson(file.path);
    let preprocessedItems = [];

    try {
      for (const row of jsonData) {
        const preprocessedItem = ExcelHandler.extractDataEmployeeRow(row);
        preprocessedItems.push(preprocessedItem);
      }
      // TODO add validation step before save to db

      await Employee.updateMany({}, { latest: false });
      for (const employee of preprocessedItems) {
        await Employee.findOneAndUpdate(
          { empNo: employee?.empNo },
          { ...employee, latest: true },
          { upsert: true, new: true, runValidator: true },
        );
      }
    } catch (error) {
      throw error;
    } finally {
      ExcelHandler.removeFile(file.path);
    }

    return res.status(StatusCodes.CREATED).json({
      data: {
        message: {
          en: 'Employees data added successfully',
          ar: 'تمت إضافة بيانات الموظفين بنجاح',
        },
      },
    });
  },

  async getEmployees(req, res) {
    const limit = req?.query?.limit ?? 10;
    const skip = req?.query?.skip ?? 0;
    const pipeline = getEmployeesPipeline(req);
    const employees = await Employee.aggregate(pipeline);

    return res.status(StatusCodes.OK).json({
      data: {
        employees: employees.slice(skip, +skip + +limit),
        totalCount: employees.length,
      },
    });
  },

  async updateEmployee(req, res) {
    const { _id, ...updateFields } = req.body;

    const row = await Employee.findOneAndUpdate(
      { _id },
      { ...ExcelHandler.extractDataEmployeeRow(updateFields) },
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
    const preprocessedItem = ExcelHandler.extractDataEmployeeRow(row);
    const addedRow = await Employee.findOneAndUpdate(
      {
        empNo: preprocessedItem?.empNo,
      },
      { ...preprocessedItem },
      { runValidator: true, new: true, upsert: true },
    );
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
    await Employee.findOneAndDelete({ _id });
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
    const latestEmployee = await Employee.findOne(
      {},
      {},
      { sort: { updatedAt: -1 } },
    );

    // If an employee is found
    if (latestEmployee) {
      const formattedDate = moment(latestEmployee.updatedAt).format(
        'DD/MM/YYYY',
      );
      return res
        .status(StatusCodes.OK)
        .json({ data: { lastUpdate: formattedDate } });
    } else {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ data: { lastUpdate: null } });
    }
  },

  async selectByEmpNo(req, res) {
    const { empNo } = req.query;

    const selectedEmployees = await Employee.find({
      empNo: { $regex: `${empNo}$` },
      latest: true,
    });

    return res.status(StatusCodes.OK).json({
      data: {
        selectedEmployees,
      },
    });
  },
};

module.exports = EmployeesControllers;

const { Employee } = require('@models');
const {
  getEmployeesBasedOnLocationCodePipeline,
  getEmployeesRetailPerfumery,
} = require('@utils/pipelines/employees.pipeline');

const { probationTrainingPeriodDate } = require('@utils/date');

const EmployeesProviders = {
  async getEmployeesByLocationCode(locationCode, probationTrainingPeriod) {
    try {
      const pipeline = getEmployeesBasedOnLocationCodePipeline(
        locationCode,
        probationTrainingPeriod,
      );
      const employees = await Employee.aggregate(pipeline);
      return employees;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getEmployeesByIds(ids, probationTrainingPeriod) {
    try {
      if (!ids) {
        return [];
      }

      const beforeDate = probationTrainingPeriodDate(probationTrainingPeriod);

      const employees = await Employee.find({
        _id: { $in: ids },
        $or: [
          { hireDate: { $lt: beforeDate } },
          { hireDate: { $exists: false } }, //TODO remove it
        ],
        latest: true,
      });

      return employees;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async getEmployeeById(id, probationTrainingPeriod) {
    try {
      if (!id) {
        return null;
      }

      const beforeDate = probationTrainingPeriodDate(probationTrainingPeriod);

      const employee = await Employee.findOne({
        _id: id,
        $or: [
          { hireDate: { $lt: beforeDate } },
          { hireDate: { $exists: false } }, //TODO remove it
        ],
        latest: true,
      });

      return employee;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async findEmployeeByLocationCode(
    locationName,
    probationTrainingPeriod,
    rest = {},
  ) {
    try {
      const filter = { ...rest };
      if (probationTrainingPeriod) {
        const beforeDate = probationTrainingPeriodDate(probationTrainingPeriod);
        filter.$or = [
          { hireDate: { $lt: beforeDate } },
          { hireDate: { $exists: false } }, //TODO remove it
        ];
      }
      const employee = await Employee.findOne({
        locationName,
        ...filter,
        latest: true,
      });
      if (!employee) {
        return null;
      }
      return employee;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async selectEmpByNo(empNo, { probationTrainingPeriod }) {
    try {
      const filter = {};
      if (probationTrainingPeriod) {
        const beforeDate = probationTrainingPeriodDate(probationTrainingPeriod);
        filter.$or = [
          { hireDate: { $lt: beforeDate } },
          { hireDate: { $exists: false } }, //TODO remove it
        ];
      }
      const selectedEmployee = await Employee.findOne({
        empNo: { $regex: `${empNo}$` },
        latest: true,
        ...filter,
      });
      return selectedEmployee;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getRetailPerfumeryEmployees(
    positionRegex,
    probationTrainingPeriod,
    locationCodes = [],
  ) {
    try {
      const pipeline = getEmployeesRetailPerfumery(
        positionRegex,
        probationTrainingPeriod,
        locationCodes,
      );

      const employees = await Employee.aggregate(pipeline);

      return employees;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

module.exports = EmployeesProviders;

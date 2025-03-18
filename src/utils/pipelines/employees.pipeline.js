const moment = require('moment');

function getEmployeesPipeline(httpRequest) {
  const pipeline = [];
  pipeline.push({ $match: { latest: true } });
  if (httpRequest?.query?.empNo) {
    pipeline.push({ $match: { empNo: httpRequest.query.empNo } });
  }
  if (httpRequest?.query?.empName) {
    const regex = new RegExp(httpRequest.query.empName, 'i');
    pipeline.push({ $match: { empNo: regex } });
  }
  if (httpRequest?.query?.locationGroup) {
    const regex = new RegExp(httpRequest.query.locationGroup, 'i');
    pipeline.push({ $match: { locationGroup: regex } });
  }
  if (httpRequest?.query?.locationName) {
    const regex = new RegExp(httpRequest.query.location, 'i');
    pipeline.push({ $match: { location: regex } });
  }

  pipeline.push({ $sort: { updatedAt: 1 } });

  return pipeline;
}

const getEmployeesBasedOnLocationCodePipeline = (
  locationCode,
  probationTrainingPeriod,
) => {
  const pipeline = [];

  if (!locationCode) {
    return Promise.reject(`locationCode not exist in the budget ${budgets}`);
  }

  if (probationTrainingPeriod) {
    const beforeDate = moment()
      .subtract(parseInt(probationTrainingPeriod), 'days')
      .toDate();
    pipeline.push({
      $match: {
        $or: [
          { hireDate: { $lt: beforeDate } },
          { hireDate: { $exists: false } }, //TODO remove it
        ],
      },
    });
  }

  pipeline.push({ $match: { latest: true } });

  pipeline.push({ $match: { locationName: { $in: locationCode } } });

  return pipeline;
};

const getEmployeesRetailPerfumery = (
  positionRegex,
  probationTrainingPeriod,
  locationCodes = [],
) => {
  const pipeline = [];

  pipeline.push({ $match: { latest: true } });

  // if (probationTrainingPeriod) {
  //   const beforeDate = moment()
  //     .subtract(parseInt(probationTrainingPeriod), 'days')
  //     .toDate();
  //   pipeline.push({
  //     $match: {
  //       $or: [
  //         { hireDate: { $lt: beforeDate } },
  //         { hireDate: { $exists: false } }, //TODO remove it
  //       ],
  //     },
  //   });
  // }

  pipeline.push({ $match: { locationName: { $in: locationCodes } } });

  pipeline.push({
    $match: {
      position: { $regex: positionRegex },
    },
  });

  // pipeline.push({
  //   $match: {
  //     empNo: { $regex: /^EMP-89-0/ },
  //   },
  // });

  return pipeline;
};

module.exports = {
  getEmployeesPipeline,
  getEmployeesBasedOnLocationCodePipeline,
  getEmployeesRetailPerfumery,
};

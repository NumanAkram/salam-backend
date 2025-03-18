const moment = require('moment');

function getSalesPipeline(httpRequest) {
  const pipeline = [];
  if (httpRequest?.query?.channelId) {
    pipeline.push({
      $match: { channelId: parseInt(httpRequest.query.channelId) },
    });
  }
  if (httpRequest?.query?.chainName) {
    pipeline.push({
      $match: { chainName: httpRequest.query.chainName.toUpperCase() },
    });
  }
  if (httpRequest?.query?.store) {
    pipeline.push({
      $match: { store: parseInt(httpRequest.query.store) },
    });
  }
  if (httpRequest?.query?.storeName) {
    pipeline.push({
      $match: { storeName: httpRequest.query.storeName },
    });
  }
  if (httpRequest?.query?.storeName3) {
    pipeline.push({
      $match: { storeName3: httpRequest.query.storeName3 },
    });
  }
  if (httpRequest?.query?.businessDate) {
    const exactBusinessDate = moment.utc(
      httpRequest?.query?.businessDate,
      'DD-MM-YYYY',
    );

    pipeline.push({
      $match: { businessDate: exactBusinessDate.toDate() },
    });
  }
  if (httpRequest?.query?.startBusinessDate) {
    const exactStartBusinessDate = moment.utc(
      httpRequest.query.startBusinessDate,
      'DD-MM-YYYY',
    );
    pipeline.push({
      $match: { businessDate: { $gte: exactStartBusinessDate.toDate() } },
    });
  }
  if (httpRequest?.query?.endBusinessDate) {
    const exactEndBusinessDate = moment.utc(
      httpRequest.query.endBusinessDate,
      'DD-MM-YYYY',
    );
    pipeline.push({
      $match: { businessDate: { $lte: exactEndBusinessDate.toDate() } },
    });
  }
  // TranSeqNo filter
  if (httpRequest?.query?.tranSeqNo) {
    pipeline.push({ $match: { tranSeqNo: httpRequest.query.tranSeqNo } });
  }
  // Additional filters based on schema
  if (httpRequest?.query?.customerId) {
    pipeline.push({
      $match: { customerId: httpRequest.query.customerId },
    });
  }
  if (httpRequest?.query?.salespersonId) {
    pipeline.push({
      $match: { salespersonId: httpRequest.query.salespersonId },
    });
  }
  if (httpRequest?.query?.division) {
    pipeline.push({
      $match: { division: parseInt(httpRequest.query.division) },
    });
  }
  if (httpRequest?.query?.brandId) {
    pipeline.push({
      $match: { brandId: httpRequest.query.brandId },
    });
  }
  if (httpRequest?.query?.item) {
    pipeline.push({
      $match: { item: httpRequest.query.item },
    });
  }
  if (httpRequest?.query?.barcode) {
    pipeline.push({
      $match: { barcode: httpRequest.query.barcode },
    });
  }
  if (httpRequest?.query?.tranType) {
    pipeline.push({
      $match: { tranType: httpRequest.query.tranType },
    });
  }

  pipeline.push({ $sort: { businessDate: 1 } });

  return pipeline;
}

const getSalesByStoreName3AndLegacyDepartmentPipeline = (
  budgets,
  startDate,
  endDate,
  { customerNameArray, isIns, isDistHome },
) => {
  const pipeline = [];

  const criteria = budgets
    .map((budget) => {
      if (budget?.storeName3 && budget?.legacyDepartment) {
        return {
          storeName3: budget.storeName3,
          legacyDepartment: budget.legacyDepartment,
        };
      }
      return null;
    })
    .filter((item) => item !== null);

  const orConditions = criteria.map((item) => {
    return {
      $and: [
        { storeName3: item.storeName3 },
        { legacyDepartment: item.legacyDepartment },
      ],
    };
  });

  if (orConditions.length) {
    pipeline.push({
      $match: {
        $or: orConditions,
      },
    });
  } else return [];

  // pipeline.push({
  //   $match: {
  //     businessDate: {
  //       $gte: startDate,
  //       $lte: endDate,
  //     },
  //   },
  // });

  pipeline.push({
    $match: {
      tranType: { $not: { $regex: '^RETURN$', $options: 'i' } },
    },
  });

  if (isDistHome) {
    if (isIns) {
      pipeline.push({
        $match: {
          $or: customerNameArray.map((str) => ({
            customerName: { $regex: `^${str}$`, $options: 'i' },
          })),
        },
      });
    } else {
      pipeline.push({
        $match: {
          $nor: customerNameArray.map((str) => ({
            customerName: { $regex: `^${str}$`, $options: 'i' },
          })),
        },
      });
    }
  }

  return pipeline;
};

const getEmployeesByStoreName3AndLegacyDepartmentPipeline = (
  budgets,
  startDate,
  endDate,
) => {
  const pipeline = [];

  const criteria = budgets
    .map((budget) => {
      if (budget?.storeName3 && budget?.legacyDepartment) {
        return {
          storeName3: budget.storeName3,
          legacyDepartment: budget.legacyDepartment,
        };
      }
      return null;
    })
    .filter((item) => item !== null);

  const orConditions = criteria.map((item) => {
    return {
      $and: [
        { storeName3: item.storeName3 },
        { legacyDepartment: item.legacyDepartment },
      ],
    };
  });

  if (orConditions.length) {
    pipeline.push({
      $match: {
        $or: orConditions,
      },
    });
  } else return [];

  pipeline.push({
    $match: {
      businessDate: {
        $gte: startDate,
        $lte: endDate,
      },
    },
  });

  pipeline.push({
    $match: {
      tranType: { $not: { $regex: '^RETURN$', $options: 'i' } },
    },
  });

  pipeline.push({
    $group: {
      _id: '$salespersonId',
      totalSales: { $sum: '$resaValue' },
    },
  });

  return pipeline;
};

const getEmployeesWithTotalSaleInstitutionalPipeline = (
  budgets,
  customerName,
  startDate,
  endDate,
) => {
  const pipeline = [];

  if (!budgets?.locationCode) return [];

  pipeline.push({ $match: { locationCode: budgets.locationCode } });

  pipeline.push({
    $match: {
      $or: customerName.map((str) => ({
        customerName: { $regex: `${str}`, $options: 'i' },
      })),
    },
  });

  pipeline.push({
    $match: {
      businessDate: {
        $gte: startDate,
        $lte: endDate,
      },
    },
  });

  pipeline.push({
    $match: {
      tranType: { $not: { $regex: '^RETURN$', $options: 'i' } },
    },
  });

  pipeline.push({
    $group: {
      _id: '$salespersonId',
      totalSales: { $sum: '$resaValue' },
    },
  });

  return pipeline;
};

const getRetailPerfumeryRotationPipeline = (
  empNo,
  locationCodes,
  startDate,
  endDate,
) => {
  const pipeline = [];

  // pipeline.push({
  //   $match: {
  //     businessDate: {
  //       $gte: startDate,
  //       $lte: endDate,
  //     },
  //   },
  // });

  pipeline.push({ $match: { salespersonId: empNo } });
  pipeline.push({ $match: { locationCode: { $in: locationCodes } } });

  // pipeline.push({
  //   $group: {
  //     _id: '$locationCode',
  //     uniqueDays: {
  //       $addToSet: {
  //         $dateToString: {
  //           format: '%Y-%m-%d',
  //           date: '$businessDate',
  //         },
  //       },
  //     },
  //   },
  // });

  // pipeline.push({
  //   $project: {
  //     _id: 1,
  //     uniqueDaysCount: { $size: '$uniqueDays' },
  //   },
  // });

  return pipeline;
};

const getSalesByDaysPipeline = (
  storeName3,
  legacyDepartment,
  startDate,
  endDate,
) => {
  const pipeline = [];
  pipeline.push({ $match: { storeName3 } });
  pipeline.push({ $match: { legacyDepartment } });
  pipeline.push({
    $match: {
      businessDate: {
        $gte: startDate,
        $lte: endDate,
      },
    },
  });

  pipeline.push({
    $match: {
      tranType: { $not: { $regex: '^RETURN$', $options: 'i' } },
    },
  });

  return pipeline;
};

module.exports = {
  getSalesPipeline,
  getSalesByStoreName3AndLegacyDepartmentPipeline,
  getEmployeesByStoreName3AndLegacyDepartmentPipeline,
  getEmployeesWithTotalSaleInstitutionalPipeline,
  getRetailPerfumeryRotationPipeline,
  getSalesByDaysPipeline,
};

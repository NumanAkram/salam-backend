const { Clauses } = require('@models');
const { SECTOR_ENUM, DP_POSITIONS } = require('@enums/sector.enum');

const ClausesProviders = {
  async findClauses(sector) {
    try {
      const clauses = await Clauses.findOne({
        sector,
      });

      return clauses;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async findClausesPopulate(sector) {
    try {
      const clauses = await Clauses.findOne({
        sector,
      })
        .populate('employees.selectedEmp')
        .populate('storeMgrDeptFashionHome.selectedEmp');

      return clauses;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  //TODO check before remove
  async getDistPhEmp(budgetId) {
    try {
      const clauses = await Clauses.findOne({
        sector: SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
      }).populate({
        path: '_empId',
      });

      if (!clauses) {
        return Promise.reject('dist photography clause not found');
      }

      const filteredPositions = clauses.position.filter((pos) => {
        const emp = pos._empId;
        if (!emp) return false;

        const probationEndDate = new Date(emp.hireDate);
        probationEndDate.setDate(
          probationEndDate.getDate() + clauses.probationTrainingPeriod,
        );

        return (
          pos._budgetId == budgetId &&
          emp.latest &&
          currentDate >= probationEndDate
        );
      });

      // const filteredClauses = {
      //   ...clauses.toObject(),
      //   position: filteredPositions,
      // };

      return filteredPositions;
    } catch (error) {
      Promise.reject(error);
    }
  },

  async getDistPhEmp(budgetId) {
    try {
      const clauses = await Clauses.findOne({
        sector: SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
      });

      if (!clauses) {
        return Promise.reject('dist photography clause not found ');
      }

      const filteredBackOffice = clauses?.backOffice.filter((item) => {
        return item._backOfficeBudgetId == budgetId;
      });

      return filteredBackOffice?._budgetsIds || [];
    } catch (error) {
      Promise.reject(error);
    }
  },

  async getEmployeeTeam(_empId, sector) {
    try {
      const clauses = await Clauses.findOne({
        sector,
      });
      if (!clauses) {
        return Promise.reject('dist photography clause not found ');
      }
      const emp = clauses?.employees.filter((item) => {
        return item?._empId == _empId;
      });
      if (!emp?.team) {
        return Promise.reject({
          en: `team not exist for employee id ${_empId} in sector ${SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY}`,
          ar: '',
        });
      }
      return emp?.team;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getEmployeePercentage(_empId, sector) {
    try {
      const clauses = await Clauses.findOne({
        sector,
      });
      if (!clauses) {
        return Promise.reject('dist photography clause not found ');
      }
      const emp = clauses?.employees.filter((item) => {
        return item?._empId == _empId;
      });
      if (!emp?.percentage) {
        return Promise.reject({
          en: `percentage not exist for employee id ${_empId} in sector ${SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY}`,
          ar: '',
        });
      }
      return emp?.percentage;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async getInstitutionalEmpIds() {
    const clause = await Clauses.findOne({
      sector: SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
    });

    const { selectedEmp } =
      clause?.employees.find((item) => {
        if (item?.position == DP_POSITIONS.INSTITUTIONAL) {
          return item;
        }
      }) || [];

    if (!selectedEmp) {
      return [];
    }
    return selectedEmp;
  },
};

module.exports = ClausesProviders;

const { BACK_OFFICE_REGEX } = require('@utils/regex');

/**
 * Finds the current back office data for the given department group.
 *
 * @param {string} deptGroup - The department group to find data for.
 * @param {Array} data - The array of back office data.
 * @returns {Array|null} The array of back office data or null if not found.
 */
const findCurrentBackOffice = (deptGroup, data) => {
  const result = data.find((ele) => ele?.backOfficeDeptGroup == deptGroup);
  return result?.deptGroup || null;
};

/**
 * Finds the current position data for the given department group.
 *
 * @param {string} position - The department group to find data for.
 * @param {Array} data - The array of employees.
 * @returns {Array|null} The array of employees or null if not found.
 */
const findCurrentEmployees = (position, data) => {
  const result = data.find((ele) => ele?.position == position);
  return result?.selectedEmp || null;
};

/**
 * Finds the current position data for the given department group.
 *
 * @param {string} budgetCode - The department group to find data for.
 * @param {Array} data - The array of employees.
 * @returns {Array|null} The array of employees or null if not found.
 */
const findStoreMgrDeptFashionHome = (budgetCode, data) => {
  const result = data.find((ele) => ele?.budgetCode == budgetCode);
  return result?.selectedEmp || null;
};

/**
 * Formats the distribution photo based on the given budgets, clauses, and template.
 *
 * @param {Array} budgets - The list of budgets.
 * @param {Object} clauses - The clauses containing back office data.
 * @param {Array} template - The template to append the back office data to.
 * @returns {Array} The formatted distribution photo data.
 */
const distPhotoFormat = (budgets, clauses, template) => {
  try {
    const options = budgets
      .filter((budget) => !BACK_OFFICE_REGEX.test(budget?.deptGroup))
      .map((budget) => budget.deptGroup);

    const backOffices = budgets
      .filter((budget) => BACK_OFFICE_REGEX.test(budget?.deptGroup))
      .map((budget) => {
        return {
          label: budget.deptGroup,
          value: budget.deptGroup,
          type: 'multi-select',
          data: findCurrentBackOffice(
            budget.deptGroup,
            clauses?.backOffice || [],
          ),
          options: options,
          optionsType: 'options',
          identifier: 'backOffice',
        };
      });

    const teams = template
      .filter((ele) => ele?.identifier == 'employees')
      .map((ele) => {
        return {
          ...ele,
          data: findCurrentEmployees(ele?.value, clauses?.employees || []),
        };
      });

    const probationTrainingPeriod = template.find(
      (ele) => ele?.identifier == 'probationTrainingPeriod',
    );
    probationTrainingPeriod['data'] = clauses?.probationTrainingPeriod || null;

    return [probationTrainingPeriod, ...teams, ...backOffices];
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Formats the distribution photo based on the given budgets, clauses, and template.
 *
 * @param {Object} clauses - The clauses containing back office data.
 * @param {Array} template - The template to append the back office data to.
 * @returns {Array} The formatted clauses of dist FMCG.
 */
const distFMCGFormat = (clauses, template) => {
  try {
    const probationTrainingPeriod = template.find(
      (ele) => ele?.identifier == 'probationTrainingPeriod',
    );
    probationTrainingPeriod['data'] = clauses?.probationTrainingPeriod || null;

    const teams = template
      .filter((ele) => ele?.identifier == 'employees')
      .map((ele) => {
        return {
          ...ele,
          data: findCurrentEmployees(ele?.value, clauses?.employees || []),
        };
      });

    return [probationTrainingPeriod, ...teams];
  } catch (error) {
    return Promise.reject(error);
  }
};

const distFashionAndHomeFormat = (budgetsDeps, clauses, template) => {
  try {
    const probationTrainingPeriod = template.find(
      (ele) => ele?.identifier == 'probationTrainingPeriod',
    );
    probationTrainingPeriod['data'] = clauses?.probationTrainingPeriod || null;

    const teams = template
      .filter((ele) => ele?.identifier == 'employees')
      .map((ele) => {
        return {
          ...ele,
          data: findCurrentEmployees(ele?.value, clauses?.employees || []),
        };
      });

    const storeManagerDepartmentStore = budgetsDeps.map((ele) => {
      return {
        label: ele._id,
        type: 'multi-select',
        data: findStoreMgrDeptFashionHome(
          ele._id,
          clauses?.storeMgrDeptFashionHome || [],
        ),
        value: ele._id,
        options: null,
        optionsType: 'employees',
        identifier: 'storeManagerDepartmentStore',
      };
    });

    return [probationTrainingPeriod, ...teams, ...storeManagerDepartmentStore];
  } catch (error) {
    return Promise.reject(error);
  }
};

const DistHomeFormat = (clauses, template) => {
  try {
    const probationTrainingPeriod = template.find(
      (ele) => ele?.identifier == 'probationTrainingPeriod',
    );
    probationTrainingPeriod['data'] = clauses?.probationTrainingPeriod || null;

    const teams = template
      .filter((ele) => ele?.identifier == 'employees')
      .map((ele) => {
        return {
          ...ele,
          data: findCurrentEmployees(ele?.value, clauses?.employees || []),
        };
      });

    const customerName = template
      .filter((ele) => ele?.identifier == 'customerName')
      .map((ele) => {
        return { ...ele, data: clauses?.customerName || [] };
      });

    return [probationTrainingPeriod, ...teams, ...customerName];
  } catch (error) {
    return Promise.reject(error);
  }
};
const RetailPerfumeryAndBeautyFormat = (clauses, template) => {
  try {
    const probationTrainingPeriod = template.find(
      (ele) => ele?.identifier == 'probationTrainingPeriod',
    );
    probationTrainingPeriod['data'] = clauses?.probationTrainingPeriod || null;

    const teams = template
      .filter((ele) => ele?.identifier == 'employees')
      .map((ele) => {
        return {
          ...ele,
          data: findCurrentEmployees(ele?.value, clauses?.employees || []),
        };
      });

    return [probationTrainingPeriod, ...teams];
  } catch (error) {
    return Promise.reject(error);
  }
};

const DistPerfumeryAndBeautyFormat = (clauses, template) => {
  try {
    const probationTrainingPeriod = template.find(
      (ele) => ele?.identifier == 'probationTrainingPeriod',
    );
    probationTrainingPeriod['data'] = clauses?.probationTrainingPeriod || null;
    // console.log("template: ", template)
    const teams = template
      .filter((ele) => ele?.identifier == 'employees')
      .map((ele) => {
        return {
          ...ele,
          data: findCurrentEmployees(ele?.value, clauses?.employees || []),
        };
      });
    return [probationTrainingPeriod, ...teams];
  } catch (error) {
    return Promise.reject(error);
  }
};

const addClausesFormat = (data) => {
  try {
    const result = {
      probationTrainingPeriod: null,
      employees: [],
      backOffice: [],
      storeManagerDepartmentStore: [],
      customerName: [],
    };
    data.map((ele) => {
      if (ele?.identifier == 'probationTrainingPeriod') {
        result.probationTrainingPeriod = ele?.data;
      } else if (ele?.identifier == 'employees') {
        result.employees.push({
          position: ele?.value,
          selectedEmp: ele?.data || [],
        });
      } else if (ele?.identifier == 'backOffice') {
        result.backOffice.push({
          backOfficeDeptGroup: ele?.value,
          deptGroup: ele?.data || [],
        });
      } else if (ele?.identifier == 'storeManagerDepartmentStore') {
        result.storeManagerDepartmentStore.push({
          budgetCode: ele?.value,
          selectedEmp: ele?.data || [],
        });
      } else if (ele?.identifier == 'customerName') {
        result.customerName = ele?.data || [];
      }
    });

    return { ...result };
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  distPhotoFormat,
  distFMCGFormat,
  distFashionAndHomeFormat,
  addClausesFormat,
  DistHomeFormat,
  RetailPerfumeryAndBeautyFormat,
  DistPerfumeryAndBeautyFormat
};

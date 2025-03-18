const BACK_OFFICE_REGEX = /(?=.*back)(?=.*office)/i;
const TEAM_CANON = /(?=.*team)(?=.*canon)/i;
const TEAM_NIKON = /(?=.*team)(?=.*nikon)/i;
const SALES_REPRESENTATIVE = /(?=.*sales) (?=.*representative)/i;
const SENIOR_SALES_REPRESENTATIVE =
  /(?=.*senior)(?=.*sales)(?=.*representative)/i;
const TECH_SUPPORT = /(?=.*tech)(?=.*support)/i;
const ENERGIZER_MERCHANDISER = /(?=.*energizer)|(?=.*merchandiser)/i;
const MERCHANDISER = /(?=.*merchandiser)/i;
const TEAM_C_ENERGIZER = /(?=.*team)(?=.*c)(?=.*energizer)/i;
const INSTITUTIONAL = /(?=.*institutional)/i;
const DEPT_INST = /(?=.*inst)/i;
const VAN_SALES = /(?=.*van)(?=.*sales)/i;
const MANAGER_CANON = /(?=.*manager)(?=.*canon)/i;
const BACK_OFFICE_CANON = /(?=.*back)(?=.*office)(?=.*canon)/i;
const MANAGER_ENERGIZER = /(?=.*manager)(?=.*energizer)/i;
const BACK_OFFICE_ENERGIZER = /(?=.*back)(?=.*office)(?=.*energizer)/i;
const VAN_SALES_LOCATION_CODE = /PH-V\d+$/i;
const WORKSHOP = /(?=.*workshop)/i;
const TEAM_ENERGIZER = /(?=.*TEAM)(?=.*ENERGIZER)/i;

const RETAIL_PERFUMERY_POSITIONS_REGEX = {
  STORE_MANAGER: /store manager/i,
  STORE_SUPERVISOR: /store supervisor|sales supervisor/i,
  CASHIER: /cashier/i,
  RETAIL_GENERAL_FRAGRANCE: /beauty advisor|Retail General Fragrance/i,
};

const DIST_PERFUMERY_POSITIONS_REGEX = {
  BEAUTY_ADVISOR: /beauty advisor/i,
  FRAGRANCE_ADVISOR: /fragrance advisor/i,
  FREELANCE_PROMOTER: /freelance promoter/i,
  MAKE_UP_EXPERT: /make up expert/i,
  SKINCARE_EXPERT: /skincare exper/i,
  FRAGRANCE_EXPERT: /fragrance expert/i,
  SALES_AND_MARKETING_SUPERVISOR: /sales and marketing supervisor/i,
  BRAND_MANAGER: /brand manager/i,
  BACK_OFFICE: /back office/i,
  FREELANCE: /freelance/i,
};

module.exports = {
  BACK_OFFICE_REGEX,
  TEAM_CANON,
  TEAM_NIKON,
  SALES_REPRESENTATIVE,
  SENIOR_SALES_REPRESENTATIVE,
  TECH_SUPPORT,
  ENERGIZER_MERCHANDISER,
  MERCHANDISER,
  TEAM_C_ENERGIZER,
  INSTITUTIONAL,
  DEPT_INST,
  VAN_SALES,
  MANAGER_CANON,
  BACK_OFFICE_CANON,
  MANAGER_ENERGIZER,
  BACK_OFFICE_ENERGIZER,
  VAN_SALES_LOCATION_CODE,
  WORKSHOP,
  TEAM_ENERGIZER,
  RETAIL_PERFUMERY_POSITIONS_REGEX,
  DIST_PERFUMERY_POSITIONS_REGEX
};

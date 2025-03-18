const { TOP_NOTES_STORES, DIST_PERFUMERY_POSITIONS } = require('@enums/sector.enum');
const { getNumberOfDays } = require('@utils/date');
const {
  StoreManager: StoreManagerJson,
  StoreSupervisor: StoreSupervisorJson,
  Minimum: MinimumJson,
  Cashier: CashierJson,
  RetailGeFr: RetailGeFrJson,
} = require('@json/metadata.json')['RetailPerfumery'];

const { RETAIL_PERFUMERY_POSITIONS } = require('@enums/sector.enum');

const findKey = (value) => {
  if (value >= 95 && value < 120) {
    return '95';
  } else if (value >= 120) {
    return '120';
  } else {
    return undefined;
  }
};

const findMinimumJson = (position) => {
  if (RETAIL_PERFUMERY_POSITIONS.STORE_MANAGER == position)
    return MinimumJson.StoreManager;
  else if (RETAIL_PERFUMERY_POSITIONS.STORE_SUPERVISOR == position)
    return MinimumJson.StoreSupervisor;
  else if (RETAIL_PERFUMERY_POSITIONS.CASHIER == position)
    return MinimumJson.Cashier;
  else if (RETAIL_PERFUMERY_POSITIONS.RETAIL_GENERAL_FRAGRANCE == position)
    return MinimumJson.RetailGeFr;
  else if (DIST_PERFUMERY_POSITIONS.BEAUTY_ADVISOR == position)
    return MinimumJsonDist.BeautyAdvisor;
  else if (DIST_PERFUMERY_POSITIONS.FRAGRANCE_ADVISOR == position)
    return MinimumJsonDist.FragranceAdvisor;
  else if (DIST_PERFUMERY_POSITIONS.FREELANCE_PROMOTER == position)
    return MinimumJsonDist.FreelancePromoter;
  else if (DIST_PERFUMERY_POSITIONS.MAKE_UP_EXPERT == position)
    return MinimumJsonDist.MakeUpExpert;
  else if (DIST_PERFUMERY_POSITIONS.SKINCARE_EXPERT == position)
    return MinimumJsonDist.SkincareExpert;
  else if (DIST_PERFUMERY_POSITIONS.FRAGRANCE_EXPERT == position)
    return MinimumJsonDist.FragranceExpert;
  else if (DIST_PERFUMERY_POSITIONS.SALES_AND_MARKETING_SUPERVISOR == position)
    return MinimumJsonDist.SalesAndMarketingSupervisor;
  else if (DIST_PERFUMERY_POSITIONS.BRAND_MANAGER == position)
    return MinimumJsonDist.BrandManager;
  else if (DIST_PERFUMERY_POSITIONS.BACK_OFFICE == position)
    return MinimumJsonDist.BackOffice;
  else if (DIST_PERFUMERY_POSITIONS.FREELANCE == position)
    return MinimumJsonDist.Freelance;

};


module.exports = {
  findKey,
  findMinimumJson,
};

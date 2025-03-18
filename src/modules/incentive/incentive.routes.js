const router = require('express').Router();
const auth = require('@middlewares/auth');
const IncentiveControllers = require('./incentive.controllers');
const ClausesControllers = require('@modules/clauses/clauses.controllers');
const { SECTOR_ENUM } = require('@enums/sector.enum');

router.post(
  '/calculate/dist-photo',
  auth,
  ClausesControllers.probationTrainingPeriodVerification(
    SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
  ),
  IncentiveControllers.calculateDistPhoto,
);

router.post(
  '/calculate/retail-photo',
  auth,
  IncentiveControllers.calculateRetailPhoto,
);

router.post(
  '/calculate/fmcg',
  auth,
  ClausesControllers.probationTrainingPeriodVerification(
    SECTOR_ENUM.DISTRIBUTION_RETAIL_PHOTOGRAPHY,
  ),
  IncentiveControllers.calculateFMCG,
);

router.get('/', auth ,IncentiveControllers.getIncentive);
router.get('/get-months', auth ,IncentiveControllers.getMonths);
router.get('/get-years', auth ,IncentiveControllers.getYears);
router.get('/download-incentives', auth ,IncentiveControllers.downloadIncentive);
router.get(
  '/institutional',
  auth,
  IncentiveControllers.getInstitutionalIncentive,
);
router.post(
  '/institutional',
  auth,
  IncentiveControllers.addInstitutionalIncentive,
);

router.post(
  '/calculate/fashion&home',
  auth,
  ClausesControllers.probationTrainingPeriodVerification(
    SECTOR_ENUM.RETAIL_FASHION_AND_HOME,
  ),
  IncentiveControllers.calculateRetailFashionAndHome,
);
router.post(
  '/calculate/dist-home',
  auth,
  ClausesControllers.probationTrainingPeriodVerification(
    SECTOR_ENUM.DISTRIBUTION_HOME,
  ),
  IncentiveControllers.calculateDistHome,
);

router.post(
  '/calculate/retail-perfumery',
  auth,
  ClausesControllers.probationTrainingPeriodVerification(
    SECTOR_ENUM.RETAIL_PERFUMERY,
  ),
  IncentiveControllers.calculateRetailPerfumeryAndBeauty,
);

router.post(
  '/calculate/dist-perfumery',
  auth,
  ClausesControllers.probationTrainingPeriodVerification(
    SECTOR_ENUM.DISTRIBUTION_PERFUMERY,
  ),
  IncentiveControllers.calculateDistPerfumeryAndBeauty,
);

module.exports = router;

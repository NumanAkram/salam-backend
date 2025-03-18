const router = require('express').Router();
const auth = require('@middlewares/auth');
const DistPhotographyControllers = require('./DistPhotography.controllers');
const { uploadInstance } = require('@utils/multer');

router.post(
  '/add-data/workshop',
  auth,
  uploadInstance.single('workshop'),
  DistPhotographyControllers.addWorkshopData,
);

router.post(
  '/add-data/promoter',
  auth,
  uploadInstance.single('promoter'),
  DistPhotographyControllers.addPromoterData,
);

module.exports = router;

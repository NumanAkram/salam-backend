const router = require('express').Router();
const auth = require('@middlewares/auth');
const RetailPhotoMetadataControllers = require('./RetailPhotoMetadata.controllers');
const { uploadInstance } = require('@utils/multer');

router.post(
  '/add-data',
  auth,
  uploadInstance.single('metadata'),
  RetailPhotoMetadataControllers.addMetaData,
);

router.get('/get-employees', auth, RetailPhotoMetadataControllers.getEmployees);

module.exports = router;

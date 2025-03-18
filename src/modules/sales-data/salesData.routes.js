const router = require('express').Router();
const SalesDataControllers = require('./salesData.controllers');
const auth = require('@middlewares/auth');
const { uploadInstance } = require('@utils/multer');

router.post(
  '/add-data',
  auth,
  uploadInstance.single('sales'),
  SalesDataControllers.addSales,
);

router.get('/get-data', auth, SalesDataControllers.getSales);

router.put('/update-row', auth, SalesDataControllers.updateSale);

router.post('/add-row', auth, SalesDataControllers.addRow);

router.delete('/delete-row', auth, SalesDataControllers.removeRow);

router.get('/last-update', auth, SalesDataControllers.getLastUpdate);

module.exports = router;

const router = require('express').Router();
const BudgetControllers = require('./budget.controllers');
const auth = require('@middlewares/auth');
const { uploadInstance } = require('@utils/multer');

router.post(
  '/add-data',
  auth,
  uploadInstance.single('budget'),
  BudgetControllers.addBudget,
);

router.get('/get-data', auth, BudgetControllers.getBudget);

router.put('/update-row', auth, BudgetControllers.updateBudget);

router.post('/add-row', auth, BudgetControllers.addRow);

router.delete('/delete-row', auth, BudgetControllers.removeRow);

router.get('/sectors', auth, BudgetControllers.getSector);

module.exports = router;

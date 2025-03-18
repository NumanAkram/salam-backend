const router = require('express').Router();
const auth = require('@middlewares/auth');
const EmployeesControllers = require('./employees.controllers');
const { uploadInstance } = require('@utils/multer');

router.post(
  '/add-data',
  auth,
  uploadInstance.single('employees'),
  EmployeesControllers.addEmployees,
);

router.get('/get-data', auth, EmployeesControllers.getEmployees);

router.put('/update-row', auth, EmployeesControllers.updateEmployee);

router.post('/add-row', auth, EmployeesControllers.addRow);

router.delete('/delete-row', auth, EmployeesControllers.removeRow);

router.get('/last-update', auth, EmployeesControllers.getLastUpdate);

router.get('/getEmp', auth, EmployeesControllers.selectByEmpNo);

module.exports = router;

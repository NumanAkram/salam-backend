const router = require('express').Router();
const StatusController = require('./status.controller');

router.get('/', StatusController.appStatus);

module.exports = router;

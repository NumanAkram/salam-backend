const router = require('express').Router();
const ClausesControllers = require('./clauses.controllers');
const auth = require('@middlewares/auth');

router.get('/', auth, ClausesControllers.getClausesJson);
router.post('/add', auth, ClausesControllers.addClauses);

module.exports = router;

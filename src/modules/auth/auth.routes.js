const router = require('express').Router();
const AuthControllers = require('./auth.controllers');
const auth = require('@middlewares/auth');

router.post('/login', AuthControllers.login);
router.post('/update-password', auth, AuthControllers.updatePassword);
router.post('/forgot-password', AuthControllers.forgotPassword);
router.post('/otp-verification', AuthControllers.verifyOTP);
router.post('/reset-password', auth, AuthControllers.resetPassword);

module.exports = router;

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/helpers');
const authController = require('../controllers/common/authController');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/verify-otp', asyncHandler(authController.verifyOtp));
router.post('/resend-otp', asyncHandler(authController.resendOtp));
router.post('/social-login', asyncHandler(authController.socialLogin));
router.get('/me', authMiddleware, asyncHandler(authController.me));

module.exports = router;

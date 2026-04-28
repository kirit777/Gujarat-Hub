const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { asyncHandler } = require('../utils/helpers');
const admin = require('../controllers/admin/adminController');

const router = express.Router();

router.post('/login', asyncHandler(admin.login));

router.use(authMiddleware, adminMiddleware);

router.get('/me', asyncHandler(admin.me));
router.get('/dashboard', asyncHandler(admin.dashboard));
router.get('/stats', asyncHandler(admin.stats));

router.get('/users', asyncHandler(admin.users));
router.get('/user/:id', asyncHandler(admin.userById));
router.put('/user/block/:id', asyncHandler(admin.blockUser));
router.put('/user/unblock/:id', asyncHandler(admin.unblockUser));
router.delete('/user/delete/:id', asyncHandler(admin.deleteUser));
router.put('/user/verify/:id', asyncHandler(admin.verifyUser));

router.get('/reports', asyncHandler(admin.reports));
router.delete('/report/:id', asyncHandler(admin.deleteReport));

router.post('/plan/create', asyncHandler(admin.createPlan));
router.put('/plan/update/:id', asyncHandler(admin.updatePlan));
router.delete('/plan/delete/:id', asyncHandler(admin.deletePlan));
router.get('/plans', asyncHandler(admin.plans));

router.get('/payments', asyncHandler(admin.payments));
router.get('/revenue', asyncHandler(admin.revenue));

router.post('/send-notification-all', asyncHandler(admin.notifyAll));
router.post('/send-notification-user/:id', asyncHandler(admin.notifyOne));

router.get('/settings', asyncHandler(admin.getSettings));
router.put('/settings', asyncHandler(admin.updateSettings));

module.exports = router;

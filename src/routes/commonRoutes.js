const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { asyncHandler } = require('../utils/helpers');
const chat = require('../controllers/common/chatController');
const notification = require('../controllers/common/notificationController');
const subscription = require('../controllers/common/subscriptionController');

const router = express.Router();

router.get('/chat/list', authMiddleware, asyncHandler(chat.chatList));
router.get('/chat/messages/:userId', authMiddleware, asyncHandler(chat.messagesWithUser));
router.post('/chat/send', authMiddleware, asyncHandler(chat.sendMessage));
router.post('/chat/send-image', authMiddleware, upload.single('image'), asyncHandler(chat.sendImageMessage));
router.put('/chat/seen/:chatId', authMiddleware, asyncHandler(chat.markSeen));
router.delete('/chat/delete/:chatId', authMiddleware, asyncHandler(chat.deleteChat));

router.get('/notification/list', authMiddleware, asyncHandler(notification.listNotifications));
router.put('/notification/read/:id', authMiddleware, asyncHandler(notification.markRead));
router.put('/notification/read-all', authMiddleware, asyncHandler(notification.markAllRead));
router.delete('/notification/delete/:id', authMiddleware, asyncHandler(notification.deleteNotification));

router.get('/subscription/plans', authMiddleware, asyncHandler(subscription.listPlans));
router.post('/subscription/buy', authMiddleware, asyncHandler(subscription.buyPlan));
router.get('/subscription/history', authMiddleware, asyncHandler(subscription.history));

module.exports = router;

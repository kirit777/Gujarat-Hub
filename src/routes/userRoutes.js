const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { asyncHandler } = require('../utils/helpers');
const profile = require('../controllers/user/profileController');
const discovery = require('../controllers/user/discoveryController');
const interaction = require('../controllers/user/interactionController');
const safety = require('../controllers/user/safetyController');

const router = express.Router();
router.use(authMiddleware);

router.get('/profile', asyncHandler(profile.getProfile));
router.put('/profile', asyncHandler(profile.updateProfile));
router.post('/upload-photo', upload.single('image'), asyncHandler(profile.uploadPhoto));
router.delete('/photo/:id', asyncHandler(profile.deletePhoto));
router.get('/photos', asyncHandler(profile.getPhotos));
router.put('/location', asyncHandler(profile.updateLocation));
router.put('/device-token', asyncHandler(profile.updateDeviceToken));

router.get('/recommended-users', asyncHandler(discovery.recommendedUsers));
router.get('/nearby-users', asyncHandler(discovery.nearbyUsers));
router.get('/search', asyncHandler(discovery.searchUsers));
router.get('/filter', asyncHandler(discovery.filterUsers));

router.post('/like', asyncHandler(interaction.like));
router.post('/dislike', asyncHandler(interaction.dislike));
router.post('/super-like', asyncHandler(interaction.superLike));
router.get('/likes-received', asyncHandler(interaction.likesReceived));
router.get('/likes-sent', asyncHandler(interaction.likesSent));
router.get('/matches', asyncHandler(interaction.matches));
router.delete('/unmatch/:id', asyncHandler(interaction.unmatch));

router.post('/report', asyncHandler(safety.reportUser));
router.post('/block', asyncHandler(safety.blockUser));
router.delete('/unblock/:id', asyncHandler(safety.unblockUser));
router.get('/blocked-users', asyncHandler(safety.blockedUsers));

module.exports = router;

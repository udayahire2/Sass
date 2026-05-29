const express = require('express');
const {
    register,
    login,
    verifyOtp,
    getMe,
    getFacultyProfile,
    logout,
    refreshSession,
    updateAvatar,
    updateDetails,
    updatePreferences,
} = require('../controllers/authController');
const { loadAuthenticatedUser } = require('../middlewares/authMiddleware');
const { createRateLimiter } = require('../middlewares/rateLimit');
const { validate } = require('../middlewares/validate');
const { loginSchema, registerSchema, updateProfileSchema, verifyOtpSchema } = require('../validation/schemas');

const router = express.Router();

const authWriteLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Please try again later.',
    keyPrefix: 'auth-write',
});

const refreshLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: 'Too many session refresh attempts. Please try again later.',
    keyPrefix: 'auth-refresh',
});

router.post('/register', authWriteLimiter, validate(registerSchema), register);
router.post('/login', authWriteLimiter, validate(loginSchema), login);
router.post('/verify-otp', authWriteLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/refresh', refreshLimiter, refreshSession);
router.post('/logout', logout);
router.get('/me', loadAuthenticatedUser, getMe);
router.put('/updatedetails', loadAuthenticatedUser, validate(updateProfileSchema), updateDetails);
router.put('/updateavatar', loadAuthenticatedUser, updateAvatar);
router.patch('/preferences', loadAuthenticatedUser, updatePreferences);
router.get('/faculty/profile', loadAuthenticatedUser, getFacultyProfile);

module.exports = router;

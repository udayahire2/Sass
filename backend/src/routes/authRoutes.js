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
} = require('../controllers/authController');
const { loadAuthenticatedUser } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { loginSchema, registerSchema, updateProfileSchema, verifyOtpSchema } = require('../validation/schemas');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/refresh', refreshSession);
router.post('/logout', logout);
router.get('/me', loadAuthenticatedUser, getMe);
router.put('/updatedetails', loadAuthenticatedUser, validate(updateProfileSchema), updateDetails);
router.put('/updateavatar', loadAuthenticatedUser, updateAvatar);
router.get('/faculty/profile', loadAuthenticatedUser, getFacultyProfile);

module.exports = router;

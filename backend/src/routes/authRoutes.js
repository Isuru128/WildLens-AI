const express = require('express');

const router = express.Router();

const {
    register,
    login,
    me,
    updateMe,
    changePassword,
    googleLogin,
    appleLogin
} = require('../controllers/authController');

const {
    auth
} = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/apple', appleLogin);
router.get('/me', auth, me);
router.put('/me', auth, updateMe);
router.put('/change-password', auth, changePassword);

module.exports = router;
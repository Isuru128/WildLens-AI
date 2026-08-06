const express = require('express');
const router = express.Router();

const { auth, adminOnly } = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/adminController');

router.get('/stats', auth, adminOnly, getStats);

module.exports = router;

const jwt = require('jsonwebtoken');

// VERIFY TOKEN
exports.auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                msg: 'Access denied. No token provided'
            });
        }

        /*
         * Supports both:
         *
         * Authorization: Bearer token
         *
         * and:
         *
         * Authorization: token
         */
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7).trim()
            : authHeader.trim();

        if (!token) {
            return res.status(401).json({
                msg: 'Access denied. No token provided'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');

            return res.status(500).json({
                msg: 'Server authentication configuration error'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                msg: 'Token has expired. Please log in again'
            });
        }

        return res.status(401).json({
            msg: 'Invalid token'
        });
    }
};

// ADMIN-ONLY ACCESS
exports.adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            msg: 'User not authenticated'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            msg: 'Admin access required'
        });
    }

    next();
};
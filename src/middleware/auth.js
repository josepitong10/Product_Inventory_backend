
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        const [rows] = await pool.execute(
            `SELECT id, fullname, email
             FROM users
             WHERE id = ?`,
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // This is the trusted logged-in user.
        // Controllers/models should use req.user.id.
        req.user = rows[0];

        next();

    } catch (error) {
        console.error('Authentication error:', error.message);

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = {
    authenticate
};

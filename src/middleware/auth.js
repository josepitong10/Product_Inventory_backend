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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [rows] = await pool.execute(
            'SELECT id, fullname, email FROM users WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = { authenticate };
const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthController {
    static async register(req, res) {
        try {
            const { fullname, email, password } = req.body;

            if (!fullname || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            const userId = await User.create({ fullname, email, password });
            const user = await User.findById(userId);

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: { user, token }
            });
        } catch (error) {
    console.error('REGISTER ERROR:', error);

    res.status(500).json({
        success: false,
        message: 'Unable to register user'
    });
}
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const user = await User.validatePassword(email, password);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.json({
                success: true,
                message: 'Login successful',
                data: { user, token }
            });
        } catch (error) {
    console.error('LOGIN ERROR:', error);

    res.status(500).json({
        success: false,
        message: 'Unable to login'
    });
}
    }

    static async me(req, res) {
        try {
            const user = await User.findById(req.user.id);
            res.json({
                success: true,
                data: { user }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to get user information'
            });
        }
    }
}

module.exports = AuthController;
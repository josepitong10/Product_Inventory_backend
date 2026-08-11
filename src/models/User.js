const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { fullname, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
            [fullname, email, hashedPassword]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, fullname, email, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    static async validatePassword(email, password) {
        const user = await this.findByEmail(email);
        if (!user) return null;
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        
        return user;
    }
}

module.exports = User;
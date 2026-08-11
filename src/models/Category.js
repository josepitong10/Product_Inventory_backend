const { pool } = require('../config/database');

class Category {
    static async getAll() {
        const [rows] = await pool.execute('SELECT * FROM categories ORDER BY category_name');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async create(categoryData) {
        const { category_name, description } = categoryData;
        const [result] = await pool.execute(
            'INSERT INTO categories (category_name, description) VALUES (?, ?)',
            [category_name, description]
        );
        return result.insertId;
    }
}

module.exports = Category;
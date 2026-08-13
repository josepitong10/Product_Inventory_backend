const { pool } = require('../config/database');

class Category {

    // ============================================
    // GET ONLY LOGGED-IN USER'S CATEGORIES
    // ============================================
    static async getAll(userId) {

        const [rows] = await pool.execute(
            `SELECT *
             FROM categories
             WHERE created_by = ?
             ORDER BY category_name`,
            [userId]
        );

        return rows;
    }


    // ============================================
    // GET ONE CATEGORY ONLY IF USER OWNS IT
    // ============================================
    static async getById(id, userId) {

        const [rows] = await pool.execute(
            `SELECT *
             FROM categories
             WHERE id = ?
               AND created_by = ?`,
            [id, userId]
        );

        return rows[0] || null;
    }


    // ============================================
    // CREATE CATEGORY FOR LOGGED-IN USER
    // ============================================
    static async create(categoryData) {

        const {
            category_name,
            description,
            created_by
        } = categoryData;

        const [result] = await pool.execute(
            `INSERT INTO categories
                (
                    category_name,
                    description,
                    created_by
                )
             VALUES (?, ?, ?)`,
            [
                category_name,
                description || null,
                created_by
            ]
        );

        return result.insertId;
    }

    static async findOrCreate(categoryName, userId) {
    const [rows] = await pool.execute(
        `SELECT id
         FROM categories
         WHERE category_name = ?
           AND created_by = ?`,
        [categoryName, userId]
    );

    if (rows.length > 0) {
        return rows[0].id;
    }

    const [result] = await pool.execute(
        `INSERT INTO categories
            (category_name, description, created_by)
         VALUES (?, ?, ?)`,
        [categoryName, null, userId]
    );

    return result.insertId;
}
}

module.exports = Category;

const { pool } = require('../config/database');

class Product {

    // ============================================
    // GET ONLY PRODUCTS BELONGING TO USER
    // ============================================

    static async getAll(userId) {

        const [rows] = await pool.execute(`
            SELECT 
                p.*,
                c.category_name,
                s.supplier_name,
                u.fullname AS created_by_name
            FROM products p
            JOIN categories c
                ON p.category_id = c.id
            JOIN suppliers s
                ON p.supplier_id = s.id
            JOIN users u
                ON p.created_by = u.id
            WHERE p.created_by = ?
            ORDER BY p.id DESC
        `, [userId]);

        return rows;
    }


    // ============================================
    // GET ONE PRODUCT ONLY IF USER OWNS IT
    // ============================================

    static async getById(id, userId) {

        const [rows] = await pool.execute(`
            SELECT 
                p.*,
                c.category_name,
                s.supplier_name,
                u.fullname AS created_by_name
            FROM products p
            JOIN categories c
                ON p.category_id = c.id
            JOIN suppliers s
                ON p.supplier_id = s.id
            JOIN users u
                ON p.created_by = u.id
            WHERE p.id = ?
              AND p.created_by = ?
        `, [id, userId]);

        return rows[0] || null;
    }


    // ============================================
    // CREATE PRODUCT
    // ============================================

    static async create(productData) {

    const {
        product_name,
        category_id,
        supplier_id,
        price,
        quantity,
        minimum_stock,
        description,
        created_by
    } = productData;

    // ============================================
    // CHECK CATEGORY OWNERSHIP
    // ============================================

    const [categoryRows] = await pool.execute(
        `SELECT id
         FROM categories
         WHERE id = ?
           AND created_by = ?`,
        [category_id, created_by]
    );

    if (categoryRows.length === 0) {
        const error = new Error(
            'Category does not belong to the logged-in user'
        );

        error.statusCode = 403;

        throw error;
    }


    // ============================================
    // CHECK SUPPLIER OWNERSHIP
    // ============================================

    const [supplierRows] = await pool.execute(
        `SELECT id
         FROM suppliers
         WHERE id = ?
           AND created_by = ?`,
        [supplier_id, created_by]
    );

    if (supplierRows.length === 0) {
        const error = new Error(
            'Supplier does not belong to the logged-in user'
        );

        error.statusCode = 403;

        throw error;
    }


    // ============================================
    // CREATE PRODUCT
    // ============================================

    const [result] = await pool.execute(`
        INSERT INTO products
        (
            product_name,
            category_id,
            supplier_id,
            price,
            quantity,
            minimum_stock,
            description,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        product_name,
        category_id,
        supplier_id,
        price,
        quantity || 0,
        minimum_stock || 5,
        description,
        created_by
    ]);

    return result.insertId;
}


    // ============================================
    // UPDATE ONLY USER'S PRODUCT
    // ============================================

    static async update(id, updateData, userId) {

        const fields = [];
        const params = [];

        const allowedFields = [
            'product_name',
            'category_id',
            'supplier_id',
            'price',
            'quantity',
            'minimum_stock',
            'description'
        ];

        for (const field of allowedFields) {

            if (updateData[field] !== undefined) {
                fields.push(`${field} = ?`);
                params.push(updateData[field]);
            }
        }

        if (fields.length === 0) {
            return false;
        }

        params.push(id);
        params.push(userId);

        const [result] = await pool.execute(
            `UPDATE products
             SET ${fields.join(', ')}
             WHERE id = ?
               AND created_by = ?`,
            params
        );

        return result.affectedRows > 0;
    }


    // ============================================
    // DELETE ONLY USER'S PRODUCT
    // ============================================

    static async delete(id, userId) {

        const [result] = await pool.execute(
            `DELETE FROM products
             WHERE id = ?
               AND created_by = ?`,
            [id, userId]
        );

        return result.affectedRows > 0;
    }


    // ============================================
    // LOW STOCK - ONLY USER'S PRODUCTS
    // ============================================

    static async getLowStock(userId) {

        const [rows] = await pool.execute(`
            SELECT
                p.id,
                p.product_name,
                p.quantity,
                p.minimum_stock,
                c.category_name,
                s.supplier_name,
                (p.minimum_stock - p.quantity)
                    AS shortage_quantity,
                CASE
                    WHEN p.quantity = 0
                        THEN 'Out of Stock'
                    WHEN p.quantity <= p.minimum_stock
                        THEN 'Low Stock'
                    ELSE 'In Stock'
                END AS stock_status
            FROM products p
            JOIN categories c
                ON p.category_id = c.id
            JOIN suppliers s
                ON p.supplier_id = s.id
            WHERE p.created_by = ?
              AND p.quantity <= p.minimum_stock
            ORDER BY shortage_quantity DESC
        `, [userId]);

        return rows;
    }


    // ============================================
    // SUMMARY - ONLY USER'S PRODUCTS
    // ============================================

    static async getSummary(userId) {

        const [rows] = await pool.execute(`
            SELECT
                p.id,
                p.product_name,
                p.quantity AS current_stock,
                p.minimum_stock,
                p.price,
                (p.price * p.quantity) AS stock_value,
                c.category_name,
                s.supplier_name,
                CASE
                    WHEN p.quantity = 0
                        THEN 'Out of Stock'
                    WHEN p.quantity <= p.minimum_stock
                        THEN 'Low Stock'
                    ELSE 'In Stock'
                END AS stock_status
            FROM products p
            JOIN categories c
                ON p.category_id = c.id
            JOIN suppliers s
                ON p.supplier_id = s.id
            WHERE p.created_by = ?
            ORDER BY p.id DESC
        `, [userId]);

        return rows;
    }
}

module.exports = Product;

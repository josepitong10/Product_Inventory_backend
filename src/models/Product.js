const { pool } = require('../config/database');

class Product {
    static async getAll() {
        const [rows] = await pool.execute(`
            SELECT 
                p.*,
                c.category_name,
                s.supplier_name,
                u.fullname as created_by_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            JOIN suppliers s ON p.supplier_id = s.id
            JOIN users u ON p.created_by = u.id
            ORDER BY p.id DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute(`
            SELECT 
                p.*,
                c.category_name,
                s.supplier_name,
                u.fullname as created_by_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            JOIN suppliers s ON p.supplier_id = s.id
            JOIN users u ON p.created_by = u.id
            WHERE p.id = ?
        `, [id]);
        return rows[0] || null;
    }

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

        const [result] = await pool.execute(`
            INSERT INTO products 
            (product_name, category_id, supplier_id, price, quantity, minimum_stock, description, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [product_name, category_id, supplier_id, price, quantity || 0, minimum_stock || 5, description, created_by]);

        return result.insertId;
    }

    static async update(id, updateData) {
        const fields = [];
        const params = [];
        const allowedFields = ['product_name', 'category_id', 'supplier_id', 'price', 'quantity', 'minimum_stock', 'description'];
        
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                fields.push(`${field} = ?`);
                params.push(updateData[field]);
            }
        }

        if (fields.length === 0) return false;

        params.push(id);
        const [result] = await pool.execute(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getLowStock() {
        const [rows] = await pool.execute('SELECT * FROM low_stock_alert');
        return rows;
    }

    static async getSummary() {
        const [rows] = await pool.execute('SELECT * FROM inventory_summary');
        return rows;
    }
}

module.exports = Product;
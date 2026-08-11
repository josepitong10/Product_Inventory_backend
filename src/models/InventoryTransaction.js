const { pool } = require('../config/database');

class InventoryTransaction {
    static async create(transactionData) {
        const {
            product_id,
            user_id,
            transaction_type,
            quantity,
            previous_quantity,
            new_quantity,
            notes
        } = transactionData;

        const [result] = await pool.execute(`
            INSERT INTO inventory_transactions 
            (product_id, user_id, transaction_type, quantity, previous_quantity, new_quantity, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [product_id, user_id, transaction_type, quantity, previous_quantity, new_quantity, notes]);

        return result.insertId;
    }

    static async getHistory(product_id = null, limit = 100) {
        let sql = 'SELECT * FROM transaction_summary';
        const params = [];

        if (product_id) {
            sql += ' WHERE product_id = ?';
            params.push(product_id);
        }

        sql += ' LIMIT ?';
        params.push(limit);

        const [rows] = await pool.execute(sql, params);
        return rows;
    }
}

module.exports = InventoryTransaction;
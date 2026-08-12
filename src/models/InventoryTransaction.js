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

    static async getHistory(product_id = null, limit = 100, userId) {

    let sql = `
        SELECT
            t.*,
            p.product_name
        FROM inventory_transactions t
        JOIN products p
            ON t.product_id = p.id
        WHERE t.user_id = ?
          AND p.created_by = ?
    `;

    const params = [userId, userId];

    if (product_id) {
        sql += ` AND t.product_id = ?`;
        params.push(product_id);
    }

    sql += ` ORDER BY t.created_at DESC LIMIT ?`;
    params.push(Number(limit));

    const [rows] = await pool.execute(sql, params);

    return rows;
}
}

module.exports = InventoryTransaction;
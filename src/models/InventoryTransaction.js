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

    try {

        let sql = `
            SELECT
                t.id,
                t.product_id,
                t.user_id,
                t.transaction_type,
                t.quantity,
                t.previous_quantity,
                t.new_quantity,
                t.notes,
                t.created_at,
                p.product_name
            FROM inventory_transactions t
            INNER JOIN products p
                ON t.product_id = p.id
            WHERE t.user_id = ?
              AND p.created_by = ?
        `;

        const params = [userId, userId];

        if (product_id) {
            sql += ` AND t.product_id = ?`;
            params.push(Number(product_id));
        }

        // Make sure LIMIT is a safe integer
        const safeLimit = Math.min(
            Math.max(parseInt(limit, 10) || 100, 1),
            500
        );

        sql += ` ORDER BY t.created_at DESC LIMIT ${safeLimit}`;

        console.log('GET HISTORY SQL:', sql);
        console.log('GET HISTORY PARAMS:', params);

        const [rows] = await pool.execute(sql, params);

        return rows;

    } catch (error) {

        console.error('InventoryTransaction.getHistory ERROR:', error);

        throw error;
    }
}
}

module.exports = InventoryTransaction;
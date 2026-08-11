const { pool } = require('../config/database');

class Supplier {
    static async getAll() {
        const [rows] = await pool.execute('SELECT * FROM suppliers ORDER BY supplier_name');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute('SELECT * FROM suppliers WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async create(supplierData) {
        const { supplier_name, contact_person, email, phone, address } = supplierData;
        const [result] = await pool.execute(
            'INSERT INTO suppliers (supplier_name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [supplier_name, contact_person, email, phone, address]
        );
        return result.insertId;
    }
}

module.exports = Supplier;
const { pool } = require('../config/database');

class Supplier {

    // ============================================
    // GET ONLY USER'S SUPPLIERS
    // ============================================
    static async getAll(userId) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM suppliers
             WHERE created_by = ?
             ORDER BY supplier_name`,
            [userId]
        );

        return rows;
    }


    // ============================================
    // GET ONE SUPPLIER ONLY IF USER OWNS IT
    // ============================================
    static async getById(id, userId) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM suppliers
             WHERE id = ?
               AND created_by = ?`,
            [id, userId]
        );

        return rows[0] || null;
    }


    // ============================================
    // CREATE SUPPLIER FOR LOGGED-IN USER
    // ============================================
    static async create(supplierData) {

    const {
        supplier_name,
        contact_person,
        email,
        phone,
        address,
        created_by
    } = supplierData;

    const [result] = await pool.execute(
        `INSERT INTO suppliers
        (
            supplier_name,
            contact_person,
            email,
            phone,
            address,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            supplier_name,
            contact_person || null,
            email || null,
            phone || null,
            address || null,
            created_by
        ]
    );

    return result.insertId;
}

static async findOrCreate(supplierName, userId) {
    const [rows] = await pool.execute(
        `SELECT id
         FROM suppliers
         WHERE supplier_name = ?
           AND created_by = ?`,
        [supplierName, userId]
    );

    if (rows.length > 0) {
        return rows[0].id;
    }

    const [result] = await pool.execute(
        `INSERT INTO suppliers
            (
                supplier_name,
                contact_person,
                email,
                phone,
                address,
                created_by
            )
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            supplierName,
            null,
            null,
            null,
            null,
            userId
        ]
    );

    return result.insertId;
}
}

module.exports = Supplier;
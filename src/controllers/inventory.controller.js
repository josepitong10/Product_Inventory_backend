
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { pool } = require('../config/database');

class InventoryController {

    // =====================================================
    // STOCK IN
    // =====================================================

    static async stockIn(req, res) {
        try {
            const { product_id, quantity, notes } = req.body;

            if (!product_id || !quantity || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID and positive quantity are required'
                });
            }

            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {

                // IMPORTANT:
                // Only find a product belonging to the logged-in user
                const [productRows] = await connection.execute(
                    `SELECT *
                     FROM products
                     WHERE id = ?
                       AND created_by = ?
                     FOR UPDATE`,
                    [product_id, req.user.id]
                );

                if (productRows.length === 0) {
                    await connection.rollback();
                    connection.release();

                    return res.status(404).json({
                        success: false,
                        message: 'Product not found'
                    });
                }

                const product = productRows[0];

                const previousQuantity = product.quantity;
                const newQuantity =
                    previousQuantity + parseInt(quantity);

                // Update only the user's product
                await connection.execute(
                    `UPDATE products
                     SET quantity = ?
                     WHERE id = ?
                       AND created_by = ?`,
                    [
                        newQuantity,
                        product_id,
                        req.user.id
                    ]
                );

                // Record transaction under logged-in user
                await connection.execute(`
                    INSERT INTO inventory_transactions
                    (
                        product_id,
                        user_id,
                        transaction_type,
                        quantity,
                        previous_quantity,
                        new_quantity,
                        notes
                    )
                    VALUES (?, ?, 'IN', ?, ?, ?, ?)
                `, [
                    product_id,
                    req.user.id,
                    quantity,
                    previousQuantity,
                    newQuantity,
                    notes || 'Stock In'
                ]);

                await connection.commit();
                connection.release();

                const updatedProduct =
                    await Product.getById(
                        product_id,
                        req.user.id
                    );

                res.json({
                    success: true,
                    message: 'Stock added successfully',
                    data: updatedProduct
                });

            } catch (error) {

                await connection.rollback();
                connection.release();

                throw error;
            }

        } catch (error) {

            console.error('STOCK IN ERROR:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to add stock'
            });
        }
    }


    // =====================================================
    // STOCK OUT
    // =====================================================

    static async stockOut(req, res) {
        try {
            const { product_id, quantity, notes } = req.body;

            if (!product_id || !quantity || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID and positive quantity are required'
                });
            }

            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {

                // IMPORTANT:
                // Only find a product belonging to the logged-in user
                const [productRows] = await connection.execute(
                    `SELECT *
                     FROM products
                     WHERE id = ?
                       AND created_by = ?
                     FOR UPDATE`,
                    [product_id, req.user.id]
                );

                if (productRows.length === 0) {
                    await connection.rollback();
                    connection.release();

                    return res.status(404).json({
                        success: false,
                        message: 'Product not found'
                    });
                }

                const product = productRows[0];

                const previousQuantity = product.quantity;
                const newQuantity =
                    previousQuantity - parseInt(quantity);

                if (newQuantity < 0) {
                    await connection.rollback();
                    connection.release();

                    return res.status(400).json({
                        success: false,
                        message:
                            'Insufficient stock. Available: ' +
                            previousQuantity
                    });
                }

                // Update only the user's product
                await connection.execute(
                    `UPDATE products
                     SET quantity = ?
                     WHERE id = ?
                       AND created_by = ?`,
                    [
                        newQuantity,
                        product_id,
                        req.user.id
                    ]
                );

                // Record transaction under logged-in user
                await connection.execute(`
                    INSERT INTO inventory_transactions
                    (
                        product_id,
                        user_id,
                        transaction_type,
                        quantity,
                        previous_quantity,
                        new_quantity,
                        notes
                    )
                    VALUES (?, ?, 'OUT', ?, ?, ?, ?)
                `, [
                    product_id,
                    req.user.id,
                    quantity,
                    previousQuantity,
                    newQuantity,
                    notes || 'Stock Out'
                ]);

                await connection.commit();
                connection.release();

                const updatedProduct =
                    await Product.getById(
                        product_id,
                        req.user.id
                    );

                res.json({
                    success: true,
                    message: 'Stock removed successfully',
                    data: updatedProduct
                });

            } catch (error) {

                await connection.rollback();
                connection.release();

                throw error;
            }

        } catch (error) {

            console.error('STOCK OUT ERROR:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to remove stock'
            });
        }
    }


    // =====================================================
    // TRANSACTION HISTORY
    // =====================================================

    static async getHistory(req, res) {
        try {

            const { product_id, limit } = req.query;

            const history =
                await InventoryTransaction.getHistory(
                    product_id,
                    limit || 100,
                    req.user.id
                );

            res.json({
                success: true,
                count: history.length,
                data: history
            });

        } catch (error) {

            console.error('GET HISTORY ERROR:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to get transaction history'
            });
        }
    }


    // =====================================================
    // USER DASHBOARD STATISTICS
    // =====================================================

    static async getDashboardStats(req, res) {

        try {

            // The user ID comes from the verified JWT
            const userId = req.user.id;


            // =================================================
            // TOTAL PRODUCTS
            // =================================================

            const [totalProducts] =
                await pool.execute(
                    `SELECT COUNT(*) AS total
                     FROM products
                     WHERE created_by = ?`,
                    [userId]
                );


            // =================================================
            // LOW STOCK PRODUCTS
            // =================================================

            const [lowStock] =
                await pool.execute(
                    `SELECT COUNT(*) AS total
                     FROM products
                     WHERE created_by = ?
                       AND quantity <= minimum_stock`,
                    [userId]
                );


            // =================================================
            // TOTAL TRANSACTIONS
            // =================================================

            const [totalTransactions] =
                await pool.execute(
                    `SELECT COUNT(*) AS total
                     FROM inventory_transactions
                     WHERE user_id = ?`,
                    [userId]
                );


                // =================================================
// TOTAL CATEGORIES
// =================================================

const [totalCategories] =
    await pool.execute(
        `SELECT COUNT(*) AS total
         FROM categories
         WHERE created_by = ?`,
        [userId]
    );


// =================================================
// TOTAL SUPPLIERS
// =================================================

const [totalSuppliers] =
    await pool.execute(
        `SELECT COUNT(*) AS total
         FROM suppliers
         WHERE created_by = ?`,
        [userId]
    );


            // =================================================
            // RECENT TRANSACTIONS
            // =================================================

            const [recentTransactions] =
                await pool.execute(
                    `SELECT
                        t.id,
                        p.product_name,
                        t.transaction_type,
                        t.quantity,
                        t.previous_quantity,
                        t.new_quantity,
                        t.notes,
                        t.created_at
                     FROM inventory_transactions t
                     JOIN products p
                        ON t.product_id = p.id
                     WHERE t.user_id = ?
                       AND p.created_by = ?
                     ORDER BY t.created_at DESC
                     LIMIT 10`,
                    [userId, userId]
                );


            // =================================================
            // SEND RESPONSE
            // =================================================

  res.json({
    success: true,
    data: {
        totalProducts:
            totalProducts[0].total,

        totalCategories:
            totalCategories[0].total,

        totalSuppliers:
            totalSuppliers[0].total,

        lowStockItems:
            lowStock[0].total,

        totalTransactions:
            totalTransactions[0].total,

        recentTransactions
    }
});

        } catch (error) {

            console.error(
                'DASHBOARD STATS ERROR:',
                error
            );

            res.status(500).json({
                success: false,
                message:
                    'Unable to get dashboard statistics'
            });
        }
    }
}

module.exports = InventoryController;

const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { pool } = require('../config/database');

class InventoryController {
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
                const [productRows] = await connection.execute(
                    'SELECT * FROM products WHERE id = ? FOR UPDATE',
                    [product_id]
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
                const newQuantity = previousQuantity + parseInt(quantity);

                await connection.execute(
                    'UPDATE products SET quantity = ? WHERE id = ?',
                    [newQuantity, product_id]
                );

                await connection.execute(`
                    INSERT INTO inventory_transactions 
                    (product_id, user_id, transaction_type, quantity, previous_quantity, new_quantity, notes)
                    VALUES (?, ?, 'IN', ?, ?, ?, ?)
                `, [product_id, req.user.id, quantity, previousQuantity, newQuantity, notes || 'Stock In']);

                await connection.commit();
                connection.release();

                const updatedProduct = await Product.getById(product_id);
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
            res.status(500).json({
                success: false,
                message: 'Unable to add stock'
            });
        }
    }

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
                const [productRows] = await connection.execute(
                    'SELECT * FROM products WHERE id = ? FOR UPDATE',
                    [product_id]
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
                const newQuantity = previousQuantity - parseInt(quantity);

                if (newQuantity < 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient stock. Available: ' + previousQuantity
                    });
                }

                await connection.execute(
                    'UPDATE products SET quantity = ? WHERE id = ?',
                    [newQuantity, product_id]
                );

                await connection.execute(`
                    INSERT INTO inventory_transactions 
                    (product_id, user_id, transaction_type, quantity, previous_quantity, new_quantity, notes)
                    VALUES (?, ?, 'OUT', ?, ?, ?, ?)
                `, [product_id, req.user.id, quantity, previousQuantity, newQuantity, notes || 'Stock Out']);

                await connection.commit();
                connection.release();

                const updatedProduct = await Product.getById(product_id);
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
            res.status(500).json({
                success: false,
                message: 'Unable to remove stock'
            });
        }
    }

    static async getHistory(req, res) {
        try {
            const { product_id, limit } = req.query;
            const history = await InventoryTransaction.getHistory(product_id, limit || 100);
            res.json({
                success: true,
                count: history.length,
                data: history
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to get transaction history'
            });
        }
    }

    static async getDashboardStats(req, res) {
        try {
            const [totalProducts] = await pool.execute('SELECT COUNT(*) as total FROM products');
            const [totalCategories] = await pool.execute('SELECT COUNT(*) as total FROM categories');
            const [totalSuppliers] = await pool.execute('SELECT COUNT(*) as total FROM suppliers');
            const [lowStock] = await pool.execute('SELECT COUNT(*) as total FROM low_stock_alert');
            const [recentTransactions] = await pool.execute('SELECT * FROM transaction_summary LIMIT 10');

            res.json({
                success: true,
                data: {
                    totalProducts: totalProducts[0].total,
                    totalCategories: totalCategories[0].total,
                    totalSuppliers: totalSuppliers[0].total,
                    lowStockItems: lowStock[0].total,
                    recentTransactions
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to get dashboard statistics'
            });
        }
    }
}

module.exports = InventoryController;
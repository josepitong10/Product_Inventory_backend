const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

class ProductController {

    // ============================================
    // GET ALL USER PRODUCTS
    // ============================================

    static async getAll(req, res) {

        try {

            const userId = req.user.id;

            const products =
                await Product.getAll(userId);

            res.json({
                success: true,
                count: products.length,
                data: products
            });

        } catch (error) {

            console.error('GET PRODUCTS ERROR:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to retrieve products'
            });
        }
    }


    // ============================================
    // GET ONE USER PRODUCT
    // ============================================

    static async getById(req, res) {

        try {

            const userId = req.user.id;

            const product =
                await Product.getById(
                    req.params.id,
                    userId
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            res.json({
                success: true,
                data: product
            });

        } catch (error) {

            console.error('GET PRODUCT ERROR:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to retrieve product'
            });
        }
    }



// ============================================
// CREATE USER PRODUCT
// ============================================

static async create(req, res) {

    try {

        const {
            product_name,
            category_name,
            supplier_name,
            price,
            quantity,
            minimum_stock,
            description
        } = req.body;

        const userId = req.user.id;

        // ============================================
        // VALIDATION
        // ============================================

        if (
            !product_name ||
            !category_name ||
            !supplier_name ||
            price === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Product name, category name, supplier name, and price are required'
            });
        }

        // ============================================
        // FIND OR CREATE CATEGORY
        // ============================================

        const categoryId = await Category.findOrCreate(
            category_name.trim(),
            userId
        );

        // ============================================
        // FIND OR CREATE SUPPLIER
        // ============================================

        const supplierId = await Supplier.findOrCreate(
            supplier_name.trim(),
            userId
        );

        // ============================================
        // CREATE PRODUCT
        // ============================================

        const productId = await Product.create({

            product_name: product_name.trim(),

            category_id: categoryId,

            supplier_id: supplierId,

            price,

            quantity: quantity || 0,

            minimum_stock: minimum_stock || 5,

            description: description || null,

            created_by: userId
        });

        // ============================================
        // GET CREATED PRODUCT
        // ============================================

        const product = await Product.getById(
            productId,
            userId
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });

    } catch (error) {

        console.error('CREATE PRODUCT ERROR:', error);

        const statusCode = error.statusCode || 500;

        res.status(statusCode).json({
            success: false,
            message:
                error.message || 'Unable to create product'
        });
    }
}


    // ============================================
    // UPDATE USER PRODUCT
    // ============================================

    static async update(req, res) {

        try {

            const userId = req.user.id;

            const updated =
                await Product.update(
                    req.params.id,
                    req.body,
                    userId
                );

            if (!updated) {

                return res.status(404).json({
                    success: false,
                    message:
                        'Product not found or no changes made'
                });
            }

            const product =
                await Product.getById(
                    req.params.id,
                    userId
                );

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });

        } catch (error) {

            console.error('UPDATE PRODUCT ERROR:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to update product'
            });
        }
    }


    // ============================================
    // DELETE USER PRODUCT
    // ============================================

    static async delete(req, res) {

        try {

            const userId = req.user.id;

            const deleted =
                await Product.delete(
                    req.params.id,
                    userId
                );

            if (!deleted) {

                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });

        } catch (error) {

            console.error('DELETE PRODUCT ERROR:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to delete product'
            });
        }
    }


    // ============================================
    // LOW STOCK
    // ============================================

    static async getLowStock(req, res) {

        try {

            const products =
                await Product.getLowStock(
                    req.user.id
                );

            res.json({
                success: true,
                count: products.length,
                data: products
            });

        } catch (error) {

            console.error('LOW STOCK ERROR:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to get low stock products'
            });
        }
    }


    // ============================================
    // PRODUCT SUMMARY
    // ============================================

    static async getSummary(req, res) {

        try {

            const products =
                await Product.getSummary(
                    req.user.id
                );

            res.json({
                success: true,
                count: products.length,
                data: products
            });

        } catch (error) {

            console.error('SUMMARY ERROR:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to get summary'
            });
        }
    }
}

module.exports = ProductController;


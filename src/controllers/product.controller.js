const Product = require('../models/Product');

class ProductController {
    static async getAll(req, res) {
        try {
            const products = await Product.getAll();
            res.json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to retrieve products'
            });
        }
    }

    static async getById(req, res) {
        try {
            const product = await Product.getById(req.params.id);
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
            res.status(500).json({
                success: false,
                message: 'Unable to retrieve product'
            });
        }
    }

    static async create(req, res) {
        try {
            const {
                product_name,
                category_id,
                supplier_id,
                price,
                quantity,
                minimum_stock,
                description
            } = req.body;

            if (!product_name || !category_id || !supplier_id || price === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Product name, category, supplier, and price are required'
                });
            }

            const productId = await Product.create({
                product_name,
                category_id,
                supplier_id,
                price,
                quantity,
                minimum_stock,
                description,
                created_by: req.user.id
            });

            const product = await Product.getById(productId);

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to create product'
            });
        }
    }

    static async update(req, res) {
        try {
            const updated = await Product.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found or no changes made'
                });
            }

            const product = await Product.getById(req.params.id);
            res.json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to update product'
            });
        }
    }

    static async delete(req, res) {
        try {
            const deleted = await Product.delete(req.params.id);
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
            res.status(500).json({
                success: false,
                message: 'Unable to delete product'
            });
        }
    }

    static async getLowStock(req, res) {
        try {
            const products = await Product.getLowStock();
            res.json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to get low stock products'
            });
        }
    }

    static async getSummary(req, res) {
        try {
            const products = await Product.getSummary();
            res.json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to get summary'
            });
        }
    }
}

module.exports = ProductController;
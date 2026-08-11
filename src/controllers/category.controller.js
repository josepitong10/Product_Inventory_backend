const Category = require('../models/Category');

class CategoryController {
    static async getAll(req, res) {
        try {
            const categories = await Category.getAll();
            res.json({
                success: true,
                count: categories.length,
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to retrieve categories'
            });
        }
    }

    static async create(req, res) {
        try {
            const { category_name, description } = req.body;
            if (!category_name) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name is required'
                });
            }

            const categoryId = await Category.create({ category_name, description });
            const category = await Category.getById(categoryId);

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to create category'
            });
        }
    }
}

module.exports = CategoryController;
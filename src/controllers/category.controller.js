const Category = require('../models/Category');

class CategoryController {

    // ============================================
    // GET USER'S CATEGORIES
    // ============================================
    static async getAll(req, res) {

        try {

            // User ID comes from verified JWT
            const userId = req.user.id;

            const categories =
                await Category.getAll(userId);

            res.json({
                success: true,
                count: categories.length,
                data: categories
            });

        } catch (error) {

            console.error(
                'GET CATEGORIES ERROR:',
                error
            );

            res.status(500).json({
                success: false,
                message: 'Unable to retrieve categories'
            });
        }
    }


    // ============================================
    // CREATE CATEGORY FOR LOGGED-IN USER
    // ============================================
    static async create(req, res) {

        try {

            const {
                category_name,
                description
            } = req.body;

            if (!category_name) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name is required'
                });
            }

            // IMPORTANT:
            // Never trust created_by from frontend.
            // Get it from authenticated JWT.
            const userId = req.user.id;

            const categoryId =
                await Category.create({
                    category_name,
                    description,
                    created_by: userId
                });

            const category =
                await Category.getById(
                    categoryId,
                    userId
                );

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });

        } catch (error) {

            console.error(
                'CREATE CATEGORY ERROR:',
                error
            );

            res.status(500).json({
                success: false,
                message: 'Unable to create category'
            });
        }
    }
}

module.exports = CategoryController;
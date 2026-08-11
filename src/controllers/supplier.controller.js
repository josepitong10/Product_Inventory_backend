const Supplier = require('../models/Supplier');

class SupplierController {
    static async getAll(req, res) {
        try {
            const suppliers = await Supplier.getAll();
            res.json({
                success: true,
                count: suppliers.length,
                data: suppliers
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to retrieve suppliers'
            });
        }
    }

    static async create(req, res) {
        try {
            const { supplier_name, contact_person, email, phone, address } = req.body;
            if (!supplier_name) {
                return res.status(400).json({
                    success: false,
                    message: 'Supplier name is required'
                });
            }

            const supplierId = await Supplier.create({ supplier_name, contact_person, email, phone, address });
            const supplier = await Supplier.getById(supplierId);

            res.status(201).json({
                success: true,
                message: 'Supplier created successfully',
                data: supplier
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to create supplier'
            });
        }
    }
}

module.exports = SupplierController;
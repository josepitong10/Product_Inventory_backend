const Supplier = require('../models/Supplier');

class SupplierController {

    // ============================================
    // GET USER'S SUPPLIERS ONLY
    // ============================================
    static async getAll(req, res) {

        try {

            const userId = req.user.id;

            const suppliers =
                await Supplier.getAll(userId);

            res.json({
                success: true,
                count: suppliers.length,
                data: suppliers
            });

        } catch (error) {

            console.error(
                'GET SUPPLIERS ERROR:',
                error
            );

            res.status(500).json({
                success: false,
                message: 'Unable to retrieve suppliers'
            });
        }
    }


    // ============================================
    // CREATE SUPPLIER FOR LOGGED-IN USER
    // ============================================
  static async create(req, res) {
    try {

        const {
            supplier_name,
            contact_person,
            email,
            phone,
            address
        } = req.body;

        if (!supplier_name) {
            return res.status(400).json({
                success: false,
                message: 'Supplier name is required'
            });
        }

        const userId = req.user.id;

        console.log('CREATING SUPPLIER FOR USER:', userId);

        const supplierId = await Supplier.create({
            supplier_name,
            contact_person,
            email,
            phone,
            address,
            created_by: userId
        });

        const supplier = await Supplier.getById(
            supplierId,
            userId
        );

        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            data: supplier
        });

    } catch (error) {

        console.error('CREATE SUPPLIER ERROR:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to create supplier'
        });
    }
}

// GET ONE SUPPLIER
static async getById(req, res) {
    try {
        const supplier = await Supplier.getById(
            req.params.id,
            req.user.id
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.json({
            success: true,
            data: supplier
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Unable to load supplier'
        });
    }
}

// UPDATE SUPPLIER
static async update(req, res) {
    try {
        const updated = await Supplier.update(
            req.params.id,
            req.body,
            req.user.id
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        const supplier = await Supplier.getById(
            req.params.id,
            req.user.id
        );

        res.json({
            success: true,
            message: 'Supplier updated successfully',
            data: supplier
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Unable to update supplier'
        });
    }
}

// DELETE SUPPLIER
static async delete(req, res) {
    try {
        const deleted = await Supplier.delete(
            req.params.id,
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.json({
            success: true,
            message: 'Supplier deleted successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Unable to delete supplier'
        });
    }
}
}

module.exports = SupplierController;
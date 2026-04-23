const { Category } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const categories = await Category.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, description } = req.body;
        console.log('[CATEGORY] Creating new category:', { name, description });

        if (!name || !name.trim()) {
            console.warn('[CATEGORY] Invalid input: name is required');
            return res.status(400).json({ error: 'Category name is required' });
        }

        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            if (!existingCategory.isActive) {
                console.log('[CATEGORY] Reactivating previously deleted category:', name);
                existingCategory.isActive = true;
                existingCategory.description = description || existingCategory.description;
                await existingCategory.save();
                return res.status(200).json({
                    message: 'Category restored successfully',
                    category: existingCategory
                });
            }

            console.warn('[CATEGORY] Category already exists:', name);
            return res.status(400).json({ error: 'Category already exists' });
        }

        const category = await Category.create({ name: name.trim(), description });
        console.log('[CATEGORY] ✓ Category created successfully:', { id: category.id, name: category.name });

        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        // More detailed error logging
        console.error('[CATEGORY] ✗ Error creating category:', error.message);
        if (error.errors) {
            console.error('[CATEGORY] Validation errors:', error.errors.map(e => ({ field: e.path, message: e.message })));
        }
        console.error('[CATEGORY] Full error:', error);

        if (error.errors) {
            const messages = error.errors.map(e => `${e.path}: ${e.message}`).join(', ');
            return res.status(400).json({ error: `Validation error: ${messages}` });
        }

        res.status(400).json({ error: error.message || 'Error creating category' });
    }
};

exports.update = async (req, res) => {
    try {
        const { name, description } = req.body;

        let category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ where: { name } });
            if (existingCategory) {
                if (existingCategory.isActive) {
                    return res.status(400).json({ error: 'A category with this name already exists and is active' });
                } else {
                    // Conflict with an inactive category - permanently delete the inactive one
                    console.log(`[CATEGORY] Deleting stale inactive category "${name}" to resolve update conflict`);
                    await existingCategory.destroy();
                }
            }
        }

        category.name = name || category.name;
        category.description = description || category.description;
        await category.save();

        res.status(200).json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        if (error.errors) {
            const messages = error.errors.map(e => `${e.path}: ${e.message}`).join(', ');
            return res.status(400).json({ error: `Validation error: ${messages}` });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        category.isActive = false;
        await category.save();

        console.log('[CATEGORY] Soft deleted category:', { id: category.id, name: category.name });
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('[CATEGORY] ✗ Error deleting category:', error);
        res.status(500).json({ error: error.message });
    }
};

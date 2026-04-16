const { Inventory, Category, Unit, User } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const { search, category, status, page = 1, limit = 10 } = req.query;

        let query = { isActive: true };
        if (search) {
            query.name = { [Op.like]: `%${search}%` };
        }
        if (category) {
            query.categoryId = category;
        }
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const { count, rows } = await Inventory.findAndCountAll({
            where: query,
            attributes: ['id', 'name', 'quantity', 'price', 'status', 'sku', 'categoryId', 'unitId', 'lowStockThreshold', 'createdAt'],
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Unit, as: 'unit', attributes: ['id', 'name', 'abbreviation'] },
                { model: User, as: 'createdBy', attributes: ['username', 'firstName', 'lastName'] }
            ],
            offset: skip,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']],
            subQuery: false,
            raw: false
        });

        // Return empty array if no items instead of error
        res.status(200).json({
            items: rows && rows.length > 0 ? rows : [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ 
            items: [],
            error: error.message,
            pagination: {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                total: 0,
                pages: 0
            }
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await Inventory.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'category' },
                { model: Unit, as: 'unit' },
                { model: User, as: 'createdBy', attributes: ['username', 'firstName', 'lastName'] },
                { model: User, as: 'updatedBy', attributes: ['username', 'firstName', 'lastName'] }
            ]
        });

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, category, description, quantity, price, unit, lowStockThreshold, sku } = req.body;
        console.log('[INVENTORY] Creating new inventory item:', { name, category, unit, quantity, price });

        if (!name || !name.trim()) {
            console.warn('[INVENTORY] Invalid input: name is required');
            return res.status(400).json({ error: 'Item name is required' });
        }
        if (!category) {
            console.warn('[INVENTORY] Invalid input: category is required');
            return res.status(400).json({ error: 'Category is required' });
        }
        if (!unit) {
            console.warn('[INVENTORY] Invalid input: unit is required');
            return res.status(400).json({ error: 'Unit is required' });
        }

        const existingItem = await Inventory.findOne({ where: { name } });
        if (existingItem) {
            if (!existingItem.isActive) {
                console.log('[INVENTORY] Reactivating previously deleted item:', name);
                existingItem.isActive = true;
                existingItem.categoryId = category;
                existingItem.description = description || existingItem.description;
                existingItem.quantity = parseInt(quantity) || existingItem.quantity;
                existingItem.price = parseFloat(price) || existingItem.price;
                existingItem.unitId = unit;
                existingItem.lowStockThreshold = parseInt(lowStockThreshold) || existingItem.lowStockThreshold;
                existingItem.sku = sku || existingItem.sku;
                existingItem.updatedById = req.user.userId;
                await existingItem.save();
                await existingItem.reload({ include: ['category', 'unit'] });
                return res.status(200).json({
                    message: 'Item restored successfully',
                    item: existingItem
                });
            }

            console.warn('[INVENTORY] Item already exists:', name);
            return res.status(400).json({ error: 'Item already exists' });
        }

        const item = await Inventory.create({
            name: name.trim(),
            categoryId: category,
            description,
            quantity: parseInt(quantity) || 0,
            price: parseFloat(price) || 0,
            unitId: unit,
            lowStockThreshold: parseInt(lowStockThreshold) || 5,
            sku,
            createdById: req.user.userId
        });

        await item.reload({ include: ['category', 'unit'] });
        console.log('[INVENTORY] ✓ Item created successfully:', { id: item.id, name: item.name });

        res.status(201).json({
            message: 'Item created successfully',
            item
        });
    } catch (error) {
        console.error('[INVENTORY] ✗ Error creating item:', error.message);
        console.error('[INVENTORY] Full error details:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { name, category, description, quantity, price, unit, lowStockThreshold, sku } = req.body;

        let item = await Inventory.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        item.name = name || item.name;
        item.categoryId = category || item.categoryId;
        item.description = description || item.description;
        item.quantity = quantity !== undefined ? quantity : item.quantity;
        item.price = price || item.price;
        item.unitId = unit || item.unitId;
        item.lowStockThreshold = lowStockThreshold || item.lowStockThreshold;
        item.sku = sku || item.sku;
        item.updatedById = req.user.userId;

        await item.save();
        await item.reload({ include: ['category', 'unit'] });

        res.status(200).json({
            message: 'Item updated successfully',
            item
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const item = await Inventory.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        item.isActive = false;
        await item.save();

        console.log('[INVENTORY] Soft deleted item:', { id: item.id, name: item.name });
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('[INVENTORY] ✗ Error deleting item:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getLowStockItems = async (req, res) => {
    try {
        const items = await Inventory.findAll({
            where: {
                status: {
                    [Op.in]: ['low stock', 'out of stock']
                }
            },
            include: ['category', 'unit'],
            order: [['quantity', 'ASC']]
        });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const totalItems = await Inventory.count();
        const lowStockItems = await Inventory.count({ where: { status: 'low stock' } });
        const outOfStockItems = await Inventory.count({ where: { status: 'out of stock' } });

        res.status(200).json({
            totalItems,
            lowStockItems,
            outOfStockItems
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

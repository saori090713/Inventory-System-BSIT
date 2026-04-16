const { Unit } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const units = await Unit.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
        res.status(200).json(units);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const unit = await Unit.findByPk(req.params.id);
        if (!unit) {
            return res.status(404).json({ error: 'Unit not found' });
        }
        res.status(200).json(unit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, abbreviation, description } = req.body;
        console.log('[UNIT] Creating new unit:', { name, abbreviation, description });

        if (!name || !name.trim()) {
            console.warn('[UNIT] Invalid input: name is required');
            return res.status(400).json({ error: 'Unit name is required' });
        }

        const existingUnit = await Unit.findOne({ where: { name } });
        if (existingUnit) {
            if (!existingUnit.isActive) {
                console.log('[UNIT] Reactivating previously deleted unit:', name);
                existingUnit.isActive = true;
                existingUnit.abbreviation = abbreviation || existingUnit.abbreviation;
                existingUnit.description = description || existingUnit.description;
                await existingUnit.save();
                return res.status(200).json({
                    message: 'Unit restored successfully',
                    unit: existingUnit
                });
            }

            console.warn('[UNIT] Unit already exists:', name);
            return res.status(400).json({ error: 'Unit already exists' });
        }

        // Auto-generate abbreviation if not provided: first letter + last letter of name
        const autoAbbreviation = abbreviation || (name.trim().length > 1 ? name.trim()[0] + name.trim()[name.trim().length - 1] : name.trim());
        
        const unit = await Unit.create({ name: name.trim(), abbreviation: autoAbbreviation, description });
        console.log('[UNIT] ✓ Unit created successfully:', { id: unit.id, name: unit.name, abbreviation: autoAbbreviation });

        res.status(201).json({
            message: 'Unit created successfully',
            unit
        });
    } catch (error) {
        console.error('[UNIT] ✗ Error creating unit:', error.message);
        console.error('[UNIT] Full error details:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { name, abbreviation, description } = req.body;

        let unit = await Unit.findByPk(req.params.id);
        if (!unit) {
            return res.status(404).json({ error: 'Unit not found' });
        }

        if (name) unit.name = name;
        if (abbreviation) unit.abbreviation = abbreviation;
        if (description) unit.description = description;
        await unit.save();

        res.status(200).json({
            message: 'Unit updated successfully',
            unit
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const unit = await Unit.findByPk(req.params.id);
        if (!unit) {
            return res.status(404).json({ error: 'Unit not found' });
        }

        unit.isActive = false;
        await unit.save();

        console.log('[UNIT] Soft deleted unit:', { id: unit.id, name: unit.name });
        res.status(200).json({ message: 'Unit deleted successfully' });
    } catch (error) {
        console.error('[UNIT] ✗ Error deleting unit:', error);
        res.status(500).json({ error: error.message });
    }
};

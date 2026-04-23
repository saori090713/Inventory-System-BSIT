require('dotenv').config();
const db = require('../../backend/models');

const seedDatabase = async () => {
  try {
    console.log('\n========================================');
    console.log('Starting Database Seeding...');
    console.log('========================================\n');

    await db.sequelize.sync({ force: false });

    // ===== SEED CATEGORIES =====
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and components' },
      { name: 'Furniture', description: 'Office and home furniture' },
      { name: 'Office Supplies', description: 'Stationery and office materials' },
      { name: 'IT Equipment', description: 'Computers and networking equipment' },
      { name: 'Software', description: 'Software licenses and tools' }
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const [category, created] = await db.Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
      if (created) {
        console.log(`✓ Created category: ${category.name}`);
      } else {
        console.log(`- Category already exists: ${category.name}`);
      }
      createdCategories.push(category);
    }

    // ===== SEED UNITS =====
    const units = [
      { name: 'Piece', abbreviation: 'pc' },
      { name: 'Box', abbreviation: 'bx' },
      { name: 'Carton', abbreviation: 'ctn' },
      { name: 'Pallet', abbreviation: 'plt' },
      { name: 'Kilogram', abbreviation: 'kg' },
      { name: 'Liter', abbreviation: 'L' },
      { name: 'Meter', abbreviation: 'm' },
      { name: 'Set', abbreviation: 'set' }
    ];

    const createdUnits = [];
    for (const unit of units) {
      const [unitRecord, created] = await db.Unit.findOrCreate({
        where: { name: unit.name },
        defaults: unit
      });
      if (created) {
        console.log(`✓ Created unit: ${unitRecord.name} (${unitRecord.abbreviation})`);
      } else {
        console.log(`- Unit already exists: ${unitRecord.name}`);
      }
      createdUnits.push(unitRecord);
    }

    // ===== SEED INVENTORY ITEMS =====
    const items = [
      {
        name: 'Laptop Dell XPS 13',
        categoryId: createdCategories[0].id,
        unitId: createdUnits[0].id,
        quantity: 15,
        price: 1200.00,
        sku: 'DELL-XPS-13',
        lowStockThreshold: 5,
        description: 'High-performance laptop for business use'
      },
      {
        name: 'Wireless Mouse',
        categoryId: createdCategories[0].id,
        unitId: createdUnits[0].id,
        quantity: 85,
        price: 35.99,
        sku: 'MOUSE-W-001',
        lowStockThreshold: 20,
        description: 'Ergonomic wireless mouse'
      },
      {
        name: 'Mechanical Keyboard',
        categoryId: createdCategories[0].id,
        unitId: createdUnits[0].id,
        quantity: 42,
        price: 129.99,
        sku: 'KEYBOARD-M-001',
        lowStockThreshold: 15,
        description: 'RGB Mechanical Gaming Keyboard'
      },
      {
        name: 'Office Desk',
        categoryId: createdCategories[1].id,
        unitId: createdUnits[0].id,
        quantity: 8,
        price: 450.00,
        sku: 'DESK-OFFICE-001',
        lowStockThreshold: 3,
        description: 'Adjustable height standing desk'
      },
      {
        name: 'Ergonomic Chair',
        categoryId: createdCategories[1].id,
        unitId: createdUnits[0].id,
        quantity: 12,
        price: 350.00,
        sku: 'CHAIR-ERG-001',
        lowStockThreshold: 4,
        description: 'Premium ergonomic office chair'
      },
      {
        name: 'A4 Paper Ream',
        categoryId: createdCategories[2].id,
        unitId: createdUnits[1].id,
        quantity: 120,
        price: 5.99,
        sku: 'PAPER-A4-500',
        lowStockThreshold: 30,
        description: '500 sheets of A4 white paper'
      },
      {
        name: 'Ballpoint Pens (Box)',
        categoryId: createdCategories[2].id,
        unitId: createdUnits[1].id,
        quantity: 45,
        price: 12.50,
        sku: 'PEN-BOX-50',
        lowStockThreshold: 10,
        description: 'Pack of 50 blue ballpoint pens'
      },
      {
        name: 'Network Switch 48-Port',
        categoryId: createdCategories[3].id,
        unitId: createdUnits[0].id,
        quantity: 3,
        price: 899.99,
        sku: 'SWITCH-48-001',
        lowStockThreshold: 2,
        description: 'Managed 48-port gigabit switch'
      },
      {
        name: 'Server License (Annual)',
        categoryId: createdCategories[4].id,
        unitId: createdUnits[7].id,
        quantity: 2,
        price: 5000.00,
        sku: 'LICENSE-SERVER-001',
        lowStockThreshold: 1,
        description: 'Annual server software license'
      }
    ];

    for (const item of items) {
      const [inventory, created] = await db.Inventory.findOrCreate({
        where: { name: item.name },
        defaults: item
      });
      if (created) {
        console.log(`✓ Created inventory item: ${inventory.name} (Qty: ${inventory.quantity})`);
      } else {
        console.log(`- Item already exists: ${inventory.name}`);
      }
    }

    console.log('\n========================================');
    console.log('✓ Database seeding completed successfully!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ Error seeding database:');
    console.error(error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedDatabase;

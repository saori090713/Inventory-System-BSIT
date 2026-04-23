// Database setup and verification script
require('dotenv').config();
const db = require('./models');

async function setupDatabase() {
    try {
        console.log('🔧 Starting database setup...\n');

        // 1. Check connection
        console.log('[STEP 1] Checking database connection...');
        await db.checkConnection();
        console.log('✓ Database connection successful\n');

        // 2. Get current tables
        console.log('[STEP 2] Checking existing tables...');
        const [results] = await db.sequelize.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'inventory_db'}'
        `);
        console.log('Current tables:', results.map(r => r.TABLE_NAME));
        console.log();

        // 3. Sync database (create/update tables)
        console.log('[STEP 3] Syncing database models...');
        console.log('  - This creates or updates all tables based on models');
        await db.sequelize.sync({ force: false });
        console.log('✓ Database synchronized successfully\n');

        // 4. Check tables again
        console.log('[STEP 4] Verifying tables after sync...');
        const [results2] = await db.sequelize.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'inventory_db'}'
        `);
        console.log('Tables after sync:', results2.map(r => r.TABLE_NAME));
        console.log();

        // 5. Seed default data
        console.log('[STEP 5] Seeding default admin user...');
        await db.seedDefaultData();
        console.log('✓ Seed complete\n');

        // 6. Verify data
        console.log('[STEP 6] Verifying test data...');
        
        const adminCount = await db.User.count();
        console.log(`  - Users: ${adminCount}`);
        
        const categoryCount = await db.Category.count();
        console.log(`  - Categories: ${categoryCount}`);
        
        const unitCount = await db.Unit.count();
        console.log(`  - Units: ${unitCount}`);
        
        const inventoryCount = await db.Inventory.count();
        console.log(`  - Inventory items: ${inventoryCount}`);
        console.log();

        // 7. Show table structure
        console.log('[STEP 7] Table structure info:\n');
        
        const tables = ['users', 'categories', 'units', 'inventories'];
        for (const table of tables) {
            try {
                const [columns] = await db.sequelize.query(`
                    SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'inventory_db'}' 
                    AND TABLE_NAME = '${table}'
                `);
                console.log(`${table}:`);
                columns.forEach(col => {
                    console.log(`  - ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : ''} ${col.COLUMN_KEY ? '🔑 ' + col.COLUMN_KEY : ''}`);
                });
                console.log();
            } catch (e) {
                console.log(`  Table not found: ${table}\n`);
            }
        }

        console.log('✅ Database setup complete!\n');
        console.log('Now you can:');
        console.log('  1. Start the backend: npm start');
        console.log('  2. Log in with: admin / admin123');
        console.log('  3. Add categories, units, and items');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database setup failed:');
        console.error(error.message);
        console.error('\nFull error:', error);
        console.error('\n--- TROUBLESHOOTING ---');
        console.error('1. Make sure MySQL is running');
        console.error('2. Check database config in models/index.js');
        console.error('3. Verify database credentials');
        console.error('4. Ensure the database exists or can be created');
        process.exit(1);
    }
}

setupDatabase();

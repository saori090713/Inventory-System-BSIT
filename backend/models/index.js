const { Sequelize } = require('sequelize');
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inventory_db',
  dialect: 'mysql'
};

const sequelize = new Sequelize(
  config.database,
  config.user,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: console.log, // Turn on SQL logging for debugging
  }
);

const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DATABASE] ✓ MySQL connection established successfully');
    console.log(`[DATABASE] Connected to: ${config.database} @ ${config.host}`);
  } catch (error) {
    console.error('[DATABASE] ✗ Unable to connect to MySQL:');
    console.error('[DATABASE] Error:', error.message);
    throw error;
  }
};

const seedDefaultData = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await db.User.findOne({ where: { username: 'admin' } });
    
    if (adminExists) {
      console.log('[DATABASE] ✓ Admin user already exists');
      return;
    }

    // Create default admin user
    const adminUser = await db.User.create({
      username: 'admin',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isActive: true
    });

    console.log('[DATABASE] ✓ Default admin user created');
    console.log('           Username: admin | Password: admin123');
  } catch (error) {
    console.error('Error creating default admin user:', error.message);
  }
};

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.checkConnection = checkConnection;
db.seedDefaultData = seedDefaultData;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Category = require('./Category')(sequelize, Sequelize);
db.Unit = require('./Unit')(sequelize, Sequelize);
db.Inventory = require('./Inventory')(sequelize, Sequelize);

// Set up associations
db.Inventory.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });
db.Category.hasMany(db.Inventory, { foreignKey: 'categoryId' });

db.Inventory.belongsTo(db.Unit, { foreignKey: 'unitId', as: 'unit' });
db.Unit.hasMany(db.Inventory, { foreignKey: 'unitId' });

db.Inventory.belongsTo(db.User, { foreignKey: 'createdById', as: 'createdBy' });
db.Inventory.belongsTo(db.User, { foreignKey: 'updatedById', as: 'updatedBy' });

module.exports = db;

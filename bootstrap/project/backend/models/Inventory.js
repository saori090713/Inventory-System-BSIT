module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    status: {
      type: DataTypes.ENUM('in stock', 'low stock', 'out of stock'),
      defaultValue: 'in stock'
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updatedById: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'inventories',
    timestamps: true,
    indexes: [
      { fields: ['categoryId'] },        // Speed up category filtering
      { fields: ['status'] },             // Speed up status filtering
      { fields: ['name'] },               // Speed up search by name
      { fields: ['createdAt'] },          // Speed up sorting by date
      { fields: ['quantity'] },           // Speed up stock queries
      { fields: ['isActive'] },           // Speed up active filter
      { fields: ['categoryId', 'status'] } // Combined index for common filters
    ],
    hooks: {
      beforeSave: (inventory) => {
        if (inventory.quantity === 0) {
          inventory.status = 'out of stock';
        } else if (inventory.quantity <= inventory.lowStockThreshold) {
          inventory.status = 'low stock';
        } else {
          inventory.status = 'in stock';
        }
      }
    }
  });

  return Inventory;
};

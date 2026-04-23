module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define('Unit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    abbreviation: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'units',
    timestamps: true,
    indexes: [
      { fields: ['name'] },           // Speed up name search
      { fields: ['abbreviation'] },   // Speed up abbreviation lookup
      { fields: ['isActive'] },       // Speed up active filter
      { fields: ['createdAt'] }       // Speed up sorting
    ]
  });

  return Unit;
};

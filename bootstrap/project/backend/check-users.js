const { User } = require('./models');
const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({ attributes: ['id', 'username', 'firstName', 'lastName', 'role', 'isActive'] });
    console.log('=== REGISTERED USERS ===');
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach(u => {
        console.log(`  ${u.username} (${u.firstName} ${u.lastName}) - Role: ${u.role} - Active: ${u.isActive}`);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

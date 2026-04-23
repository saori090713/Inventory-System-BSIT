const db = require('./models');

async function test() {
  try {
    await db.checkConnection();
    const user = await db.User.unscoped().findOne({ where: { username: 'admin' } });
    if (!user) {
       console.log('Admin not found in DB');
       return;
    }
    console.log('User found! Password property present?', !!user.password);
    const isValid = await user.matchPassword('admin123');
    console.log('Password valid? ', isValid);

    console.log('Testing create...');
    const testUser = await db.User.create({
      username: 'testuser' + Date.now(),
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User'
    });
    console.log('Created user id:', testUser.id);
  } catch (err) {
    console.error('Error during test:', err.message);
  } finally {
    process.exit();
  }
}
test();

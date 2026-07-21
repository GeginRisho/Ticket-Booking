const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Database connection established successfully.');

    // Create all tables if they don't exist
    await sequelize.sync();
    console.log('✅ Database tables synchronized.');

    // Automatically check and run the seeder script if tables are empty
    try {
      const { Movie } = require('./models');
      const movieCount = await Movie.count();
      if (movieCount === 0) {
        console.log('⚠️ Database is empty. Running seeder script automatically...');
        const { exec } = require('child_process');
        const path = require('path');
        const seederPath = path.join(__dirname, 'scripts', 'seed_demo_data.js');
        exec(`node "${seederPath}"`, (err, stdout, stderr) => {
          if (err) {
            console.error('❌ Automatic seeder execution failed:', err);
          } else {
            console.log('✅ Database seeded successfully.');
          }
        });
      }
    } catch (seederErr) {
      console.error('⚠️ Could not run automatic seeder checks:', seederErr.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
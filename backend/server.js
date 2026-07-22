const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Connecting database...');
    await sequelize.authenticate();
    console.log('Database connected.');

    console.log('Checking schema...');
    const { Movie } = require('./models');
    // Basic verification query
    await sequelize.query('SELECT 1+1 AS result', { type: sequelize.QueryTypes.SELECT });
    
    // In production, we run sequelize.sync() to check/sync Sequelize models.
    // In development, we run it with alter: true.
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    } else {
      await sequelize.sync();
    }
    console.log('Sequelize initialized.');

    // Automatically check and run the seeder script if tables are empty
    try {
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
      console.warn('⚠️ Non-fatal: Could not run automatic seeder checks:', seederErr.message);
    }

    console.log('Starting server...');
    app.listen(PORT, () => {
      console.log(`🚀 Server ready. Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('❌ Fatal error during backend startup:');
    if (error.stack) {
      console.error(error.stack);
    } else {
      console.error(error);
    }
    if (error.sql) {
      console.error(`Executed SQL Statement: ${error.sql}`);
    }
    if (error.original) {
      console.error('PostgreSQL Raw Error:', error.original);
    }
    process.exit(1);
  }
};

startServer();
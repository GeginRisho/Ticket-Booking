const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Test DB connection and spin up server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Database connection established successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

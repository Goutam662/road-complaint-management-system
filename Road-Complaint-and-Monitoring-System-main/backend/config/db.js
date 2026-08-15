const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database Connected (SQLite)');
  } catch (err) {
    console.error('DB connection error:', err.message || err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };


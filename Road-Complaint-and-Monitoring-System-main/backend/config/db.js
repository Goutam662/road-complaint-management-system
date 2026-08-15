const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQL_URI, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database Connected (MySQL)');
  } catch (err) {
    console.error('DB connection error:', err.message || err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };


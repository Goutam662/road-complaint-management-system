const { Sequelize } = require('sequelize');

const connectionString = process.env.MYSQL_URI || 'sqlite:./database.sqlite';
const dialect = process.env.MYSQL_URI ? 'mysql' : 'sqlite';

const sequelize = new Sequelize(connectionString, {
  dialect,
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('MySQL Connected');
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

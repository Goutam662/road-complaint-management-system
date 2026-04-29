const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ResetToken = sequelize.define("ResetToken", {
  userId: DataTypes.INTEGER,
  token: DataTypes.STRING,
  expiresAt: DataTypes.DATE
}, {
  timestamps: true
});

module.exports = ResetToken;

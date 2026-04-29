const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
  village: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  emailVerifiedAt: { type: DataTypes.DATE, defaultValue: null }
}, {
  timestamps: true
});

module.exports = User;

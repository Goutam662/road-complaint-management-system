const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Admin = sequelize.define("Admin", {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("superadmin", "admin"),
    defaultValue: "admin"
  },
  otpSecret: DataTypes.STRING
}, {
  timestamps: true
});

module.exports = Admin;

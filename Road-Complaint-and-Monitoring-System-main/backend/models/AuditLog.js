const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AuditLog = sequelize.define("AuditLog", {
  actor: DataTypes.STRING,
  action: DataTypes.STRING,
  target: DataTypes.STRING
}, {
  timestamps: true
});

module.exports = AuditLog;

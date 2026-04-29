const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Complaint = sequelize.define("Complaint", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  image: DataTypes.STRING,
  location: DataTypes.STRING,
  description: DataTypes.STRING,
  severity: { type: DataTypes.STRING, defaultValue: "Medium" },
  path: { type: DataTypes.JSON, defaultValue: [] },
  routePath: { type: DataTypes.JSON, defaultValue: [] },
  lat: DataTypes.FLOAT,
  lng: DataTypes.FLOAT,
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
  status: { type: DataTypes.STRING, defaultValue: "Pending" },
  flags: DataTypes.STRING
}, {
  timestamps: true
});

module.exports = Complaint;

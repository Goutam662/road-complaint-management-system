const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ContactMessage = sequelize.define("ContactMessage", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "New" }
}, {
  timestamps: true
});

module.exports = ContactMessage;

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EmailVerification = sequelize.define("EmailVerification", {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  otpHash: { type: DataTypes.STRING, defaultValue: null },
  otpExpiresAt: { type: DataTypes.DATE, defaultValue: null },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verifiedAt: { type: DataTypes.DATE, defaultValue: null },
  lastSentAt: { type: DataTypes.DATE, defaultValue: null },
  windowStartedAt: { type: DataTypes.DATE, defaultValue: null },
  requestCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  timestamps: true
});

module.exports = EmailVerification;

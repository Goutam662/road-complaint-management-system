const User = require("./User");
const Admin = require("./Admin");
const Complaint = require("./Complaint");
const ContactMessage = require("./ContactMessage");
const AuditLog = require("./AuditLog");
const EmailVerification = require("./EmailVerification");
const ResetToken = require("./ResetToken");

User.hasMany(Complaint, { foreignKey: "userId", as: "complaints" });
Complaint.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(ResetToken, { foreignKey: "userId", as: "resetTokens" });
ResetToken.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  User,
  Admin,
  Complaint,
  ContactMessage,
  AuditLog,
  EmailVerification,
  ResetToken
};

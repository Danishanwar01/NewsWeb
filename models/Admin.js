const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  password: String
});

// Hash password before saving the admin
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Admin = mongoose.model('Admins', adminSchema);

module.exports = Admin;

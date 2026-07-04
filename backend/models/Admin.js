const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: false, unique: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  role: { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);

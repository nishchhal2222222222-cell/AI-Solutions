const mongoose = require('mongoose');

const DemoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  country: { type: String },
  interestedService: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('DemoRequest', DemoSchema);

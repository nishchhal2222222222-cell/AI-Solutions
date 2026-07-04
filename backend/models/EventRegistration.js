const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  country: { type: String },
  eventInterest: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('EventRegistration', EventSchema);

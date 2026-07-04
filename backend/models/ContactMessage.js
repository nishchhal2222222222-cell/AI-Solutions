const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  country: { type: String },
  jobTitle: { type: String },
  jobDetails: { type: String },
  replies: [{
    message: { type: String },
    sentAt: { type: Date },
    sentBy: { type: String },
  }],
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', ContactSchema);

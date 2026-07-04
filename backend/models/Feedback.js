const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  message: { type: String },
  relatedService: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);

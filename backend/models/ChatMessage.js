const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  sessionId: { type: String },
  user: { type: String },
  message: { type: String },
  response: { type: String },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', ChatSchema);

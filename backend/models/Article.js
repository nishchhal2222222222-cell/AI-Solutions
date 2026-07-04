const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  content: { type: String },
  author: { type: String },
  published: { type: Boolean, default: false },
  tags: [String],
  coverImage: { type: String },
  attachment: {
    fileName: { type: String },
    fileType: { type: String },
    fileUrl: { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);

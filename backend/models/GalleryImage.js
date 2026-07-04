const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: { type: String },
  url: { type: String, required: true },
  caption: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', GallerySchema);

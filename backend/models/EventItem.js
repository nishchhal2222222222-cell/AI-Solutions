const mongoose = require('mongoose')

const EventItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  buttonText: { type: String, default: 'Join Event' },
}, { timestamps: true })

module.exports = mongoose.model('EventItem', EventItemSchema)

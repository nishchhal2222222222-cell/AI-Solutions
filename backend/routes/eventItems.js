const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const EventItem = require('../models/EventItem')
const { protect } = require('../middleware/auth')

router.get('/', async (req, res) => {
  try {
    const items = await EventItem.find().sort({ date: 1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', protect, [
  body('title').notEmpty(),
  body('date').notEmpty(),
  body('location').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const item = new EventItem(req.body)
    await item.save()
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', protect, async (req, res) => {
  try {
    const updated = await EventItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    await EventItem.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

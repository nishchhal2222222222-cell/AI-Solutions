const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Demo = require('../models/DemoRequest');
const { protect } = require('../middleware/auth');

router.post('/', [body('name').notEmpty(), body('email').isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try { const item = new Demo(req.body); await item.save(); res.json(item); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', protect, async (req, res) => { try { const items = await Demo.find().sort({ createdAt: -1 }); res.json(items); } catch (err) { res.status(500).json({ error: err.message }); } });
router.put('/:id', protect, async (req, res) => { try { const updated = await Demo.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updated); } catch (err) { res.status(500).json({ error: err.message }); } });
router.delete('/:id', protect, async (req, res) => { try { await Demo.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (err) { res.status(500).json({ error: err.message }); } });

module.exports = router;

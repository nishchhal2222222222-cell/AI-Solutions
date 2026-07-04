const express = require('express');
const router = express.Router();
const Gallery = require('../models/GalleryImage');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => { try { const g = new Gallery(req.body); await g.save(); res.json(g); } catch (err) { res.status(500).json({ error: err.message }); } });
router.get('/', async (req, res) => { try { const items = await Gallery.find().sort({ createdAt: -1 }); res.json(items); } catch (err) { res.status(500).json({ error: err.message }); } });
router.put('/:id', protect, async (req, res) => { try { const updated = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updated); } catch (err) { res.status(500).json({ error: err.message }); } });
router.delete('/:id', protect, async (req, res) => { try { await Gallery.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (err) { res.status(500).json({ error: err.message }); } });

module.exports = router;

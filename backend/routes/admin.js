const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Contact = require('../models/ContactMessage');
const Demo = require('../models/DemoRequest');
const Event = require('../models/EventRegistration');
const Chat = require('../models/ChatMessage');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

// Admin stats
router.get('/stats', protect, async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const totalDemos = await Demo.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalChats = await Chat.countDocuments();
    res.json({ totalContacts, totalDemos, totalEvents, totalChats });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

// --- Profile endpoints ---

// Get admin profile
router.get('/profile', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update profile (name, username)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, username } = req.body;
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    if (name) admin.name = name;
    if (username) admin.username = username;
    await admin.save();
    const safe = admin.toObject(); delete safe.password;
    res.json({ message: 'Profile updated successfully', admin: safe });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update profile photo (base64 payload expected in body.image)
router.put('/profile/photo', protect, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'No image provided' });

    // Data URI -> base64
    const matches = image.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i);
    if (!matches) return res.status(400).json({ message: 'Invalid image format' });
    const mime = matches[1];
    const base64Data = matches[3];
    const buffer = Buffer.from(base64Data, 'base64');
    const maxBytes = 5 * 1024 * 1024;
    if (buffer.length > maxBytes) return res.status(400).json({ message: 'Image exceeds 5MB limit' });

    // Ensure uploads/admins exists
    const adminsDir = path.join(__dirname, '..', 'uploads', 'admins');
    fs.mkdirSync(adminsDir, { recursive: true });

    // Process and resize/crop to square 256x256 using Jimp
    const imageObj = await Jimp.read(buffer);
    const size = Math.min(imageObj.bitmap.width, imageObj.bitmap.height);
    imageObj.crop((imageObj.bitmap.width - size) / 2, (imageObj.bitmap.height - size) / 2, size, size);
    imageObj.cover(256, 256);

    const filename = `admin_${req.admin._id}_${Date.now()}.png`;
    const outPath = path.join(adminsDir, filename);
    await imageObj.writeAsync(outPath);

    // Update admin profileImage
    const admin = await Admin.findById(req.admin._id);
    admin.profileImage = `/uploads/admins/${filename}`;
    await admin.save();
    const safe = admin.toObject(); delete safe.password;
    res.json({ message: 'Profile picture updated successfully', admin: safe });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update password
router.put('/profile/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    const match = await bcrypt.compare(currentPassword, admin.password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    // Validate new password
    const pwOk = /(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword);
    if (!pwOk) return res.status(400).json({ message: 'New password does not meet complexity requirements' });

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

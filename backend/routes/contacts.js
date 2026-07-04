const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Contact = require('../models/ContactMessage');
const { protect } = require('../middleware/auth');

const sendContactReply = async ({ to, fullName, subject, message }) => {
  if (!to) throw new Error('No recipient');

  const transporterConfig = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } : undefined,
  };

  const hasCredentials = Boolean(transporterConfig.host && transporterConfig.auth?.user && transporterConfig.auth?.pass);
  if (!hasCredentials) {
    console.warn('Email credentials not configured; skipping delivery');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport(transporterConfig);
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@ai-solutions.com',
    to,
    subject: subject || 'Re: Your inquiry to AI-Solutions',
    text: `Hello ${fullName || ''},\n\n${message}\n\nBest regards,\nAI-Solutions Team`,
    html: `<p>Hello ${fullName || ''},</p><p>${String(message).replace(/\n/g, '<br/>')}</p><p>Best regards,<br/>AI-Solutions Team</p>`,
  };

  await transporter.sendMail(mailOptions);
  return { skipped: false };
}

// Create contact
router.post('/', [
  body('fullName').notEmpty(),
  body('email').isEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.json(contact);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: list
router.get('/', protect, async (req, res) => {
  try { const items = await Contact.find().sort({ createdAt: -1 }); res.json(items); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Update
router.put('/:id', protect, async (req, res) => {
  try { const updated = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updated); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete
router.delete('/:id', protect, async (req, res) => {
  try { await Contact.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: send a reply to a contact
router.post('/reply', protect, [
  body('contactId').notEmpty(),
  body('to').isEmail(),
  body('subject').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  try {
    const { contactId, to, subject, message } = req.body;
    const contact = await Contact.findById(contactId);
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });

    const fullName = contact.fullName || '';
    const mailResult = await sendContactReply({ to, fullName, subject, message });
    if (mailResult.skipped) return res.status(502).json({ success: false, message: 'Email delivery not configured' });

    const replyEntry = { message, sentAt: new Date(), sentBy: req.admin?.name || req.admin?.email || 'Admin' };
    contact.replies = contact.replies || [];
    contact.replies.push(replyEntry);
    await contact.save();

    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (err) {
    console.error('Reply send error', err);
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
});

module.exports = router;

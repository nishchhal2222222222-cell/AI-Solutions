const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Article = require('../models/Article');
const { protect } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'articles');
fs.mkdirSync(uploadsDir, { recursive: true });

const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:');
const decodeDataUrl = (dataUrl) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!matches) return null;
  return {
    mimeType: matches[1],
    data: Buffer.from(matches[2], 'base64'),
  };
};

const safeFileName = (name) => name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
const getUploadUrl = (req, fileName) => `${req.protocol}://${req.get('host')}/uploads/articles/${encodeURIComponent(fileName)}`;

const saveAttachmentFromDataUrl = async (attachment, req) => {
  if (!attachment?.fileUrl || !isDataUrl(attachment.fileUrl)) return attachment;
  const decoded = decodeDataUrl(attachment.fileUrl);
  if (!decoded) return attachment;

  const originalName = attachment.fileName || `attachment.${decoded.mimeType.split('/')[1] || 'bin'}`;
  const fileName = `${Date.now()}-${safeFileName(originalName)}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(filePath, decoded.data);
  return {
    fileName: originalName,
    fileType: decoded.mimeType,
    fileUrl: getUploadUrl(req, fileName),
  };
};

const normalizeAttachmentUrl = (attachment, req) => {
  if (!attachment || typeof attachment !== 'object') return attachment;
  if (attachment.fileUrl && attachment.fileUrl.startsWith('/')) {
    return {
      ...attachment,
      fileUrl: `${req.protocol}://${req.get('host')}${attachment.fileUrl}`,
    };
  }
  return attachment;
};

const processAttachment = async (attachment, req) => {
  if (!attachment) return attachment;
  if (isDataUrl(attachment.fileUrl)) {
    return await saveAttachmentFromDataUrl(attachment, req);
  }
  return normalizeAttachmentUrl(attachment, req);
};

const generateSlug = (text) => {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

router.post('/', protect, [body('title').notEmpty().withMessage('Title is required')], async (req, res) => {
  if (!req.body.slug || !String(req.body.slug).trim()) {
    req.body.slug = generateSlug(req.body.title);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }

  if (!req.body.slug) {
    return res.status(400).json({ error: 'Slug is required or could not be generated from title' });
  }

  try {
    if (req.body.attachment) {
      req.body.attachment = await processAttachment(req.body.attachment, req);
    }
    const article = new Article(req.body);
    await article.save();
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => { try { const items = await Article.find().sort({ createdAt: -1 }); res.json(items); } catch (err) { res.status(500).json({ error: err.message }); } });
router.get('/:slug', async (req, res) => {
  try {
    const item = await Article.findOne({ slug: req.params.slug });
    if (!item) return res.status(404).json({});
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug/attachment', async (req, res) => {
  try {
    const item = await Article.findOne({ slug: req.params.slug });
    if (!item?.attachment?.fileUrl) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const url = item.attachment.fileUrl;
    const fileName = safeFileName(item.attachment.fileName || 'attachment');

    if (url.startsWith('data:')) {
      const decoded = decodeDataUrl(url);
      if (!decoded) return res.status(400).json({ error: 'Invalid attachment data' });
      res.setHeader('Content-Type', item.attachment.fileType || decoded.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(decoded.data);
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        const localPath = parsed.pathname.replace(/^\/+/, '');
        const absolutePath = path.join(__dirname, '..', localPath);
        if (fs.existsSync(absolutePath)) {
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
          return res.sendFile(absolutePath);
        }
      } catch {
        // fall through to redirect if URL cannot be resolved locally
      }
    }

    if (url.startsWith('/')) {
      const absolutePath = path.join(__dirname, '..', url.replace(/^\//, ''));
      if (fs.existsSync(absolutePath)) {
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return res.sendFile(absolutePath);
      }
    }

    return res.redirect(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    if (req.body.attachment) {
      req.body.attachment = await processAttachment(req.body.attachment, req);
    }
    const updated = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/:id', protect, async (req, res) => { try { await Article.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (err) { res.status(500).json({ error: err.message }); } });

module.exports = router;

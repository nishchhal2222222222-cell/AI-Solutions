const express = require('express');
const router = express.Router();
const Chat = require('../models/ChatMessage');

const normalizeText = (value) => (value || '').toLowerCase().trim();
const ARTICLE_KEYWORD_PATTERN = /(?:\babout\s+article(?:s)?\b|\btell\s+me\s+about\s+article(?:s)?\b|\barticle(?:s)?\b|\bblog(?:s)?\b|\bresource(?:s)?\b|\bdocument(?:s)?\b|\bpdf\b|\bresearch(?:\s+papers?)?\b|explainable ai|cyber defence|cybersecurity(?:\s+article(?:s)?)?|\bai\s+article(?:s)?\b|\bdownload(?:ing)?\s+pdf\b)/;

const resolveSectionFromText = (value) => {
  const text = normalizeText(value);
  if (/\b(hero|home|landing)\b/.test(text)) return 'home';
  if (/\b(about|expertise|delivery|roi|mission|trusted)\b/.test(text)) return 'about';
  if (/\b(service|services|assistant|analytics|security|multichannel|integration|engagement|iteration)\b/.test(text)) return 'services';
  if (/\b(event|join|webinar|summit|conference|register|session)\b/.test(text)) return 'events';
  if (/\b(gallery|project|portfolio|showcase|image|visual)\b/.test(text)) return 'gallery';
  if (ARTICLE_KEYWORD_PATTERN.test(text)) return 'articles';
  if (/\b(review|ratings|feedback|testimonial|customer|trust)\b/.test(text)) return 'ratings';
  if (/\b(contact|reach out|talk|connect|team|consult|sales)\b/.test(text)) return 'contact';
  return 'home';
};

const detectIntent = (value) => {
  const text = normalizeText(value);
  if (/\b(hi|hello|hey|hiya|good morning|good afternoon|good evening)\b/.test(text)) return 'greeting';
  if (/\b(help|assist|support|guide|need help|what can you do)\b/.test(text)) return 'help';
  if (/\b(price|pricing|cost|plan|subscription|fee|quote|estimate|budget)\b/.test(text)) return 'pricing';
  if (/\b(about|expertise|delivery|roi|mission|company|trusted)\b/.test(text)) return 'about';
  if (/\b(service|services|assistant|analytics|security|multichannel|integration|engagement|iteration)\b/.test(text)) return 'services';
  if (/\b(event|join|webinar|summit|conference|register|session)\b/.test(text)) return 'events';
  if (/\b(gallery|project|portfolio|showcase|image|visual)\b/.test(text)) return 'gallery';
  if (ARTICLE_KEYWORD_PATTERN.test(text)) return 'articles';
  if (/\b(review|ratings|feedback|testimonial|customer|trust)\b/.test(text)) return 'ratings';
  if (/\b(contact|reach out|talk|connect|team|consult|sales)\b/.test(text)) return 'contact';
  return 'general';
};

const ACTION_MAP = {
  services: [{ label: 'Open Services', section: 'services' }],
  events: [{ label: 'Join Event', section: 'events' }],
  gallery: [{ label: 'Open Gallery', section: 'gallery' }],
  articles: [
    { label: 'View Articles', section: 'articles' },
    { label: 'Download PDFs', section: 'articles' },
    { label: 'Featured Article', section: 'articles' },
    { label: 'Search Articles', section: 'articles' },
  ],
  ratings: [{ label: 'Read Reviews', section: 'ratings' }],
  contact: [{ label: 'Contact Team', section: 'contact' }],
};

const getResponseData = (message, history = []) => {
  const intent = detectIntent(message);
  const section = resolveSectionFromText(message);
  const fallback = {
    response: 'I’m here to help with services, events, gallery, articles, reviews, or contact options. Which area would you like to explore?',
    intent: 'general',
    section,
    actions: [{ label: 'Services', section: 'services' }, { label: 'Contact Team', section: 'contact' }],
  };

  if (intent === 'greeting') {
    return {
      response: 'Hello! I’m your AI-Solutions assistant. I can help you explore services, events, gallery, articles, reviews, or contact options. What would you like to do?',
      intent,
      section,
      actions: [{ label: 'Explore Services', section: 'services' }, { label: 'See Events', section: 'events' }, { label: 'Open Gallery', section: 'gallery' }],
    };
  }

  if (intent === 'help') {
    return {
      response: 'I can guide you through the website, recommend the best section, or help you contact our team. Which experience would you like?',
      intent,
      section,
      actions: [{ label: 'Services', section: 'services' }, { label: 'Contact Team', section: 'contact' }],
    };
  }

  if (intent === 'pricing') {
    return {
      response: 'Pricing begins at $19/month for small teams and scales for enterprise needs. Would you like a plan comparison or a custom quote?',
      intent,
      section,
      actions: [{ label: 'Contact Team', section: 'contact' }],
    };
  }

  if (intent === 'about') {
    return {
      response: 'AI-Solutions delivers trusted expertise, rapid delivery, and ROI-focused AI systems. Would you like to learn about services or upcoming events?',
      intent,
      section,
      actions: [{ label: 'Explore Services', section: 'services' }, { label: 'See Events', section: 'events' }],
    };
  }

  if (intent === 'services') {
    return {
      response: 'We provide:\n• AI Assistants\n• Customer Engagement\n• Analytics\n• Security\n• Multichannel support\n• Fast iteration\nWould you like to explore our services?',
      intent,
      section,
      actions: ACTION_MAP.services,
    };
  }

  if (intent === 'events') {
    return {
      response: 'We currently have upcoming events, sessions, and registration options available. Would you like to view events?',
      intent,
      section,
      actions: ACTION_MAP.events,
    };
  }

  if (intent === 'gallery') {
    return {
      response: 'Here are our latest projects and visual case studies. Would you like to open the gallery?',
      intent,
      section,
      actions: ACTION_MAP.gallery,
    };
  }

  if (intent === 'articles') {
    return {
      response: '📚 Articles & Resources\nYou can browse AI articles, research, and downloadable PDFs here.\nTry topics like Explainable AI, Cyber Defence, or cybersecurity articles.',
      intent,
      section,
      actions: ACTION_MAP.articles,
    };
  }

  if (intent === 'ratings') {
    return {
      response: 'Our reviews highlight quality, delivery, and customer satisfaction. Would you like to see testimonials or share feedback?',
      intent,
      section,
      actions: ACTION_MAP.ratings,
    };
  }

  if (intent === 'contact') {
    return {
      response: 'I can connect you with our team or help book a meeting. Which option works best for you?',
      intent,
      section,
      actions: ACTION_MAP.contact,
    };
  }

  return fallback;
};

const saveChatMessage = async (payload) => {
  const doc = new Chat(payload);
  await doc.save();
  return doc;
};

const saveLeadMessage = async (payload) => {
  const doc = new Chat({
    sessionId: payload.sessionId,
    user: 'lead',
    message: `Lead: ${payload.name || 'N/A'} | ${payload.email || 'N/A'} | ${payload.phone || 'N/A'} | ${payload.interest || 'N/A'}`,
    response: `Thanks ${payload.name || 'there'}! Our team will review your request and reach out via ${payload.email || 'your email'} soon.`,
    meta: { intent: 'lead', section: 'contact', lead: { name: payload.name, email: payload.email, phone: payload.phone, interest: payload.interest } },
  });
  await doc.save();
  return doc;
};

router.post('/message', async (req, res) => {
  try {
    const { sessionId, user, message, history } = req.body;
    const result = getResponseData(message, Array.isArray(history) ? history : []);
    const doc = await saveChatMessage({ sessionId, user, message, response: result.response, meta: { intent: result.intent, section: result.section, actions: result.actions } });
    res.json({ response: result.response, meta: { intent: result.intent, section: result.section, actions: result.actions }, chat: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/lead', async (req, res) => {
  try {
    const { sessionId, name, email, phone, interest } = req.body;
    const doc = await saveLeadMessage({ sessionId, name, email, phone, interest });
    res.json({ response: doc.response, meta: doc.meta, chat: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    const items = await Chat.find({ sessionId }).sort({ createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { sessionId, user, message, history } = req.body;
    const result = getResponseData(message, Array.isArray(history) ? history : []);
    const doc = await saveChatMessage({ sessionId, user, message, response: result.response, meta: { intent: result.intent, section: result.section, actions: result.actions } });
    res.json({ response: result.response, meta: { intent: result.intent, section: result.section, actions: result.actions }, chat: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

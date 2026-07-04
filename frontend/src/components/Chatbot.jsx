import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import API from '../config/api'

const CHAT_STORAGE_KEY = 'aiSolutionsChatState'
const QUICK_ACTIONS = ['Services', 'Events', 'Gallery', 'Articles', 'Contact']
const SECTION_HINTS = {
  home: 'Need help exploring the website?',
  about: 'I can explain our expertise, delivery speed, and ROI focus.',
  services: 'I can guide you through AI Assistants, Analytics, and more.',
  events: 'Want help registering for events?',
  gallery: 'Looking for project examples?',
  articles: 'Want suggested articles or downloads?',
  ratings: 'Want customer reviews or feedback?',
  contact: 'Need help choosing a solution?',
}
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
}

const createSessionId = () => {
  const stored = localStorage.getItem('chatSessionId')
  if (stored) return stored
  const id = `chat_${Math.random().toString(36).slice(2, 12)}`
  localStorage.setItem('chatSessionId', id)
  return id
}

const normalizeText = (value) => (value || '').toLowerCase().trim()
const ARTICLE_KEYWORD_PATTERN = /(?:\babout\s+article(?:s)?\b|\btell\s+me\s+about\s+article(?:s)?\b|\barticle(?:s)?\b|\bblog(?:s)?\b|\bresource(?:s)?\b|\bdocument(?:s)?\b|\bpdf\b|\bresearch(?:\s+papers?)?\b|explainable ai|cyber defence|cybersecurity(?:\s+article(?:s)?)?|\bai\s+article(?:s)?\b|\bdownload(?:ing)?\s+pdf\b)/

const resolveSectionFromText = (value) => {
  const text = normalizeText(value)
  if (/\b(hero|home|landing)\b/.test(text)) return 'home'
  if (/\b(about|expertise|delivery|roi|mission|trusted)\b/.test(text)) return 'about'
  if (/\b(service|services|assistant|analytics|security|multichannel|integration|engagement|iteration)\b/.test(text)) return 'services'
  if (/\b(event|join|webinar|summit|conference|register|session)\b/.test(text)) return 'events'
  if (/\b(gallery|project|portfolio|showcase|image|visual)\b/.test(text)) return 'gallery'
  if (ARTICLE_KEYWORD_PATTERN.test(text)) return 'articles'
  if (/\b(review|ratings|feedback|testimonial|customer|trust)\b/.test(text)) return 'ratings'
  if (/\b(contact|reach out|talk|connect|team|consult|sales)\b/.test(text)) return 'contact'
  return 'home'
}

const detectIntent = (value) => {
  const text = normalizeText(value)
  if (/\b(hi|hello|hey|hiya|good morning|good afternoon|good evening)\b/.test(text)) return 'greeting'
  if (/\b(help|assist|support|guide|need help|what can you do)\b/.test(text)) return 'help'
  if (/\b(price|pricing|cost|plan|subscription|fee|quote|estimate|budget)\b/.test(text)) return 'pricing'
  if (/\b(about|expertise|delivery|roi|mission|company|trusted)\b/.test(text)) return 'about'
  if (/\b(service|services|assistant|analytics|security|multichannel|integration|engagement|iteration)\b/.test(text)) return 'services'
  if (/\b(event|join|webinar|summit|conference|register|session)\b/.test(text)) return 'events'
  if (/\b(gallery|project|portfolio|showcase|image|visual)\b/.test(text)) return 'gallery'
  if (ARTICLE_KEYWORD_PATTERN.test(text)) return 'articles'
  if (/\b(review|ratings|feedback|testimonial|customer|trust)\b/.test(text)) return 'ratings'
  if (/\b(contact|reach out|talk|connect|team|consult|sales)\b/.test(text)) return 'contact'
  return 'general'
}

const formatEventDate = (dateString) => {
  if (!dateString) return 'TBA'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'TBA'
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

const formatEventSummary = (events) => {
  if (!Array.isArray(events) || events.length === 0) return null
  const sorted = [...events].sort((a, b) => new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0))
  const items = sorted.slice(0, 3).map((event, index) => {
    const title = event.title || event.name || 'Event'
    const dateStr = formatEventDate(event.date || event.createdAt)
    const location = event.location ? ` @ ${event.location}` : ''
    return `${index + 1}. ${title} — ${dateStr}${location}`
  })
  const remaining = events.length - items.length
  const extra = remaining > 0 ? `\n…and ${remaining} more upcoming event${remaining > 1 ? 's' : ''}.` : ''
  return `${items.join('\n')}${extra}`
}

const getAssistantResponse = (intent, section, events = []) => {
  const sectionLabel = section === 'home' ? 'our website' : `the ${section} section`
  const eventSummary = formatEventSummary(events)
  const eventCount = events.length
  switch (intent) {
    case 'greeting':
      return {
        response: 'Hello! I’m your AI-Solutions assistant. I can help you explore services, events, gallery, articles, reviews, or contact options. What would you like to do?',
        actions: [{ label: 'Explore Services', section: 'services' }, { label: 'See Events', section: 'events' }, { label: 'Open Gallery', section: 'gallery' }],
      }
    case 'help':
      return {
        response: 'I can guide you through the website, recommend the best section, or help you contact our team. Which option would you like?',
        actions: [{ label: 'Services', section: 'services' }, { label: 'Contact Team', section: 'contact' }],
      }
    case 'pricing':
      return {
        response: 'Pricing begins at $19/mo for small teams and scales for enterprise programs. Would you like a plan comparison or a custom quote?',
        actions: [{ label: 'Contact Team', section: 'contact' }],
      }
    case 'about':
      return {
        response: 'AI-Solutions delivers trusted expertise, rapid delivery, and ROI-focused AI systems. Would you like to learn about services or upcoming events?',
        actions: [{ label: 'Explore Services', section: 'services' }, { label: 'See Events', section: 'events' }],
      }
    case 'services':
      return {
        response: 'We provide:\n• AI Assistants\n• Customer Engagement\n• Analytics\n• Security\n• Multichannel support\n• Fast iteration\nWould you like to explore our services?',
        actions: ACTION_MAP.services,
      }
    case 'events':
      return {
        response: eventSummary
          ? `We currently have ${eventCount} upcoming event${eventCount === 1 ? '' : 's'}. Here are the next ${Math.min(3, eventCount)}:\n${eventSummary}\n\nWould you like to view the full events page or register for one of these sessions?`
          : 'We currently have upcoming events, sessions, and registration options available. Would you like to view events?',
        actions: ACTION_MAP.events,
      }
    case 'gallery':
      return {
        response: 'Here are our latest projects and visual case studies. Would you like to open the gallery?',
        actions: ACTION_MAP.gallery,
      }
    case 'articles':
      return {
        response: '📚 Articles & Resources\nYou can browse AI articles, research, and downloadable PDFs here.\nTry topics like Explainable AI, Cyber Defence, or cybersecurity articles.',
        actions: ACTION_MAP.articles,
      }
    case 'ratings':
      return {
        response: 'Our reviews highlight quality, delivery, and customer satisfaction. Would you like to see testimonials or share feedback?',
        actions: ACTION_MAP.ratings,
      }
    case 'contact':
      return {
        response: 'I can connect you with our team or help book a meeting. Which option works best for you?',
        actions: ACTION_MAP.contact,
      }
    default:
      return {
        response: `I’m here to help with ${sectionLabel}. Ask about services, events, gallery, articles, reviews, or contact options, and I’ll guide you there.`,
        actions: [{ label: 'Services', section: 'services' }, { label: 'Contact', section: 'contact' }],
      }
  }
}

const Chatbot = forwardRef(function Chatbot(props, ref) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [isMinimized, setIsMinimized] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showLeadPrompt, setShowLeadPrompt] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', interest: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [eventItems, setEventItems] = useState([])
  const [sessionMemory, setSessionMemory] = useState({ name: '', lastTopic: 'home', visitedSections: [], interest: '', timestamp: new Date().toISOString() })
  const [interactionCount, setInteractionCount] = useState(0)
  const [currentSection, setCurrentSection] = useState('home')
  const [sectionHint, setSectionHint] = useState(SECTION_HINTS.home)
  const [hasRetried, setHasRetried] = useState(false)

  const sessionId = useRef(createSessionId()).current
  const containerRef = useRef(null)
  const lastUserMessageRef = useRef('')

  useImperativeHandle(ref, () => ({ open: () => setIsMinimized(false) }))

  const formatTime = (d) => {
    if (!d) return ''
    const date = new Date(d)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  const saveLocalState = (state) => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.warn('Unable to save chat state', err)
    }
  }

  const loadLocalState = () => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const resolveSectionFromHash = () => {
    if (typeof window === 'undefined') return 'home'
    const hash = window.location.hash.replace('#', '').toLowerCase() || 'home'
    return ['hero', 'home', 'about', 'services', 'articles', 'events', 'gallery', 'ratings', 'contact'].includes(hash) ? hash : 'home'
  }

  const handleNavigate = (section) => {
    if (!section) return
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setIsMinimized(true)
  }

  const createBotMessage = (text, meta = {}) => ({ from: 'bot', message: text, time: new Date().toISOString(), meta })
  const createUserMessage = (text) => ({ from: 'user', message: text, time: new Date().toISOString() })

  const maybeUpdateSessionMemory = (intent, section) => {
    setSessionMemory(prev => {
      const visitedSections = Array.from(new Set([...prev.visitedSections, section]))
      const interest = prev.interest || (intent === 'services' ? 'AI Assistants' : intent === 'events' ? 'Events' : intent === 'gallery' ? 'Gallery' : intent === 'articles' ? 'Articles' : intent === 'ratings' ? 'Reviews' : intent === 'contact' ? 'Contact' : prev.interest)
      return {
        ...prev,
        lastTopic: intent,
        visitedSections,
        interest,
        timestamp: new Date().toISOString(),
      }
    })
  }

  const buildLocalReply = (message, history = []) => {
    const intent = detectIntent(message)
    const section = resolveSectionFromText(message)
    const response = getAssistantResponse(intent, section, eventItems)
    return { ...response, intent, section }
  }

  const handleRetry = async (payload, localResponse) => {
    try {
      const res = await API.post('/chat/message', payload)
      return { response: res.data?.response || localResponse.response, meta: res.data?.meta || localResponse }
    } catch {
      if (!hasRetried) {
        setHasRetried(true)
        await new Promise(resolve => setTimeout(resolve, 900))
        return handleRetry(payload, localResponse)
      }
      throw new Error('Backend unavailable')
    }
  }

  const send = async () => {
    const trimmedText = text.trim()
    if (!trimmedText || isSending) return
    if (trimmedText.toLowerCase() === lastUserMessageRef.current.toLowerCase()) return

    lastUserMessageRef.current = trimmedText
    const newUserMessage = createUserMessage(trimmedText)
    setMessages(prev => [...prev, newUserMessage])
    setText('')
    setIsSending(true)
    setErrorMessage('')
    setInteractionCount(prev => prev + 1)

    const intent = detectIntent(trimmedText)
    const section = resolveSectionFromText(trimmedText) || currentSection
    maybeUpdateSessionMemory(intent, section)
    setCurrentSection(section)

    const payloadHistory = [...messages, newUserMessage].map(({ from, message }) => ({ from, message }))
    const localResponse = buildLocalReply(trimmedText, payloadHistory)

    const payload = {
      sessionId,
      user: 'visitor',
      message: trimmedText,
      section,
      intent,
      history: payloadHistory,
    }

    setMessages(prev => [...prev, createBotMessage('', { typing: true })])
    setIsTyping(true)

    try {
      const result = await handleRetry(payload, localResponse)
      const botMessage = createBotMessage(result.response, { intent: result.meta?.intent || intent, section: result.meta?.section || section, actions: result.meta?.actions || ACTION_MAP[result.meta?.section || section] || [] })
      setMessages(prev => {
        const updated = [...prev]
        if (updated.length && updated[updated.length - 1].from === 'bot' && updated[updated.length - 1].meta?.typing) {
          updated[updated.length - 1] = botMessage
        } else {
          updated.push(botMessage)
        }
        return updated
      })
    } catch (err) {
      setErrorMessage('Temporary issue. Please try again.')
      const fallback = createBotMessage(localResponse.response, { intent: localResponse.intent, section: localResponse.section, actions: localResponse.actions })
      setMessages(prev => {
        const updated = [...prev]
        if (updated.length && updated[updated.length - 1].from === 'bot' && updated[updated.length - 1].meta?.typing) {
          updated[updated.length - 1] = fallback
        } else {
          updated.push(fallback)
        }
        return updated
      })
    } finally {
      setIsTyping(false)
      setIsSending(false)
    }
  }

  const handleQuickReply = (value) => {
    setText(value)
    setTimeout(() => send(), 160)
  }

  const handleLeadSubmit = async () => {
    if (leadSubmitting) return
    setLeadSubmitting(true)
    setErrorMessage('')
    try {
      const payload = { sessionId, ...leadForm }
      const res = await API.post('/chat/lead', payload)
      const botMessage = createBotMessage(res.data?.response || 'Thanks! Our team will contact you shortly.', { intent: 'lead', section: 'contact' })
      setMessages(prev => [...prev, botMessage])
      setShowLeadForm(false)
      setShowLeadPrompt(false)
      setLeadForm({ name: '', email: '', phone: '', interest: '' })
      setSessionMemory(prev => ({ ...prev, interest: leadForm.interest || prev.interest }))
    } catch {
      setErrorMessage('Temporary issue. Please try again.')
    } finally {
      setLeadSubmitting(false)
    }
  }

  useEffect(() => {
    const stored = loadLocalState()
    const section = resolveSectionFromHash()
    setCurrentSection(section)
    setSectionHint(SECTION_HINTS[section] || SECTION_HINTS.home)

    const fetchEvents = async () => {
      try {
        const res = await API.get('/event-items')
        setEventItems(Array.isArray(res.data) ? res.data : [])
      } catch {
        setEventItems([])
      }
    }

    const fetchHistory = async () => {
      try {
        const res = await API.get('/chat/history', { params: { sessionId } })
        if (Array.isArray(res.data) && res.data.length) {
          const loaded = res.data.map(item => ({
            from: item.user === 'visitor' ? 'user' : 'bot',
            message: item.user === 'visitor' ? item.message : item.response,
            time: item.createdAt,
            meta: item.meta || {},
          }))
          setMessages(loaded)
          setInteractionCount(loaded.filter(m => m.from === 'user').length)
        }
      } catch {
        // ignore history fetch failures
      }
    }

    fetchEvents()

    if (stored) {
      if (stored.messages) setMessages(stored.messages)
      if (stored.sessionMemory) setSessionMemory(stored.sessionMemory)
      if (typeof stored.interactionCount === 'number') setInteractionCount(stored.interactionCount)
      if (stored.currentSection) setCurrentSection(stored.currentSection)
      if (stored.showLeadPrompt) setShowLeadPrompt(stored.showLeadPrompt)
      return
    }

    fetchHistory()
  }, [sessionId])

  useEffect(() => {
    saveLocalState({ messages, sessionMemory, interactionCount, currentSection, showLeadPrompt })
    scrollToBottom()
  }, [messages, sessionMemory, interactionCount, currentSection, showLeadPrompt])

  useEffect(() => {
    if (interactionCount >= 3 && !showLeadPrompt && !showLeadForm) {
      setShowLeadPrompt(true)
    }
  }, [interactionCount, showLeadPrompt, showLeadForm])

  useEffect(() => {
    if (!isMinimized) {
      const section = resolveSectionFromHash()
      setSectionHint(SECTION_HINTS[section] || SECTION_HINTS.home)
    }
  }, [isMinimized])

  return (
    <>
      <style>{`.chat-scrollbar::-webkit-scrollbar { width: 10px; }
      .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.45); border-radius: 9999px; }
      .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #7C3AED; }
      .chat-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.45) transparent; }`}</style>

      {!isMinimized && (
        <div className="fixed right-4 left-4 bottom-6 z-50 mx-auto w-[min(95vw,24rem)] transform transition-all duration-300 ease-out md:right-6 md:left-auto md:bottom-4">
          <div className="relative flex h-[min(92vh,1040px)] max-h-[calc(100vh-40px)] flex-col overflow-visible rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(6,12,34,0.96)] shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-lg">
            <button onClick={() => setIsMinimized(prev => !prev)} aria-label="Toggle chat" title="Close chat" className="absolute -left-12 bottom-4 h-14 w-14 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center shadow-[0_20px_50px_rgba(124,58,237,0.35)] hover:scale-105 transition-transform z-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                <path d="M12 3C7 3 3 6.5 3 11c0 2.5 1 4.6 2.7 6.2L5 21l4.2-1.7c.8.2 1.7.3 2.8.3 5 0 9-3.5 9-8.1S17 3 12 3z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 10.5h.01M11.5 10.5h.01M14.5 10.5h.01" strokeLinecap="round" />
              </svg>
            </button>

            <div className="flex items-center justify-between p-3 text-white rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #1E40FF, #2563EB, #0EA5E9)' }}>
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)]">
                  <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]"></span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M8 9h8M8 13h6" strokeLinecap="round" />
                    <path d="M12 3a9 9 0 00-9 9v3a3 3 0 003 3h3l3 3 3-3h3a3 3 0 003-3v-3a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold leading-4 text-white">AI Solutions Assistant</div>
                  <div className="text-xs text-[rgba(255,255,255,0.85)] flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsMinimized(true)} aria-label="Minimize chat" className="text-white bg-[rgba(255,255,255,0.15)] p-2 rounded-xl hover:bg-[rgba(255,255,255,0.22)] transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 chat-scrollbar bg-[rgba(8,15,40,0.94)]">
              <div className="space-y-4">
                {messages.length === 0 && !isTyping && (
                  <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,22,50,0.92)] p-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
                    <div className="text-sm font-semibold text-white">Hi 👋 Welcome to AI-Solutions.</div>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-[rgba(255,255,255,0.85)]">
                      <p>I can help you:</p>
                      <ul className="list-disc pl-5">
                        <li>Explore services</li>
                        <li>Find events</li>
                        <li>Browse gallery</li>
                        <li>Read articles</li>
                        <li>Contact team</li>
                        <li>Get recommendations</li>
                      </ul>
                      <p>{sectionHint}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {QUICK_ACTIONS.map((item) => (
                        <button key={item} onClick={() => handleQuickReply(item)} className="text-sm px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] text-white hover:bg-[rgba(255,255,255,0.12)] transition focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={`${m.from}-${i}`} className={`flex gap-3 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.from !== 'user' && (
                      <div className="flex-shrink-0">
                        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white flex items-center justify-center text-sm font-semibold shadow-[0_10px_30px_rgba(124,58,237,0.35)]">AI</div>
                      </div>
                    )}
                    <div className={`max-w-[78%] px-4 py-3 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.20)] transition ${m.from === 'user' ? 'bg-[linear-gradient(135deg,#2563EB,#1D4ED8)] text-white rounded-br-none shadow-[0_12px_32px_rgba(37,99,235,0.35)]' : 'bg-[linear-gradient(180deg,#111827,#1F2937)] text-[#F9FAFB] rounded-bl-none border border-[rgba(255,255,255,0.06)]'}`}>
                      <div className="whitespace-pre-wrap leading-6">{m.message}</div>
                      {Array.isArray(m.meta?.actions) && m.meta.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.meta.actions.map((action, idx) => (
                            <button key={idx} onClick={() => handleNavigate(action.section)} className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-3 py-1 text-[13px] text-white transition hover:bg-[rgba(255,255,255,0.12)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className={`text-[11px] ${m.from === 'user' ? 'text-[rgba(255,255,255,0.75)]' : 'text-[rgba(255,255,255,0.55)]'} mt-2 text-right`}>
                        {formatTime(m.time)}
                      </div>
                    </div>
                    {m.from === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="h-9 w-9 rounded-2xl bg-[rgba(37,99,235,0.12)] text-white flex items-center justify-center text-sm font-semibold shadow-[0_10px_30px_rgba(37,99,235,0.25)]">U</div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0">
                      <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white flex items-center justify-center text-sm font-semibold shadow-[0_10px_30px_rgba(124,58,237,0.35)]">AI</div>
                    </div>
                    <div className="rounded-3xl bg-[rgba(17,24,39,0.95)] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.20)] border border-[rgba(255,255,255,0.06)]">
                      <div className="text-sm font-medium text-white">AI-Solutions is thinking…</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/30 animate-pulse"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-white/30 animate-pulse delay-75"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-white/30 animate-pulse delay-150"></span>
                      </div>
                    </div>
                  </div>
                )}

                {showLeadPrompt && !showLeadForm && (
                  <div className="rounded-3xl border border-[rgba(255,255,255,0.10)] bg-[rgba(15,23,47,0.95)] p-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
                    <div className="text-sm font-semibold">Looks like you're exploring solutions.</div>
                    <div className="mt-2 text-sm text-[rgba(255,255,255,0.85)]">Would you like our team to contact you?</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => setShowLeadForm(true)} className="rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]">Book Meeting</button>
                      <button onClick={() => setShowLeadForm(true)} className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm text-white transition hover:bg-[rgba(255,255,255,0.12)]">Contact Team</button>
                    </div>
                  </div>
                )}

                {showLeadForm && (
                  <div className="rounded-3xl border border-[rgba(255,255,255,0.10)] bg-[rgba(15,23,47,0.95)] p-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
                    <div className="font-semibold">Share your contact details</div>
                    <div className="mt-3 space-y-3">
                      {['name', 'email', 'phone', 'interest'].map((field) => (
                        <label key={field} className="block text-[13px] text-[rgba(255,255,255,0.80)]">
                          {field === 'interest' ? 'Interest' : field.charAt(0).toUpperCase() + field.slice(1)}
                          <input
                            type={field === 'email' ? 'email' : 'text'}
                            name={field}
                            value={leadForm[field]}
                            onChange={(e) => setLeadForm(prev => ({ ...prev, [field]: e.target.value }))}
                            className="mt-2 w-full rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-white placeholder-[#94A3B8] focus:border-[#22C55E] focus:outline-none focus:ring-4 focus:ring-[rgba(34,197,94,0.18)]"
                            placeholder={field === 'interest' ? 'Example: AI Assistants, Security, or Event registration' : ''}
                            aria-label={field}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={handleLeadSubmit} disabled={leadSubmitting} className="rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50">Send Info</button>
                      <button onClick={() => setShowLeadForm(false)} className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm text-white transition hover:bg-[rgba(255,255,255,0.12)]">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 p-4 border-t border-[rgba(255,255,255,0.1)] bg-[rgba(14,23,55,0.95)] rounded-b-3xl">
              <div className="mb-3 flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((item) => (
                  <button key={item} onClick={() => handleQuickReply(item)} className="text-[13px] rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-white transition hover:bg-[rgba(255,255,255,0.12)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  className="flex-1 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-[#94A3B8] focus:border-[#22C55E] focus:outline-none focus:ring-4 focus:ring-[rgba(34,197,94,0.18)]"
                  placeholder="Ask a question or say hello..."
                  aria-label="Chat input"
                />
                <button onClick={send} disabled={isSending || !text.trim()} className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563EB,#7C3AED)] px-4 py-3 text-white text-sm font-semibold shadow-[0_12px_35px_rgba(124,58,237,0.40)] transform transition duration-200 hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {errorMessage && <div className="mt-2 text-xs text-rose-300">{errorMessage}</div>}
            </div>
          </div>
        </div>
      )}

      {isMinimized && (
        <button onClick={() => setIsMinimized(false)} className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-[0_20px_50px_rgba(124,58,237,0.35)] ring-1 ring-white/10 hover:scale-105 transition-transform duration-200" aria-label="Open chat">
          <span className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
          <span className="relative flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
              <path d="M12 3C7 3 3 6.5 3 11c0 2.5 1 4.6 2.7 6.2L5 21l4.2-1.7c.8.2 1.7.3 2.8.3 5 0 9-3.5 9-8.1S17 3 12 3z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.5 10.5h.01M11.5 10.5h.01M14.5 10.5h.01" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      )}
    </>
  )
})

export default Chatbot

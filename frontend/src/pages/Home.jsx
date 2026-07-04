import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
const Chatbot = lazy(() => import('../components/Chatbot'))
import ContactForm from '../components/ContactForm'
import EventForm from '../components/EventForm'
import FeedbackForm from '../components/FeedbackForm'
import API from '../config/api'
import mapsIcon from '../assets/google-maps-logo-round-circle.svg'
import calendarIcon from '../assets/daily-calendar.svg'

export default function Home(){
  const [articles, setArticles] = useState([])
  const [gallery, setGallery] = useState([])
  const [feedback, setFeedback] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [reviewSort, setReviewSort] = useState('Most helpful')
  const [showAllGallery, setShowAllGallery] = useState(false)
  const [activeGalleryItem, setActiveGalleryItem] = useState(null)
  const [showAllEvents, setShowAllEvents] = useState(false)
  const [openingSlug, setOpeningSlug] = useState(null)
  const [docOpenError, setDocOpenError] = useState('')
  const navigate = useNavigate()
  const chatbotRef = useRef(null)

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const backendOrigin = (() => {
    try {
      return new URL(apiBase).origin
    } catch {
      return 'http://localhost:5000'
    }
  })()

  const resolveAttachmentUrl = (attachment, slug) => {
    if (!attachment?.fileUrl) return null
    const rawUrl = attachment.fileUrl
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl
    if (rawUrl.startsWith('/')) return `${backendOrigin}${rawUrl}`
    if (rawUrl.startsWith('data:')) return `${backendOrigin}/api/articles/${slug}/attachment`
    return `${backendOrigin}/${rawUrl}`
  }

  const openDocument = (article) => {
    setDocOpenError('')
    setOpeningSlug(article.slug)

    const attachment = article.attachment
    const fileUrl = resolveAttachmentUrl(attachment, article.slug)
    if (!fileUrl) {
      setDocOpenError('Document URL is missing or invalid.')
      setOpeningSlug(null)
      return
    }

    const ext = (attachment?.fileName || fileUrl).split('.').pop().split(/[#?]/)[0].toLowerCase()
    if (ext === 'pdf') {
      window.open(fileUrl, '_blank')
    } else if (ext === 'doc' || ext === 'docx') {
      const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`
      window.open(viewerUrl, '_blank')
    } else {
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = attachment?.fileName || ''
      a.target = '_blank'
      a.rel = 'noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    window.setTimeout(() => setOpeningSlug(null), 300)
  }

  const handleDownload = (article) => {
    if (!article?.slug) return
    const downloadUrl = `${backendOrigin}/api/articles/${article.slug}/attachment`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = article.attachment?.fileName || `${article.slug}.pdf`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleTalkToSales = () => {
    if (chatbotRef.current) {
      chatbotRef.current.open()
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, galleryRes, feedbackRes, eventRes] = await Promise.all([
          API.get('/articles'),
          API.get('/gallery'),
          API.get('/feedback').catch(() => ({ data: [] })),
          API.get('/event-items').catch(() => ({ data: [] })),
        ])
        setArticles(articlesRes.data || [])
        setGallery(galleryRes.data || [])
        setFeedback(feedbackRes.data || [])
        const allEvents = eventRes.data || []
        const sortedEvents = allEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setEvents(sortedEvents)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.min(rating, 5))
  }

  const visibleArticles = articles.filter(article => article.published)
  const visibleGallery = gallery
  const articleItems = visibleArticles.slice(0, 6)
  const hasMoreArticles = visibleArticles.length > 6
  const galleryItems = showAllGallery ? visibleGallery : visibleGallery.slice(0, 8)
  const hasMoreGallery = visibleGallery.length > 8
  const topThreeEvents = events.slice(0, 3)
  const hasMoreEvents = events.length > 3

  const averageRating = feedback.length > 0
    ? (feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length).toFixed(1)
    : null

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedback.filter(item => item.rating === star).length,
  }))

  const maxRatingCount = Math.max(...ratingCounts.map(item => item.count), 1)
  const featuredReview = feedback.length > 0 ? feedback[0] : null

  const sortedReviews = [...feedback].sort((a, b) => {
    if (reviewSort === 'Most helpful') return (b.rating || 0) - (a.rating || 0)
    if (reviewSort === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (reviewSort === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    return 0
  })

  const formatTimeAgo = (date) => {
    if (!date) return ''
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    const periods = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
    ]
    for (const period of periods) {
      const value = Math.floor(diff / period.seconds)
      if (value >= 1) return `${value} ${period.label}${value > 1 ? 's' : ''} ago`
    }
    return 'Today'
  }

  const previewAttachment = (attachment) => {
    if (!attachment?.fileUrl) return null
    if (attachment.fileType?.includes('pdf')) {
      return <iframe src={attachment.fileUrl} title="Attachment preview" className="h-80 w-full rounded-3xl border border-slate-200" />
    }
    if (attachment.fileType?.startsWith('image/')) {
      return <img src={attachment.fileUrl} alt={attachment.fileName} className="h-80 w-full rounded-3xl border border-slate-200 object-contain" />
    }
    if (attachment.fileType?.startsWith('text/')) {
      return <iframe src={attachment.fileUrl} title="Attachment preview" className="h-80 w-full rounded-3xl border border-slate-200" />
    }
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Preview not available for this file type. Use the download button below to open it.
      </div>
    )
  }

  const handleNewFeedback = (item) => {
    setFeedback(prev => [item, ...prev])
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-24">
      {/* ============ HERO SECTION ============ */}
      <section className="grid lg:grid-cols-2 gap-12 items-start py-16">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300 shadow-sm ring-1 ring-emerald-400/20">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            Enterprise-ready AI for customer experience
          </span>

          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-100 leading-tight">
              Deliver smarter support and higher conversions with AI.
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-8">
              AI-Solutions helps businesses launch intelligent virtual assistants, automate customer engagement, and turn every interaction into measurable growth.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-3">Speed</p>
              <p className="text-3xl font-semibold text-slate-100">Launch fast</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-3">Support</p>
              <p className="text-3xl font-semibold text-slate-100">24/7 coverage</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a href="#join-event" className="rounded-3xl bg-gradient-to-r from-emerald-600 to-lime-500 px-8 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
              Book a Event
            </a>
            <a href="#about" className="rounded-3xl border border-slate-700 px-8 py-3 text-slate-200 font-semibold hover:border-emerald-400 hover:text-emerald-300 transition-colors">
              Learn More
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-slate-950/95 p-8 text-white shadow-2xl ring-1 ring-white/10">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-lime-500 p-6 shadow-lg">
              <h2 className="text-xl font-semibold">AI system insights</h2>
              <p className="mt-3 text-slate-100 leading-7">Quality automation, security, and analytics for customer-facing experiences.</p>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-slate-900/90 p-5 border border-slate-800">
                <p className="text-sm text-slate-400">Conversion lift</p>
                <p className="text-3xl font-bold">+32%</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-5 border border-slate-800">
                <p className="text-sm text-slate-400">Customer rating</p>
                <p className="text-3xl font-bold">4.9/5</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Virtual Assistants', description: 'Responsive AI chat designed for real-world conversations.' },
              { title: 'Rapid Prototypes', description: 'Build, test, and iterate quickly with modular AI flows.' }
            ].map((item, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ABOUT SECTION ============ */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32" id="about">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#e9f8f0] via-transparent to-transparent opacity-80"></div>
        <div className="absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-0 top-24 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative mx-auto w-full max-w-[1280px] px-0 sm:px-4 lg:px-8">
          <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-slate-950/25 backdrop-blur-xl" style={{ background: 'rgba(8, 10, 25, 0.62)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 12px 40px rgba(0,0,0,0.28)' }}>
            <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
              <div className="relative z-10 mx-auto max-w-4xl text-center">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm">
                  About AI-Solutions
                </span>
                <h2 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ textShadow: '0 0 16px rgba(170,120,255,0.18)' }}>
                  Transforming <span className="text-[#7BFFB2]">Customer Experiences</span> Through Intelligent AI Solutions
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.8] text-[#E6EBFF] sm:text-lg">
                  We partner with ambitious teams to build premium AI solutions that boost customer loyalty, increase efficiency, and scale enterprise-grade digital experiences.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
                  <a href="#solutions" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition duration-300 hover:-translate-y-1 hover:bg-slate-800">
                    Explore Solutions
                  </a>
                  <a href="#contact" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(236,72,153,0.22)] transition-all duration-300 ease-out hover:-translate-y-1 hover:from-violet-600 hover:to-pink-600 hover:shadow-[0_14px_30px_rgba(236,72,153,0.30)]">
                    Contact Team
                  </a>
                </div>
              </div>

              <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { value: '50+', label: 'Projects Delivered' },
                  { value: '98%', label: 'Client Satisfaction' },
                  { value: '24/7', label: 'AI Support' },
                  { value: '10+', label: 'Industry Solutions' }
                ].map((stat, idx) => (
                  <div key={idx} className="rounded-3xl border border-white/10 bg-[rgba(10,14,35,0.82)] px-6 py-7 shadow-lg shadow-slate-950/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <p className="text-4xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#B6C3E5]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {[
                  {
                    title: 'Trusted Expertise',
                    description: 'Enterprise-ready AI design, secure delivery, and best-in-class customer journeys.',
                    icon: '🛡️'
                  },
                  {
                    title: 'Rapid Delivery',
                    description: 'Fast deployment cycles with polished execution and measurable business results.',
                    icon: '⚡'
                  },
                  {
                    title: 'ROI Focus',
                    description: 'Solutions built to drive efficiency, conversion, and long-term value.',
                    icon: '📈'
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(10,14,35,0.82)] p-8 shadow-xl shadow-slate-950/20 transition duration-500 hover:-translate-y-2 hover:shadow-2xl">
                    <div className="absolute inset-0 z-0 rounded-[2rem] bg-gradient-to-br from-emerald-100/70 via-white to-cyan-100/40 opacity-80 blur-2xl" />
                    <div className="relative z-10 flex h-full flex-col gap-6">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-md shadow-slate-900/5 text-2xl">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                        <p className="mt-3 text-[#E6EBFF] leading-7">{feature.description}</p>
                      </div>
                      <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-black hover:text-black">
                        <span>Learn more</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {['Enterprise Ready', 'Secure Platform', 'Fast Deployment', 'Human Support'].map((item, idx) => (
                  <div key={idx} className="inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-[rgba(10,14,35,0.82)] px-4 py-4 text-sm font-medium text-[#E6EBFF] shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="py-16" id="services">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-100">What we deliver</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">Advanced AI capabilities designed for modern enterprises, all wrapped in a polished experience.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'AI Assistants', description: 'Smart chatbots that handle support, lead capture, and customer care.' },
            { title: 'Customer Engagement', description: 'Automated workflows that keep conversations moving.' },
            { title: 'Analytics', description: 'Insights that show impact, performance, and next best actions.' },
            { title: 'Security', description: 'Enterprise-grade data protection and compliance controls.' },
            { title: 'Multichannel', description: 'Support across web, mobile, and messaging experiences.' },
            { title: 'Fast iteration', description: 'Quick updates and improvements based on real feedback.' }
          ].map((feature, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white text-lg font-bold mb-4">{idx + 1}</div>
              <h4 className="text-xl font-semibold text-slate-100 mb-2">{feature.title}</h4>
              <p className="text-slate-300 leading-relaxed mb-6">{feature.description}</p>
              <button className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900">
                Learn more
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============ ARTICLES SECTION ============ */}
      <section className="py-16" id="articles">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-100">Latest Articles & Resources</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">Insights, case studies, and practical advice for AI-driven teams.</p>
        </div>

        {visibleArticles.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articleItems.map((article) => (
              <div key={article._id} className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative overflow-hidden h-56 bg-slate-900">
                  {article.coverImage ? (
                    <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-r from-slate-800 via-slate-900 to-slate-700 px-6">
                      <p className="text-center text-lg font-semibold text-slate-100">Featured article</p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6"></div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-4">
                    <span className="font-medium">{article.author || 'AI Solutions'}</span>
                    <span>•</span>
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags?.slice(0, 3).map((tag, index) => (
                      <span key={index} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-100 mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-4">{article.excerpt}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {article.attachment?.fileUrl ? (
                      <button onClick={() => openDocument(article)} disabled={openingSlug === article.slug} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400">
                        {openingSlug === article.slug ? 'Opening...' : 'Read document'}
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/article/${article.slug}`)} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                        Read article
                      </button>
                    )}
                    {article.attachment?.fileUrl && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault()
                          handleDownload(article)
                        }}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(236,72,153,0.22)] transition-all duration-250 ease-out hover:-translate-y-0.5 hover:from-violet-600 hover:to-pink-600 hover:shadow-[0_14px_30px_rgba(236,72,153,0.30)] active:scale-[0.98]"
                      >
                        Download file
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center shadow-sm">
            <p className="text-slate-300 text-lg">No articles available yet. Check back soon.</p>
          </div>
        )}
        {hasMoreArticles && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">More articles will be available soon. Check back for fresh insights.</p>
          </div>
        )}
      </section>

      {/* ============ EVENT SECTION ============ */}
      <section className="py-16" id="event-section">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-100">Upcoming Events</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">Join workshops, AI launches, networking sessions and innovation programs.</p>
        </div>

        {events.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {topThreeEvents.map((event) => (
                <div key={event._id} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[rgba(80,130,255,0.15)] bg-[rgba(12,18,38,0.95)] text-left shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,120,255,0.22)]" style={{ backdropFilter: 'blur(18px)' }}>
                  <div className="relative overflow-hidden h-48 bg-slate-900">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-900 text-slate-400">
                        <span>No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/45 to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-7 gap-4">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-1.5 text-sm font-semibold text-white">Upcoming</span>
                    <h3 className="mt-2 text-[32px] font-bold leading-[1.2] tracking-[-0.03em] text-white line-clamp-2">{event.title}</h3>
                    <p className="text-[16px] leading-[1.8] text-[rgba(220,228,245,0.82)] line-clamp-3">{event.description}</p>
                    <div className="mt-3 space-y-3 text-[rgba(160,180,220,0.88)]">
                      <div className="flex items-center gap-3 text-sm">
                        <img src={calendarIcon} alt="Date" className="h-4 w-4 shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <img src={mapsIcon} alt="Location" className="h-4 w-4 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <button onClick={() => window.location.hash = '#join-event'} className="mt-auto inline-flex h-[56px] w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-6 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(139,92,246,0.22)] transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5">
                      {event.buttonText || 'Join Event'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {hasMoreEvents && (
              <div className="mt-8 text-center">
                <button onClick={() => setShowAllEvents(true)} className="inline-flex items-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 hover:bg-slate-800 transition hover:-translate-y-0.5">
                  See All Events ({events.length})
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-12 text-center shadow-sm">
            <p className="text-slate-300 text-lg">No upcoming events available</p>
          </div>
        )}
      </section>

      {showAllEvents && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 p-4" onClick={() => setShowAllEvents(false)}>
          <div
            className="absolute flex min-h-[82vh] flex-col overflow-x-hidden overflow-y-auto rounded-[32px] bg-white shadow-2xl"
            style={{
              width: 'min(96vw, 1800px)',
              maxWidth: '1800px',
              maxHeight: '90vh',
              padding: '40px 48px',
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAllEvents(false)}
              className="absolute z-20 inline-flex items-center justify-center rounded-full transition-all duration-200 ease-out hover:scale-105"
              style={{
                top: '32px',
                right: '32px',
                width: '44px',
                height: '44px',
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
            >
              <span className="text-xl font-bold" style={{ color: '#0F172A' }}>×</span>
            </button>
            <div className="mb-[36px]">
              <h2 className="text-3xl font-bold text-black mb-2">All Events</h2>
              <p className="text-slate-600">{events.length} events available</p>
            </div>
            <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', alignItems: 'start' }}>
              {events.map((event) => (
                <div key={event._id} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[rgba(80,130,255,0.15)] bg-[rgba(12,18,38,0.95)] text-left shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,120,255,0.22)]" style={{ backdropFilter: 'blur(18px)', minWidth: 0 }}>
                  <div className="relative overflow-hidden h-48 bg-slate-900">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-900 text-slate-400">
                        <span>No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/45 to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-7 gap-4">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-1.5 text-sm font-semibold text-white">Upcoming</span>
                    <h3 className="mt-2 text-[32px] font-bold leading-[1.2] tracking-[-0.03em] text-white line-clamp-2">{event.title}</h3>
                    <p className="text-[16px] leading-[1.8] text-[rgba(220,228,245,0.82)] line-clamp-3">{event.description}</p>
                    <div className="mt-3 space-y-3 text-[rgba(160,180,220,0.88)] text-sm">
                      <div className="flex items-center gap-3">
                        <img src={calendarIcon} alt="Date" className="h-4 w-4 shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img src={mapsIcon} alt="Location" className="h-4 w-4 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <button onClick={() => { setShowAllEvents(false); window.location.hash = '#join-event' }} className="mt-auto inline-flex h-[56px] w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-6 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(139,92,246,0.22)] transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5">
                      {event.buttonText || 'Join Event'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}




      {/* ============ GALLERY SECTION ============ */}
      <section className="py-16" id="gallery">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">Visual showcase</span>
          <h2 className="mt-6 text-4xl font-bold text-slate-100">Project Gallery</h2>
          <p className="mt-4 text-lg text-slate-300">Browse curated visuals from our latest AI deployments and customer stories.</p>
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3 text-sm text-slate-500">
            <span>{visibleGallery.length} items available</span>
            <span className="hidden sm:inline-block">•</span>
            <span>Click any image to view details</span>
          </div>
        </div>

        {visibleGallery.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {galleryItems.map((image) => (
              <button key={image._id} onClick={() => setActiveGalleryItem(image)} className="group overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/80 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/30">
                <div className="overflow-hidden rounded-t-[1.75rem]">
                  <img src={image.url} alt={image.title || 'Gallery image'} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-500 mb-3">Photo showcase</p>
                  <h3 className="text-xl font-semibold text-slate-100 mb-3 line-clamp-2">{image.title || 'Project snapshot'}</h3>
                  <p className="text-slate-300 text-sm leading-6 line-clamp-3">{image.caption || 'Click to open a detailed preview.'}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center shadow-sm">
            <p className="text-slate-300 text-lg">Gallery content will appear here soon.</p>
          </div>
        )}

        {hasMoreGallery && (
          <div className="mt-8 text-center">
            <button onClick={() => setShowAllGallery(prev => !prev)} className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition">
              {showAllGallery ? 'Show fewer images' : `Show all ${visibleGallery.length} images`}
            </button>
          </div>
        )}
      </section>

      {activeGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <button onClick={() => setActiveGalleryItem(null)} className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow hover:bg-slate-100">
              <span className="text-xl font-bold">×</span>
            </button>
            <img src={activeGalleryItem.url} alt={activeGalleryItem.title || 'Gallery preview'} className="w-full h-[420px] object-cover" />
            <div className="p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-500">Photo details</p>
              <h3 className="mt-4 text-3xl font-semibold text-black">{activeGalleryItem.title || 'Project snapshot'}</h3>
              <p className="mt-4 text-black leading-7">{activeGalleryItem.caption || 'No additional description available for this item.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ============ FEEDBACK SECTION ============ */}
      <section className="py-16" id="feedback">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-100">Ratings and reviews</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">A concise view of customer satisfaction backed by recent testimonials.</p>
        </div>

        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900/80 p-8 shadow-sm lg:p-10">
          {/* Row 1: Score & Breakdown */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10 mb-10 pb-10 border-b border-slate-200">
            <div className="min-w-0 lg:max-w-[320px]">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer score</p>
              <div className="mt-4 flex items-end gap-4">
                <p className="text-6xl font-bold text-slate-900">{averageRating || '0.0'}</p>
                <div>
                  <p className="text-sm text-slate-500">{feedback.length} ratings</p>
                  <div className="mt-2 text-amber-500 text-lg">{renderStars(Math.round(Number(averageRating || 0)))}</div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Breakdown</p>
              <div className="space-y-2">
                {ratingCounts.map((item) => (
                  <div key={item.star} className="grid grid-cols-[24px_1fr_24px] items-center gap-2">
                    <span className="text-xs text-slate-600">{item.star}★</span>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.round((item.count / maxRatingCount) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Featured Review */}
          <div className="mb-10 pb-10 border-b border-slate-200 relative">
            <div className="relative flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="relative">
                <button onClick={() => setShowSortOptions(!showSortOptions)} className={`inline-flex items-center justify-between gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-300 ease-in-out ${reviewSort === 'Most helpful' ? 'border-transparent bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-md hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]' : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300'}`}>
                  <span>{reviewSort}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showSortOptions && (
                  <div className="absolute left-0 top-full mt-2 w-44 rounded-3xl border border-slate-200 bg-white shadow-lg">
                    {['Most helpful', 'Newest', 'Oldest'].map((option) => (
                      <button
                        key={option}
                        onClick={() => { setReviewSort(option); setShowSortOptions(false) }}
                        className={`w-full text-left px-4 py-3 text-sm transition-all duration-300 ease-in-out ${option === 'Most helpful' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white hover:brightness-110' : 'text-slate-700 hover:bg-slate-100'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-amber-500 text-lg">{renderStars(featuredReview?.rating || 5)}</div>
                <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                  {featuredReview?.rating?.toFixed(1) || '5.0'}
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-4">{featuredReview ? featuredReview.message.split(' ').slice(0, 5).join(' ') : 'Huge improvement!!'}</h3>

            <p className="text-slate-600 leading-7 mb-6">{featuredReview ? featuredReview.message : 'This section highlights the most meaningful customer review shared so far.'}</p>

            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500 mb-6">
              <div>
                <span className="font-semibold text-slate-900">{featuredReview?.name || 'Anonymous'}</span>
                <span className="mx-2">•</span>
                <span>{formatTimeAgo(featuredReview?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>33 people found this helpful</span>
                <button className="text-slate-400 hover:text-slate-600">⚑</button>
              </div>
            </div>

            <button onClick={() => setShowAllReviews(!showAllReviews)} className="text-sm font-semibold text-amber-500 hover:text-amber-600 flex items-center gap-1">
              See all reviews →
            </button>

            {showAllReviews && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm text-black">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-black">All reviews</p>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-black">
                    <span>{reviewSort}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  {sortedReviews.length > 0 ? (
                    sortedReviews.map((item) => (
                      <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-black">{item.message.split(' ').slice(0, 4).join(' ') || 'Review'}</p>
                              <p className="text-xs text-black mt-1">{item.name || 'Anonymous'} • {formatTimeAgo(item.createdAt)}</p>
                            </div>
                            <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-semibold">
                              {renderStars(item.rating)}
                              <span className="text-black">{item.rating?.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-black text-sm leading-relaxed">{item.message}</p>
                          <div className="flex flex-wrap items-center gap-4 text-black text-sm">
                            <button className="inline-flex items-center gap-2 hover:text-slate-900">
                              <span>👍</span>
                              <span>33</span>
                            </button>
                            <button className="inline-flex items-center gap-2 hover:text-slate-900">
                              <span>👎</span>
                              <span>9</span>
                            </button>
                            <button className="inline-flex items-center gap-2 hover:text-slate-900">
                              <span>⚑</span>
                              <span>Report</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-black py-6 text-sm">No reviews yet. Be the first to share!</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Share Feedback Form */}
          <div>
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Share your feedback</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">Submit your own rating</h3>
              <p className="mt-2 text-slate-600 leading-relaxed">Help others to understand the value of our AI solutions by sharing your experience.</p>
            </div>
            {showSuccess && (
              <div className="mb-6 rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
                Thank you — your rating is live and visible to other visitors.
              </div>
            )}
            <FeedbackForm onSuccess={handleNewFeedback} />
          </div>
        </div>
      </section>

      {/* ============ CONTACT SECTION ============ */}
      <section className="py-20 bg-slate-950/40" id="contact">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-600 mb-4">Contact</p>
            <h2 className="text-5xl font-bold tracking-tight text-slate-100 sm:text-6xl">Get in touch</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">Reach out to our team with your inquiry or secure your spot in an upcoming event. We’re here to help you evaluate the best AI solutions for your business.</p>
          </div>

          <div className="space-y-12">
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 w-full mx-auto p-8 sm:p-10 lg:p-12 shadow-xl shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="pointer-events-none absolute -left-8 top-8 h-48 w-48 rounded-full bg-emerald-100 opacity-60 blur-3xl"></div>
              <div className="relative">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-600 text-white text-2xl shadow-lg shadow-indigo-600/20 mb-6">✉️</div>
                <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100 mb-4">General Inquiry</h3>
                <p className="text-base leading-7 text-slate-300 mb-8">Submit your questions about our services, capabilities, or AI strategy. Our experts will respond promptly with tailored guidance.</p>
                <ContactForm />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 w-full mx-auto p-8 sm:p-10 lg:p-12 shadow-xl shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="pointer-events-none absolute -right-8 top-8 h-48 w-48 rounded-full bg-cyan-100 opacity-60 blur-3xl"></div>
                <div className="relative" id="join-event">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-purple-600 text-white text-2xl shadow-lg shadow-purple-600/20 mb-6">🎯</div>
                <h3 className="text-3xl font-semibold text-slate-100 mb-4">Join Event</h3>
                <p className="max-w-2xl text-base text-slate-300 mb-8">Register for our upcoming webinars and sessions to learn how your team can leverage AI for growth.</p>
                <EventForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-16 rounded-2xl bg-gradient-to-r from-emerald-600 via-lime-600 to-emerald-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>
        <div className="relative text-center max-w-3xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90">Join leading enterprises using AI-Solutions to streamline operations and boost customer satisfaction.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-white text-emerald-600 rounded-lg font-bold hover:scale-105 transform transition-all duration-300 shadow-lg">
              Start Free Trial
            </button>
            <button onClick={handleTalkToSales} className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-emerald-600 transition-all duration-300">
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* ============ AI CHATBOT ============ */}
      <Suspense fallback={null}>
        <Chatbot ref={chatbotRef} />
      </Suspense>
    </div>
  )
}

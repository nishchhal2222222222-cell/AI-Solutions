import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../config/api'
import AdminProfile from './AdminProfile'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

export default function AdminDashboard(){
  const nav = useNavigate()
  const [stats, setStats] = useState(null)
  const [timeRange, setTimeRange] = useState('7 Days')
  const [contacts, setContacts] = useState([])
  const [eventItems, setEventItems] = useState([])
  const [eventRequests, setEventRequests] = useState([])
  const [feedback, setFeedback] = useState([])
  const [articles, setArticles] = useState([])
  const [gallery, setGallery] = useState([])
  const [activeTab, setActiveTab] = useState('contacts')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [page, setPage] = useState(1)
  const [eventSubTab, setEventSubTab] = useState('management')
  const [eventSearchTerm, setEventSearchTerm] = useState('')
  const [eventFilterBy, setEventFilterBy] = useState('all')
  const [eventPage, setEventPage] = useState(1)
  const [requestSearchTerm, setRequestSearchTerm] = useState('')
  const [requestFilterBy, setRequestFilterBy] = useState('all')
  const [requestPage, setRequestPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const pageSize = 10
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [newArticle, setNewArticle] = useState({ title: '', slug: '', excerpt: '', author: '', tags: '', coverImage: '', content: '', published: true, attachment: null })
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', url: '', caption: '' })
  const [showNewArticleForm, setShowNewArticleForm] = useState(false)
  const [showNewEventForm, setShowNewEventForm] = useState(false)
  const [showNewGalleryForm, setShowNewGalleryForm] = useState(false)
  const [newEventItem, setNewEventItem] = useState({ title: '', description: '', image: '', date: '', location: '', buttonText: 'Join Event' })
  const [previewEvent, setPreviewEvent] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, contactsRes, eventItemsRes, eventRequestsRes, feedbackRes, articlesRes, galleryRes] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/contacts'),
          API.get('/event-items'),
          API.get('/events'),
          API.get('/feedback'),
          API.get('/articles'),
          API.get('/gallery'),
        ])
        setStats(statsRes.data)
        setContacts(contactsRes.data)
        setEventItems(eventItemsRes.data)
        setEventRequests(eventRequestsRes.data.map(item => ({ status: item.status || 'Pending', ...item })))
        setFeedback(feedbackRes.data)
        setArticles(articlesRes.data)
        setGallery(galleryRes.data)
      } catch (err) {
        if (err.response?.status === 401) nav('/admin/login')
      }
    }
    loadData()
  }, [nav])

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
  }

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const deleteItem = async (type, id) => {
    try {
      await API.delete(`/${type}/${id}`)
      notify(`${type} item deleted`)
      if (type === 'contacts') setContacts(c => c.filter(x => x._id !== id))
      else if (type === 'events') setEventRequests(c => c.filter(x => x._id !== id))
      else if (type === 'event-items') setEventItems(c => c.filter(x => x._id !== id))
      else if (type === 'feedback') setFeedback(c => c.filter(x => x._id !== id))
      else if (type === 'articles') setArticles(c => c.filter(x => x._id !== id))
      else if (type === 'gallery') setGallery(c => c.filter(x => x._id !== id))
    } catch (err) { notify('Error deleting', 'error') }
  }

  const updateItem = async (type, id) => {
    try {
      const body = type === 'articles'
        ? { ...editData, tags: String(editData.tags || '').split(',').map(tag => tag.trim()).filter(Boolean) }
        : editData
      await API.put(`/${type}/${id}`, body)
      notify(`${type} item updated`)
      setEditId(null)
      if (type === 'contacts') setContacts(c => c.map(x => x._id === id ? {...x, ...editData} : x))
      else if (type === 'events') setEventRequests(c => c.map(x => x._id === id ? {...x, ...editData} : x))
      else if (type === 'event-items') setEventItems(c => c.map(x => x._id === id ? {...x, ...editData} : x))
      else if (type === 'articles') setArticles(c => c.map(x => x._id === id ? {...x, ...body} : x))
      else if (type === 'gallery') setGallery(c => c.map(x => x._id === id ? {...x, ...editData} : x))
    } catch (err) { notify('Error updating', 'error') }
  }

  const handleContactReply = async (contactId, payload) => {
    try {
      const res = await API.post('/contacts/reply', { contactId, ...payload })
      // update local contacts state: append reply to contact.replies
      setContacts(prev => prev.map(c => {
        if (c._id !== contactId) return c
        const replies = Array.isArray(c.replies) ? [...c.replies] : []
        replies.push({ message: payload.message, sentAt: new Date().toISOString(), sentBy: 'Admin' })
        return { ...c, replies }
      }))
      notify(res.data?.message || 'Reply sent successfully')
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reply'
      notify(message, 'error')
      return { success: false, message }
    }
  }

  const updateRequestStatus = (id, status) => {
    setEventRequests(prev => prev.map(item => item._id === id ? { ...item, status } : item))
  }

  const logout = async () => {
    await API.post('/auth/logout')
    nav('/admin/login')
  }

  const createItem = async (type) => {
    try {
      if (type === 'articles') {
        if (!newArticle.title?.trim()) {
          notify('Article title is required', 'error')
          return
        }
        const slug = String(newArticle.slug || '').trim() || generateSlug(newArticle.title)
        if (!slug) {
          notify('Please enter a valid slug or title', 'error')
          return
        }
        const payload = {
          ...newArticle,
          slug,
          tags: String(newArticle.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
          published: Boolean(newArticle.published),
          attachment: newArticle.attachment || undefined,
        }
        const res = await API.post('/articles', payload)
        setArticles(prev => [res.data, ...prev])
        setNewArticle({ title: '', slug: '', excerpt: '', author: '', tags: '', coverImage: '', content: '', published: true, attachment: null })
        setShowNewArticleForm(false)
        notify('Article added')
      } else if (type === 'events') {
        const res = await API.post('/event-items', newEventItem)
        setEventItems(prev => [res.data, ...prev])
        setNewEventItem({ title: '', description: '', image: '', date: '', location: '', buttonText: 'Join Event' })
        setShowNewEventForm(false)
        notify('Event added')
      } else if (type === 'gallery') {
        const res = await API.post('/gallery', newGalleryItem)
        setGallery(prev => [res.data, ...prev])
        setNewGalleryItem({ title: '', url: '', caption: '' })
        setShowNewGalleryForm(false)
        notify('Gallery item added')
      }
    } catch (err) {
      console.error('Create item error', err)
      const message = err.response?.data?.error
        || err.response?.data?.errors?.map(e => e.msg).join(', ')
        || err.message
        || 'Error creating item'
      notify(message, 'error')
    }
  }

  const filterData = (data, query, filter) => {
    const search = query.trim().toLowerCase()
    return data.filter(item => {
      if (!item) return false
      const raw = JSON.stringify(item).toLowerCase()
      if (search && !raw.includes(search)) return false

      if (filter === 'recent') {
        const createdAt = item.createdAt ? new Date(item.createdAt) : null
        return !createdAt || (Date.now() - createdAt.getTime()) <= 30 * 24 * 60 * 60 * 1000
      }

      if (filter === 'hasAttachment') {
        return Boolean(item.attachment || item.url || item.coverImage)
      }

      return true
    })
  }

  const tabItems = [
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'contacts', label: 'Contacts', icon: '📥' },
    { id: 'events', label: 'Events', icon: '🎫' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'articles', label: 'Articles', icon: '📝' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]

  const activeSearchTerm = activeTab === 'events'
    ? (eventSubTab === 'management' ? eventSearchTerm : requestSearchTerm)
    : searchTerm
  const activeFilterBy = activeTab === 'events'
    ? (eventSubTab === 'management' ? eventFilterBy : requestFilterBy)
    : filterBy
  const activePageNumber = activeTab === 'events'
    ? (eventSubTab === 'management' ? eventPage : requestPage)
    : page

  const currentData = activeTab === 'events'
    ? (eventSubTab === 'management' ? eventItems : eventRequests)
    : {
      contacts,
      feedback,
      articles,
      gallery,
    }[activeTab] || []

  const filteredData = filterData(currentData, activeSearchTerm, activeFilterBy)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = filteredData.slice((activePageNumber - 1) * pageSize, activePageNumber * pageSize)
  const pageRangeStart = filteredData.length === 0 ? 0 : (activePageNumber - 1) * pageSize + 1
  const pageRangeEnd = Math.min(filteredData.length, activePageNumber * pageSize)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchTerm('')
    setFilterBy('all')
    setPage(1)
    if (tab !== 'events') {
      setEventSubTab('management')
      setEventSearchTerm('')
      setEventFilterBy('all')
      setEventPage(1)
      setRequestSearchTerm('')
      setRequestFilterBy('all')
      setRequestPage(1)
      setSelectedRequest(null)
    }
  }

  const dashboardStats = {
    totalContacts: stats?.totalContacts || 0,
    totalDemos: stats?.totalDemos || 0,
    totalEvents: stats?.totalEvents || 0,
    totalChats: stats?.totalChats || 0,
  }

  const chartData = [
    { name: 'Day 1', Inquiries: Math.max(3, Math.round(dashboardStats.totalContacts * 0.16)), DemoRequests: Math.max(2, Math.round(dashboardStats.totalDemos * 0.18)), Registrations: Math.max(1, Math.round(dashboardStats.totalEvents * 0.14)), ChatMessages: Math.max(4, Math.round(dashboardStats.totalChats * 0.2)) },
    { name: 'Day 2', Inquiries: Math.max(4, Math.round(dashboardStats.totalContacts * 0.22)), DemoRequests: Math.max(2, Math.round(dashboardStats.totalDemos * 0.2)), Registrations: Math.max(2, Math.round(dashboardStats.totalEvents * 0.18)), ChatMessages: Math.max(5, Math.round(dashboardStats.totalChats * 0.22)) },
    { name: 'Day 3', Inquiries: Math.max(5, Math.round(dashboardStats.totalContacts * 0.26)), DemoRequests: Math.max(3, Math.round(dashboardStats.totalDemos * 0.24)), Registrations: Math.max(2, Math.round(dashboardStats.totalEvents * 0.22)), ChatMessages: Math.max(6, Math.round(dashboardStats.totalChats * 0.24)) },
    { name: 'Day 4', Inquiries: Math.max(6, Math.round(dashboardStats.totalContacts * 0.28)), DemoRequests: Math.max(3, Math.round(dashboardStats.totalDemos * 0.26)), Registrations: Math.max(3, Math.round(dashboardStats.totalEvents * 0.26)), ChatMessages: Math.max(7, Math.round(dashboardStats.totalChats * 0.26)) },
    { name: 'Day 5', Inquiries: Math.max(5, Math.round(dashboardStats.totalContacts * 0.24)), DemoRequests: Math.max(2, Math.round(dashboardStats.totalDemos * 0.22)), Registrations: Math.max(3, Math.round(dashboardStats.totalEvents * 0.24)), ChatMessages: Math.max(6, Math.round(dashboardStats.totalChats * 0.24)) },
    { name: 'Day 6', Inquiries: Math.max(7, Math.round(dashboardStats.totalContacts * 0.3)), DemoRequests: Math.max(3, Math.round(dashboardStats.totalDemos * 0.28)), Registrations: Math.max(3, Math.round(dashboardStats.totalEvents * 0.3)), ChatMessages: Math.max(8, Math.round(dashboardStats.totalChats * 0.28)) },
    { name: 'Day 7', Inquiries: Math.max(8, Math.round(dashboardStats.totalContacts * 0.34)), DemoRequests: Math.max(4, Math.round(dashboardStats.totalDemos * 0.32)), Registrations: Math.max(4, Math.round(dashboardStats.totalEvents * 0.34)), ChatMessages: Math.max(9, Math.round(dashboardStats.totalChats * 0.32)) },
  ]

  const donutData = [
    { name: 'Inquiries', value: dashboardStats.totalContacts, color: '#16A34A' },
    { name: 'Events', value: dashboardStats.totalEvents, color: '#A78BFA' },
    { name: 'Feedback', value: feedback.length, color: '#F97316' },
    { name: 'Chat', value: dashboardStats.totalChats, color: '#1E40AF' },
  ]

  const recentActivities = [
    { label: 'New Inquiry', description: 'A new contact form was submitted.', time: '2m ago' },
    { label: 'Event Registered', description: 'A user signed up for an event.', time: '12m ago' },
    { label: 'Demo Booked', description: 'A demo request was scheduled.', time: '45m ago' },
    { label: 'Chat Started', description: 'A new chat interaction began.', time: '1h ago' },
  ]

  const performanceMetrics = [
    { label: 'Conversion Rate', value: '6.4%', detail: '+14% vs last week' },
    { label: 'User Engagement', value: '82.3%', detail: '+8% vs last week' },
    { label: 'Avg Response Time', value: '12m', detail: 'Improved by 18%' },
    { label: 'Satisfaction Score', value: '91%', detail: '+4 pts' },
  ]

  return (
    <div className="admin-dashboard-shell min-h-screen pt-8">
      <style>{`
        .admin-dashboard-shell {
          background: radial-gradient(circle at top left, rgba(85, 92, 255, 0.16), transparent 28%), linear-gradient(135deg, #060816 0%, #091224 100%);
          color: #F3F7FF;
        }
        .admin-dashboard-shell .text-slate-900 { color: #F3F7FF !important; }
        .admin-dashboard-shell .text-slate-800 { color: #E7EDFF !important; }
        .admin-dashboard-shell .text-slate-700 { color: #DCE5FF !important; }
        .admin-dashboard-shell .text-slate-600 { color: #B6C3E5 !important; }
        .admin-dashboard-shell .text-slate-500 { color: #94A3C8 !important; }
        .admin-dashboard-shell .text-slate-400 { color: #8FA2C6 !important; }
        .admin-dashboard-shell .bg-white { background-color: rgba(10, 14, 35, 0.82) !important; }
        .admin-dashboard-shell .bg-slate-50 { background-color: rgba(255, 255, 255, 0.06) !important; }
        .admin-dashboard-shell .bg-slate-100 { background-color: rgba(255, 255, 255, 0.08) !important; }
        .admin-dashboard-shell .border-slate-200, .admin-dashboard-shell .border-slate-300 { border-color: rgba(255,255,255,0.10) !important; }
        .admin-dashboard-shell input, .admin-dashboard-shell select, .admin-dashboard-shell textarea {
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.10) !important;
          color: #FFFFFF !important;
        }
        .admin-dashboard-shell input::placeholder, .admin-dashboard-shell textarea::placeholder { color: rgba(255,255,255,0.55) !important; }
        .admin-dashboard-shell table thead {
          background: linear-gradient(180deg, rgba(20,28,60,0.98), rgba(12,18,45,0.96)) !important;
          color: #F8FAFF !important;
          font-weight: 700 !important;
        }
        .admin-dashboard-shell table tbody { background: rgba(12,18,40,0.75) !important; color: #EAF2FF !important; }
        .admin-dashboard-shell table th, .admin-dashboard-shell table td, .admin-dashboard-shell table p {
          color: #EAF2FF !important;
          opacity: 1 !important;
        }
        .admin-dashboard-shell table th { font-weight: 700 !important; }
        .admin-dashboard-shell table tbody tr { background: rgba(13,18,42,0.82) !important; transition: all .25s ease; }
        .admin-dashboard-shell table tbody tr:nth-child(even) { background: rgba(18,25,56,0.86) !important; }
        .admin-dashboard-shell table tbody tr:hover { background: rgba(40,55,110,0.75) !important; }
        .admin-dashboard-shell table tbody tr:hover td, .admin-dashboard-shell table tbody tr:hover th { color: #FFFFFF !important; }
        .admin-dashboard-shell table tbody tr.selected-row { background: linear-gradient(90deg, rgba(35,60,130,0.45), rgba(22,163,74,0.22)) !important; color: #FFFFFF !important; }
        .admin-dashboard-shell a { color: #7FD8FF !important; transition: color .25s ease; }
        .admin-dashboard-shell a:hover { color: #A8EAFF !important; }
        .admin-dashboard-shell .table-action-btn { box-shadow: 0 8px 20px rgba(0,0,0,0.28) !important; transition: all .25s ease; }
        .admin-dashboard-shell .table-action-btn.delete { background-color: #dc2626 !important; color: #FFFFFF !important; }
        .admin-dashboard-shell .table-action-btn.reply { background: linear-gradient(135deg,#2563EB,#7C3AED) !important; color: #FFFFFF !important; }
        .admin-dashboard-shell .pagination-btn { color: #DCE7FF !important; }
        .admin-dashboard-shell .pagination-btn:disabled { color: rgba(220,231,255,0.35) !important; }
        .admin-dashboard-shell .shadow-sm, .admin-dashboard-shell .shadow-[0_10px_40px_rgba(0,0,0,.06)] { box-shadow: 0 12px 40px rgba(0,0,0,0.28) !important; }
      `}</style>
      <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white py-4 px-6 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {notification && (
        <div className={`p-4 text-white text-center ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.msg}
        </div>
      )}

      <div className="max-w-[1700px] mx-auto px-6 lg:px-8 py-6">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="w-[280px] min-w-[280px] sticky top-6 self-start rounded-3xl border border-white/10 p-5 shadow-sm ml-0" style={{ background: 'rgba(10,14,35,0.82)', boxShadow: '0 12px 40px rgba(0,0,0,0.28)' }}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#F3F7FF] mb-4">Admin Menu</h3>
            <nav className="space-y-2">
              {tabItems.map(tab => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'text-white rounded-[18px]' : 'text-[#DCE5FF] rounded-2xl hover:bg-white/10'}`}
                  style={activeTab === tab.id ? { 
                    background: 'linear-gradient(90deg,#16A34A,#34D399)',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 24px rgba(34,197,94,0.15)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                    borderLeft: '3px solid rgba(255,255,255,0.65)',
                    paddingLeft: 'calc(1rem - 2px)'
                  } : undefined}
                  onMouseEnter={(e) => activeTab === tab.id && (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => activeTab === tab.id && (e.currentTarget.style.transform = 'translateY(0)')}>
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#F8FAFF]">{activeTab === 'events' ? (eventSubTab === 'management' ? 'Event Management' : 'Join Event Requests') : tabItems.find(tab => tab.id === activeTab)?.label || 'Contacts'}</h2>
                <p className="text-sm text-[#C4D2F3]">{activeTab === 'events' ? (eventSubTab === 'management' ? 'Manage admin-controlled event content.' : 'Review public join event submissions.') : `Manage and review ${activeTab} data in one place.`}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                    className="w-full rounded-2xl border border-white/10 px-4 py-3 pr-10 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                    style={{ background: 'rgba(20,25,55,0.88)' }}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/70">🔎</span>
                </div>
                <select value={filterBy} onChange={e => { setFilterBy(e.target.value); setPage(1) }}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  style={{ background: 'rgba(20,25,55,0.88)' }}>
                  <option value="all">All records</option>
                  <option value="recent">Recent 30 days</option>
                  <option value="hasAttachment">Has attachment</option>
                </select>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 p-6 shadow-sm" style={{ background: 'rgba(7, 12, 35, 0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 40px rgba(0,0,0,0.28)' }}>
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[{
                      label: 'Total Inquiries',
                      value: dashboardStats.totalContacts,
                      trend: '+12.5%',
                      color: 'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700',
                      icon: '📥',
                    }, {
                      label: 'Feedback',
                      value: feedback.length,
                      trend: '+6.8%',
                      color: 'from-cyan-100 to-cyan-50 border-cyan-200 text-cyan-700',
                      icon: '💬',
                    }, {
                      label: 'Event Registrations',
                      value: dashboardStats.totalEvents,
                      trend: '+9.6%',
                      color: 'from-lime-100 to-lime-50 border-lime-200 text-lime-700',
                      icon: '🎫',
                    }, {
                      label: 'Chat Interactions',
                      value: dashboardStats.totalChats,
                      trend: '+11.2%',
                      color: 'from-violet-100 to-violet-50 border-violet-200 text-violet-700',
                      icon: '💬',
                    }].map((card) => (
                      <div key={card.label} className="rounded-3xl bg-white border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,.06)] p-6 transition-all duration-300 hover:-translate-y-1">
                        <div className={`inline-flex items-center justify-center rounded-3xl bg-gradient-to-br ${card.color} w-12 h-12 text-lg shadow-sm mb-5`}>
                          {card.icon}
                        </div>
                        <div className="text-sm text-slate-500 mb-2">{card.label}</div>
                        <div className="text-3xl font-bold text-slate-900">{card.value || 0}</div>
                        <div className="mt-3 inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
                          <span className="mr-2">{card.trend}</span>
                          <span className="text-slate-400">vs last week</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,.06)]">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">Activity Trends</h3>
                          <p className="text-sm text-slate-500">Performance across key engagement channels.</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          {['7 Days', '30 Days', '90 Days'].map(range => (
                            <button key={range} onClick={() => setTimeRange(range)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${timeRange === range ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                            <Tooltip wrapperStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#ffffff' }} />
                            <Line type="monotone" dataKey="Inquiries" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="DemoRequests" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="Registrations" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="ChatMessages" stroke="#1E40AF" strokeWidth={3} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,.06)]">
                      <h3 className="text-xl font-semibold text-slate-900 mb-4">Traffic Distribution</h3>
                      <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                              {donutData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-3">
                        {donutData.map(item => (
                          <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                            <span className="font-medium text-slate-700">{item.name}</span>
                            <span className="text-sm text-slate-500">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,.06)]">
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
                          <p className="text-sm text-slate-500">Latest events from the dashboard.</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Live</span>
                      </div>
                      <div className="space-y-4">
                        {recentActivities.map(item => (
                          <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-base font-semibold text-slate-900">{item.label}</h4>
                                <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                              </div>
                              <span className="text-sm text-slate-500">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,.06)]">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-slate-900">Performance Summary</h3>
                        <p className="text-sm text-slate-500">Key metrics for team performance and response rates.</p>
                      </div>
                      <div className="space-y-4">
                        {performanceMetrics.map(metric => (
                          <div key={metric.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-semibold text-slate-700">{metric.label}</p>
                              <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <AdminProfile />
                </div>
              )}

              {activeTab === 'contacts' && (
                <DataTable title="Contacts" data={paginatedData} type="contacts" onDelete={deleteItem} onReply={handleContactReply} />
              )}

              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-start">
                    <div className="flex flex-wrap items-center gap-3">
                      <button onClick={() => setEventSubTab('management')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${eventSubTab === 'management' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        Event Management
                      </button>
                      <button onClick={() => setEventSubTab('requests')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${eventSubTab === 'requests' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        Join Event Requests
                      </button>
                    </div>
                  </div>

                  {eventSubTab === 'management' && (
                    <>
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">Manage Events</h4>
                          <p className="text-sm text-slate-500">Add or update admin-controlled event content.</p>
                        </div>
                        <button onClick={() => setShowNewEventForm(prev => !prev)} className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                          {showNewEventForm ? 'Hide form' : 'Add New Event'}
                        </button>
                      </div>

                      {showNewEventForm && (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                          <div className="grid gap-4 lg:grid-cols-2">
                            <input value={newEventItem.title} onChange={e => setNewEventItem({...newEventItem, title: e.target.value})} placeholder="Event title" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                            <input value={newEventItem.date} onChange={e => setNewEventItem({...newEventItem, date: e.target.value})} type="date" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                            <input value={newEventItem.location} onChange={e => setNewEventItem({...newEventItem, location: e.target.value})} placeholder="Location" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                            <input value={newEventItem.buttonText} onChange={e => setNewEventItem({...newEventItem, buttonText: e.target.value})} placeholder="Button label" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                            <textarea value={newEventItem.description} onChange={e => setNewEventItem({...newEventItem, description: e.target.value})} placeholder="Description" className="w-full rounded-2xl border border-slate-300 px-4 py-3 h-28 lg:col-span-2" />
                            <label className="flex flex-col gap-2 lg:col-span-2 text-slate-700">
                              <span className="text-sm font-medium">Event image</span>
                              <input type="file" accept="image/*" onChange={async e => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const dataUrl = await readFileAsDataUrl(file)
                                setNewEventItem({...newEventItem, image: dataUrl})
                              }} className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                              {newEventItem.image && (
                                <img src={newEventItem.image} alt="Preview" className="mt-3 rounded-2xl border border-slate-200 object-cover max-h-52" />
                              )}
                            </label>
                          </div>
                          <div className="mt-4 flex gap-3 flex-wrap">
                            <button onClick={() => createItem('events')} className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition">Create event</button>
                            <button onClick={() => setShowNewEventForm(false)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">Cancel</button>
                          </div>
                        </div>
                      )}

                      <DataTable title="Events" data={paginatedData} type="event-items" onDelete={deleteItem} onPreview={item => setPreviewEvent(item)} onEdit={(id, data) => { setEditId(id); setEditData(data) }} onUpdate={(id) => updateItem('event-items', id)} editId={editId} editData={editData} setEditData={setEditData} />
                    </>
                  )}

                  {eventSubTab === 'requests' && (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">Join Event Requests</h4>
                          <p className="text-sm text-slate-500">Review public Join Event submissions and update request status.</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="relative w-full sm:w-72">
                            <input
                              type="text"
                              placeholder="Search requests..."
                              value={requestSearchTerm}
                              onChange={e => { setRequestSearchTerm(e.target.value); setRequestPage(1) }}
                              className="w-full rounded-2xl border border-white/10 px-4 py-3 pr-10 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                              style={{ background: 'rgba(20,25,55,0.88)' }}
                            />
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/70">🔎</span>
                          </div>
                          <select value={requestFilterBy} onChange={e => { setRequestFilterBy(e.target.value); setRequestPage(1) }}
                            className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                            style={{ background: 'rgba(20,25,55,0.88)' }}>
                            <option value="all">All requests</option>
                            <option value="recent">Recent 30 days</option>
                            <option value="hasAttachment">Has attachment</option>
                          </select>
                        </div>
                      </div>

                      <div className="rounded-lg shadow overflow-hidden" style={{ background: 'rgba(7, 12, 35, 0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="px-6 py-4 border-b border-white/10">
                          <h3 className="font-bold text-lg text-[#F8FAFF]">Join Event Requests</h3>
                          <p className="text-sm text-[#C4D2F3]">{filteredData.length} submissions</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b border-white/10">
                              <tr>
                                <th className="px-4 py-3 text-left font-medium text-[#F8FAFF]">Full Name</th>
                                <th className="px-4 py-3 text-left font-medium text-[#F8FAFF]">Email</th>
                                <th className="px-4 py-3 text-left font-medium text-[#F8FAFF]">Phone Number</th>
                                <th className="px-4 py-3 text-left font-medium text-[#F8FAFF]">Company</th>
                                <th className="px-4 py-3 text-left font-medium text-[#F8FAFF]">Country</th>
                                <th className="px-4 py-3 text-left font-medium text-[#F8FAFF]">AI Topic / Interest</th>
                                <th className="px-4 py-3 text-left font-medium text-[#F8FAFF]">Submitted Date</th>
                                <th className="px-4 py-3 text-left font-medium text-[#F8FAFF]">Status</th>
                                <th className="px-4 py-3 text-right font-medium text-[#F8FAFF]">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedData.length === 0 ? (
                                <tr><td colSpan="9" className="px-4 py-6 text-center text-[#C4D2F3]">No requests found</td></tr>
                              ) : paginatedData.map(item => (
                                <tr key={item._id} className={`border-b border-white/10 ${selectedRequest?._id === item._id ? 'selected-row' : ''}`}>
                                  <td className="px-4 py-3">{item.name}</td>
                                  <td className="px-4 py-3">{item.email}</td>
                                  <td className="px-4 py-3">{item.phone || '-'}</td>
                                  <td className="px-4 py-3">{item.company || '-'}</td>
                                  <td className="px-4 py-3">{item.country || '-'}</td>
                                  <td className="px-4 py-3">{item.eventInterest || '-'}</td>
                                  <td className="px-4 py-3">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                                  <td className="px-4 py-3 overflow-visible">
                                    <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold border ${item.status === 'Approved' ? 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]' : item.status === 'Pending' ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]' : 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]'}`}>
                                      {item.status ?? 'Pending'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right space-x-2">
                                    <button onClick={() => setSelectedRequest(item)} className="table-action-btn px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">View</button>
                                    <button onClick={() => updateRequestStatus(item._id, 'Approved')} className="table-action-btn px-2 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600">Approve</button>
                                    <button onClick={() => updateRequestStatus(item._id, 'Rejected')} className="table-action-btn px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Reject</button>
                                    <button onClick={() => deleteItem('events', item._id)} className="table-action-btn delete px-2 py-1 text-xs rounded">Delete</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {selectedRequest && eventSubTab === 'requests' && (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                              <h4 className="text-lg font-semibold">Request details</h4>
                              <p className="text-sm text-slate-500">Review the selected request from the public Join Event form.</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="text-slate-500 hover:text-slate-700 text-sm">Close</button>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-slate-700">Full Name</div>
                              <div className="text-slate-600">{selectedRequest.name || '-'}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-slate-700">Email</div>
                              <div className="text-slate-600">{selectedRequest.email || '-'}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-slate-700">Phone Number</div>
                              <div className="text-slate-600">{selectedRequest.phone || '-'}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-slate-700">Company</div>
                              <div className="text-slate-600">{selectedRequest.company || '-'}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-slate-700">Country</div>
                              <div className="text-slate-600">{selectedRequest.country || '-'}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-slate-700">AI Topic / Interest</div>
                              <div className="text-slate-600">{selectedRequest.eventInterest || '-'}</div>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <div className="text-sm font-semibold text-slate-700">Submitted Date</div>
                              <div className="text-slate-600">{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : '-'}</div>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <div className="text-sm font-semibold text-slate-700">Status</div>
                              <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700">{selectedRequest.status || 'Pending'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'feedback' && (
                <FeedbackTable title="Feedback" data={paginatedData} onDelete={deleteItem} />
              )}

              {activeTab === 'articles' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Manage Articles</h3>
                      <p className="text-sm text-slate-500">Create, update, and publish featured content for the homepage articles section.</p>
                    </div>
                    <button onClick={() => setShowNewArticleForm(prev => !prev)}
                      className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                      {showNewArticleForm ? 'Hide form' : 'Add New Article'}
                    </button>
                  </div>
                  {showNewArticleForm && (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <input value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} placeholder="Title" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                        <input value={newArticle.slug} onChange={e => setNewArticle({...newArticle, slug: e.target.value})} placeholder="Slug (unique)" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                        <input value={newArticle.author} onChange={e => setNewArticle({...newArticle, author: e.target.value})} placeholder="Author" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-slate-700">Cover image</span>
                          <input type="file" accept="image/*" onChange={async e => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const dataUrl = await readFileAsDataUrl(file)
                            setNewArticle({...newArticle, coverImage: dataUrl})
                          }} className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                          {newArticle.coverImage && (
                            <img src={newArticle.coverImage} alt="Cover preview" className="mt-3 rounded-2xl border border-slate-200 object-cover max-h-48" />
                          )}
                        </label>
                        <textarea value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} placeholder="Excerpt" className="w-full rounded-2xl border border-slate-300 px-4 py-3 h-28" />
                        <textarea value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} placeholder="Content" className="w-full rounded-2xl border border-slate-300 px-4 py-3 h-28 lg:col-span-2" />
                        <input value={newArticle.tags} onChange={e => setNewArticle({...newArticle, tags: e.target.value})} placeholder="Tags (comma separated)" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Article Attachment</label>
                          <input type="file" accept=".pdf,.doc,.docx,.txt,image/*" onChange={async e => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const fileUrl = await readFileAsDataUrl(file)
                            setNewArticle({...newArticle, attachment: { fileName: file.name, fileType: file.type, fileUrl }})
                          }} className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                          {newArticle.attachment?.fileName && (
                            <p className="mt-2 text-sm text-slate-500">Attached file: {newArticle.attachment.fileName}</p>
                          )}
                        </div>
                        <label className="flex items-center gap-3 text-sm text-slate-700">
                          <input type="checkbox" checked={newArticle.published} onChange={e => setNewArticle({...newArticle, published: e.target.checked})} className="h-4 w-4 rounded border-slate-300" />
                          Published
                        </label>
                      </div>
                      <div className="mt-4 flex gap-3 flex-wrap">
                        <button onClick={() => createItem('articles')} className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition">Create article</button>
                        <button onClick={() => setShowNewArticleForm(false)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">Cancel</button>
                      </div>
                    </div>
                  )}
                  <DataTable title="Articles" data={paginatedData} type="articles" onDelete={deleteItem} onEdit={(id, data) => { setEditId(id); setEditData({...data, tags: (data.tags || []).join(', ')}) }} onUpdate={(id) => updateItem('articles', id)} editId={editId} editData={editData} setEditData={setEditData} />
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Manage Gallery</h3>
                      <p className="text-sm text-slate-500">Add and update images displayed in the homepage gallery section.</p>
                    </div>
                    <button onClick={() => setShowNewGalleryForm(prev => !prev)}
                      className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                      {showNewGalleryForm ? 'Hide form' : 'Add Gallery Item'}
                    </button>
                  </div>
                  {showNewGalleryForm && (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <input value={newGalleryItem.title} onChange={e => setNewGalleryItem({...newGalleryItem, title: e.target.value})} placeholder="Title" className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                        <label className="flex flex-col gap-2 text-slate-700">
                          <span className="text-sm font-medium">Upload image</span>
                          <input type="file" accept="image/*" onChange={async e => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const dataUrl = await readFileAsDataUrl(file)
                            setNewGalleryItem({...newGalleryItem, url: dataUrl})
                          }} className="w-full rounded-2xl border border-slate-300 px-4 py-3" />
                        </label>
                        <textarea value={newGalleryItem.caption} onChange={e => setNewGalleryItem({...newGalleryItem, caption: e.target.value})} placeholder="Caption" className="w-full rounded-2xl border border-slate-300 px-4 py-3 h-24 lg:col-span-2" />
                      </div>
                      {newGalleryItem.url && (
                        <div className="mt-4 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                          <img src={newGalleryItem.url} alt="Preview" className="w-full object-cover max-h-64" />
                        </div>
                      )}
                      <div className="mt-4 flex gap-3 flex-wrap">
                        <button onClick={() => createItem('gallery')} className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition">Add gallery item</button>
                        <button onClick={() => setShowNewGalleryForm(false)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">Cancel</button>
                      </div>
                    </div>
                  )}
                  <DataTable title="Gallery" data={paginatedData} type="gallery" onDelete={deleteItem} onEdit={(id, data) => { setEditId(id); setEditData(data) }} onUpdate={(id) => updateItem('gallery', id)} editId={editId} editData={editData} setEditData={setEditData} />
                </div>
              )}

              {filteredData.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-[#C4D2F3]" style={{ background: 'rgba(20,25,55,0.82)' }}>
                  <p className="text-lg font-semibold text-[#F8FAFF]">No {activeTab} records found.</p>
                  <p className="mt-2 text-sm">Try a different search term or filter, or add new content if available.</p>
                </div>
              )}

              {filteredData.length > 0 && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-[#DCE7FF]">
                  <p>{pageRangeStart}-{pageRangeEnd} of {filteredData.length} {tabItems.find(tab => tab.id === activeTab)?.label.toLowerCase()}</p>
                  <div className="inline-flex items-center gap-2">
                    <button onClick={() => setPage(current => Math.max(1, current - 1))}
                      disabled={page === 1}
                      className="pagination-btn rounded-full border border-white/10 px-3 py-2 text-sm font-medium transition hover:bg-[rgba(30,38,78,0.9)] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ background: 'rgba(20,25,55,0.88)' }}>
                      Prev
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button onClick={() => setPage(current => Math.min(totalPages, current + 1))}
                      disabled={page === totalPages}
                      className="pagination-btn rounded-full border border-white/10 px-3 py-2 text-sm font-medium transition hover:bg-[rgba(30,38,78,0.9)] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ background: 'rgba(20,25,55,0.88)' }}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }){
  const colorMap = { indigo: 'from-indigo-50 to-indigo-100 border-indigo-300', cyan: 'from-cyan-50 to-cyan-100 border-cyan-300', emerald: 'from-emerald-50 to-emerald-100 border-emerald-300', purple: 'from-purple-50 to-purple-100 border-purple-300' }
  return (
    <div className={`p-6 bg-gradient-to-br ${colorMap[color]} rounded-lg shadow border`}>
      <div className="text-3xl font-bold text-slate-800">{value || 0}</div>
      <div className="text-slate-600 text-sm mt-1">{label}</div>
    </div>
  )
}

function DataTable({ title, data, type, onDelete, onEdit, onUpdate, editId, editData, setEditData, onReply }){
  const handleFileInput = async (e, field) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const fileData = reader.result
      if (field === 'attachment') {
        setEditData({...editData, attachment: { fileName: file.name, fileType: file.type, fileUrl: fileData }})
      } else if (field === 'coverImage') {
        setEditData({...editData, coverImage: fileData})
      } else {
        setEditData({...editData, [field]: fileData})
      }
    }
    reader.readAsDataURL(file)
  }
  const openGmailCompose = (contact) => {
    try {
      const subject = encodeURIComponent('Re: Your inquiry to AI-Solutions')
      const body = encodeURIComponent(`Hello ${contact.fullName || ''},\n\nThank you for contacting AI-Solutions.\n\nRegarding your inquiry:\n\n[Write your response here]\n\nBest regards,\nAI-Solutions Team`)
      const to = encodeURIComponent(contact.email || '')
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`
      const opened = window.open(gmailUrl, '_blank')
      if (!opened) {
        // fallback to mailto
        const mailto = `mailto:${contact.email}?subject=${subject}&body=${body}`
        window.open(mailto, '_blank')
      }
    } catch (err) {
      try {
        const subject = encodeURIComponent('Re: Your inquiry to AI-Solutions')
        const body = encodeURIComponent(`Hello ${contact.fullName || ''},\n\nThank you for contacting AI-Solutions.\n\nRegarding your inquiry:\n\n[Write your response here]\n\nBest regards,\nAI-Solutions Team`)
        const mailto = `mailto:${contact.email}?subject=${subject}&body=${body}`
        window.open(mailto, '_blank')
      } catch (e) {
        console.error('Failed to open mail client', e)
      }
    }
  }

  const getEventDescriptionPreview = (value) => {
    if (typeof value !== 'string') return ''
    const text = value.trim()
    if (!text) return ''
    if (text.length <= 60) return text

    const words = text.split(/\s+/)
    let previewWords = []
    let preview = ''

    for (const word of words) {
      const candidate = previewWords.length === 0 ? word : `${preview} ${word}`
      if (candidate.length > 60 || previewWords.length >= 8) break
      previewWords.push(word)
      preview = previewWords.join(' ')
    }

    if (previewWords.length === 0) {
      return `${text.slice(0, 57).trimEnd()}...`
    }

    return previewWords.length < words.length ? `${preview}...` : preview
  }

  const getImageUrlPreview = (value) => {
    if (typeof value !== 'string') return ''
    const text = value.trim()
    if (!text) return ''
    if (text.length <= 40) return text
    return `${text.slice(0, 37).trimEnd()}...`
  }

  const formatEventDate = (value) => {
    if (!value) return '-'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '-'
    return parsed.toLocaleDateString('en-GB')
  }

  return (
    <div className="rounded-lg shadow overflow-hidden" style={{ background: 'rgba(7, 12, 35, 0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="font-bold text-lg text-[#F8FAFF]">{title}</h3>
        <p className="text-sm text-[#C4D2F3]">{data.length} records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              {data.length > 0 && Object.keys(data[0]).filter(k => k !== '_id' && k !== '__v' && k !== 'password').slice(0, 5).map(k => {
                const isDescription = type === 'event-items' && k === 'description'
                const isImage = type === 'event-items' && k === 'image'
                return (
                  <th key={k} className={`px-4 py-3 text-left font-medium text-slate-700 ${isDescription || isImage ? 'max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis' : ''}`}>{k}</th>
                )
              })}
              <th className={`px-4 py-3 font-medium text-slate-700 ${type === 'contacts' ? 'text-center' : 'text-right'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-[#C4D2F3]">No records found</td></tr>
            ) : data.map(item => (
              <tr key={item._id} className="border-b border-white/10">
                {type !== 'contacts' && editId === item._id ? (
                  <>
                    {Object.keys(item).filter(k => k !== '_id' && k !== '__v' && k !== 'password').slice(0, 5).map(k => (
                      <td key={k} className="px-4 py-3">
                        {((type === 'gallery' && k === 'url') || (type === 'articles' && (k === 'attachment' || k === 'coverImage'))) ? (
                          <input type="file" accept={type === 'gallery' ? 'image/*' : k === 'coverImage' ? 'image/*' : '.pdf,.doc,.docx,.txt,image/*'} onChange={e => handleFileInput(e, k)} className="w-full p-2 border rounded text-xs" />
                        ) : (
                          <input type="text" value={editData[k] || ''} onChange={e => setEditData({...editData, [k]: e.target.value})} className="w-full p-2 border rounded text-xs" />
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => onUpdate(item._id)} className="table-action-btn px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">Save</button>
                      <button onClick={() => setEditId(null)} className="table-action-btn px-2 py-1 bg-slate-400 text-white text-xs rounded hover:bg-slate-500">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    {Object.keys(item).filter(k => k !== '_id' && k !== '__v' && k !== 'password').slice(0, 5).map(k => {
                      const value = item[k]
                      let display = typeof value === 'object' && value !== null ? value.fileName || JSON.stringify(value).slice(0, 40) : String(value)
                      if (type === 'gallery' && k === 'url' && display.length > 40) {
                        display = display.slice(0, 40) + '...'
                      }
                      if (type === 'event-items' && k === 'description') {
                        display = getEventDescriptionPreview(value)
                        return (
                          <td key={k} className="px-4 py-3 max-w-[280px] whitespace-nowrap overflow-hidden text-ellipsis align-middle" title={typeof value === 'string' ? value : ''}>
                            {display}
                          </td>
                        )
                      }
                      if (type === 'event-items' && k === 'image') {
                        const imageText = getImageUrlPreview(value)
                        return (
                          <td key={k} className="px-4 py-3 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis align-middle" title={typeof value === 'string' ? value : ''}>
                            {typeof value === 'string' && value.trim() ? (
                              <a href={value} target="_blank" rel="noopener noreferrer" className="block truncate text-slate-700 hover:text-blue-600 hover:underline">
                                {imageText}
                              </a>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        )
                      }
                      if (type === 'event-items' && k === 'date') {
                        return <td key={k} className="px-4 py-3 truncate">{formatEventDate(value)}</td>
                      }
                      return <td key={k} className="px-4 py-3 truncate">{display}</td>
                    })}
                    <td className={`px-4 py-3 ${type === 'contacts' ? 'text-center' : 'text-right'}`}>
                      <div className={`flex flex-wrap gap-2 ${type === 'contacts' ? 'justify-center' : 'justify-end'}`}>
                        {type !== 'contacts' && (
                          <button onClick={() => onEdit(item._id, item)} className="table-action-btn px-2 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600">Edit</button>
                        )}
                        <button onClick={() => onDelete(type, item._id)} className="table-action-btn delete px-2 py-1 text-xs rounded">Delete</button>
                        {type === 'contacts' && (
                          <>
                            <button onClick={() => openGmailCompose(item)} style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', boxShadow: '0 8px 20px rgba(0,0,0,0.28)' }} className="table-action-btn reply h-8 px-3 text-xs font-semibold text-white rounded-[10px] transform transition hover:-translate-y-2 hover:shadow-lg">
                              {item.replies && item.replies.length > 0 ? 'Replied ✓' : 'Reply'}
                            </button>
                            {item.replies && item.replies.length > 0 && (
                              <div className="mt-2 text-center text-xs text-emerald-700">Last replied: {new Date(item.replies[item.replies.length-1].sentAt).toLocaleString()}</div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      

    </div>
  )
}

function FeedbackTable({ title, data, onDelete }){
  return (
    <div className="rounded-lg shadow overflow-hidden" style={{ background: 'rgba(7, 12, 35, 0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="font-bold text-lg text-[#F8FAFF]">{title}</h3>
        <p className="text-sm text-[#C4D2F3]">{data.length} records</p>
      </div>
      <div className="space-y-4 p-6">
        {data.length === 0 ? (
          <p className="text-[#C4D2F3]">No feedback yet</p>
        ) : data.map(item => (
          <div key={item._id} className="p-4 border border-white/10 rounded" style={{ background: 'rgba(13,18,42,0.82)' }}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#F8FAFF]">{item.name || 'Anonymous'}</span>
                  <span className="text-yellow-500">{'★'.repeat(item.rating || 0)}</span>
                </div>
                <p className="text-[#EAF2FF] mt-1">{item.message}</p>
                {item.relatedService && <p className="text-sm text-[#C4D2F3] mt-1">Service: {item.relatedService}</p>}
              </div>
              <button onClick={() => onDelete('feedback', item._id)} className="table-action-btn delete px-3 py-1 text-xs rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const USERS_STORAGE_KEY = 'ai_solutions_users'

const loadUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

export default function UserAuth({ initialMode = 'login' }){
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const email = form.email.trim().toLowerCase()
    const password = form.password.trim()
    const name = form.name.trim()

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    if (mode === 'register') {
      if (!name) {
        setError('Please enter your name.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (form.password !== form.confirm) {
        setError('Passwords do not match.')
        return
      }
      const users = loadUsers()
      if (users.some(u => u.email === email)) {
        setError('An account with this email already exists.')
        return
      }
      users.push({ name, email, password })
      saveUsers(users)
      setMessage('Registration successful. You can now log in.')
      setMode('login')
      setForm({ name: '', email: '', password: '', confirm: '' })
      return
    }

    const users = loadUsers()
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) {
      setError('Invalid credentials. Please register or try again.')
      return
    }

    setMessage(`Welcome back, ${user.name}!`)
    setForm({ name: '', email: '', password: '', confirm: '' })
    setTimeout(() => { nav('/') }, 1000)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 rounded-3xl shadow-xl ring-1 ring-white/10">
      <div className="mb-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{mode === 'login' ? 'Login' : 'Create Account'}</h1>
          <p className="text-sm text-slate-300">Secure access for users. Please sign in or create an account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-700 px-4 py-3 text-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30" placeholder="Your full name" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-700 px-4 py-3 text-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30" placeholder="you@example.com" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-700 px-4 py-3 text-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30" placeholder="Enter password" required />
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-700 px-4 py-3 text-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30" placeholder="Repeat password" required />
          </div>
        )}

        {error && <div className="rounded-2xl bg-red-900/60 px-4 py-3 text-sm text-red-200">{error}</div>}
        {message && <div className="rounded-2xl bg-emerald-900/50 px-4 py-3 text-sm text-emerald-200">{message}</div>}

        <button type="submit" className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition-colors">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-500">
        {mode === 'login' ? (
          <>Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">Sign Up here</Link>.</>
        ) : (
          <>Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Login here</Link>.</>
        )}
      </div>
    </div>
  )
}

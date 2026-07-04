import React, { useState } from 'react'
import API from '../config/api'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin(){
  const [form, setForm] = useState({ email: '', password: '' })
  const [err, setErr] = useState(null)
  const nav = useNavigate()
  const submit = async e => {
    e.preventDefault(); setErr(null)
    try {
      const res = await API.post('/auth/login', form)
      if (res.data?.token) {
        localStorage.setItem('adminToken', res.data.token)
        API.defaults.headers.common.Authorization = `Bearer ${res.data.token}`
      }
      nav('/admin/dashboard')
    } catch (err) { setErr(err.response?.data?.message || 'Login failed') }
  }
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-emerald-400">Admin Portal</h2>
          <p className="mt-2 text-sm text-slate-300">Secure sign-in for administrators only.</p>
        </div>

        <div className="rounded-3xl bg-slate-800 p-6 space-y-6">
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Email address</label>
              <input
                name="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="admin@ai-solutions.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-700 px-4 py-3 text-white shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-900/30"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-white/10 bg-slate-700 px-4 py-3 text-white shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-900/30"
                required
              />
            </div>

            {err && <div className="rounded-2xl bg-red-900/60 px-4 py-3 text-sm text-red-200">{err}</div>}

            <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-3 text-white font-semibold shadow-lg shadow-slate-300/50 transition hover:from-indigo-700 hover:to-sky-600">
              Sign in
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Need help? Contact your system administrator for access permissions.
          </div>
        </div>
      </div>
    </div>
  )
}

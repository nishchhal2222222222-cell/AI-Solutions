import React, { useState } from 'react'
import API from '../config/api'

export default function DemoForm(){
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', country: '', interestedService: '' })
  const [status, setStatus] = useState(null)
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = async e => {
    e.preventDefault(); setStatus('loading')
    try { await API.post('/demos', form); setStatus('success'); setForm({ name: '', email: '', phone: '', company: '', country: '', interestedService: '' }) }
    catch (err) { setStatus('error') }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="name" value={form.name} onChange={handle} placeholder="Name" className="w-full p-2 border" required />
      <input name="email" value={form.email} onChange={handle} placeholder="Email" className="w-full p-2 border" required />
      <input name="phone" value={form.phone} onChange={handle} placeholder="Phone" className="w-full p-2 border" />
      <input name="company" value={form.company} onChange={handle} placeholder="Company" className="w-full p-2 border" />
      <input name="country" value={form.country} onChange={handle} placeholder="Country" className="w-full p-2 border" />
      <input name="interestedService" value={form.interestedService} onChange={handle} placeholder="Interested Service" className="w-full p-2 border" />
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 bg-cyan-600 text-white rounded">Request Demo</button>
        {status === 'loading' && <span>Sending...</span>}
        {status === 'success' && <span className="text-green-600">Request submitted</span>}
        {status === 'error' && <span className="text-red-600">Error</span>}
      </div>
    </form>
  )
}

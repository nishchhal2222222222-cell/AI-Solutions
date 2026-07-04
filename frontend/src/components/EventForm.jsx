import React, { useState, useRef } from 'react'
import API from '../config/api'

export default function EventForm(){
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', country: '', eventInterest: '' })
  const [status, setStatus] = useState(null)
  const [errors, setErrors] = useState({})

  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const phoneRef = useRef(null)
  const companyRef = useRef(null)
  const countryRef = useRef(null)
  const eventInterestRef = useRef(null)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^[0-9]{7,15}$/

  const inputClass = "w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-black placeholder-slate-400 outline-none transition duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"

  const validateForm = () => {
    const trimmedName = form.name.trim()
    const trimmedEmail = form.email.trim()
    const cleanedPhone = form.phone.replace(/\D/g, '')
    const trimmedCompany = form.company.trim()
    const trimmedCountry = form.country.trim()
    const trimmedEventInterest = form.eventInterest.trim()

    const newErrors = {}
    if (trimmedName.length < 2) newErrors.name = 'Please enter your full name'
    if (!emailRegex.test(trimmedEmail)) newErrors.email = 'Please enter a valid email address'
    if (!phoneRegex.test(cleanedPhone)) newErrors.phone = 'Please enter a valid phone number'
    if (!trimmedCompany) newErrors.company = 'Company is required'
    if (!trimmedCountry) newErrors.country = 'Please select a country'
    if (!trimmedEventInterest) newErrors.eventInterest = 'Please select event interest'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name) nameRef.current?.focus()
      else if (newErrors.email) emailRef.current?.focus()
      else if (newErrors.phone) phoneRef.current?.focus()
      else if (newErrors.company) companyRef.current?.focus()
      else if (newErrors.country) countryRef.current?.focus()
      else if (newErrors.eventInterest) eventInterestRef.current?.focus()
      return false
    }
    return true
  }

  const handle = e => {
    const { name, value } = e.target
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '')
      setForm(prev => ({ ...prev, phone: cleaned }))
      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const submit = async e => {
    e.preventDefault()
    if (!validateForm()) return
    setStatus('loading')
    try {
      await API.post('/events', { ...form, phone: form.phone.replace(/\D/g, '') })
      setStatus('success')
      setForm({ name: '', email: '', phone: '', company: '', country: '', eventInterest: '' })
      setErrors({})
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <input
            ref={nameRef}
            name="name"
            value={form.name}
            onChange={handle}
            placeholder="Full name"
            className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <input
            ref={emailRef}
            name="email"
            value={form.email}
            onChange={handle}
            placeholder="Email address"
            type="email"
            className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <input
            ref={phoneRef}
            name="phone"
            value={form.phone}
            onChange={handle}
            placeholder="Phone number"
            className={`${inputClass} ${errors.phone ? 'border-red-500' : ''}`}
            inputMode="numeric"
            maxLength={15}
          />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
        </div>
        <div className="space-y-2">
          <input
            ref={companyRef}
            name="company"
            value={form.company}
            onChange={handle}
            placeholder="Company"
            className={`${inputClass} ${errors.company ? 'border-red-500' : ''}`}
          />
          {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <input
            ref={countryRef}
            name="country"
            value={form.country}
            onChange={handle}
            placeholder="Country"
            className={`${inputClass} ${errors.country ? 'border-red-500' : ''}`}
          />
          {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
        </div>
        <div className="space-y-2">
          <input
            ref={eventInterestRef}
            name="eventInterest"
            value={form.eventInterest}
            onChange={handle}
            placeholder="Event interest"
            className={`${inputClass} ${errors.eventInterest ? 'border-red-500' : ''}`}
          />
          {errors.eventInterest && <p className="text-sm text-red-600">{errors.eventInterest}</p>}
        </div>
      </div>
      <button type="submit" disabled={status === 'loading'} className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50">
        {status === 'loading' ? 'Registering...' : 'Join Event'}
      </button>
      {status === 'loading' && <div className="text-sm text-slate-500">Sending your event request...</div>}
      {status === 'success' && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">✅ Registered successfully!</div>}
      {status === 'error' && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">❌ Something went wrong. Please try again.</div>}
    </form>
  )
}

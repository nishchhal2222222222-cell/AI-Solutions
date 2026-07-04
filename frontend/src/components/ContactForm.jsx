import React, { useState, useRef, useEffect } from 'react'
import API from '../config/api'

const COUNTRIES = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
  { name: 'Thailand', code: '+66', flag: '🇹🇭' },
  { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
  { name: 'Philippines', code: '+63', flag: '🇵🇭' },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Spain', code: '+34', flag: '🇪🇸' },
  { name: 'Italy', code: '+39', flag: '🇮🇹' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { name: 'Sweden', code: '+46', flag: '🇸🇪' },
  { name: 'Norway', code: '+47', flag: '🇳🇴' },
  { name: 'Denmark', code: '+45', flag: '🇩🇰' },
  { name: 'Belgium', code: '+32', flag: '🇧🇪' },
  { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
  { name: 'Austria', code: '+43', flag: '🇦🇹' },
  { name: 'Poland', code: '+48', flag: '🇵🇱' },
  { name: 'Czech Republic', code: '+420', flag: '🇨🇿' },
  { name: 'Hungary', code: '+36', flag: '🇭🇺' },
  { name: 'Romania', code: '+40', flag: '🇷🇴' },
  { name: 'Greece', code: '+30', flag: '🇬🇷' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹' },
  { name: 'Ireland', code: '+353', flag: '🇮🇪' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Chile', code: '+56', flag: '🇨🇱' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  { name: 'Peru', code: '+51', flag: '🇵🇪' },
  { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Turkey', code: '+90', flag: '🇹🇷' },
  { name: 'Russia', code: '+7', flag: '🇷🇺' },
  { name: 'Ukraine', code: '+380', flag: '🇺🇦' },
  { name: 'Israel', code: '+972', flag: '🇮🇱' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'UAE', code: '+971', flag: '🇦🇪' },
]

export default function ContactForm(){
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', company: '', country: '', phoneCode: '+1', jobTitle: '', jobDetails: '' })
  const [status, setStatus] = useState(null)
  const [errors, setErrors] = useState({})
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES)

  const fullNameRef = useRef(null)
  const emailRef = useRef(null)
  const phoneRef = useRef(null)
  const companyRef = useRef(null)
  const countryDropdownRef = useRef(null)
  const countrySearchRef = useRef(null)
  const jobDetailsRef = useRef(null)

  const inputClass = "w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-black placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^[0-9]{7,15}$/

  useEffect(() => {
    const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    setFilteredCountries(filtered)
  }, [countrySearch])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectCountry = (country) => {
    setForm(prev => ({ ...prev, country: country.name, phoneCode: country.code }))
    setShowCountryDropdown(false)
    setCountrySearch('')
    if (errors.country) setErrors(prev => ({ ...prev, country: '' }))
  }

  const validateForm = () => {
    const trimmedFullName = form.fullName.trim()
    const trimmedEmail = form.email.trim()
    const cleanedPhone = form.phone.replace(/\D/g, '')
    const trimmedCompany = form.company.trim()
    const trimmedCountry = form.country.trim()
    const trimmedJobDetails = form.jobDetails.trim()

    const newErrors = {}

    if (trimmedFullName.length < 2) newErrors.fullName = 'Please enter your full name'
    if (!emailRegex.test(trimmedEmail)) newErrors.email = 'Please enter a valid email address'
    if (!phoneRegex.test(cleanedPhone)) newErrors.phone = 'Please enter a valid phone number'
    if (!trimmedCompany) newErrors.company = 'Company is required'
    if (!trimmedCountry) newErrors.country = 'Please select a country'
    if (trimmedJobDetails.length < 10) newErrors.jobDetails = 'Message is required'

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.fullName) fullNameRef.current?.focus()
      else if (newErrors.email) emailRef.current?.focus()
      else if (newErrors.phone) phoneRef.current?.focus()
      else if (newErrors.company) companyRef.current?.focus()
      else if (newErrors.country) countrySearchRef.current?.focus()
      else if (newErrors.jobDetails) jobDetailsRef.current?.focus()
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
      const submitData = { ...form, phone: form.phoneCode + form.phone }
      await API.post('/contacts', submitData)
      setStatus('success')
      setForm({ fullName: '', email: '', phone: '', company: '', country: '', phoneCode: '+1', jobTitle: '', jobDetails: '' })
      setErrors({})
    } catch (err) {
      setStatus('error')
    }
  }

  const selectedCountry = COUNTRIES.find(c => c.name === form.country)

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <input
            ref={fullNameRef}
            name="fullName"
            value={form.fullName}
            onChange={handle}
            placeholder="Full name"
            className={`${inputClass} ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
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
        <div className="space-y-2 relative">
          <div ref={countryDropdownRef} className="relative">
            <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-black outline-none transition duration-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 flex items-center gap-2">
              {selectedCountry && <span className="text-lg">{selectedCountry.flag}</span>}
              <input
                ref={countrySearchRef}
                type="text"
                placeholder="Select country..."
                value={showCountryDropdown ? countrySearch : form.country}
                onChange={(e) => setCountrySearch(e.target.value)}
                onFocus={() => { setShowCountryDropdown(true); setCountrySearch('') }}
                className="flex-1 bg-transparent outline-none placeholder-slate-400 text-black"
              />
              <span className="text-black">▼</span>
            </div>
            {showCountryDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.name}
                      type="button"
                      onClick={() => selectCountry(country)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition flex items-center gap-3 border-b border-slate-100 last:border-b-0"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="font-medium text-black flex-1">{country.name}</span>
                      <span className="text-black">{country.code}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-black">No countries found</div>
                )}
              </div>
            )}
          </div>
          {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-black outline-none transition duration-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 flex items-center gap-2 min-w-[100px] whitespace-nowrap">
              {selectedCountry && <span className="text-lg">{selectedCountry.flag}</span>}
              <span className="font-semibold">{form.phoneCode}</span>
            </div>
            <div className="flex-1">
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
            </div>
          </div>
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
        <input name="jobTitle" value={form.jobTitle} onChange={handle} placeholder="Job title" className={inputClass} />
      </div>
      <div className="space-y-2">
        <textarea
          ref={jobDetailsRef}
          name="jobDetails"
          value={form.jobDetails}
          onChange={handle}
          placeholder="Tell us about your needs..."
          rows="5"
          className={`${inputClass} min-h-[160px] resize-none ${errors.jobDetails ? 'border-red-500' : ''}`}
        />
        {errors.jobDetails && <p className="text-sm text-red-600">{errors.jobDetails}</p>}
      </div>
      <button type="submit" disabled={status === 'loading'} className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50">
        {status === 'loading' ? 'Sending request...' : 'Send Message'}
      </button>
      {status === 'success' && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">✅ Message sent successfully!</div>}
      {status === 'error' && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">❌ Error sending message</div>}
    </form>
  )
}

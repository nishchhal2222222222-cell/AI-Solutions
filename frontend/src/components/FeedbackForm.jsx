import React, { useState } from 'react'
import API from '../config/api'

export default function FeedbackForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      setStatus({ type: 'error', text: 'Please share your feedback message.' })
      return
    }

    setLoading(true)
    try {
      const response = await API.post('/feedback', {
        name: name.trim() || 'Anonymous',
        rating,
        message: message.trim(),
      })

      setStatus({ type: 'success', text: 'Thank you! Your rating has been submitted.' })
      setMessage('')
      if (onSuccess) onSuccess(response.data)
    } catch (error) {
      console.error(error)
      setStatus({ type: 'error', text: 'Unable to submit feedback. Please try again later.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Your name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-black outline-none transition focus:border-emerald-500 focus:bg-white"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700">Rating</label>
          <span className="text-sm text-slate-500">{rating}.0</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setRating(value)}
              className={`inline-flex items-center justify-center rounded-3xl px-4 py-3 text-sm font-semibold transition ${rating === value ? 'bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFB300] text-white shadow-[0_0_12px_rgba(255,215,0,0.45)] hover:brightness-110' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {'★'.repeat(value)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Feedback</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Tell us how AI-Solutions helped your team or what you’d like to see improved."
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-black outline-none transition focus:border-emerald-500 focus:bg-white resize-none"
        />
      </div>

      {status && (
        <p className={`text-sm ${status.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>{status.text}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full justify-center rounded-3xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:brightness-110 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  )
}

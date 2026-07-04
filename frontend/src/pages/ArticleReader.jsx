import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../config/api'

export default function ArticleReader() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const res = await API.get(`/articles/${slug}`)
        setArticle(res.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load article.')
      } finally {
        setLoading(false)
      }
    }
    if (slug) loadArticle()
  }, [slug])

  const renderAttachmentPreview = (attachment) => {
    if (!attachment?.fileUrl) return null

    if (attachment.fileType?.includes('pdf')) {
      return <iframe src={attachment.fileUrl} title="Attachment preview" className="h-96 w-full rounded-3xl border border-slate-200" />
    }

    if (attachment.fileType?.startsWith('image/')) {
      return <img src={attachment.fileUrl} alt={attachment.fileName} className="h-96 w-full rounded-3xl border border-slate-200 object-contain" />
    }

    if (attachment.fileType?.startsWith('text/')) {
      return <iframe src={attachment.fileUrl} title="Attachment preview" className="h-96 w-full rounded-3xl border border-slate-200" />
    }

    if (attachment.fileName?.toLowerCase().endsWith('.docx') || attachment.fileName?.toLowerCase().endsWith('.doc')) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          This document is best opened in a new tab via the article card button.
        </div>
      )
    }

    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        Preview not available for this file type. Use the download button below.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="text-lg text-slate-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-24">
        <div className="container mx-auto px-4 lg:px-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-semibold text-slate-900 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">
            Back to articles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <button onClick={() => navigate(-1)} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition mb-8">
          Back to articles
        </button>

        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="relative h-80 bg-slate-900">
            {article.coverImage ? (
              <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-r from-slate-800 via-slate-900 to-slate-700 px-6">
                <p className="text-center text-2xl font-semibold text-white">Article document</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Article</p>
              <h1 className="mt-3 text-4xl font-bold text-white">{article.title}</h1>
            </div>
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
                  <div>
                    <p>By {article.author || 'AI Solutions'}</p>
                    <p>{new Date(article.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.tags?.map((tag, idx) => (
                      <span key={idx} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700 whitespace-pre-line">
                {article.content || article.excerpt || 'This article does not include any body text.'}
              </div>
            </div>

            {article.attachment?.fileUrl && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Attachment</p>
                      <p className="text-xs text-slate-500">{article.attachment.fileName}</p>
                    </div>
                    <a href={article.attachment.fileUrl} download={article.attachment.fileName} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                      Download
                    </a>
                  </div>
                  {renderAttachmentPreview(article.attachment)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

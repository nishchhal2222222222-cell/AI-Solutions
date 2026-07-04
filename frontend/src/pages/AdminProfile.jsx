import React, { useEffect, useState } from 'react'
import API from '../config/api'

export default function AdminProfile(){
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  // password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/admin/profile')
        setProfile(res.data)
        setName(res.data.name || '')
        setUsername(res.data.username || '')
        setEmail(res.data.email || '')
        setImagePreview(res.data.profileImage || '')
      } catch (err) {
        setErr('Unable to load profile')
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const onSelectImage = async (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp']
    if (!allowed.includes(f.type)) return setErr('Invalid file type')
    if (f.size > 5 * 1024 * 1024) return setErr('Image must be 5MB or smaller')
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
  }

  const saveProfile = async () => {
    try {
      setErr(null); setMsg(null)
      await API.put('/admin/profile', { name, username })
      setMsg('Profile updated successfully.')
    } catch (err) { setErr(err.response?.data?.message || 'Error updating profile') }
  }

  const uploadPhoto = async () => {
    if (!imageFile) return setErr('No image selected')
    try {
      setErr(null); setMsg(null)
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result
        const res = await API.put('/admin/profile/photo', { image: dataUrl })
        setProfile(res.data.admin)
        setImagePreview(res.data.admin.profileImage || '')
        setMsg('Profile picture updated successfully.')
      }
      reader.readAsDataURL(imageFile)
    } catch (err) { setErr(err.response?.data?.message || 'Error uploading photo') }
  }

  const resetPassword = async () => {
    setErr(null); setMsg(null)
    if (newPassword !== confirmPassword) return setErr('New passwords do not match')
    if (!/(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) return setErr('Password must be 8+ chars, include upper, lower and a number')
    try {
      await API.put('/admin/profile/password', { currentPassword, newPassword })
      setMsg('Password changed successfully.')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) { setErr(err.response?.data?.message || 'Error changing password') }
  }

  if (loading) return <div className="text-white">Loading...</div>

  return (
    <div className="space-y-6">
      {msg && <div className="p-3 rounded-md bg-green-600 text-white">{msg}</div>}
      {err && <div className="p-3 rounded-md bg-red-600 text-white">{err}</div>}

      <div className="rounded-3xl border border-white/10 p-6 shadow-sm" style={{ background: 'rgba(7, 12, 35, 0.92)' }}>
        <h3 className="text-lg font-semibold text-[#F8FAFF] mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center md:items-start">
            <div className="w-36 h-36 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-white/60">No photo</div>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="file" accept="image/*" onChange={onSelectImage} className="hidden" />
                <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white">Upload New Photo</span>
              </label>
              <button onClick={removeImage} className="px-4 py-2 rounded-xl bg-white/5 text-white">Remove Photo</button>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm text-[#C4D2F3]">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-2 rounded-2xl border border-white/10 px-4 py-3 text-white" />
            </div>
            <div>
              <label className="text-sm text-[#C4D2F3]">Email (read-only)</label>
              <input value={email} readOnly className="w-full mt-2 rounded-2xl border border-white/10 px-4 py-3 bg-slate-800 text-white" />
            </div>
            <div>
              <label className="text-sm text-[#C4D2F3]">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full mt-2 rounded-2xl border border-white/10 px-4 py-3 text-white" />
            </div>
            <div className="flex justify-end">
              <div className="flex gap-3">
                <button onClick={() => { setImageFile(null); setImagePreview(profile?.profileImage || '') }} className="px-4 py-2 rounded-xl bg-white/5 text-white">Cancel</button>
                <button onClick={saveProfile} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white">Save Changes</button>
                <button onClick={uploadPhoto} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white">Upload Photo</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 p-6 shadow-sm" style={{ background: 'rgba(7, 12, 35, 0.92)' }}>
        <h3 className="text-lg font-semibold text-[#F8FAFF] mb-4">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#C4D2F3]">Current Password</label>
            <div className="mt-2 relative">
              <input type={showPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full rounded-2xl border border-white/10 px-4 py-3 text-white" />
              <button onClick={() => setShowPw(s => !s)} className="absolute right-3 top-3 text-white/60">{showPw ? 'Hide' : 'Show'}</button>
            </div>
          </div>

          <div>
            <label className="text-sm text-[#C4D2F3]">New Password</label>
            <div className="mt-2 relative">
              <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded-2xl border border-white/10 px-4 py-3 text-white" />
              <button onClick={() => setShowNewPw(s => !s)} className="absolute right-3 top-3 text-white/60">{showNewPw ? 'Hide' : 'Show'}</button>
            </div>
            <p className="text-sm text-[#C4D2F3] mt-2">Minimum 8 characters, one uppercase, one lowercase, one number.</p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-[#C4D2F3]">Confirm New Password</label>
            <input type={showNewPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full mt-2 rounded-2xl border border-white/10 px-4 py-3 text-white" />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }} className="px-4 py-2 rounded-xl bg-white/5 text-white">Cancel</button>
            <button onClick={resetPassword} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white">Reset Password</button>
          </div>
        </div>
      </div>
    </div>
  )
}

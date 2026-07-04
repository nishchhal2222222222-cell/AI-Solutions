import React, { useMemo, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import API from '../config/api'
import logo from '../assets/logo.svg'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '#about' },
  { label: 'Our Services', href: '#services' },
  { label: 'Articles', href: '#articles' },
  { label: 'Event', href: '#event-section' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Ratings', href: '#feedback' },
  { label: 'Contact Us', href: '#contact' }
]

export default function Navbar(){
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showGetStarted, setShowGetStarted] = useState(false)
  const location = useLocation()
  const [currentHash, setCurrentHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''))

  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash || '')
    window.addEventListener('hashchange', onHashChange, { passive: true })
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (location.hash && location.hash !== currentHash) {
      setCurrentHash(location.hash)
    }
  }, [location.hash, currentHash])

  const activePage = useMemo(() => {
    if (location.pathname === '/') {
      if (currentHash === '#about') return 'About Us'
      if (currentHash === '#services') return 'Our Services'
      if (currentHash === '#articles') return 'Articles'
      if (currentHash === '#event-section') return 'Event'
      if (currentHash === '#gallery') return 'Gallery'
      if (currentHash === '#feedback') return 'Ratings'
      if (currentHash === '#contact') return 'Contact Us'
      return 'Home'
    }
    return 'Home'
  }, [location.pathname, currentHash])

  const isAdminDashboard = location.pathname === '/admin/dashboard'
  const [compactNav, setCompactNav] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout')
      window.location.href = '/'
    } catch (err) {
      console.error('Logout failed')
    }
  }

  const handleHomeClick = () => {
    setMobileOpen(false)
    setShowGetStarted(false)
    setCurrentHash('')
    window.scrollTo(0, 0)
  }

  const handleHashNavClick = (href) => {
    setMobileOpen(false)
    if (href.startsWith('#')) setCurrentHash(href)
  }

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset
      if (scrollY > 80) {
        setCompactNav(true)
      } else {
        setCompactNav(false)
      }
      setLastScrollY(scrollY)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 overflow-visible bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-sm shadow-slate-950/30 transition-all duration-300">
      <div className="mx-auto max-w-[1440px] overflow-visible px-4 sm:px-8">
        <div className="overflow-visible">
          <div className={`flex items-center justify-between gap-4 border-b border-slate-800/80 transition-all duration-300 ease-out ${compactNav ? 'h-0 py-0 opacity-0 overflow-hidden border-0 pointer-events-none' : 'h-auto py-4 opacity-100'}`}>
            <Link to="/" onClick={handleHomeClick} className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-transparent shadow-none">
                <img src={logo} alt="AI-Solutions logo" className="h-14 w-14 object-contain" />
              </div>
              <div className="hidden lg:flex flex-col leading-tight">
                <span className="text-2xl font-bold tracking-tight text-slate-100">AI-Solutions</span>
              </div>
            </Link>

            <div className="hidden lg:flex flex-1 justify-center px-4">
              <div className="text-center">
                <p className="text-3xl font-bold tracking-tight text-slate-100">AI-Solutions</p>
                <p className="mt-2 text-sm text-slate-400">Modern AI systems for secure enterprise and public service organizations</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMobileOpen(prev => !prev)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-200 shadow-sm transition hover:bg-slate-800 lg:hidden">
                <span className="sr-only">Toggle navigation</span>
                {mobileOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex overflow-visible h-16 items-center justify-between px-4 z-40">
          <div className="flex items-center gap-10 overflow-x-auto text-sm font-semibold text-slate-300">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.href === '/' ? (
                  <Link to={item.href} onClick={handleHomeClick} className={`inline-flex items-center rounded-full px-4 py-2 transition ${activePage === item.label ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-300'}`}>
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} onClick={() => handleHashNavClick(item.href)} className={`inline-flex items-center rounded-full px-4 py-2 transition ${activePage === item.label ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-300'}`}>
                    {item.label}
                  </a>
                )}
                <span className={`absolute inset-x-0 -bottom-1 mx-auto h-1 rounded-full bg-gradient-to-r from-[#1B7F2A] via-[#7ED321] to-[#0D6EFD] transition-all duration-300 ${activePage === item.label ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`} />
              </div>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {isAdminDashboard && (
              <button onClick={handleLogout} className="rounded-2xl bg-slate-900/80 border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 shadow-md shadow-slate-950/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                Logout
              </button>
            )}
            {!isAdminDashboard && (
              <div className="relative overflow-visible">
                <button onClick={() => setShowGetStarted(prev => !prev)} className="rounded-2xl bg-gradient-to-r from-[#1B7F2A] to-[#7ED321] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-[#1B7F2A]/20 transition duration-300 hover:scale-[1.02] hover:shadow-2xl">
                  Get Started
                </button>
                {showGetStarted && (
                  <div className="absolute right-0 top-full mt-3 z-[9999] min-w-[220px] bg-slate-900 border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden">
                    <Link onClick={() => setShowGetStarted(false)} to="/login" className="block text-white font-medium px-4 py-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#EC4899] hover:text-white focus:bg-[rgba(139,92,246,0.15)] cursor-pointer">Login</Link>
                    <Link onClick={() => setShowGetStarted(false)} to="/admin/login" className="block text-white font-medium px-4 py-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#EC4899] hover:text-white focus:bg-[rgba(139,92,246,0.15)] cursor-pointer">Admin Portal</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden overflow-visible border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-slate-950/20">
          <div className="mx-auto max-w-[1440px] overflow-visible px-4 py-5 sm:px-8">
            <div className="grid gap-4">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.href === '/' ? (
                    <Link to={item.href} onClick={handleHomeClick} className="block rounded-3xl px-4 py-3 text-base font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-cyan-300">
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} onClick={() => { handleHashNavClick(item.href); setShowGetStarted(false) }} className="block rounded-3xl px-4 py-3 text-base font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-cyan-300">
                      {item.label}
                    </a>
                  )}
                </div>
              ))}

              {isAdminDashboard ? (
                <button onClick={handleLogout} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5">
                  Logout
                </button>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => setShowGetStarted(prev => !prev)} className="w-full rounded-2xl bg-gradient-to-r from-[#1B7F2A] to-[#7ED321] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-[#1B7F2A]/20 transition hover:-translate-y-0.5">
                    Get Started
                  </button>
                  {showGetStarted && (
                    <div className="space-y-2 rounded-xl bg-slate-900 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden p-3">
                      <Link onClick={() => { setMobileOpen(false); setShowGetStarted(false) }} to="/login" className="block text-white font-medium px-4 py-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#EC4899] hover:text-white focus:bg-[rgba(139,92,246,0.15)] cursor-pointer">
                        Login
                      </Link>
                      <Link onClick={() => { setMobileOpen(false); setShowGetStarted(false) }} to="/admin/login" className="block text-white font-medium px-4 py-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#EC4899] hover:text-white focus:bg-[rgba(139,92,246,0.15)] cursor-pointer">
                        Admin Portal
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

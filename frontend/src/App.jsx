import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ArticleReader from './pages/ArticleReader'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import UserAuth from './pages/UserAuth'
import BackgroundImg from './assets/Background_img.jpg'

export default function App(){
  return (
    <div className="app-shell relative min-h-screen flex flex-col overflow-x-hidden">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${BackgroundImg})`,
          backgroundRepeat: 'repeat-y',
          backgroundSize: '100% auto',
          backgroundPosition: 'center top',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="fixed inset-0 -z-10 bg-slate-950/15" />
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 lg:px-8 pt-36 pb-12 sm:pt-40 lg:pt-44">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<UserAuth/>} />
          <Route path="/register" element={<UserAuth initialMode="register"/>} />
          <Route path="/article/:slug" element={<ArticleReader/>} />
          <Route path="/admin/login" element={<AdminLogin/>} />
          <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        </Routes>
      </main>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-b from-slate-900 to-black text-white mt-20 border-t border-slate-800">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">AI</div>
                <span className="font-bold text-lg">AI-Solutions</span>
              </div>
              <p className="text-slate-400 text-sm">Intelligent digital assistants & customer engagement systems.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
                <li><a href="#services" className="hover:text-indigo-400 transition-colors">Services</a></li>
                <li><a href="#gallery" className="hover:text-indigo-400 transition-colors">Gallery</a></li>
                <li><a href="#feedback" className="hover:text-indigo-400 transition-colors">Testimonials</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">AI Assistants</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Customer Engagement</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Prototyping</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Consulting</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>📧 contact@ai-solutions.com</li>
                <li>🌐 www.ai-solutions.com</li>
                <li className="pt-2">
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">L</a>
                    <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">T</a>
                    <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">F</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
              <p>&copy; 2026 AI-Solutions. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

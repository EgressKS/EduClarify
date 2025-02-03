"use client"
import Link from "next/link"
import { useState } from "react"
import { Menu, X, LogOut, Settings, BarChart3 } from "lucide-react"
import { ProfileAvatar } from "./profile-avatar"

interface NavbarProps {
  isLoggedIn: boolean
  user: { name: string; email: string } | null
  onLogout: () => void
  onLogin: (name: string, email: string) => void
  onShowSignIn?: () => void
  onShowSignUp?: () => void
}

export function Navbar({ isLoggedIn, user, onLogout, onLogin, onShowSignIn, onShowSignUp }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-700/30 bg-slate-900/80 backdrop-blur-lg">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">KS</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent hidden sm:inline">
                EduClarify
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-2 items-center">
              {isLoggedIn && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 hover:bg-slate-800/50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <ProfileAvatar name={user.name} size="sm" />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-700/30">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                      >
                        <BarChart3 size={16} />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          onLogout()
                          setShowProfileMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-slate-700/30"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={onShowSignIn}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-md font-medium"
                  >
                    Log in
                  </button>
                  <button
                    onClick={onShowSignUp}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium text-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
              {isLoggedIn && (
                <Link
                  href="/solver"
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 font-medium text-sm"
                >
                  Start Learning
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden border-t border-slate-700/30 py-4 space-y-2">
              {isLoggedIn && user ? (
                <>
                  <div className="px-4 py-3 bg-slate-800/50 rounded-lg mb-2">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm"
                  >
                    Settings
                  </button>
                  <Link
                    href="#"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-sm font-medium"
                  >
                    Start Learning
                  </Link>
                  <button
                    onClick={() => {
                      onLogout()
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onShowSignIn?.()
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      onShowSignUp?.()
                      setIsOpen(false)
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

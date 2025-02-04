"use client"
import Link from "next/link"
import { useState } from "react"
import { Menu, X, LogOut, Settings, BarChart3, User } from "lucide-react"
import { ProfileAvatar } from "./profile-avatar"

interface NavbarProps {
  isLoggedIn: boolean
  user: { id?: string; name: string; email: string } | null
  onLogout: () => void
  onShowSignIn?: () => void
  onShowSignUp?: () => void
}

export function Navbar({ isLoggedIn, user, onLogout, onShowSignIn, onShowSignUp }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto px-6 sm:px-6 lg:px-8 ">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                <span className="text-white font-bold text-lg">EC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent hidden sm:inline">
                EduClarify
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-2 items-center">
              {isLoggedIn && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 hover:bg-zinc-800/50 p-1 rounded-full transition-all duration-200 ring-0 hover:ring-2 hover:ring-red-500"
                  >
                    <ProfileAvatar name={user.name} size="lg" />
                  </button>
                  {showProfileMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className="absolute right-0 mt-3 w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-dropdown">
                        {/* User Info Header */}
                        <div className="px-4 py-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-zinc-700/30">
                          <div className="flex items-center gap-3">
                            <ProfileAvatar name={user.name} size="md" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                              <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href="/solver"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <BarChart3 size={18} className="text-gray-400" />
                            <span>Start Learning</span>
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-zinc-700/50 transition-colors"
                          >
                            <User size={18} className="text-gray-400" />
                            <span>Profile</span>
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-zinc-700/50 transition-colors"
                          >
                            <Settings size={18} className="text-gray-400" />
                            <span>Settings</span>
                          </Link>
                        </div>
                        
                        {/* Logout */}
                        <div className="border-t border-slate-700/30 py-2">
                          <button
                            onClick={() => {
                              onLogout()
                              setShowProfileMenu(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut size={18} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
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
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-md hover:from-red-500 hover:to-red-400 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 font-medium text-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden border-t border-zinc-800/50 py-4 space-y-2">
              {isLoggedIn && user ? (
                <>
                  <div className="px-4 py-3 bg-zinc-800/50 rounded-lg mb-2">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <Link
                    href="/solver"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors text-sm"
                  >
                    Start Learning
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors text-sm"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors text-sm"
                  >
                    Settings
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
                    className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors text-sm"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      onShowSignUp?.()
                      setIsOpen(false)
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-md hover:shadow-lg hover:shadow-red-500/30 transition-all text-sm font-medium"
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

"use client"

import Link from "next/link"
import { Mail, Linkedin, Github, Twitter, User, Settings, ChevronUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ProfileAvatar } from "./profile-avatar"

interface FooterProps {
  isLoggedIn?: boolean
  user?: { id?: string; name: string; email: string } | null
}

export function Footer({ isLoggedIn = false, user = null }: FooterProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  // Close menu on click outside
  useEffect(() => {
    if (!showUserMenu) return

    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [showUserMenu])

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-800/40 bg-slate-950/70 backdrop-blur-sm mt-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-12 ">
        {/* Footer Top Section (User bar) */}
        {isLoggedIn && user && (
          <div className="py-5 border-b border-slate-800/40 flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Signed in as
                </span>
                <span className="text-sm font-medium text-white">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
            </div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-slate-700/60 bg-slate-900/70 hover:bg-slate-800/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
                aria-label="User menu"
              >
                <ProfileAvatar name={user.name} size="sm" />
                <span className="hidden sm:inline text-xs text-slate-300">
                  Account
                </span>
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-3 w-44 bg-slate-900/95 border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden z-20"
                  role="menu"
                >
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-100 hover:bg-slate-800/80 transition-colors"
                    role="menuitem"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-100 hover:bg-slate-800/80 transition-colors"
                    role="menuitem"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <div className="border-t border-slate-700/60" />
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-300 hover:bg-red-950/40 transition-colors"
                    role="menuitem"
                  >
                    {/* Replace with real logout logic */}
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="py-12">
          <div className="grid gap-10 md:grid-cols-5 mb-10">
            {/* Brand / About */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold text-lg">KS</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold bg-gradient-to-r from-blue-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent text-lg">
                    EduClarify
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    AI-first learning platform
                  </span>
                </div>
              </div>
              {/* SHORT TAGLINE 10–25 CHARACTERS */}
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Personalized AI Learning
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700/60 px-2.5 py-1 text-[11px] text-slate-300">
                  ✨ AI-powered explanations
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700/60 px-2.5 py-1 text-[11px] text-slate-300">
                  📚 Curriculum aligned
                </span>
              </div>
            </div>

            {/* Product */}
            <nav aria-label="Product" className="space-y-3">
              <h4 className="text-white font-semibold text-sm tracking-wide">
                Product
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="">
                  <Link
                    href="/features"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    Live demo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    API access
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Company */}
            <nav aria-label="Company" className="space-y-3">
              <h4 className="text-white font-semibold text-sm tracking-wide">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Newsletter / Legal */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm tracking-wide">
                Stay in the loop
              </h4>
              <p className="text-slate-400 text-sm">
                Get product updates, study tips, and AI learning insights in
                your inbox.
              </p>
              <form
                className="flex flex-col sm:flex-row gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg bg-slate-900/80 border border-slate-700/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                >
                  Subscribe
                </button>
              </form>

              <div className="pt-2">
                <h5 className="text-xs font-semibold text-slate-400 mb-2">
                  Legal
                </h5>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                  <Link
                    href="/privacy"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/cookies"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Cookies
                  </Link>
                  <Link
                    href="/support"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Support
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-slate-800/40 pt-6 pb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1 text-sm text-slate-500">
              <p>&copy; {currentYear} EduClarify AI. All rights reserved.</p>
              <p className="text-xs">
                Built for students, educators, and life-long learners.
              </p>
            </div>

            <div className="flex items-center gap-5">
              {/* Social Links */}
              <div className="flex gap-2">
                <Link
                  href="https://twitter.com"
                  aria-label="EduClarify on Twitter"
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors"
                >
                  <Twitter size={18} />
                </Link>
                <Link
                  href="https://linkedin.com"
                  aria-label="EduClarify on LinkedIn"
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors"
                >
                  <Linkedin size={18} />
                </Link>
                <Link
                  href="https://github.com"
                  aria-label="EduClarify on GitHub"
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors"
                >
                  <Github size={18} />
                </Link>
                <Link
                  href="mailto:hello@educlarify.ai"
                  aria-label="Email EduClarify"
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors"
                >
                  <Mail size={18} />
                </Link>
              </div>

              {/* Back to top */}
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-blue-500 hover:text-blue-300 hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <ChevronUp size={14} />
                Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

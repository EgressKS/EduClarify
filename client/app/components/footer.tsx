"use client"

import Link from "next/link"
import { Mail, Linkedin, Github, Twitter, User, Settings, ChevronUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ProfileAvatar } from "./profile-avatar"


export function Footer() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100)
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    <>
      <footer className="border-t border-zinc-800/40 bg-zinc-950 backdrop-blur-sm mt-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-12">
        

        <div className="py-8">
          <div className="grid gap-10 md:grid-cols-5 mb-6">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity w-fit">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <span className="text-white font-bold text-lg">EC</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent text-lg">
                    EduClarify
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                    AI-first learning platform
                  </span>
                </div>
              </Link>
              {/* SHORT TAGLINE 10–25 CHARACTERS */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Personalized AI Learning
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-zinc-900/80 border border-zinc-700/60 px-2.5 py-1 text-[11px] text-gray-300">
                  ✨ AI-powered explanations
                </span>
                <span className="inline-flex items-center rounded-full bg-zinc-900/80 border border-zinc-700/60 px-2.5 py-1 text-[11px] text-gray-300">
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
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Live demo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api"
                    className="text-gray-400 hover:text-red-400 transition-colors"
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
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-red-400 transition-colors"
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
              <p className="text-gray-400 text-sm">
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
                  className="w-full rounded-lg bg-zinc-900/80 border border-zinc-700/70 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
                >
                  Subscribe
                </button>
              </form>

              <div className="pt-2">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">
                  Legal
                </h5>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-gray-500">
                  <Link
                    href="/privacy"
                    className="hover:text-red-400 transition-colors"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    className="hover:text-red-400 transition-colors"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/cookies"
                    className="hover:text-red-400 transition-colors"
                  >
                    Cookies
                  </Link>
                  <Link
                    href="/support"
                    className="hover:text-red-400 transition-colors"
                  >
                    Support
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-zinc-800/40 pt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1 text-sm text-gray-500">
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
                  className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/70 text-gray-400 hover:text-red-400 hover:border-red-500 transition-colors"
                >
                  <Twitter size={18} />
                </Link>
                <Link
                  href="https://linkedin.com"
                  aria-label="EduClarify on LinkedIn"
                  className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/70 text-gray-400 hover:text-red-400 hover:border-red-500 transition-colors"
                >
                  <Linkedin size={18} />
                </Link>
                <Link
                  href="https://github.com"
                  aria-label="EduClarify on GitHub"
                  className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/70 text-gray-400 hover:text-red-400 hover:border-red-500 transition-colors"
                >
                  <Github size={18} />
                </Link>
                <Link
                  href="mailto:hello@educlarify.ai"
                  aria-label="Email EduClarify"
                  className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/70 text-gray-400 hover:text-red-400 hover:border-red-500 transition-colors"
                >
                  <Mail size={18} />
                </Link>
              </div>

              {/* Back to top */}
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/70 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-red-500 hover:text-red-300 hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                <ChevronUp size={14} />
                Top
              </button>
            </div>
          </div>
        </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          className="fixed bottom-6 right-6 z-[9999] p-3 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 hover:from-red-500 hover:to-red-400 hover:shadow-red-500/50 hover:scale-110 transition-all duration-300"
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  )
}

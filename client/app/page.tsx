"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Mail, Linkedin, Github, Twitter } from "lucide-react"

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-5 py-3 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
            EduClarify
          </span>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors">Demo</button>
          <Link
            href="/solver"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium"
          >
            Try Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-8 py-32">
        <div
          className={`text-center transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-block mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-300">
            ✨ AI-Powered Learning Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-balance">
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
              Ask Any Doubt,
            </span>
            <br />
            <span className="text-slate-100">Get Instant AI Help</span>
          </h1>

          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform the way you learn. Get step-by-step explanations with LaTeX formatting for math, physics,
            chemistry, and more. Your personal AI teacher is always ready.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
            <Link
              href="/solver"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Learning</span>
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <button className="px-8 py-3.5 border-2 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg text-lg font-semibold hover:bg-slate-800/50 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
    
        {/* More Powerful Features Section */}
        <div
          className={`mt-32 transition-all duration-1000 delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-center text-balance">
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
              More Powerful Features
            </span>
          </h2>
          <p className="text-xl text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to excel in your studies
          </p>

          {/* Extended Features Grid - 2x2 layout */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:from-purple-500/30 group-hover:to-blue-600/30 transition-all">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Instant Answers</h3>
              <p className="text-slate-400 leading-relaxed">
                Get immediate responses to your doubts without waiting. Our AI processes questions in real-time to
                provide accurate solutions.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition-all">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Multi-Subject Support</h3>
              <p className="text-slate-400 leading-relaxed">
                From Mathematics and Physics to Chemistry and Biology. Master any subject with specialized AI guidance
                tailored to each discipline.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:from-green-500/30 group-hover:to-blue-600/30 transition-all">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Learning Progress Tracking</h3>
              <p className="text-slate-400 leading-relaxed">
                Monitor your improvement over time with detailed analytics. Understand your strengths and areas for
                improvement with personalized insights.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:from-orange-500/30 group-hover:to-blue-600/30 transition-all">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Personalized Learning Path</h3>
              <p className="text-slate-400 leading-relaxed">
                Get customized study recommendations based on your learning style and pace. Our adaptive system evolves
                with your progress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className=" mx-auto px-10 py-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  EduClarify
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Revolutionizing education with AI-powered learning solutions.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-slate-700/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-slate-400 text-sm">&copy; 2025 EduClarify AI. All rights reserved.</p>

              {/* Social Links */}
              <div className="flex gap-6">
                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Twitter size={20} />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Linkedin size={20} />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Github size={20} />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Mail size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

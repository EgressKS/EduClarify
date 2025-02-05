"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/app/lib/http"
import { Navbar } from "@/app/components/navbar"
import { Footer } from "@/app/components/footer"
import { useGoogleAuth } from "@/app/lib/useGoogleAuth"

export default function LandingPage() {
  const router = useRouter()
  const { initiateGoogleLogin, isLoading: googleLoading, error: googleError } = useGoogleAuth()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ id?: string; name: string; email: string } | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  // Auth modal states
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  
  // Sign In form state
  const [signInData, setSignInData] = useState({ email: "", password: "" })
  const [signInLoading, setSignInLoading] = useState(false)
  const [signInError, setSignInError] = useState("")
  
  // Sign Up form state
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" })
  const [signUpLoading, setSignUpLoading] = useState(false)
  const [signUpError, setSignUpError] = useState("")

  useEffect(() => {
    setIsLoaded(true)
    // Check for existing auth token and user data
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsLoggedIn(true)
      } catch {
        // Invalid data, clear storage
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
  }, [])

  const handleLogin = (userData: { id?: string; name: string; email: string }, token: string) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", token)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  // Sign In handlers
  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignInData(prev => ({ ...prev, [name]: value }))
    if (signInError) setSignInError("")
  }

  const handleSignInSubmit = async () => {
    if (!signInData.email || !signInData.password) {
      setSignInError("Please fill in all fields")
      return
    }

    setSignInLoading(true)
    setSignInError("")

    try {
      const response = await apiClient.post("/auth/login", {
        email: signInData.email,
        password: signInData.password,
      })

      if (response.data.success) {
        const { user: userData, token } = response.data.data
        handleLogin(userData, token)
        setShowSignIn(false)
        setSignInData({ email: "", password: "" })
      } else {
        setSignInError(response.data.message || "Login failed")
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed. Please try again."
      setSignInError(message)
    } finally {
      setSignInLoading(false)
    }
  }

  // Sign Up handlers
  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignUpData(prev => ({ ...prev, [name]: value }))
    if (signUpError) setSignUpError("")
  }

  const handleSignUpSubmit = async () => {
    if (!signUpData.email || !signUpData.password || !signUpData.name) {
      setSignUpError("Please fill in all fields")
      return
    }

    if (signUpData.password.length < 6) {
      setSignUpError("Password must be at least 6 characters long")
      return
    }

    setSignUpLoading(true)
    setSignUpError("")

    try {
      const response = await apiClient.post("/auth/signup", {
        name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password,
      })

      if (response.data.success) {
        const { user: userData, token } = response.data.data
        handleLogin(userData, token)
        setShowSignUp(false)
        setSignUpData({ name: "", email: "", password: "" })
      } else {
        setSignUpError(response.data.message || "Signup failed")
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Signup failed. Please try again."
      setSignUpError(message)
    } finally {
      setSignUpLoading(false)
    }
  }

  // Handle Google OAuth with PKCE
  const handleOAuthClick = async (provider: string) => {
    if (provider === "Google") {
      try {
        await initiateGoogleLogin()
      } catch (err) {
        setSignInError("Failed to initiate Google login")
        setSignUpError("Failed to initiate Google login")
      }
    }
  }

  // Show Google error if any
  useEffect(() => {
    if (googleError) {
      setSignInError(googleError)
      setSignUpError(googleError)
    }
  }, [googleError])

  const switchToSignUp = () => {
    setShowSignIn(false)
    setShowSignUp(true)
    setSignInData({ email: "", password: "" })
    setSignInError("")
  }

  const switchToSignIn = () => {
    setShowSignUp(false)
    setShowSignIn(true)
    setSignUpData({ name: "", email: "", password: "" })
    setSignUpError("")
  }

  if (!isLoaded) return null

  // Features data
  const features = [
    {
      icon: "⚡",
      title: "Instant Answers",
      description:
        "Get immediate responses to your doubts without waiting. Our AI processes questions in real-time to provide accurate solutions.",
    },
    {
      icon: "📚",
      title: "Multi-Subject Support",
      description:
        "From Mathematics and Physics to Chemistry and Biology. Master any subject with specialized AI guidance tailored to each discipline.",
    },
    {
      icon: "📊",
      title: "Learning Progress Tracking",
      description:
        "Monitor your improvement over time with detailed analytics. Understand your strengths and areas for improvement with personalized insights.",
    },
    {
      icon: "🎯",
      title: "Personalized Learning Path",
      description:
        "Get customized study recommendations based on your learning style and pace. Our adaptive system evolves with your progress.",
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar 
        isLoggedIn={isLoggedIn} 
        user={user} 
        onLogout={handleLogout} 
        onShowSignIn={() => setShowSignIn(true)}
        onShowSignUp={() => setShowSignUp(true)}
      />

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl p-8 relative">
            <button
              onClick={() => {
                setShowSignIn(false)
                setSignInData({ email: "", password: "" })
                setSignInError("")
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h1 className="text-3xl font-extrabold text-white mb-2 text-center">Sign in</h1>
            <p className="text-gray-400 mb-6 text-center">Welcome back! Please enter your details</p>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthClick("Google")}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg font-semibold text-white hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-gray-500">Or sign in with email</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={signInData.email}
                  onChange={handleSignInChange}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={signInData.password}
                  onChange={handleSignInChange}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-red-500 bg-zinc-800 border-zinc-600 rounded focus:ring-red-500" />
                  <span className="ml-2 text-sm text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-red-400 hover:text-red-300">
                  Forgot password?
                </a>
              </div>

              {signInError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {signInError}
                </div>
              )}

              <button
                onClick={handleSignInSubmit}
                disabled={signInLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-red-500 hover:to-red-400 hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {signInLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <button onClick={switchToSignUp} className="font-semibold text-red-400 hover:text-red-300">
                Sign up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowSignUp(false)
                setSignUpData({ name: "", email: "", password: "" })
                setSignUpError("")
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h1 className="text-3xl font-extrabold text-white mb-2 text-center">Create account</h1>
            <p className="text-gray-400 mb-3 text-center">Join thousands of users already on board</p>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthClick("Google")}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg font-semibold text-white hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              {signUpError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {signUpError}
                </div>
              )}

              <button
                onClick={handleSignUpSubmit}
                disabled={signUpLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-red-500 hover:to-red-400 hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {signUpLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create account</span>
                )}
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <button onClick={switchToSignIn} className="font-semibold text-red-400 hover:text-red-300">
                Sign in
              </button>
            </p>

            <p className="mt-1 text-xs text-gray-500 text-center">
              By signing up, you agree to our{" "}
              <a href="#" className="underline hover:text-gray-400">Terms</a>
              {" "}and{" "}
              <a href="#" className="underline hover:text-gray-400">Privacy Policy</a>
            </p>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section - Netflix Style */}
        <div className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-zinc-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.3),transparent)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          
          {/* Animated background particles/glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-full text-sm font-medium text-red-400 backdrop-blur-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>AI-Powered Learning Platform</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
                <span className="text-white">Ask Any Doubt,</span>
                <br />
                <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
                  Get Instant AI Help
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Transform the way you learn. Get step-by-step explanations with LaTeX formatting for math, physics,
                chemistry, and more. Your personal AI teacher is always ready.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <button 
                  onClick={() => {
                    if (isLoggedIn) {
                      router.push("/solver")
                    } else {
                      setShowSignIn(true)
                    }
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-md text-lg font-bold hover:from-red-500 hover:to-red-400 transition-all duration-300 flex items-center gap-3 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105"
                >
                  <span>Start Learning Now</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button className="px-8 py-4 bg-zinc-800/80 backdrop-blur border border-zinc-700 text-gray-200 hover:text-white hover:bg-zinc-700/80 hover:border-zinc-600 rounded-md text-lg font-semibold transition-all duration-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Trust indicators */}
              <div className="pt-12 flex flex-col items-center gap-4">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Trusted by students worldwide</p>
                <div className="flex items-center gap-8">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-zinc-900 flex items-center justify-center text-white text-sm font-bold">A</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-zinc-900 flex items-center justify-center text-white text-sm font-bold">B</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-zinc-900 flex items-center justify-center text-white text-sm font-bold">C</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-zinc-900 flex items-center justify-center text-white text-sm font-bold">D</div>
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-gray-400 text-xs font-bold">+10K</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-gray-400 ml-2 font-medium">No. 1 Platform</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-900 to-transparent" />
        </div>
        {/* About Section - Netflix Style */}
        <div className="relative overflow-hidden">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/20 to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32" id="about">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                <span className="text-white">Why Choose </span>
                <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
                  EduClarify?
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                The future of learning is here. Experience education like never before.
              </p>
            </div>

            {/* Netflix-style feature cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {/* Card 1 */}
              <div className="group relative bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-lg overflow-hidden border border-zinc-800 hover:border-red-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20">
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Instant AI Responses</h3>
                  <p className="text-gray-400 leading-relaxed">Get answers in seconds, not hours. Our AI never sleeps, ensuring you can learn anytime, anywhere.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-lg overflow-hidden border border-zinc-800 hover:border-red-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20">
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Smart Explanations</h3>
                  <p className="text-gray-400 leading-relaxed">Complex concepts broken down into simple steps. LaTeX-rendered formulas for crystal-clear understanding.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-lg overflow-hidden border border-zinc-800 hover:border-red-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20">
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">All Subjects Covered</h3>
                  <p className="text-gray-400 leading-relaxed">Math, Physics, Chemistry, Biology, and more. One platform for all your academic needs.</p>
                </div>
              </div>
            </div>

            {/* Stats Section - Netflix style */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20 blur-3xl" />
              <div className="relative bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-10 md:p-14">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-red-400">Live Platform Stats</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                      Trusted by students<br />
                      <span className="text-gray-400">around the world</span>
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      Join thousands of learners who have transformed their academic journey with EduClarify. 
                      Our AI-powered platform delivers results that speak for themselves.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <span className="px-4 py-2 bg-zinc-800 rounded-full text-sm text-gray-300 border border-zinc-700">🎓 University Level</span>
                      <span className="px-4 py-2 bg-zinc-800 rounded-full text-sm text-gray-300 border border-zinc-700">📚 High School</span>
                      <span className="px-4 py-2 bg-zinc-800 rounded-full text-sm text-gray-300 border border-zinc-700">🧪 Competitive Exams</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-zinc-800/50 backdrop-blur rounded-xl p-6 text-center border border-zinc-700/50 hover:border-red-500/30 transition-colors">
                      <div className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">10K+</div>
                      <div className="text-gray-400 mt-2 font-medium">Active Students</div>
                    </div>
                    <div className="bg-zinc-800/50 backdrop-blur rounded-xl p-6 text-center border border-zinc-700/50 hover:border-red-500/30 transition-colors">
                      <div className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">50K+</div>
                      <div className="text-gray-400 mt-2 font-medium">Doubts Solved</div>
                    </div>
                    <div className="bg-zinc-800/50 backdrop-blur rounded-xl p-6 text-center border border-zinc-700/50 hover:border-red-500/30 transition-colors">
                      <div className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">98%</div>
                      <div className="text-gray-400 mt-2 font-medium">Satisfaction Rate</div>
                    </div>
                    <div className="bg-zinc-800/50 backdrop-blur rounded-xl p-6 text-center border border-zinc-700/50 hover:border-red-500/30 transition-colors">
                      <div className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">24/7</div>
                      <div className="text-gray-400 mt-2 font-medium">Always Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer/>
    </div>
  )
}

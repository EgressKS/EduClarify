"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/app/lib/http"
import { Navbar } from "@/app/components/navbar"
import { Footer } from "@/app/components/footer"

export default function LandingPage() {
  const router = useRouter()
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

  const handleOAuthClick = (provider: string) => {
    alert(`${provider} OAuth coming soon!`)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      <Navbar 
        isLoggedIn={isLoggedIn} 
        user={user} 
        onLogout={handleLogout} 
        onShowSignIn={() => setShowSignIn(true)}
        onShowSignUp={() => setShowSignUp(true)}
      />

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-8 relative">
            <button
              onClick={() => {
                setShowSignIn(false)
                setSignInData({ email: "", password: "" })
                setSignInError("")
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h1 className="text-3xl font-extrabold text-white mb-2 text-center">Sign in</h1>
            <p className="text-slate-400 mb-6 text-center">Welcome back! Please enter your details</p>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthClick("Google")}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg font-semibold text-white hover:bg-slate-700 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">Or sign in with email</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={signInData.email}
                  onChange={handleSignInChange}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={signInData.password}
                  onChange={handleSignInChange}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-slate-400">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300">
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
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
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

            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <button onClick={switchToSignUp} className="font-semibold text-blue-400 hover:text-blue-300">
                Sign up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowSignUp(false)
                setSignUpData({ name: "", email: "", password: "" })
                setSignUpError("")
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h1 className="text-3xl font-extrabold text-white mb-2 text-center">Create account</h1>
            <p className="text-slate-400 mb-3 text-center">Join thousands of users already on board</p>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthClick("Google")}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg font-semibold text-white hover:bg-slate-700 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
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

            <p className="mt-4 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <button onClick={switchToSignIn} className="font-semibold text-blue-400 hover:text-blue-300">
                Sign in
              </button>
            </p>

            <p className="mt-1 text-xs text-slate-500 text-center">
              By signing up, you agree to our{" "}
              <a href="#" className="underline hover:text-slate-400">Terms</a>
              {" "}and{" "}
              <a href="#" className="underline hover:text-slate-400">Privacy Policy</a>
            </p>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-300 animate-fade-in">
              ✨ AI-Powered Learning Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                Ask Any Doubt,
              </span>
              <br />
              <span className="text-slate-100">Get Instant AI Help</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Transform the way you learn. Get step-by-step explanations with LaTeX formatting for math, physics,
              chemistry, and more. Your personal AI teacher is always ready.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button 
                onClick={() => {
                  if (isLoggedIn) {
                    router.push("/solver")
                  } else {
                    setShowSignIn(true)
                  }
                }}
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
              </button>
              <button className="px-8 py-3.5 border-2 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg text-lg font-semibold hover:bg-slate-800/50 transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                More Powerful Features
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Everything you need to excel in your studies</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-all">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer isLoggedIn={isLoggedIn} user={user} />
    </div>
  )
}

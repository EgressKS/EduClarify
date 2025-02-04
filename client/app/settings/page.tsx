"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, User, MapPin, Globe, Clock } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

interface UserData {
  id: string
  name: string
  email: string
}

interface ProfileFormData {
  fullName: string
  nickName: string
  gender: string
  country: string
  language: string
  timeZone: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Active section for sidebar navigation (based on scroll)
  const [activeSection, setActiveSection] = useState("profile")
  
  // Refs for each section
  const profileRef = useRef<HTMLDivElement>(null)
  const passwordRef = useRef<HTMLDivElement>(null)
  const deleteRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Profile form data (read-only, same as profile page)
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    nickName: "",
    gender: "",
    country: "",
    language: "",
    timeZone: "",
  })
  
  // Password state
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Intersection Observer for scroll spy
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    const sections = [profileRef.current, passwordRef.current, deleteRef.current]
    sections.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section)
      })
    }
  }, [loading])

  const scrollToSection = useCallback((sectionId: string) => {
    const refs: { [key: string]: React.RefObject<HTMLDivElement | null> } = {
      profile: profileRef,
      password: passwordRef,
      delete: deleteRef,
    }
    
    const ref = refs[sectionId]
    if (ref?.current) {
      const yOffset = -100
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    
    if (!token || !userData) {
      router.push("/")
      return
    }

    try {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setFormData(prev => ({
        ...prev,
        fullName: parsed.name || "",
      }))
    } catch {
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleSetPassword = () => {
    setPasswordError("")
    setPasswordSuccess("")

    if (!password || !confirmPassword) {
      setPasswordError("Please fill in all password fields")
      return
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    // Simulate password change (in real app, call API)
    setPasswordSuccess("Password set successfully!")
    setPassword("")
    setConfirmPassword("")
  }

  const handleDeleteAccount = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) return null

  const sidebarItems = [
    { id: "profile", label: "Profile" },
    { id: "password", label: "Password" },
    { id: "delete", label: "Delete account" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b  flex flex-col">
      {/* Navbar */}
      <Navbar
        isLoggedIn={true}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Account settings</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area - All sections visible */}
          <div className="flex-1 space-y-6">
            {/* Personal Information Section */}
            <div ref={profileRef} id="profile" className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-purple-400" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName || "---"}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white cursor-default focus:outline-none"
                  />
                </div>

                {/* Nick Name */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Nick Name</label>
                  <input
                    type="text"
                    value={formData.nickName || "---"}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white cursor-default focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <User size={14} className="text-slate-500" />
                    Gender
                  </label>
                  <input
                    type="text"
                    value={formData.gender || "---"}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white cursor-default focus:outline-none"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <MapPin size={14} className="text-slate-500" />
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country || "---"}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white cursor-default focus:outline-none"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <Globe size={14} className="text-slate-500" />
                    Language
                  </label>
                  <input
                    type="text"
                    value={formData.language || "---"}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white cursor-default focus:outline-none"
                  />
                </div>

                {/* Time Zone */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <Clock size={14} className="text-slate-500" />
                    Time Zone
                  </label>
                  <input
                    type="text"
                    value={formData.timeZone || "---"}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white cursor-default focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-400 cursor-default focus:outline-none"
                />
              </div>
            </div>

            {/* Set Password Section */}
            <div ref={passwordRef} id="password" className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Set password</h2>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSetPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                >
                  Set password
                </button>
              </div>
            </div>

            {/* Delete Account Section */}
            <div ref={deleteRef} id="delete" className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Delete account</h2>
              <p className="text-slate-400 text-sm mb-4">Before you can delete your account, you need to:</p>
              
              <div className="flex items-center gap-2 text-slate-300 mb-6">
                <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center">
                  <Check size={12} className="text-green-400" />
                </div>
                <span className="text-sm">Leave all organizations</span>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                >
                  Delete account
                </button>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-white font-medium mb-2">Are you sure?</p>
                  <p className="text-sm text-slate-400 mb-4">This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Navigation - Fixed position on right */}
          <div className="hidden lg:block lg:w-48 flex-shrink-0">
            <div className="sticky top-24">
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-2 ${
                      activeSection === item.id
                        ? "text-white border-l-blue-500"
                        : "text-slate-400 border-l-transparent hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

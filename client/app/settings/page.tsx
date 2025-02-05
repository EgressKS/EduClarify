"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, User, MapPin, Globe, Clock } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { apiClient } from "../lib/http";

interface UserData {
  id: string
  name: string
  email: string
  nickName?: string
  gender?: string
  country?: string
  language?: string
  timeZone?: string
  avatarUrl?: string
  authProvider?: string
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
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Profile saving state
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileError, setProfileError] = useState("")

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
      setFormData({
        fullName: parsed.name || "",
        nickName: parsed.nickName || "",
        gender: parsed.gender || "",
        country: parsed.country || "",
        language: parsed.language || "",
        timeZone: parsed.timeZone || "",
      })
      
      // Fetch latest profile from server
      fetchProfile()
    } catch {
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/auth/profile')
      if (response.data.success) {
        const userData = response.data.data.user
        setUser(userData)
        setFormData({
          fullName: userData.name || "",
          nickName: userData.nickName || "",
          gender: userData.gender || "",
          country: userData.country || "",
          language: userData.language || "",
          timeZone: userData.timeZone || "",
        })
        // Update local storage
        localStorage.setItem("user", JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleSetPassword = async () => {
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

    // Check if user has existing password (local auth)
    const hasExistingPassword = user?.authProvider === 'local' || (user?.authProvider !== 'google')

    if (hasExistingPassword && !currentPassword) {
      setPasswordError("Current password is required")
      return
    }

    setPasswordLoading(true)

    try {
      const response = await apiClient.put('/auth/password', {
        currentPassword: hasExistingPassword ? currentPassword : undefined,
        newPassword: password
      })

      if (response.data.success) {
        setPasswordSuccess("Password updated successfully!")
        setCurrentPassword("")
        setPassword("")
        setConfirmPassword("")
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      setPasswordError(axiosError.response?.data?.message || "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError("")
    setDeleteLoading(true)

    try {
      const response = await apiClient.delete('/auth/account', {
        data: { password: deletePassword }
      })

      if (response.data.success) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/")
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      setDeleteError(axiosError.response?.data?.message || "Failed to delete account")
      setDeleteLoading(false)
    }
  }

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setProfileError("")
    setProfileSuccess("")

    // Validate required fields
    if (!formData.fullName.trim()) {
      setProfileError("Please enter your full name")
      return
    }

    setProfileSaving(true)

    try {
      const response = await apiClient.put('/auth/profile', {
        fullName: formData.fullName,
        nickName: formData.nickName,
        gender: formData.gender,
        country: formData.country,
        language: formData.language,
        timeZone: formData.timeZone
      })
      
      if (response.data.success) {
        const updatedUser = response.data.data.user
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser as UserData)
        setProfileSuccess("Profile updated successfully!")
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      setProfileError(axiosError.response?.data?.message || "Failed to update profile. Please try again.")
    } finally {
      setProfileSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Account settings</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area - All sections visible */}
          <div className="flex-1 space-y-6">
            {/* Personal Information Section */}
            <div ref={profileRef} id="profile" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-red-400" />
                Personal Information
              </h2>

              {profileError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {profileSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleProfileChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Nick Name */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Nick Name</label>
                  <input
                    type="text"
                    value={formData.nickName}
                    onChange={(e) => handleProfileChange("nickName", e.target.value)}
                    placeholder="Enter your nick name"
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                    <User size={14} className="text-zinc-500" />
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleProfileChange("gender", e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                    <MapPin size={14} className="text-zinc-500" />
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleProfileChange("country", e.target.value)}
                    placeholder="Enter your country"
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                    <Globe size={14} className="text-zinc-500" />
                    Language
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => handleProfileChange("language", e.target.value)}
                    placeholder="Enter your language"
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Time Zone */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                    <Clock size={14} className="text-zinc-500" />
                    Time Zone
                  </label>
                  <select
                    value={formData.timeZone}
                    onChange={(e) => handleProfileChange("timeZone", e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    <option value="">Select time zone</option>
                    <option value="UTC-12:00">UTC-12:00 (Baker Island)</option>
                    <option value="UTC-11:00">UTC-11:00 (American Samoa)</option>
                    <option value="UTC-10:00">UTC-10:00 (Hawaii)</option>
                    <option value="UTC-09:00">UTC-09:00 (Alaska)</option>
                    <option value="UTC-08:00">UTC-08:00 (Pacific Time)</option>
                    <option value="UTC-07:00">UTC-07:00 (Mountain Time)</option>
                    <option value="UTC-06:00">UTC-06:00 (Central Time)</option>
                    <option value="UTC-05:00">UTC-05:00 (Eastern Time)</option>
                    <option value="UTC-04:00">UTC-04:00 (Atlantic Time)</option>
                    <option value="UTC-03:00">UTC-03:00 (Buenos Aires)</option>
                    <option value="UTC-02:00">UTC-02:00 (Mid-Atlantic)</option>
                    <option value="UTC-01:00">UTC-01:00 (Azores)</option>
                    <option value="UTC+00:00">UTC+00:00 (London, GMT)</option>
                    <option value="UTC+01:00">UTC+01:00 (Paris, Berlin)</option>
                    <option value="UTC+02:00">UTC+02:00 (Cairo, Jerusalem)</option>
                    <option value="UTC+03:00">UTC+03:00 (Moscow, Istanbul)</option>
                    <option value="UTC+04:00">UTC+04:00 (Dubai)</option>
                    <option value="UTC+05:00">UTC+05:00 (Karachi)</option>
                    <option value="UTC+05:30">UTC+05:30 (India, Sri Lanka)</option>
                    <option value="UTC+06:00">UTC+06:00 (Dhaka)</option>
                    <option value="UTC+07:00">UTC+07:00 (Bangkok, Jakarta)</option>
                    <option value="UTC+08:00">UTC+08:00 (Singapore, Beijing)</option>
                    <option value="UTC+09:00">UTC+09:00 (Tokyo, Seoul)</option>
                    <option value="UTC+10:00">UTC+10:00 (Sydney)</option>
                    <option value="UTC+11:00">UTC+11:00 (Solomon Islands)</option>
                    <option value="UTC+12:00">UTC+12:00 (Auckland, Fiji)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 mb-3">
                <label className="block text-sm text-zinc-400 mb-2">Email (Email cannot be changed)</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 cursor-default focus:outline-none"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileSaving ? "Saving..." : "Save changes"}
              </button>
            </div>

            {/* Set Password Section */}
            <div ref={passwordRef} id="password" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                {user?.authProvider === 'google' ? 'Set password' : 'Change password'}
              </h2>

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
                {/* Current Password - only show if user has local auth */}
                {user?.authProvider !== 'google' && (
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSetPassword}
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? "Updating..." : (user?.authProvider === 'google' ? 'Set password' : 'Update password')}
                </button>
              </div>
            </div>

            {/* Delete Account Section */}
            <div ref={deleteRef} id="delete" className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Delete account</h2>
              <p className="text-zinc-400 text-sm mb-4">This action is permanent and cannot be undone.</p>

              <div className="flex items-center gap-2 text-zinc-300 mb-6">
                <div className="w-5 h-5 rounded-full border border-zinc-600 flex items-center justify-center">
                  <Check size={12} className="text-green-400" />
                </div>
                <span className="text-sm">All your data will be permanently deleted</span>
              </div>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {deleteError}
                </div>
              )}

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm"
                >
                  Delete account
                </button>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-white font-medium mb-2">Are you sure?</p>
                  <p className="text-sm text-zinc-400 mb-4">This action cannot be undone. All your data will be permanently deleted.</p>
                  
                  {user?.authProvider !== 'google' && (
                    <div className="mb-4">
                      <label className="block text-sm text-zinc-400 mb-2">Enter your password to confirm</label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeletePassword("")
                        setDeleteError("")
                      }}
                      className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-500 transition-colors text-sm"
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
                    className={`w-full text-left px-4 py-2 text-sm transition-all duration-200 border-l-2 ${activeSection === item.id
                        ? "text-white border-l-red-500"
                        : "text-zinc-400 border-l-transparent hover:text-white"
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
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  )
}

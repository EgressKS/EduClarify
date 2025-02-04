"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, MapPin, Globe, Clock, User, Sparkles } from "lucide-react"
import { Navbar } from "../components/navbar"

interface UserData {
  id: string
  name: string
  email: string
  createdAt?: string
}

interface ProfileFormData {
  fullName: string
  nickName: string
  gender: string
  country: string
  language: string
  timeZone: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    nickName: "",
    gender: "",
    country: "",
    language: "",
    timeZone: "",
  })

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



  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar
        isLoggedIn={true}
        user={user}
        onLogout={handleLogout}
      />

      {/* Hero Section with Gradient */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-violet-600/40 via-purple-500/30 to-blue-600/40 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.3),transparent_50%)]" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        {/* Profile Card - Overlapping Hero */}
        <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar with Camera */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-[3px] shadow-lg shadow-purple-500/25">
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                  <Camera size={16} className="text-white" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  <Sparkles size={18} className="text-purple-400" />
                </div>
                <p className="text-slate-400">{user.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </span>
                  <span className="text-xs text-slate-600">Member since 2024</span>
                </div>
              </div>

              {/* Stats or Badge */}
              <div className="hidden md:flex items-center gap-3">
                <div className="px-4 py-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-purple-500/20 rounded-xl">
                  <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    Pro Learner
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User size={20} className="text-purple-400" />
            Personal Information
          </h2>
        
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="group">
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={formData.fullName || "---"}
                readOnly
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white cursor-default focus:outline-none"
              />
            </div>
          </div>

          {/* Nick Name */}
          <div className="group">
            <label className="block text-sm font-medium text-slate-400 mb-2">Nick Name</label>
            <div className="relative">
              <input
                type="text"
                value={formData.nickName || "---"}
                readOnly
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white cursor-default focus:outline-none"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="group">
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <User size={14} className="text-slate-500" />
              Gender
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.gender || "---"}
                readOnly
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white cursor-default focus:outline-none"
              />
            </div>
          </div>

          {/* Country */}
          <div className="group">
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-slate-500" />
              Country
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.country || "---"}
                readOnly
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white cursor-default focus:outline-none"
              />
            </div>
          </div>

          {/* Language */}
          <div className="group">
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Globe size={14} className="text-slate-500" />
              Language
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.language || "---"}
                readOnly
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white cursor-default focus:outline-none"
              />
            </div>
          </div>

          {/* Time Zone */}
          <div className="group">
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              Time Zone
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.timeZone || "---"}
                readOnly
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white cursor-default focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

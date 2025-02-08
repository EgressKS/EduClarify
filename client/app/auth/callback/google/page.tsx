"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useGoogleAuth } from "@/app/lib/useGoogleAuth"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleCallback, isLoading, error } = useGoogleAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Processing authentication...")
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    // Prevent duplicate processing (React 18 Strict Mode runs effects twice)
    if (hasProcessed) {
      console.log("Callback already processed, skipping");
      return;
    }

    const processCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const errorParam = searchParams.get("error")

      console.log("=== OAUTH CALLBACK RECEIVED ===")
      console.log("Code:", code?.substring(0, 20) + '...')
      console.log("State:", state)
      console.log("Error:", errorParam)
      console.log("Current URL:", window.location.href)
      
      // Check what's in storage RIGHT NOW
      console.log("Storage check on callback:")
      console.log("- localStorage pkce_data:", !!localStorage.getItem('pkce_data'))
      console.log("- sessionStorage pkce_state:", !!sessionStorage.getItem('pkce_state'))
      console.log("- Cookies:", document.cookie)

      if (errorParam) {
        setStatus("error")
        setMessage(searchParams.get("error_description") || "Authentication was cancelled")
        return
      }

      if (!code || !state) {
        setStatus("error")
        setMessage("Missing authentication parameters")
        return
      }

      // Mark as processing to prevent duplicate calls
      setHasProcessed(true)

      try {
        const result = await handleCallback(code, state)

        if (result) {
          setStatus("success")
          setMessage("Authentication successful! Redirecting...")
          
          // Redirect to home page after successful auth
          setTimeout(() => {
            router.push("/")
          }, 1000)
        } else {
          setStatus("error")
          setMessage(error || "Authentication failed")
        }
      } catch (err) {
        setStatus("error")
        setMessage("An unexpected error occurred")
      }
    }

    processCallback()
  }, [searchParams, handleCallback, router, error, hasProcessed])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Authenticating</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Success!</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Authentication Failed</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            {message.includes("state parameter") && (
              <p className="text-sm text-gray-500 mb-4">
                This can happen if you refreshed the page or your session expired. Please try logging in again.
              </p>
            )}
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Loading</h1>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}

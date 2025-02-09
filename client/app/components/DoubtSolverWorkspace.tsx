"use client"

import { useState, useRef, useEffect } from "react"
import { useMemoizedFn } from "ahooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic"
import {
  AvatarQuality,
  VoiceEmotion,
  ElevenLabsModel,
  VoiceChatTransport,
  STTProvider,
  StreamingEvents,
} from "@heygen/streaming-avatar"
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession"
import { useVoiceChat } from "./logic/useVoiceChat"
import { useConversationState } from "./logic/useConversationState"
import { useTextChat } from "./logic/useTextChat"
import { useUnmount } from "ahooks"
import { AVATARS } from "@/app/lib/constants"
import { apiClient } from "@/app/lib/http"

import { Button } from "./Button"
import { AvatarVideo } from "./AvatarSession/AvatarVideo"
import { LoadingIcon } from "./Icons"
import ExplanationPanel from "./ExplanationPanel"
import DiagramPanel from "./DiagramPanel"
import { SendIcon, MicIcon, MicOffIcon } from "./Icons"

const DEFAULT_CONFIG = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: undefined,
  voice: {
    rate: 1.2,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
}

function EduClarifyWorkspace() {
  const router = useRouter()
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } = useStreamingAvatarSession()
  const { startVoiceChat } = useVoiceChat()
  const { startListening, stopListening } = useConversationState()
  const { repeatMessage } = useTextChat()

  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [question, setQuestion] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [explanation, setExplanation] = useState<{
    avatar_script: string
    text_explanation: string
  } | null>(null)
  const [diagramQuery, setDiagramQuery] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ id?: string; name: string; email: string } | null>(null)

  const mediaStream = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setIsLoaded(true)
    // Check authentication
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch {
        // Invalid data - redirect to home
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/")
      }
    } else {
      // Not authenticated - redirect to home
      router.push("/")
    }
  }, [router])

  async function fetchAccessToken() {
    try {
      const { data } = await apiClient.post("/get-access-token");
      const token = typeof data === "string" ? data : typeof data?.token === "string" ? data.token : null

      if (!token) {
        throw new Error("Access token missing in server response")
      }
      return token
    } catch (error) {
      console.error("Error fetching access token:", error)
      throw error
    }
  }

  const startSession = useMemoizedFn(async () => {
    try {
      const newToken = await fetchAccessToken()
      const avatar = initAvatar(newToken)

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e)
      })
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e)
      })
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected")
      })
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log("Stream ready:", event.detail)
      })

      await startAvatar(DEFAULT_CONFIG)
    } catch (error) {
      console.error("Error starting avatar session:", error)
    }
  })

  const handleVoiceToggle = async () => {
    if (!isVoiceMode) {
      setIsVoiceMode(true)
      if (sessionState === StreamingAvatarSessionState.CONNECTED) {
        try {
          await startVoiceChat();
          startListening();
          setIsListening(true);
        } catch (error) {
          console.error("Unable to start voice chat:", error);
          setIsVoiceMode(false);
        }
      }
    } else {
      setIsVoiceMode(false)
      stopListening()
      setIsListening(false)
    }
  }

  // Helper to speak steps one by one
  async function speakStepsSequentially(steps: string[], delayMs = 4000) {
    console.log(`Starting to speak ${steps.length} steps with ${delayMs}ms delay between each`)

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      console.log(`Speaking step ${i + 1}/${steps.length}:`, step)

      if (repeatMessage) {
        try {
          await repeatMessage(step)
          console.log(`Step ${i + 1} sent to avatar`)

          // Wait longer between steps to allow avatar to finish speaking
          if (i < steps.length - 1) {
            // Don't wait after the last step
            console.log(`Waiting ${delayMs}ms before next step...`)
            await new Promise((resolve) => setTimeout(resolve, delayMs))
          }
        } catch (error) {
          console.error(`Error speaking step ${i + 1}:`, error)
        }
      }
    }
    console.log("Finished speaking all steps")
  }

  const handleAskQuestion = async () => {
    if (!question.trim() || isProcessing) return

    setIsProcessing(true)
    setExplanation(null)
    setDiagramQuery("")

    try {
      const { data } = await apiClient.post("/ask", {
        question: question.trim(),
      })
      console.log("Gemini response:", data)

      setExplanation(data)

      // Set diagram query for visual aids
      if (data.image_query) {
        console.log("Setting diagram query:", data.image_query)
        setDiagramQuery(data.image_query)
      } else {
        console.log("No image_query in response, using fallback")
        // Generate a fallback query if none provided
        const fallbackQuery = question
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .split(" ")
          .filter((w) => w.length > 3)
          .slice(0, 3)
          .join(" ")
        console.log("Fallback diagram query:", fallbackQuery)
        setDiagramQuery(fallbackQuery)
      }

      // Make avatar speak the response
      if (sessionState === StreamingAvatarSessionState.CONNECTED && repeatMessage) {
        if (data.avatar_steps && Array.isArray(data.avatar_steps) && data.avatar_steps.length > 0) {
          // Speak each step sequentially for better engagement
          console.log("Speaking steps sequentially:", data.avatar_steps)
          await speakStepsSequentially(data.avatar_steps)
        } else if (data.avatar_script) {
          // Fallback to single script if no steps available
          console.log("Speaking avatar script:", data.avatar_script)
          await repeatMessage(data.avatar_script)
        }
      }
    } catch (error: any) {
      console.error("Error asking question:", error)
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/")
        return
      }
      
      setExplanation({
        avatar_script: "I apologize, but I encountered an error while processing your question. Please try again.",
        text_explanation:
          error.response?.data?.message || "Error: Unable to process your question at the moment. Please check your connection and try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleAskQuestion()
    }
  }

  const handleResetPanels = () => {
    setExplanation(null)
    setDiagramQuery("")
  }

  useUnmount(() => {
    stopAvatar()
  })

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play()
      }
    }
  }, [stream])

  return (
    <div className="min-h-screen bg-gradient-to-br text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800 px-5 py-3 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="text-white font-bold text-xl">EC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              EduClarify AI
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${sessionState === StreamingAvatarSessionState.CONNECTED ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-red-500 shadow-lg shadow-red-500/50"}`}
              ></div>
              <span
                className={`text-sm font-medium ${sessionState === StreamingAvatarSessionState.CONNECTED ? "text-green-400" : "text-red-400"}`}
              >
                {sessionState === StreamingAvatarSessionState.CONNECTED ? "Connected" : "Disconnected"}
              </span>
            </div>
            <Link href="/" className="text-zinc-300 hover:text-red-400 font-medium transition-colors duration-200">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex h-[calc(100vh-88px)] overflow-hidden">
        {/* Left Panel - Avatar */}
        <div className="w-1/2 bg-gradient-to-b from-zinc-900/50 to-zinc-950/50 border-r border-zinc-800 flex flex-col sticky top-0 h-full">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Avatar Display */}
            <div className="flex-1 flex items-center justify-center relative p-8 min-h-0">
              {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
                <div
                  className={`w-full h-full bg-zinc-900/50 rounded-2xl overflow-hidden shadow-2xl shadow-red-500/10 border border-zinc-800 transition-all duration-700 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                >
                  <AvatarVideo ref={mediaStream} />
                </div>
              ) : (
                <div
                  className={`text-center transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-red-500/20">
                    <span className="text-5xl">👨‍🏫</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Your AI Teacher</h3>
                  <p className="text-zinc-400 mb-6">Ready to help you learn!</p>
                  <Button
                    onClick={startSession}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 font-medium"
                  >
                    Start Session
                  </Button>
                </div>
              )}
            </div>

            {/* Input Controls */}
            <div className="flex-shrink-0 pt-8 px-8 pb-4 border-t border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
              {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                <div className="space-y-6">
                  {/* Voice/Text Toggle */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleVoiceToggle}
                      className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg ${
                        isVoiceMode
                          ? "bg-red-500/90 hover:bg-red-600 text-white shadow-red-500/30 hover:shadow-red-500/50"
                          : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30 hover:shadow-red-500/50"
                      }`}
                    >
                      {isVoiceMode ? <MicOffIcon size={18} /> : <MicIcon size={18} />}
                      <span>{isVoiceMode ? "Stop Speaking" : "Ask Your Doubt"}</span>
                    </Button>
                  </div>

                  {/* Text Input */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="Ask your doubt here..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isProcessing}
                      className="flex-1 text-zinc-100 text-base bg-zinc-900/50 border border-zinc-800 py-3 px-4 rounded-lg outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 disabled:bg-zinc-950/50 disabled:text-zinc-500 transition-all duration-200 shadow-lg backdrop-blur-sm"
                    />
                    <Button
                      onClick={handleAskQuestion}
                      disabled={!question.trim() || isProcessing}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 disabled:bg-zinc-600 disabled:cursor-not-allowed disabled:shadow-none font-medium"
                    >
                      {isProcessing ? <LoadingIcon /> : <SendIcon size={18} />}
                    </Button>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex justify-center space-x-6 text-sm">
                    {isVoiceMode && (
                      <span
                        className={`flex items-center space-x-2 ${isListening ? "text-green-400" : "text-zinc-400"}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isListening ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50" : "bg-zinc-600"
                          }`}
                        />
                        <span className="font-medium">{isListening ? "Listening..." : "Voice Ready"}</span>
                      </span>
                    )}
                    {isProcessing && (
                      <span className="flex items-center space-x-2 text-red-400 font-medium">
                        <LoadingIcon />
                        <span>Processing...</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-400">
                  {sessionState === StreamingAvatarSessionState.CONNECTING ? (
                    <div className="flex items-center justify-center space-x-3">
                      <LoadingIcon />
                      <span className="font-medium">Connecting to AI Teacher...</span>
                    </div>
                  ) : (
                    <span className="font-medium">Start a session to begin asking questions</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Explanation */}
        <div className="w-1/2 bg-gradient-to-b from-zinc-900/30 to-zinc-950/50 flex flex-col overflow-y-auto h-full border-l border-zinc-800">
          <ExplanationPanel explanation={explanation} />
          <DiagramPanel query={diagramQuery} className="border-t border-zinc-800 flex-1" onClose={handleResetPanels} />
        </div>
      </div>
    </div>
  )
}

export default function EduClarifyWorkspaceWrapper() {
  return (
    <StreamingAvatarProvider
      basePath={process.env.NEXT_PUBLIC_HEYGEN_BASE_URL || "https://api.heygen.com"}
    >
      <EduClarifyWorkspace />
    </StreamingAvatarProvider>
  )
}

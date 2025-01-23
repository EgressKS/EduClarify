"use client"

import ReactMarkdown from "react-markdown"
import "katex/dist/katex.min.css"
import { InlineMath, BlockMath } from "react-katex"
import type React from "react"
import { useState, useEffect } from "react"

interface ExplanationPanelProps {
  explanation: {
    avatar_script: string
    text_explanation: string
  } | null
}

// Custom component to handle LaTeX math expressions
const MathRenderer = ({ children }: { children: string }) => {
  // Split by LaTeX delimiters
  const parts = children.split(/(\\$$.*?\\$$|\\\[.*?\\\])/)

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          // Inline math
          const math = part.slice(2, -2)
          return <InlineMath key={index} math={math} />
        } else if (part.startsWith("\\[") && part.endsWith("\\]")) {
          // Block math
          const math = part.slice(2, -2)
          return <BlockMath key={index} math={math} />
        } else {
          return part
        }
      })}
    </>
  )
}

// Custom markdown components with dark theme styling
const components = {
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-6 leading-relaxed text-slate-300 text-base" {...props}>
      {props.children}
    </p>
  ),
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mb-6 text-white border-b border-slate-700/50 pb-3" {...props}>
      {props.children}
    </h1>
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold mb-4 text-slate-100 mt-8" {...props}>
      {props.children}
    </h2>
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-medium mb-3 text-slate-100 mt-6" {...props}>
      {props.children}
    </h3>
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-6 space-y-2 ml-4" {...props}>
      {props.children}
    </ul>
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-6 space-y-2 ml-4" {...props}>
      {props.children}
    </ol>
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className="text-slate-300 leading-relaxed" {...props}>
      {props.children}
    </li>
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-slate-900/50 px-2 py-1 rounded-md text-sm font-mono text-blue-300 border border-slate-700/50"
      {...props}
    >
      {props.children}
    </code>
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-slate-950/80 text-slate-100 p-6 rounded-xl overflow-x-auto mb-6 border border-slate-700/50 shadow-lg shadow-black/30"
      {...props}
    >
      {props.children}
    </pre>
  ),
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-6 italic text-slate-300 mb-6 bg-blue-500/10 py-4 rounded-r-lg"
      {...props}
    >
      {props.children}
    </blockquote>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-white" {...props}>
      {props.children}
    </strong>
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-slate-300" {...props}>
      {props.children}
    </em>
  ),
}

export default function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!explanation) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div
            className={`flex items-center space-x-4 transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white text-2xl">📚</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Step-by-Step Solution</h2>
              <p className="text-slate-400 mt-1">Your detailed explanation will appear here</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-800/20 to-slate-900/50">
          <div
            className={`text-center max-w-md mx-auto px-6 transition-all duration-700 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-blue-500/20">
              <span className="text-4xl">🎓</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Ready to Learn</h3>
            <p className="text-slate-300 leading-relaxed">
              Ask your AI teacher any question and get a comprehensive, step-by-step explanation with visual diagrams.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2 text-emerald-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium">AI Teacher is ready to help</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`p-8 transition-all duration-700 bg-gradient-to-b from-slate-800/30 to-slate-900/50 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="bg-slate-800/50 rounded-2xl shadow-2xl shadow-blue-500/10 border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 px-8 py-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white text-xl">✨</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Step-by-Step Solution</h2>
              <p className="text-slate-400 mt-1">AI Teacher Response</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown components={components} className="text-slate-100">
              {explanation.text_explanation}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

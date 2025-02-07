import { useEffect, useState } from "react";

/**
 * Simple Speaking Avatar Component
 * Animates mouth movement while speaking
 * Works with Web Speech API TTS
 */

interface SpeakingAvatarProps {
  isSpeaking: boolean;
  className?: string;
}

export function SpeakingAvatar({
  isSpeaking,
  className = "",
}: SpeakingAvatarProps) {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSpeaking) {
      // Animate mouth opening/closing while speaking
      interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 200);
    } else {
      setMouthOpen(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ position: "relative" }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle
          cx="100"
          cy="100"
          fill="url(#avatarGradient)"
          r="80"
          stroke="#ef4444"
          strokeWidth="3"
        />

        {/* Eyes */}
        <circle cx="75" cy="85" fill="#1f2937" r="8" />
        <circle cx="125" cy="85" fill="#1f2937" r="8" />

        {/* Eye highlights */}
        <circle cx="77" cy="83" fill="#ffffff" r="3" />
        <circle cx="127" cy="83" fill="#ffffff" r="3" />

        {/* Mouth - animates when speaking */}
        {mouthOpen ? (
          <>
            <ellipse
              cx="100"
              cy="120"
              fill="#1f2937"
              rx="20"
              ry="12"
            />
            <path
              d="M 85 115 Q 100 125, 115 115"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            />
          </>
        ) : (
          <path
            d="M 85 120 Q 100 130, 115 120"
            fill="none"
            stroke="#1f2937"
            strokeLinecap="round"
            strokeWidth="3"
          />
        )}

        {/* Microphone indicator when speaking */}
        {isSpeaking && (
          <>
            <circle
              className="animate-ping"
              cx="100"
              cy="100"
              fill="#ef4444"
              opacity="0.3"
              r="85"
            />
            <text
              fill="#ef4444"
              fontSize="12"
              textAnchor="middle"
              x="100"
              y="175"
            >
              Speaking...
            </text>
          </>
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient
            id="avatarGradient"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="50%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

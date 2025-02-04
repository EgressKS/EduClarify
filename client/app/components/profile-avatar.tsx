"use client"

interface ProfileAvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
}

export function ProfileAvatar({ name, size = "md" }: ProfileAvatarProps) {
  // Get first character in uppercase
  const firstChar = name.charAt(0).toUpperCase()

  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20`}
    >
      {firstChar}
    </div>
  )
}

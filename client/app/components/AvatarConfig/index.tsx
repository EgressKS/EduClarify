"use client"

import type React from "react"
import { useMemo, useState } from "react"
import {
  AvatarQuality,
  ElevenLabsModel,
  STTProvider,
  VoiceEmotion,
  type StartAvatarRequest,
  VoiceChatTransport,
} from "@heygen/streaming-avatar"

import { Input } from "../Input"
import { Select } from "../Select"

import { Field } from "./Field"

import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants"

interface AvatarConfigProps {
  onConfigChange: (config: StartAvatarRequest) => void
  config: StartAvatarRequest
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({ onConfigChange, config }) => {
  const onChange = <T extends keyof StartAvatarRequest>(key: T, value: StartAvatarRequest[T]) => {
    onConfigChange({ ...config, [key]: value })
  }
  const [showMore, setShowMore] = useState<boolean>(false)

  const selectedAvatar = useMemo(() => {
    const avatar = AVATARS.find((avatar) => avatar.avatar_id === config.avatarName)

    if (!avatar) {
      return {
        isCustom: true,
        name: "Custom Avatar ID",
        avatarId: null,
      }
    } else {
      return {
        isCustom: false,
        name: avatar.name,
        avatarId: avatar.avatar_id,
      }
    }
  }, [config.avatarName])

  return (
    <div className="relative flex flex-col gap-4 w-[550px] py-8 max-h-full overflow-y-auto px-4 bg-gradient-to-br from-zinc-900/60 to-zinc-900/30 rounded-xl border border-zinc-800 shadow-xl">
      <div className="mb-4 pb-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          Avatar Configuration
        </h2>
      </div>

      <Field label="Custom Knowledge Base ID">
        <Input
          placeholder="Enter custom knowledge base ID"
          value={config.knowledgeId}
          onChange={(value) => onChange("knowledgeId", value)}
        />
      </Field>
      <Field label="Avatar ID">
        <Select
          isSelected={(option) =>
            typeof option === "string" ? !!selectedAvatar?.isCustom : option.avatar_id === selectedAvatar?.avatarId
          }
          options={[...AVATARS, "CUSTOM"]}
          placeholder="Select Avatar"
          renderOption={(option) => {
            return typeof option === "string" ? "Custom Avatar ID" : option.name
          }}
          value={selectedAvatar?.isCustom ? "Custom Avatar ID" : selectedAvatar?.name}
          onSelect={(option) => {
            if (typeof option === "string") {
              onChange("avatarName", "")
            } else {
              onChange("avatarName", option.avatar_id)
            }
          }}
        />
      </Field>
      {selectedAvatar?.isCustom && (
        <Field label="Custom Avatar ID">
          <Input
            placeholder="Enter custom avatar ID"
            value={config.avatarName}
            onChange={(value) => onChange("avatarName", value)}
          />
        </Field>
      )}
      <Field label="Language">
        <Select
          isSelected={(option) => option.value === config.language}
          options={STT_LANGUAGE_LIST}
          renderOption={(option) => option.label}
          value={STT_LANGUAGE_LIST.find((option) => option.value === config.language)?.label}
          onSelect={(option) => onChange("language", option.value)}
        />
      </Field>
      <Field label="Avatar Quality">
        <Select
          isSelected={(option) => option === config.quality}
          options={Object.values(AvatarQuality)}
          renderOption={(option) => option}
          value={config.quality}
          onSelect={(option) => onChange("quality", option)}
        />
      </Field>
      <Field label="Voice Chat Transport">
        <Select
          isSelected={(option) => option === config.voiceChatTransport}
          options={Object.values(VoiceChatTransport)}
          renderOption={(option) => option}
          value={config.voiceChatTransport}
          onSelect={(option) => onChange("voiceChatTransport", option)}
        />
      </Field>
      {showMore && (
        <>
          <h1 className="text-zinc-200 w-full text-center mt-6 mb-4 font-semibold">Voice Settings</h1>
          <Field label="Custom Voice ID">
            <Input
              placeholder="Enter custom voice ID"
              value={config.voice?.voiceId}
              onChange={(value) => onChange("voice", { ...config.voice, voiceId: value })}
            />
          </Field>
          <Field label="Emotion">
            <Select
              isSelected={(option) => option === config.voice?.emotion}
              options={Object.values(VoiceEmotion)}
              renderOption={(option) => option}
              value={config.voice?.emotion}
              onSelect={(option) => onChange("voice", { ...config.voice, emotion: option })}
            />
          </Field>
          <Field label="ElevenLabs Model">
            <Select
              isSelected={(option) => option === config.voice?.model}
              options={Object.values(ElevenLabsModel)}
              renderOption={(option) => option}
              value={config.voice?.model}
              onSelect={(option) => onChange("voice", { ...config.voice, model: option })}
            />
          </Field>
          <h1 className="text-zinc-200 w-full text-center mt-6 mb-4 font-semibold">STT Settings</h1>
          <Field label="Provider">
            <Select
              isSelected={(option) => option === config.sttSettings?.provider}
              options={Object.values(STTProvider)}
              renderOption={(option) => option}
              value={config.sttSettings?.provider}
              onSelect={(option) =>
                onChange("sttSettings", {
                  ...config.sttSettings,
                  provider: option,
                })
              }
            />
          </Field>
        </>
      )}
      <button
        className="text-zinc-300 text-sm cursor-pointer w-full text-center bg-transparent py-2.5 mt-2 rounded-lg border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-900/50 hover:text-red-300 transition-all duration-300 font-medium"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "Show less" : "Show more..."}
      </button>
    </div>
  )
}

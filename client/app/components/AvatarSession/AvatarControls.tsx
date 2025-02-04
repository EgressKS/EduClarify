import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import React from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";

import { AudioInput } from "./AudioInput";
import { TextInput } from "./TextInput";

export const AvatarControls: React.FC = () => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();

  return (
    <div className="flex flex-col gap-3 relative w-full items-center">
      <ToggleGroup
        className={`bg-zinc-900 border border-zinc-800 rounded-lg p-1 ${isVoiceChatLoading ? "opacity-50" : ""}`}
        disabled={isVoiceChatLoading}
        type="single"
        value={isVoiceChatActive || isVoiceChatLoading ? "voice" : "text"}
        onValueChange={(value) => {
          if (value === "voice" && !isVoiceChatActive && !isVoiceChatLoading) {
            startVoiceChat();
          } else if (
            value === "text" &&
            isVoiceChatActive &&
            !isVoiceChatLoading
          ) {
            stopVoiceChat();
          }
        }}
      >
        <ToggleGroupItem
          className="data-[state=on]:bg-red-600 data-[state=on]:text-white rounded-lg p-2 text-sm w-[90px] text-center text-zinc-400 hover:text-white transition-colors"
          value="voice"
        >
          Voice Chat
        </ToggleGroupItem>
        <ToggleGroupItem
          className="data-[state=on]:bg-red-600 data-[state=on]:text-white rounded-lg p-2 text-sm w-[90px] text-center text-zinc-400 hover:text-white transition-colors"
          value="text"
        >
          Text Chat
        </ToggleGroupItem>
      </ToggleGroup>
      {isVoiceChatActive || isVoiceChatLoading ? <AudioInput /> : <TextInput />}
      <div className="absolute top-[-70px] right-3">
        <Button className="!bg-zinc-800 !border !border-zinc-700 !text-white hover:!bg-zinc-700" onClick={interrupt}>
          Interrupt
        </Button>
      </div>
    </div>
  );
};

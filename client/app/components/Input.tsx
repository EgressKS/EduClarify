import React from "react";

interface InputProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Input = (props: InputProps) => {
  return (
    <input
      className={`w-full text-white text-sm bg-zinc-900 border border-zinc-800 py-2 px-6 rounded-lg outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all ${props.className}`}
      placeholder={props.placeholder}
      type="text"
      value={props.value || ""}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
};

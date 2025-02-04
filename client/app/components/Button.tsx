import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  return (
    <button
      className={`bg-red-600 hover:bg-red-500 text-white text-sm px-6 py-2 rounded-lg disabled:opacity-50 disabled:hover:bg-red-600 h-fit transition-colors ${className}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};

"use client";
import { Loader2 } from "lucide-react";

type Props = {
  onClick: () => void;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function ActionButton({ onClick, loading, children, className, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-transform duration-200 hover:scale-105 ${className}`}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      <span>{children}</span>
    </button>
  );
}

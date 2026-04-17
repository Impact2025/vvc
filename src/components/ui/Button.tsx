import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-container text-white font-bold hover:opacity-90 active:scale-[0.98] font-headline uppercase tracking-wider",
  secondary:
    "border border-primary-container text-primary-container font-bold hover:bg-primary-container hover:text-white active:scale-[0.98] font-headline uppercase tracking-wider",
  ghost:
    "text-secondary font-bold hover:bg-surface-container font-headline",
  danger:
    "bg-error text-white font-bold hover:opacity-90 active:scale-[0.98] font-headline uppercase tracking-wider",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs rounded-lg",
  md: "px-6 py-3 text-sm rounded-lg",
  lg: "px-8 py-4 text-base rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-150 select-none",
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

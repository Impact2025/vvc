import { cn } from "@/lib/utils";

type BadgeVariant = "live" | "upcoming" | "victory" | "draw" | "defeat" | "new";

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  live: "bg-red-500 text-white",
  upcoming: "bg-secondary/10 text-secondary border border-secondary/20",
  victory: "bg-primary-container/10 text-primary-container border border-primary-container/20",
  draw: "bg-surface-container-highest text-on-surface-variant border border-outline-variant/30",
  defeat: "bg-error/10 text-error border border-error/20",
  new: "bg-green-500/10 text-green-700 border border-green-500/20",
};

const variantLabels: Record<BadgeVariant, string> = {
  live: "LIVE",
  upcoming: "Aankomend",
  victory: "Gewonnen",
  draw: "Gelijkspel",
  defeat: "Verlies",
  new: "Nieuw",
};

export default function Badge({ variant, children, className }: BadgeProps) {
  if (variant === "live") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
          variantStyles.live,
          className
        )}
      >
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        {children ?? variantLabels.live}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded",
        variantStyles[variant],
        className
      )}
    >
      {children ?? variantLabels[variant]}
    </span>
  );
}

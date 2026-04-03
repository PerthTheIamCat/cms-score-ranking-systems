import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const BADGE_COLORS = {
  default: "bg-white/30",
  dark_green: "bg-green-700/60",
  light_green: "bg-green-300/60",
  red: "bg-red-500/60",
  yellow: "bg-yellow-500/60",
} as const;

export type BadgeProps = Readonly<{
  icon?: ReactNode;
  isDisabledIcon?: boolean;
  label?: string;
  children?: ReactNode;
  className?: string;
  color?: keyof typeof BADGE_COLORS;
}>;

export default function Badge({
  icon,
  isDisabledIcon = false,
  label,
  children,
  className,
  color = "dark_green",
}: BadgeProps) {
  const thisClassName = twMerge(
    "flex items-center justify-center rounded-2xl backdrop-blur-lg w-30",
    `${BADGE_COLORS[color ?? "default"]}`,
    className,
  );

  return (
    <span className={thisClassName}>
      {!isDisabledIcon &&
        (icon ?? <div className="p-1 rounded-full bg-white mr-2"></div>)}
      {label && <span className="mr-1">{label}</span>}
      {children}
    </span>
  );
}

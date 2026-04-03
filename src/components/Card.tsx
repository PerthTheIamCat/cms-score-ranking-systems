import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export default function Card({
  title,
  description,
  isAnimated = true,
  children,
  className,
}: Readonly<{
  title?: string;
  description?: string;
  isAnimated?: boolean;
  children: ReactNode;
  className?: string;
}>) {
  const thisClassName = twMerge(
    `w-full max-w-md rounded-2xl border border-white/10 p-6 backdrop-blur-sm bg-white/5 ${
      isAnimated &&
      "transition-all ease-spring-elastic duration-950 active:scale-95 hover:shadow-2xl hover:shadow-black/30 hover:backdrop-blur-lg hover:bg-white/10 hover:scale-105 "
    }`,
    className,
  );

  return (
    <div className={thisClassName}>
      {title && <h2 className="mb-2 text-lg font-semibold">{title}</h2>}
      {description && <p className="mb-4 text-sm">{description}</p>}
      {children}
    </div>
  );
}

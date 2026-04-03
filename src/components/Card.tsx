import type { ReactNode } from "react";

export default function Card({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: ReactNode;
}>) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 p-6 backdrop-blur-sm hover:backdrop-blur-lg bg-white/5 hover:bg-white/10 hover:scale-105 transition-all ease-spring-elastic duration-950 hover:shadow-2xl hover:shadow-black/30 active:scale-95">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <p className="mb-4 text-sm">{description}</p>
      {children}
    </div>
  );
}

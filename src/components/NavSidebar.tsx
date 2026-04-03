import type { ReactNode, CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

interface NavSideBarProps {
    menu: {
        icon?: ReactNode;
        title?: string;
    };
    children?: ReactNode;
    classname?: string;
    bgColor?: string;
}

export default function NavSidebar({
    children,
    classname,
    menu: { icon, title },
    bgColor,
}: NavSideBarProps) {
    const glassStyle: CSSProperties = {
        backgroundColor: bgColor ? `${bgColor}95` : "rgba(28, 28, 30, 0.8)",
    };

    return (
        <nav
            style={glassStyle}
            className={twMerge(
                // Base State: Slim (w-20)
                // Hover State: Expanded (w-64)
                "group sticky top-4 left-4 z-50 flex flex-col h-[calc(100vh-32px)] w-20 hover:w-64",
                "transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                "backdrop-blur-2xl backdrop-saturate-150",
                "rounded-[32px] border border-white/10 shadow-2xl overflow-hidden",
                classname
            )}
        >
            {/* Header / Active Icon */}
            {(icon || title) && (
                <div className="flex items-center w-full p-4 mb-4">
                    <div className="relative shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-tr from-white/10 to-white/30 shadow-[inset_0px_1px_2px_rgba(255,255,255,0.3)]">
                        {icon}
                    </div>
                    {/* Text fades in only when group is hovered */}
                    <span className="ml-4 font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {title}
                    </span>
                </div>
            )}

            {/* Navigation Items */}
            <div className="flex-1 px-4 space-y-6">
                {children}
            </div>

            {/* Subtle bottom gradient to match the image depth */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
        </nav>
    );
}
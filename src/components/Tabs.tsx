"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export type TabsList = {
  label: string;
  icon?: ReactNode;
};

export type TabsProps = Readonly<{
  tabsList: TabsList[];
}>;

export default function Tabs({ tabsList }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const activeTabIndex =
    tabsList.length === 0 ? 0 : Math.min(activeIndex, tabsList.length - 1);

  useLayoutEffect(() => {
    const activeTabElement = tabRefs.current[activeTabIndex];

    if (!activeTabElement) {
      return;
    }

    setIndicatorStyle({
      left: activeTabElement.offsetLeft,
      width: activeTabElement.offsetWidth,
      opacity: 1,
    });
  }, [activeTabIndex, tabsList]);

  useEffect(() => {
    if (tabsList.length === 0) {
      return;
    }

    const updateIndicator = () => {
      const activeTabElement = tabRefs.current[activeTabIndex];

      if (!activeTabElement) {
        return;
      }

      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
        opacity: 1,
      });
    };

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateIndicator);

      tabRefs.current.forEach((tabElement) => {
        if (tabElement) {
          resizeObserver?.observe(tabElement);
        }
      });
    } else {
      window.addEventListener("resize", updateIndicator);
    }

    return () => {
      resizeObserver?.disconnect();

      if (typeof ResizeObserver === "undefined") {
        window.removeEventListener("resize", updateIndicator);
      }
    };
  }, [activeTabIndex, tabsList]);

  if (tabsList.length === 0) {
    return null;
  }

  return (
    <div className="w-fit rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="relative flex w-fit p-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1 bottom-1 rounded-xl border border-white/10 bg-white/10 transition-all duration-900 ease-spring-snap"
          style={indicatorStyle}
        />
        {tabsList.map((tab, index) => {
          const isActive = index === activeTabIndex;

          return (
            <button
              key={`${tab.label}-${index}`}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              className={`relative z-10 flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                isActive
                  ? "text-foreground"
                  : "text-foreground/70 hover:text-white"
              }`}
              onClick={() => setActiveIndex(index)}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

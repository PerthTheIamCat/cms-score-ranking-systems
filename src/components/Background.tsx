"use client";

import { useEffect, useRef, useState } from "react";
import type { CanvasHTMLAttributes } from "react";

type Dot = Readonly<{
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  twinkleWeight: number;
}>;

type PointerState = {
  active: boolean;
  clientX: number;
  clientY: number;
};

export type BackgroundProps = Readonly<
  Omit<CanvasHTMLAttributes<HTMLCanvasElement>, "width" | "height"> & {
    gap?: number;
    dotSize?: number;
    hoverRadius?: number;
    repelStrength?: number;
    color?: string;
    accentColor?: string;
    twinkle?: boolean;
    twinkleChance?: number;
    twinkleSpeed?: number;
    twinkleIntensity?: number;
    paused?: boolean;
    speed?: number;
    lineLength?: number;
    trailColor?: string;
  }
>;

const DEFAULT_GAP = 24;
const DEFAULT_DOT_SIZE = 1.45;
const DEFAULT_HOVER_RADIUS = 110;
const DEFAULT_REPEL_STRENGTH = 14;
const DEFAULT_COLOR = "rgb(110 180 140)";
const DEFAULT_ACCENT_COLOR = "rgb(237 255 246)";
const DEFAULT_TWINKLE = true;
const DEFAULT_TWINKLE_CHANCE = 0.06;
const DEFAULT_TWINKLE_SPEED = 1;
const DEFAULT_TWINKLE_INTENSITY = 0.18;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TAU = Math.PI * 2;
const TWINKLE_FRAME_INTERVAL = 40;

function clampPositive(value: number, fallback: number, minimum: number) {
  return Number.isFinite(value) ? Math.max(minimum, value) : fallback;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    const update = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    update();

    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return prefersReducedMotion;
}

function createDots(
  width: number,
  height: number,
  gap: number,
  dotSize: number,
  twinkleChance: number,
  twinkleSpeed: number,
) {
  const resolvedGap = clampPositive(gap, DEFAULT_GAP, 1);
  const resolvedTwinkleChance = clamp01(twinkleChance);
  const resolvedTwinkleSpeed = clampPositive(twinkleSpeed, DEFAULT_TWINKLE_SPEED, 0);
  const columns = Math.max(1, Math.ceil(width / resolvedGap) + 1);
  const rows = Math.max(1, Math.ceil(height / resolvedGap) + 1);

  const dots: Dot[] = [];

  for (let row = 0; row < rows; row += 1) {
    const y = Math.min(height, resolvedGap / 2 + row * resolvedGap);

    for (let column = 0; column < columns; column += 1) {
      const x = Math.min(width, resolvedGap / 2 + column * resolvedGap);

      dots.push({
        x,
        y,
        size: dotSize * randomBetween(0.72, 1.12),
        alpha: randomBetween(0.035, 0.085),
        twinklePhase: randomBetween(0, TAU),
        twinkleSpeed: resolvedTwinkleSpeed * randomBetween(0.08, 0.18),
        twinkleWeight: Math.random() < resolvedTwinkleChance ? randomBetween(0.6, 1) : 0,
      });
    }
  }

  return dots;
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dots: Dot[],
  pointer: PointerState,
  color: string,
  accentColor: string,
  hoverRadius: number,
  repelStrength: number,
  twinkleIntensity: number,
  timestampMs: number,
) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  const hasPointer = pointer.active;
  const pointerX = hasPointer ? pointer.clientX - rect.left : 0;
  const pointerY = hasPointer ? pointer.clientY - rect.top : 0;
  const resolvedHoverRadius = clampPositive(hoverRadius, DEFAULT_HOVER_RADIUS, 8);
  const resolvedRepelStrength = clampPositive(
    repelStrength,
    DEFAULT_REPEL_STRENGTH,
    0,
  );
  const resolvedTwinkleIntensity = clampPositive(
    twinkleIntensity,
    DEFAULT_TWINKLE_INTENSITY,
    0,
  );
  const timeSeconds = timestampMs / 1000;

  for (const dot of dots) {
    let x = dot.x;
    let y = dot.y;
    let influence = 0;

    const twinklePulse =
      dot.twinkleWeight > 0
        ? Math.pow(
            Math.max(0, Math.sin(timeSeconds * dot.twinkleSpeed + dot.twinklePhase)),
            7,
          ) * dot.twinkleWeight
        : 0;

    if (hasPointer) {
      const dx = x - pointerX;
      const dy = y - pointerY;
      const distance = Math.max(0.0001, Math.hypot(dx, dy));
      influence = clamp01(1 - distance / resolvedHoverRadius);

      if (influence > 0) {
        const eased = influence * influence;
        const displacement = eased * resolvedRepelStrength;
        x += (dx / distance) * displacement;
        y += (dy / distance) * displacement;
      }
    }

    const size = dot.size * (1 + influence * 0.45 + twinklePulse * 0.22);
    const alpha = Math.min(
      1,
      dot.alpha + influence * 0.42 + twinklePulse * resolvedTwinkleIntensity,
    );

    ctx.fillStyle = influence > 0.22 || twinklePulse > 0.14 ? accentColor : color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TAU);
    ctx.fill();

    if (influence > 0.42 || twinklePulse > 0.34) {
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = Math.max(influence * 0.18, twinklePulse * 0.18);
      ctx.beginPath();
      ctx.arc(x, y, size * 2.2, 0, TAU);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}

export default function Background({
  className,
  gap = DEFAULT_GAP,
  dotSize = DEFAULT_DOT_SIZE,
  hoverRadius = DEFAULT_HOVER_RADIUS,
  repelStrength = DEFAULT_REPEL_STRENGTH,
  color = DEFAULT_COLOR,
  accentColor = DEFAULT_ACCENT_COLOR,
  twinkle = DEFAULT_TWINKLE,
  twinkleChance = DEFAULT_TWINKLE_CHANCE,
  twinkleSpeed = DEFAULT_TWINKLE_SPEED,
  twinkleIntensity = DEFAULT_TWINKLE_INTENSITY,
  paused = false,
  speed,
  lineLength,
  trailColor,
  ...canvasProps
}: BackgroundProps) {
  const { style, ...restCanvasProps } = canvasProps;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const resolvedGap = clampPositive(gap, DEFAULT_GAP, 1);
    const resolvedDotSize = clampPositive(dotSize, DEFAULT_DOT_SIZE, 0.25);
    const resolvedHoverRadius = clampPositive(
      hoverRadius ?? lineLength ?? DEFAULT_HOVER_RADIUS,
      DEFAULT_HOVER_RADIUS,
      8,
    );
    const resolvedRepelStrength = clampPositive(
      repelStrength ??
        (typeof speed === "number"
          ? DEFAULT_REPEL_STRENGTH * speed
          : DEFAULT_REPEL_STRENGTH),
      DEFAULT_REPEL_STRENGTH,
      0,
    );
    const resolvedAccentColor = accentColor ?? trailColor ?? DEFAULT_ACCENT_COLOR;
    const resolvedTwinkleChance = clamp01(twinkleChance);
    const resolvedTwinkleSpeed = clampPositive(
      twinkleSpeed,
      DEFAULT_TWINKLE_SPEED,
      0,
    );
    const resolvedTwinkleIntensity = clampPositive(
      twinkleIntensity,
      DEFAULT_TWINKLE_INTENSITY,
      0,
    );
    const isTwinkling = twinkle && !paused && !prefersReducedMotion;
    const shouldInteract = !paused && !prefersReducedMotion;

    let dots = createDots(
      1,
      1,
      resolvedGap,
      resolvedDotSize,
      resolvedTwinkleChance,
      resolvedTwinkleSpeed,
    );
    let animationFrameId: number | null = null;
    let renderQueued = false;
    let destroyed = false;
    let resizeObserver: ResizeObserver | null = null;
    let lastFrameAt = 0;

    const pointer: PointerState = {
      active: false,
      clientX: 0,
      clientY: 0,
    };

    const render = (timestamp = performance.now()) => {
      drawDots(
        context,
        canvas,
        dots,
        pointer,
        color,
        resolvedAccentColor,
        resolvedHoverRadius,
        resolvedRepelStrength,
        resolvedTwinkleIntensity,
        timestamp,
      );
    };

    const scheduleRender = () => {
      if (destroyed || renderQueued || isTwinkling) {
        return;
      }

      renderQueued = true;
      animationFrameId = window.requestAnimationFrame((timestamp) => {
        renderQueued = false;
        animationFrameId = null;
        render(timestamp);
      });
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = createDots(
        width,
        height,
        resolvedGap,
        resolvedDotSize,
        resolvedTwinkleChance,
        resolvedTwinkleSpeed,
      );
      render();
    };

    const updatePointer = (clientX: number, clientY: number) => {
      pointer.active = true;
      pointer.clientX = clientX;
      pointer.clientY = clientY;
      scheduleRender();
    };

    const clearPointer = () => {
      if (!pointer.active) {
        return;
      }

      pointer.active = false;
      scheduleRender();
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget instanceof Node) {
        return;
      }

      clearPointer();
    };

    const handleBlur = () => {
      clearPointer();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearPointer();
      }
    };

    resizeCanvas();

    if (isTwinkling) {
      const animate = (timestamp: number) => {
        if (destroyed) {
          return;
        }

        if (lastFrameAt !== 0 && timestamp - lastFrameAt < TWINKLE_FRAME_INTERVAL) {
          animationFrameId = window.requestAnimationFrame(animate);
          return;
        }

        lastFrameAt = timestamp;
        render(timestamp);
        animationFrameId = window.requestAnimationFrame(animate);
      };

      animationFrameId = window.requestAnimationFrame(animate);
    }

    if (shouldInteract) {
      document.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("pointerout", handlePointerOut, { passive: true });
      window.addEventListener("blur", handleBlur);
      window.addEventListener("scroll", scheduleRender, { passive: true });
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    window.addEventListener("resize", resizeCanvas);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(canvas);
    }

    return () => {
      destroyed = true;

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      resizeObserver?.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("scroll", scheduleRender);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    accentColor,
    color,
    dotSize,
    gap,
    hoverRadius,
    lineLength,
    paused,
    prefersReducedMotion,
    repelStrength,
    speed,
    trailColor,
    twinkle,
    twinkleChance,
    twinkleIntensity,
    twinkleSpeed,
  ]);

  return (
    <canvas
      ref={canvasRef}
      {...restCanvasProps}
      aria-hidden="true"
      role="presentation"
      tabIndex={-1}
      className={[
        "pointer-events-none block h-full w-full select-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...style,
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

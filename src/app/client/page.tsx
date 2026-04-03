"use client";
import { useEffect, useState } from "react";

type ConnectionStatus = "connecting" | "connected" | "reconnecting";

type BooleanEvent = {
  value?: unknown;
};

const statusStyles: Record<ConnectionStatus, string> = {
  connecting: "bg-amber-400/10 text-amber-100",
  connected: "bg-emerald-400/10 text-emerald-100",
  reconnecting: "bg-sky-400/10 text-sky-100",
};

export default function ClientPage() {
  const [flag, setFlag] = useState<boolean | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [lastMessage, setLastMessage] = useState(
    "Waiting for the first event.",
  );

  useEffect(() => {
    let active = true;
    let hasOpened = false;

    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => {
      if (!active) {
        return;
      }

      hasOpened = true;
      setConnectionStatus("connected");
      setLastMessage("Connected to /api/events.");
    };

    eventSource.onmessage = (event) => {
      if (!active) {
        return;
      }

      try {
        const payload = JSON.parse(event.data) as BooleanEvent;

        if (typeof payload.value === "boolean") {
          setFlag(payload.value);
          setLastMessage(
            `Received value ${payload.value ? "true" : "false"} from the server.`,
          );
        } else {
          setLastMessage("Received an SSE payload without a boolean value.");
        }
      } catch {
        setLastMessage("Received malformed SSE data.");
      }
    };

    eventSource.onerror = () => {
      if (!active) {
        return;
      }

      setConnectionStatus(hasOpened ? "reconnecting" : "connecting");
      setLastMessage("SSE connection is retrying.");
    };

    return () => {
      active = false;
      eventSource.close();
    };
  }, []);

  const isOpen = flag === true;
  const flagLabel =
    flag === null ? "ยังไม่มีค่า" : isOpen ? "เปิดอยู่" : "ปิดอยู่";

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10">
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-[0.3em] text-emerald-100/80 uppercase">
                    Client
                  </p>
                  <h1 className="text-4xl font-semibold tracking-tight text-emerald-50 md:text-5xl">
                    SSE Boolean Stream
                  </h1>
                  <p className="max-w-xl text-sm leading-6 text-emerald-100/75 md:text-base">
                    หน้านี้เชื่อมต่อกับ{" "}
                    <span className="font-mono">/api/events</span> และรับค่า
                    boolean แบบ real-time จากหน้า admin ทันที
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs tracking-[0.28em] text-emerald-100/60 uppercase">
                      Connection
                    </p>
                    <div
                      className={`mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-sm font-medium capitalize ${statusStyles[connectionStatus]}`}
                    >
                      {connectionStatus}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs tracking-[0.28em] text-emerald-100/60 uppercase">
                      SSE Endpoint
                    </p>
                    <p className="mt-3 font-mono text-sm text-emerald-50">
                      EventSource(&quot;/api/events&quot;)
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                  <p className="text-xs tracking-[0.28em] text-emerald-100/60 uppercase">
                    Last Event
                  </p>
                  <p className="mt-3 text-sm leading-6 text-emerald-50/90">
                    {lastMessage}
                  </p>
                </div>
              </div>

              <aside className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-black/25 p-5">
                <div className="space-y-4">
                  <p className="text-xs tracking-[0.28em] text-emerald-100/60 uppercase">
                    Current Flag
                  </p>
                  <div className="rounded-3xl border border-white/10 bg-emerald-500/10 p-5">
                    <p className="font-mono text-5xl font-semibold tracking-tight text-emerald-50">
                      {flag === null ? "--" : flag ? "true" : "false"}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                      {flagLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-emerald-100/70">
                  เปิดหน้า <span className="font-mono">/admin</span>{" "}
                  แล้วกดส่งค่า เพื่อดูการอัปเดตแบบ real-time
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

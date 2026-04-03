"use client";

import { useState } from "react";

type ControlResponse = {
  ok?: boolean;
  value?: boolean;
  clientCount?: number;
  error?: string;
};

async function readResponseBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as ControlResponse;
  } catch {
    return text;
  }
}

export default function AdminPage() {
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);
  const [responseText, setResponseText] = useState<string>(
    "Press a button to broadcast a boolean value.",
  );
  const [errorText, setErrorText] = useState<string | null>(null);

  const sendBoolean = async (value: boolean) => {
    setPendingValue(value);
    setErrorText(null);

    try {
      const response = await fetch("/api/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });

      const body = await readResponseBody(response);

      if (!response.ok) {
        const errorMessage =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : "Broadcast failed.";

        setErrorText(errorMessage);
        setResponseText(
          typeof body === "string" ? body : JSON.stringify(body, null, 2),
        );
        return;
      }

      setResponseText(
        typeof body === "string" ? body : JSON.stringify(body, null, 2),
      );
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Request failed.");
      setResponseText("No response was returned from /api/control.");
    } finally {
      setPendingValue(null);
    }
  };

  const isSendingTrue = pendingValue === true;
  const isSendingFalse = pendingValue === false;

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10">
      <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />
      <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-[0.3em] text-emerald-100/80 uppercase">
                    Admin
                  </p>
                  <h1 className="text-4xl font-semibold tracking-tight text-emerald-50 md:text-5xl">
                    Control Panel
                  </h1>
                  <p className="max-w-xl text-sm leading-6 text-emerald-100/75 md:text-base">
                    ปุ่มด้านล่างจะส่งค่า boolean ไปที่{" "}
                    <span className="font-mono">POST /api/control</span> แล้ว
                    server จะ broadcast ไปยังทุก client ที่เชื่อมอยู่
                  </p>
                </div>

                <div className="grid gap-4">
                  <button
                    type="button"
                    onClick={() => void sendBoolean(true)}
                    disabled={pendingValue !== null}
                    className="rounded-2xl border border-emerald-300/30 bg-emerald-400/15 px-5 py-4 text-left text-lg font-semibold text-emerald-50 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span>Send true</span>
                      <span className="font-mono text-sm text-emerald-100/70">
                        {isSendingTrue ? "sending..." : "broadcast"}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => void sendBoolean(false)}
                    disabled={pendingValue !== null}
                    className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-left text-lg font-semibold text-emerald-50 transition hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span>Send false</span>
                      <span className="font-mono text-sm text-emerald-100/70">
                        {isSendingFalse ? "sending..." : "broadcast"}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <aside className="space-y-4 rounded-2xl border border-white/10 bg-black/25 p-5">
                <div>
                  <p className="text-xs tracking-[0.28em] text-emerald-100/60 uppercase">
                    Response
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-100/75">
                    ผลลัพธ์จาก <span className="font-mono">/api/control</span>{" "}
                    จะแสดงที่นี่เพื่อยืนยันว่าการ broadcast สำเร็จ
                  </p>
                </div>

                {errorText ? (
                  <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm leading-6 text-rose-50">
                    {errorText}
                  </div>
                ) : null}

                <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-6 text-emerald-50">
                  {responseText}
                </pre>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

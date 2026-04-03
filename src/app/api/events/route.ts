import {
  addClient,
  encodeSseComment,
  encodeSseData,
  getCurrentBoolean,
  removeClient,
} from "@/lib/sse-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const keepAliveIntervalMs = 15_000;

export async function GET(request: Request) {
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      addClient(controller);

      const state = {
        closed: false,
        keepAliveTimer: undefined as ReturnType<typeof setInterval> | undefined,
      };

      const send = (chunk: Uint8Array) => {
        if (state.closed) {
          return false;
        }

        try {
          controller.enqueue(chunk);
          return true;
        } catch {
          cleanup();
          return false;
        }
      };

      cleanup = () => {
        if (state.closed) {
          return;
        }

        state.closed = true;

        if (state.keepAliveTimer) {
          clearInterval(state.keepAliveTimer);
        }

        removeClient(controller);

        try {
          controller.close();
        } catch {
          // The runtime may already have closed the stream.
        }
      };

      request.signal.addEventListener("abort", cleanup, { once: true });

      if (!send(encodeSseData({ value: getCurrentBoolean() }))) {
        return;
      }

      // Send a comment frame every 15 seconds so intermediaries keep the socket open.
      state.keepAliveTimer = setInterval(() => {
        send(encodeSseComment("keep-alive"));
      }, keepAliveIntervalMs);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

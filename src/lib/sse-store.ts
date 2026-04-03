const encoder = new TextEncoder();

const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();

let currentBoolean = false;

export type BroadcastBooleanResult = {
  value: boolean;
  clientCount: number;
};

export function getCurrentBoolean() {
  return currentBoolean;
}

export function addClient(controller: ReadableStreamDefaultController<Uint8Array>) {
  clients.add(controller);
}

export function removeClient(controller: ReadableStreamDefaultController<Uint8Array>) {
  clients.delete(controller);
}

export function encodeSseData(data: unknown) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export function encodeSseComment(comment: string) {
  return encoder.encode(`: ${comment}\n\n`);
}

export function broadcastBoolean(value: boolean): BroadcastBooleanResult {
  currentBoolean = value;

  // Encode once and reuse the same SSE frame for every connected client.
  const payload = encodeSseData({ value });
  const staleClients: ReadableStreamDefaultController<Uint8Array>[] = [];

  for (const controller of clients) {
    try {
      controller.enqueue(payload);
    } catch {
      staleClients.push(controller);
    }
  }

  for (const controller of staleClients) {
    clients.delete(controller);
  }

  return {
    value: currentBoolean,
    clientCount: clients.size,
  };
}

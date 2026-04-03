import { broadcastBoolean } from "@/lib/sse-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { value?: unknown }).value !== "boolean"
  ) {
    return Response.json(
      { ok: false, error: 'Body must be an object with a boolean "value" field.' },
      { status: 400 },
    );
  }

  const { value } = body as { value: boolean };
  const result = broadcastBoolean(value);

  return Response.json({
    ok: true,
    value: result.value,
    clientCount: result.clientCount,
  });
}

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, service: "gold-egypt", time: new Date().toISOString() });
}

import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { getLocalPriceSet } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) return unauthorizedResponse();
  try {
    const data = await getLocalPriceSet(true);
    return Response.json({ refreshed: true, ...data });
  } catch (err) {
    return Response.json(
      { error: "fetch_failed", message: (err as Error).message },
      { status: 502 },
    );
  }
}

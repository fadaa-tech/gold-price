import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { getLocalPriceSet } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) return unauthorizedResponse();

  try {
    const data = await getLocalPriceSet(false);
    return Response.json({
      currency: "EGP",
      unit: "gram",
      ...data,
    });
  } catch (err) {
    return Response.json(
      { error: "fetch_failed", message: (err as Error).message },
      { status: 502 },
    );
  }
}

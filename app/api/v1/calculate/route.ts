import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { calculatePrice, KARAT_KEYS, type Karat } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) return unauthorizedResponse();

  const url = new URL(req.url);
  const karatNum = Number(url.searchParams.get("karat"));
  const grams = Number(url.searchParams.get("grams"));
  const workmanship = url.searchParams.get("workmanship") === "true";

  if (!KARAT_KEYS.includes(karatNum as Karat)) {
    return Response.json(
      {
        error: "invalid_karat",
        message: `karat must be one of ${KARAT_KEYS.join(", ")}`,
      },
      { status: 400 },
    );
  }
  if (!Number.isFinite(grams) || grams <= 0) {
    return Response.json(
      { error: "invalid_grams", message: "grams must be a number > 0" },
      { status: 400 },
    );
  }

  try {
    const result = await calculatePrice({
      karat: karatNum as Karat,
      grams,
      workmanship,
    });
    return Response.json({ currency: "EGP", ...result });
  } catch (err) {
    return Response.json(
      { error: "calc_failed", message: (err as Error).message },
      { status: 500 },
    );
  }
}

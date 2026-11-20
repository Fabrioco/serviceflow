import { SESSION_COOKIE } from "@/lib/session";
import { cookies } from "next/headers";
import { cache } from "react";

export const fetchTechnicians = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const res = await fetch(`${process.env.API_URL}/technicians`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return res.json()
});

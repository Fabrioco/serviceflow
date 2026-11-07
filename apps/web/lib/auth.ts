import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "TECHNICIAN";
  organizationId: string;
};

export const requireUser = cache(async (): Promise<CurrentUser> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${process.env.API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401) redirect("/login");
  if (!res.ok) throw new Error("Não foi possível carregar o usuário.");

  return res.json();
});

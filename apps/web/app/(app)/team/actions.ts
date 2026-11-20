import { SESSION_COOKIE } from "@/lib/session";
import { cookies } from "next/headers";
import { cache } from "react";

type FetchTechniciansParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export const fetchTechnicians = cache(
  async ({ search, page = 1, limit = 10 }: FetchTechniciansParams = {}) => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;

    const params = new URLSearchParams();

    if (search?.trim()) {
      params.set("search", search.trim());
    }

    params.set("page", String(page));
    params.set("limit", String(limit));

    const res = await fetch(
      `${process.env.API_URL}/technicians?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error("Erro ao buscar técnicos");
    }

    return res.json();
  },
);

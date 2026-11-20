"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeamSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function clearSearch() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("search");
    params.delete("page");

    const query = params.toString();

    router.push(query ? `/team?${query}` : "/team");
  }

  return (
    <form action="/team" method="GET" role="search" className="mb-6 flex gap-3">
      <div className="w-full max-w-sm">
        <Input
          label="Buscar técnico"
          name="search"
          type="search"
          defaultValue={defaultValue}
          placeholder="Buscar por nome ou email"
          trailing={
            defaultValue ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Limpar pesquisa"
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-ink"
              >
                <X size={16} />
              </button>
            ) : undefined
          }
        />
      </div>

      <Button type="submit" variant="secondary" className="self-end">
        Buscar
      </Button>
    </form>
  );
}

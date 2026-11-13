import { Button } from "@/components/ui/button";

export function CustomerSearch({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/customers" role="search" className="mb-6 flex gap-3">
      <label htmlFor="search" className="sr-only">
        Buscar cliente
      </label>
      <input
        id="search"
        name="search"
        defaultValue={defaultValue}
        placeholder="Buscar por nome ou telefone"
        className="h-11 w-full max-w-sm rounded-lg border border-border-strong bg-white px-3.5 text-[15px] text-ink placeholder:text-[#6b7280] focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent focus:ring-offset-1"
      />
      <Button type="submit" variant="secondary">
        Buscar
      </Button>
    </form>
  );
}

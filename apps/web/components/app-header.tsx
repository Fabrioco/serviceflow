"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/app/(app)/actions";

const links = [
  { href: "/dashboard", label: "Painel" },
  { href: "/customers", label: "Clientes" },
  // { href: "/orders", label: "Ordens de serviço" }, // descomente quando a tela existir
  // { href: "/team", label: "Equipe" },
];

export function AppHeader(user: { name: string; role: string }) {
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center gap-8 border-b border-border bg-white px-8 md:px-12">
      <Logo className="text-ink" />

      <nav aria-label="Principal" className="flex gap-6 text-sm font-medium">
        {links.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`border-b-2 py-5.25 ${
                active
                  ? "border-accent text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3 text-[13px] text-muted">
        {/* TODO: trocar pelo nome e papel do usuário logado */}
        <span>
          {user.name} ·{" "}
          {user.role === "OWNER"
            ? "DONO"
            : user.role === "TECHNICAN"
              ? "TÉCNICO"
              : "ADMIN"}
        </span>
        <form action={logoutAction}>
          <button className="font-medium text-accent hover:underline">
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}

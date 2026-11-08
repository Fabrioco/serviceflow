import Link from "next/link";
import { Logo } from "@/components/logo";

const tips = [
  "Verifique se o endereço digitado está correto",
  "Navegue através dos links do painel",
  "Retorne à página inicial se precisar recomeçar",
];

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen md:grid-cols-[1.05fr_1fr]">
      {/* Lado Escuro / Hero */}
      <aside className="hidden flex-col justify-between bg-brand p-14 text-brand-fg md:flex">
        <Logo />

        <div>
          <span className="mb-4 inline-block text-sm font-semibold tracking-wider text-mint uppercase">
            Erro 404
          </span>
          <h2 className="mb-4 max-w-115 text-[40px] font-semibold leading-12 tracking-tight">
            Página não encontrada.
          </h2>
          <p className="max-w-110 text-base leading-6.5 text-brand-muted">
            O caminho que você tentou acessar não existe, foi removido ou mudou
            de endereço.
          </p>
        </div>

        <ul className="grid gap-3 text-[15px] text-brand-soft">
          {tips.map((text) => (
            <li key={text} className="flex items-center gap-2.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 9.5l3.2 3L14 5.5"
                  stroke="#5EC4B6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {text}
            </li>
          ))}
        </ul>
      </aside>

      {/* Lado Claro / Conteúdo Principal */}
      <main className="flex items-start justify-center px-8 pt-14 md:items-center md:py-12">
        <div className="w-full max-w-95">
          <Logo className="mb-8 md:hidden" />

          <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink">
            Ops! Você se perdeu?
          </h1>
          <p className="mb-8 mt-2 text-[15px] leading-6 text-muted">
            A página que você está procurando não está disponível.
          </p>

          {/* Ações */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Voltar ao início
            </Link>

            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
            >
              Ir para o painel
            </Link>
          </div>

          <p className="mt-7 border-t border-border pt-5 text-center text-sm text-muted">
            Precisa de ajuda?{" "}
            <Link
              href="/support"
              className="font-medium text-accent hover:underline"
            >
              Falar com suporte
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

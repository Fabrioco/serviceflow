import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

const benefits = [
  "Ordens de serviço com histórico completo",
  "Equipe e clientes separados por empresa",
  "Painel com o andamento do mês",
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen md:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between bg-brand p-14 text-brand-fg md:flex">
        <Logo />
        <div>
          <h2 className="mb-4 max-w-115 text-[40px] font-semibold leading-12 tracking-tight">
            Cada serviço, do pedido à conclusão.
          </h2>
          <p className="max-w-110 text-base leading-6.5 text-brand-muted">
            Ordens de serviço, equipe e clientes da sua empresa em um único
            painel.
          </p>
        </div>
        <ul className="grid gap-3 text-[15px] text-brand-soft">
          {benefits.map((text) => (
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

      <main className="flex items-start justify-center px-8 pt-14 md:items-center md:py-12">
        <div className="w-full max-w-95">
          <Logo className="mb-8 md:hidden" />
          <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink">
            Entrar
          </h1>
          <p className="mb-8 mt-2 text-[15px] leading-6 text-muted">
            Acesse o painel da sua empresa.
          </p>

          <LoginForm />

          <p className="mt-7 border-t border-border pt-5 text-center text-sm text-muted">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-accent hover:underline"
            >
              Cadastrar empresa
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

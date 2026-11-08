import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { OrderPreview } from "./order-preview";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Criar conta — ServiceFlow" };

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen bg-white md:grid-cols-[1fr_1.1fr]">
      <main className="flex flex-col px-8 py-8 md:px-16 md:py-12">
        <header className="flex items-center justify-between">
          <Logo className="text-ink" />
          <p className="text-sm text-muted">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Entrar
            </Link>
          </p>
        </header>

        <div className="my-auto w-full max-w-105 py-10">
          <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-ink">
            Crie a conta da sua empresa
          </h1>
          <p className="mb-8 mt-2 text-[15px] leading-6 text-muted">
            Leva menos de um minuto. Você será o proprietário e adiciona a
            equipe depois.
          </p>
          <RegisterForm />
        </div>
      </main>

      <aside className="hidden items-center justify-center border-l border-border bg-canvas p-14 md:flex">
        <OrderPreview />
      </aside>
    </div>
  );
}

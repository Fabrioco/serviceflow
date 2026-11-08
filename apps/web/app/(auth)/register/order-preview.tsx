const steps = [
  { label: "Aberta", state: "done" },
  { label: "Agendada", state: "current" },
  { label: "Em andamento", state: "todo" },
  { label: "Concluída", state: "todo" },
] as const;

const details = [
  ["Cliente", "Ana Souza"],
  ["Técnico", "João Silva"],
  ["Data", "06/11, 14:00"],
  ["Valor", "R$ 180,00"],
] as const;

export function OrderPreview() {
  return (
    <div className="w-full max-w-115">
      <h2 className="text-2xl font-semibold leading-8 tracking-tight text-ink">
        Seu painel desde o primeiro dia
      </h2>
      <p className="mb-8 mt-2 text-[15px] leading-6 text-muted">
        Cada ordem de serviço com cliente, técnico, valor e histórico.
      </p>

      <article
        aria-label="Exemplo de ordem de serviço"
        className="rounded-xl border border-border bg-white p-6 shadow-[0_1px_2px_rgba(17,24,39,0.06)]"
      >
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-ink">OS #00031</p>
          <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            Agendado
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">Manutenção de ar-condicionado</p>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-0.5 text-[15px] text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <ol className="mt-7 flex border-t border-border pt-6">
          {steps.map(({ label, state }, i) => (
            <li
              key={label}
              aria-current={state === "current" ? "step" : undefined}
              className={`relative flex-1 text-center text-xs ${
                state === "current" ? "font-medium text-ink" : "text-muted"
              }`}
            >
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-1.25 h-0.5 w-full ${
                    steps[i - 1].state === "done" ? "bg-accent" : "bg-border"
                  }`}
                />
              )}
              <span
                aria-hidden="true"
                className={`relative mx-auto mb-2 block h-3 w-3 rounded-full border-2 ${
                  state === "done"
                    ? "border-accent bg-accent"
                    : state === "current"
                      ? "border-accent bg-white ring-4 ring-accent-soft"
                      : "border-border-strong bg-white"
                }`}
              />
              {label}
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}

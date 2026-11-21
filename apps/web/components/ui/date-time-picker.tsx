"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const BASE_MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

const fieldClass =
  "h-11 rounded-lg border border-border bg-white px-3.5 text-[15px] text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent focus:ring-offset-1";

// ISO (UTC) -> partes em horário de Brasília
function splitIso(iso: string | null) {
  if (!iso) return { date: "", hour: "08", minute: "00" };
  const local = new Date(
    new Date(iso).getTime() - BRASILIA_OFFSET_MS,
  ).toISOString();
  return {
    date: local.slice(0, 10),
    hour: local.slice(11, 13),
    minute: local.slice(14, 16),
  };
}

// "YYYY-MM-DD" de amanhã em Brasília
function tomorrowInBrasilia() {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
  const tomorrow = new Date(
    new Date(`${today}T12:00:00-03:00`).getTime() + DAY_MS,
  );
  return tomorrow.toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

// fora do componente: a referência não muda a cada render
const subscribe = () => () => {};
const getServerMinDate = () => "";

type Props = {
  /** nome do campo enviado no formData (formato "YYYY-MM-DDTHH:mm") */
  name: string;
  /** valor inicial em ISO (como vem da API) */
  initialIso?: string | null;
  /** avisa o formulário quando a data escolhida é inválida */
  onInvalidChange?: (invalid: boolean) => void;
};

export function DateTimePicker({
  name,
  initialIso = null,
  onInvalidChange,
}: Props) {
  const initial = useMemo(() => splitIso(initialIso), [initialIso]);

  const [date, setDate] = useState(initial.date);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);

  // "" no servidor, data real no cliente (sem useEffect e sem erro de hidratação)
  const minDate = useSyncExternalStore(
    subscribe,
    tomorrowInBrasilia,
    getServerMinDate,
  );

  const minutes = useMemo(
    () => Array.from(new Set([...BASE_MINUTES, initial.minute])).sort(),
    [initial.minute],
  );

  const value = date ? `${date}T${hour}:${minute}` : "";
  const initialValue = initialIso
    ? `${initial.date}T${initial.hour}:${initial.minute}`
    : "";

  // só reclama se o usuário mudou o valor e a data não é depois de hoje
  const invalid = Boolean(
    date && minDate && value !== initialValue && date < minDate,
  );

  useEffect(() => {
    onInvalidChange?.(invalid);
  }, [invalid, onInvalidChange]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          min={minDate || undefined}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Data do agendamento"
          className={`${fieldClass} flex-1 min-w-[10rem] ${
            invalid ? "border-danger" : ""
          }`}
        />

        <div className="flex items-center gap-1.5">
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            disabled={!date}
            aria-label="Hora"
            className={`${fieldClass} w-[4.5rem] disabled:opacity-50`}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="text-muted">:</span>
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            disabled={!date}
            aria-label="Minutos"
            className={`${fieldClass} w-[4.5rem] disabled:opacity-50`}
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {date && (
          <button
            type="button"
            onClick={() => setDate("")}
            className="h-11 rounded-lg px-3 text-[13px] font-medium text-muted hover:text-ink"
          >
            Limpar
          </button>
        )}
      </div>

      {invalid && (
        <p className="text-[12px] text-danger">
          Escolha uma data a partir de amanhã.
        </p>
      )}

      {/* é este campo que a server action lê */}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

// Salve como: apps/web/components/ui/textarea.tsx
import { useId, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({ label, error, id, className = "", ...props }: TextareaProps) {
  const autoId = useId(); // id único para ligar o label ao campo
  const textareaId = id ?? autoId;
  const errorId = `${textareaId}-error`;

  return (
    <div>
      <label htmlFor={textareaId} className="mb-1.5 block text-[13px] font-medium leading-5 text-ink">
        {label}
      </label>

      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-24 w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-[#6b7280] focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent focus:ring-offset-1 ${
          error ? "border-danger" : "border-border-strong"
        } ${className}`}
        {...props}
      />

      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
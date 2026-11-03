"use client";
import { useFormStatus } from "react-dom";
export function Submit({
  children,
  className = "button primary",
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending || disabled} type="submit">
      {pending ? "Guardando…" : children}
    </button>
  );
}

import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";

export function Button({
  variant = "primary", className, ...props
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold",
        "transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-brand text-white hover:bg-brand-600",
        variant === "ghost" && "border border-white/15 text-ink-100 hover:bg-white/5",
        variant === "danger" && "border border-red-500/40 text-red-300 hover:bg-red-500/10",
        className,
      )}
    />
  );
}

export function LinkButton({
  variant = "primary", className, ...props
}: ComponentProps<typeof Link> & { variant?: "primary" | "ghost" }) {
  return (
    <Link
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
        variant === "primary" && "bg-brand text-white hover:bg-brand-600",
        variant === "ghost" && "border border-white/15 text-ink-100 hover:bg-white/5",
        className,
      )}
    />
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-xl border border-white/10 bg-ink-800/60 p-5 shadow-panel",
        className,
      )}
    />
  );
}

export function Field({
  label, hint, className, ...props
}: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-200">{label}</span>
      <input
        {...props}
        className={clsx(
          "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink-50",
          "placeholder:text-ink-500 focus:border-accent/60 focus:outline-none",
          className,
        )}
      />
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export function Select({
  label, className, children, ...props
}: ComponentProps<"select"> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-200">{label}</span>
      <select
        {...props}
        className={clsx(
          "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink-50",
          "focus:border-accent/60 focus:outline-none [&>option]:bg-ink-800",
          className,
        )}
      >
        {children}
      </select>
    </label>
  );
}

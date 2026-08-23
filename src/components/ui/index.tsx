import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";

const NUT_CHUNG =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60";

const BIEN_THE = {
  chinh:
    "bg-gradient-to-r from-hanh-kim to-hanh-thuy text-white shadow-glow " +
    "hover:brightness-115 hover:shadow-[0_0_50px_-6px_rgba(136,0,255,0.6)] active:scale-[0.98]",
  vien: "border border-line-strong text-ink hover:bg-white/[0.06] hover:border-white/30",
  mo: "text-ink-dim hover:text-ink",
  nguyHiem: "border border-hanh-hoa/40 text-hanh-hoa hover:bg-hanh-hoa/10",
} as const;

type BienThe = keyof typeof BIEN_THE;

export function Button({ variant = "chinh", className, ...p }:
  ComponentProps<"button"> & { variant?: BienThe }) {
  return <button {...p} className={clsx(NUT_CHUNG, BIEN_THE[variant],
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none", className)} />;
}

export function LinkButton({ variant = "chinh", className, ...p }:
  ComponentProps<typeof Link> & { variant?: BienThe }) {
  return <Link {...p} className={clsx(NUT_CHUNG, BIEN_THE[variant], className)} />;
}

export function Card({ className, ...p }: ComponentProps<"div">) {
  return <div {...p} className={clsx("glass rounded-2xl shadow-lift", className)} />;
}

export function Field({ label, hint, loi, className, ...p }:
  ComponentProps<"input"> & { label: string; hint?: string; loi?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">{label}</span>
      <input {...p} className={clsx(
        "w-full rounded-xl border bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink",
        "placeholder:text-ink-faint transition focus:outline-none focus:ring-2",
        loi ? "border-hanh-hoa/50 focus:ring-hanh-hoa/40" : "border-line focus:border-cyan/40 focus:ring-cyan/25",
        className)} />
      {loi
        ? <span className="mt-1 block text-xs text-hanh-hoa">{loi}</span>
        : hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export function Select({ label, className, children, ...p }:
  ComponentProps<"select"> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">{label}</span>
      <select {...p} className={clsx(
        "w-full rounded-xl border border-line bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink",
        "transition focus:border-cyan/40 focus:outline-none focus:ring-2 focus:ring-cyan/25",
        "[&>option]:bg-surface-2", className)}>{children}</select>
    </label>
  );
}

/** Nhãn nhỏ dùng cho trạng thái / phân loại. */
export function Chip({ className, ...p }: ComponentProps<"span">) {
  return <span {...p} className={clsx(
    "inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1",
    "text-[11px] font-medium text-ink-dim", className)} />;
}

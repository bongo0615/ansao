"use client";

/**
 * Danh sách lá số ở chế độ khách — đọc từ localStorage.
 * Dùng lại đúng markup của danh sách Supabase để hai chế độ nhìn như nhau.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, LinkButton } from "@/components/ui";
import { danhSachCucBo, xoaCucBo } from "@/lib/luu-tru-cuc-bo";
import type { LaSoRow } from "@/lib/la-so-io";

const GIO = (h: number, p: number) =>
  `${String(h).padStart(2, "0")}:${String(p).padStart(2, "0")}`;

export function DanhSachCucBo() {
  // localStorage chỉ có ở client — đọc sau khi mount để tránh lệch SSR.
  const [rows, setRows] = useState<LaSoRow[] | null>(null);
  useEffect(() => setRows(danhSachCucBo()), []);

  function xoa(id: string, ten: string) {
    if (!window.confirm(`Xoá lá số "${ten}"?`)) return;
    xoaCucBo(id);
    setRows(danhSachCucBo());
  }

  if (rows === null) return <p className="mt-8 text-ink-400">Đang tải…</p>;

  return (
    <>
      <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        <strong>Chế độ khách</strong> — lá số lưu trong trình duyệt này. Tắt
        <code className="mx-1">NEXT_PUBLIC_CHE_DO_KHACH</code> trong{" "}
        <code>.env.local</code> để quay lại lưu trên Supabase.
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-white/10 bg-ink-800/60 p-6 text-ink-300">
          Chưa có lá số nào. Bấm <strong>Lập lá số mới</strong> để bắt đầu.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-800/60 p-4 transition hover:border-accent/40"
            >
              <Link href={`/la-so/${r.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-base font-bold">{r.ho_ten || "(chưa đặt tên)"}</span>
                  <span className="text-sm text-ink-400">
                    {r.gioi_tinh === "nam" ? "Nam" : "Nữ"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-300">
                  {r.ngay_sinh}/{r.thang_sinh}/{r.nam_sinh} ·{" "}
                  {GIO(r.gio_sinh, r.phut_sinh)} · {r.noi_sinh}
                </p>
              </Link>
              <Button variant="danger" onClick={() => xoa(r.id, r.ho_ten)}>Xoá</Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <LinkButton href="/la-so/moi" variant="ghost">Lập lá số mới</LinkButton>
      </div>
    </>
  );
}

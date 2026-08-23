"use client";

/** Danh sách lá số ở chế độ khách — đọc từ localStorage. */

import { useEffect, useState } from "react";
import { danhSachCucBo, xoaCucBo } from "@/lib/luu-tru-cuc-bo";
import type { LaSoRow } from "@/lib/la-so-io";
import { TheLaSo, TheThemMoi } from "./TheLaSo";
import { LuoiRong } from "./LuoiRong";

export function DanhSachCucBo() {
  // localStorage chỉ có ở client — đọc sau khi mount để tránh lệch SSR.
  const [rows, setRows] = useState<LaSoRow[] | null>(null);
  useEffect(() => setRows(danhSachCucBo()), []);

  function xoa(id: string) {
    const r = rows?.find((x) => x.id === id);
    if (!window.confirm(`Xoá lá số "${r?.ho_ten || "chưa đặt tên"}"?`)) return;
    xoaCucBo(id);
    setRows(danhSachCucBo());
  }

  if (rows === null) {
    return (
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) return <LuoiRong />;

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => <TheLaSo key={r.id} row={r} onXoa={xoa} />)}
      <TheThemMoi />
    </div>
  );
}

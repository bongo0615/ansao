"use client";

/** Mở một lá số đã lưu trong localStorage (chế độ khách). */

import Link from "next/link";
import { useEffect, useState } from "react";
import { layCucBo } from "@/lib/luu-tru-cuc-bo";
import { rowToInput } from "@/lib/la-so-io";
import type { AnSaoInput } from "@/lib/tuvi/engine";
import { LaSoWorkspace } from "./LaSoWorkspace";

export function LaSoCucBo({ id }: { id: string }) {
  const [tt, setTt] = useState<
    { loai: "dang_tai" } | { loai: "co"; input: AnSaoInput } | { loai: "khong_thay" }
  >({ loai: "dang_tai" });

  useEffect(() => {
    const row = layCucBo(id);
    setTt(row ? { loai: "co", input: rowToInput(row) } : { loai: "khong_thay" });
  }, [id]);

  if (tt.loai === "dang_tai") return <p className="text-ink-400">Đang tải…</p>;

  if (tt.loai === "khong_thay") {
    return (
      <div className="rounded-xl border border-white/10 bg-ink-800/60 p-6">
        <p className="text-ink-200">
          Không tìm thấy lá số này trong trình duyệt hiện tại.
        </p>
        <p className="mt-2 text-sm text-ink-400">
          Ở chế độ khách, lá số chỉ nằm trên máy đã tạo ra nó.
        </p>
        <Link href="/la-so" className="mt-4 inline-block text-accent underline">
          ← Về danh sách
        </Link>
      </div>
    );
  }

  return <LaSoWorkspace banDau={tt.input} id={id} noiLuu="cuc_bo" />;
}

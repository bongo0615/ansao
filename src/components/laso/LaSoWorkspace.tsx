"use client";

/**
 * Màn hình làm việc với một lá số: form nhập nằm ngay trong Input Panel giữa
 * la võng (đúng thiết kế), thanh công cụ phía trên lo lưu / in / đổi theme.
 * Lá số được tính lại ngay trên client mỗi lần input đổi — engine thuần TS.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import type { AnSaoInput } from "@/lib/tuvi/engine";
import { luuCucBo } from "@/lib/luu-tru-cuc-bo";
import { LaSoView } from "./LaSoView";

export type TrangThaiLuu = "chua_luu" | "dang_luu" | "da_luu" | "loi";

export type NoiLuu =
  /** Lưu qua API vào Supabase (đã đăng nhập). */
  | "supabase"
  /** Lưu vào localStorage của trình duyệt (chế độ khách). */
  | "cuc_bo"
  /** Không lưu được — chưa đăng nhập và không ở chế độ khách. */
  | "khong";

export function LaSoWorkspace({
  banDau, id, noiLuu,
}: {
  banDau: AnSaoInput;
  /** Có id = đang sửa lá số đã lưu; không có = lá số mới. */
  id?: string;
  noiLuu: NoiLuu;
}) {
  const coTheLuu = noiLuu !== "khong";
  const router = useRouter();
  const [value, setValue] = useState<AnSaoInput>(banDau);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [trangThai, setTrangThai] = useState<TrangThaiLuu>("chua_luu");
  const [loi, setLoi] = useState<string | null>(null);
  const dirty = useRef(false);

  const onChange = useCallback((next: AnSaoInput) => {
    dirty.current = true;
    setTrangThai("chua_luu");
    setValue(next);
  }, []);

  // Cảnh báo khi rời trang lúc còn thay đổi chưa lưu.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty.current && coTheLuu) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [coTheLuu]);

  async function luu() {
    setTrangThai("dang_luu");
    setLoi(null);
    try {
      if (noiLuu === "cuc_bo") {
        const maId = luuCucBo(value, id);
        dirty.current = false;
        setTrangThai("da_luu");
        if (!id) router.push(`/la-so/${maId}`);
        return;
      }

      const res = await fetch(id ? `/api/la-so/${id}` : "/api/la-so", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hoTen: value.hoTen, gioiTinh: value.gioiTinh,
          namSinh: value.namSinh, thangSinh: value.thangSinh, ngaySinh: value.ngaySinh,
          gioSinh: value.gioSinh, phutSinh: value.phutSinh,
          noiSinh: value.noiSinh,
          namXem: value.namXem ?? null,
          thangXem: value.thangXem ?? null,
          daiVanTuoiDau: value.daiVanTuoiDau ?? null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Lưu không thành công");

      dirty.current = false;
      setTrangThai("da_luu");
      if (!id) router.push(`/la-so/${json.data.id}`);
      else router.refresh();
    } catch (e) {
      setTrangThai("loi");
      setLoi((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-xl font-black">
          {value.hoTen || "Lá số chưa đặt tên"}
        </h1>

        <Button
          variant="ghost"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? "Nền sáng" : "Nền tối"}
        </Button>
        <Button variant="ghost" onClick={() => window.print()}>In / PDF</Button>
        {coTheLuu && (
          <Button onClick={luu} disabled={trangThai === "dang_luu"}>
            {{
              chua_luu: id ? "Lưu thay đổi" : "Lưu lá số",
              dang_luu: "Đang lưu…",
              da_luu: "Đã lưu ✓",
              loi: "Thử lưu lại",
            }[trangThai]}
          </Button>
        )}
      </div>

      {noiLuu === "khong" && (
        <p className="no-print rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-ink-300">
          Lá số này không được lưu lại.{" "}
          <a href="/login" className="text-accent underline">Đăng nhập</a> để lưu.
        </p>
      )}
      {noiLuu === "cuc_bo" && (
        <p className="no-print rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          <strong>Chế độ khách</strong> — lá số lưu trong trình duyệt này, chưa
          đồng bộ lên máy chủ. Xoá dữ liệu duyệt web là mất.
        </p>
      )}
      {loi && (
        <p className="no-print rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {loi}
        </p>
      )}

      <LaSoView value={value} onChange={onChange} theme={theme} />
    </div>
  );
}

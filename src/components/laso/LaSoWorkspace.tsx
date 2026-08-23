"use client";

/**
 * Màn làm việc: lá số bên trái, chuyên gia luận giải bên phải.
 *
 * Chỉ MỘT thanh công cụ (52px) cho cả trang — không có header site chồng lên,
 * để lá số được nhiều chỗ nhất. Màn hẹp: hai phần chuyển thành tab vì lá số là
 * khung cứng 1080px, chia đôi màn nhỏ sẽ vỡ.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { KhungChat } from "@/components/chat/KhungChat";
import { luuCucBo, xoaCucBo } from "@/lib/luu-tru-cuc-bo";
import type { AnSaoInput } from "@/lib/tuvi/engine";
import type { Tin } from "@/components/ui/ThongBao";
import { LaSoView, type CheDoXem } from "./LaSoView";
import { ThanhCongCu } from "./ThanhCongCu";

export type NoiLuu = "supabase" | "cuc_bo" | "khong";
type TrangThai = "chua_luu" | "dang_luu" | "da_luu" | "loi";
type Tab = "la-so" | "luan-giai";

const KHOA_CHE_DO = "ansao.che-do-xem";

export function LaSoWorkspace({ banDau, id, noiLuu }: {
  banDau: AnSaoInput; id?: string; noiLuu: NoiLuu;
}) {
  const router = useRouter();
  const [value, setValue] = useState<AnSaoInput>(banDau);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [tab, setTab] = useState<Tab>("la-so");
  const [cheDo, setCheDo] = useState<CheDoXem>("cao");
  const [zoom, setZoom] = useState(0.5);
  const [trangThai, setTrangThai] = useState<TrangThai>("chua_luu");
  const [loi, setLoi] = useState<string | null>(null);
  const dirty = useRef(false);
  const coTheLuu = noiLuu !== "khong";

  // Nhớ chế độ xem giữa các lần mở — thói quen zoom rất cá nhân.
  useEffect(() => {
    try {
      const luu = localStorage.getItem(KHOA_CHE_DO);
      if (luu) setCheDo(luu === "cao" || luu === "ngang" ? luu : Number(luu));
    } catch { /* localStorage bị chặn */ }
  }, []);
  const doiCheDo = useCallback((c: CheDoXem) => {
    setCheDo(c);
    try { localStorage.setItem(KHOA_CHE_DO, String(c)); } catch { /* bỏ qua */ }
  }, []);

  const onChange = useCallback((next: AnSaoInput) => {
    dirty.current = true;
    setTrangThai("chua_luu");
    setValue(next);
  }, []);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty.current && coTheLuu) e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [coTheLuu]);

  async function luu() {
    setTrangThai("dang_luu"); setLoi(null);
    try {
      if (noiLuu === "cuc_bo") {
        const maId = luuCucBo(value, id);
        dirty.current = false; setTrangThai("da_luu");
        if (!id) router.push(`/la-so/${maId}`);
        return;
      }
      const res = await fetch(id ? `/api/la-so/${id}` : "/api/la-so", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hoTen: value.hoTen, gioiTinh: value.gioiTinh,
          namSinh: value.namSinh, thangSinh: value.thangSinh, ngaySinh: value.ngaySinh,
          gioSinh: value.gioSinh, phutSinh: value.phutSinh, noiSinh: value.noiSinh,
          namXem: value.namXem ?? null, thangXem: value.thangXem ?? null,
          daiVanTuoiDau: value.daiVanTuoiDau ?? null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Lưu không thành công");
      dirty.current = false; setTrangThai("da_luu");
      if (!id) router.push(`/la-so/${json.data.id}`); else router.refresh();
    } catch (e) {
      setTrangThai("loi"); setLoi((e as Error).message);
    }
  }

  async function xoa() {
    if (!id || !window.confirm(`Xoá lá số "${value.hoTen || "chưa đặt tên"}"?`)) return;
    if (noiLuu === "cuc_bo") { xoaCucBo(id); router.push("/la-so"); return; }
    const res = await fetch(`/api/la-so/${id}`, { method: "DELETE" });
    if (res.ok) { dirty.current = false; router.push("/la-so"); router.refresh(); }
    else setLoi("Xoá không thành công.");
  }

  // Cảnh báo dồn vào chuông trên thanh công cụ thay vì chiếm một dải ngang.
  const tin: Tin[] = [];
  if (loi) tin.push({ id: "loi", muc: "loi", tieuDe: "Không lưu được", than: loi });
  if (noiLuu === "cuc_bo") {
    tin.push({
      id: "khach", muc: "canh_bao", tieuDe: "Chế độ khách",
      than: "Lá số lưu trong trình duyệt này, chưa đồng bộ lên máy chủ. Xoá dữ liệu duyệt web là mất.",
    });
  }
  if (noiLuu === "khong") {
    tin.push({
      id: "chua-luu", muc: "canh_bao", tieuDe: "Lá số chưa được lưu",
      than: (
        <>
          <a href="/login" className="text-cyan underline underline-offset-2">Đăng nhập</a>
          {" "}để lưu lá số này và hỏi chuyên gia luận giải.
        </>
      ),
    });
  }

  const ten = value.hoTen || "Lá số chưa đặt tên";
  const phu = `${value.ngaySinh}/${value.thangSinh}/${value.namSinh} · `
    + `${String(value.gioSinh).padStart(2, "0")}:${String(value.phutSinh).padStart(2, "0")} · ${value.noiSinh}`;

  return (
    <div className="flex min-h-screen flex-col">
      <ThanhCongCu
        ten={ten} phu={phu}
        cheDo={cheDo} zoom={zoom} doiCheDo={doiCheDo}
        theme={theme} doiTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        tab={tab} doiTab={setTab}
        trangThaiLuu={trangThai} onLuu={coTheLuu ? luu : undefined}
        onXoa={id ? xoa : undefined} coTheLuu={coTheLuu}
        duongVe={{ href: coTheLuu ? "/la-so" : "/", nhan: coTheLuu ? "Lá số của tôi" : "Trang chủ" }}
        tin={tin}
      />


      <div className="grid flex-1 gap-3 p-3 sm:px-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className={tab === "la-so" ? "min-w-0" : "hidden min-w-0 xl:block"}>
          <LaSoView
            value={value} onChange={onChange} theme={theme}
            cheDo={cheDo} onZoom={setZoom}
          />
        </div>

        <div className={`no-print ${tab === "luan-giai" ? "" : "hidden xl:block"}
                        xl:sticky xl:top-[64px] xl:h-[calc(100vh-76px)]`}>
          <KhungChat
            laSoId={noiLuu === "supabase" ? id : undefined}
            laSo={noiLuu === "supabase" ? undefined : value}
            tenDuongSo={ten}
          />
        </div>
      </div>
    </div>
  );
}

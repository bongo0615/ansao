"use client";

/**
 * Khung trò chuyện với chuyên gia luận giải.
 *
 * Lá số KHÔNG gửi kèm nội dung chat — server tự dựng lại từ `laSoId` (hoặc từ
 * input ở chế độ khách) rồi nạp vào system prompt. Client chỉ gửi lịch sử hội
 * thoại, nên không thể giả mạo lá số của người khác.
 */

import { useEffect, useRef, useState } from "react";
import { GOI_Y_CAU_HOI, NHOM_CAU_HOI } from "@/lib/ai/system-prompt";
import { Menu } from "@/components/ui/Menu";
import type { AnSaoInput } from "@/lib/tuvi/engine";
import { Markdown } from "./Markdown";

type Vai = "user" | "assistant";
type TinNhan = { vai: Vai; noiDung: string };

export function KhungChat({
  laSoId,
  laSo,
  tenDuongSo,
  khoa,
  lyDoKhoa = "chua_dang_nhap",
}: {
  laSoId?: string;
  /** Chế độ khách: gửi thẳng input vì lá số chưa có trong CSDL. */
  laSo?: AnSaoInput;
  tenDuongSo: string;
  /** Khoá khung: chưa đăng nhập, hoặc lá số chưa đủ thông tin. */
  khoa?: boolean;
  lyDoKhoa?: "chua_dang_nhap" | "chua_du";
}) {
  const [tin, setTin] = useState<TinNhan[]>([]);
  const [nhap, setNhap] = useState("");
  const [dangChay, setDangChay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const cuonRef = useRef<HTMLDivElement>(null);
  const huyRef = useRef<AbortController | null>(null);

  // Bám đáy khi có nội dung mới, kể cả trong lúc đang stream.
  useEffect(() => {
    cuonRef.current?.scrollTo({ top: cuonRef.current.scrollHeight, behavior: "smooth" });
  }, [tin, dangChay]);

  useEffect(() => () => huyRef.current?.abort(), []);

  async function gui(noiDung: string) {
    if (!noiDung.trim() || dangChay) return;
    setLoi(null);
    setNhap("");

    const lichSu: TinNhan[] = [...tin, { vai: "user", noiDung }];
    setTin([...lichSu, { vai: "assistant", noiDung: "" }]);
    setDangChay(true);

    const huy = new AbortController();
    huyRef.current = huy;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: huy.signal,
        body: JSON.stringify({
          laSoId,
          laSo: laSoId
            ? undefined
            : laSo && {
                hoTen: laSo.hoTen || "Đương số",
                gioiTinh: laSo.gioiTinh,
                namSinh: laSo.namSinh,
                thangSinh: laSo.thangSinh,
                ngaySinh: laSo.ngaySinh,
                gioSinh: laSo.gioSinh,
                phutSinh: laSo.phutSinh,
                noiSinh: laSo.noiSinh,
                namXem: laSo.namXem ?? null,
                thangXem: laSo.thangXem ?? null,
                daiVanTuoiDau: laSo.daiVanTuoiDau ?? null,
              },
          messages: lichSu.map((m) => ({ role: m.vai, content: m.noiDung })),
        }),
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Không kết nối được tới chuyên gia.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let dem = "";

      // SSE: mỗi sự kiện là một dòng "data: {...}" kết thúc bằng dòng trống.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        dem += decoder.decode(value, { stream: true });
        const phan = dem.split("\n\n");
        dem = phan.pop() ?? "";
        for (const p of phan) {
          if (!p.startsWith("data: ")) continue;
          const sk = JSON.parse(p.slice(6)) as { t: string; v?: string };
          if (sk.t === "text" && sk.v) {
            setTin((cu) => {
              const n = [...cu];
              n[n.length - 1] = { vai: "assistant", noiDung: n[n.length - 1].noiDung + sk.v };
              return n;
            });
          } else if (sk.t === "error") {
            setLoi(sk.v ?? "Có lỗi xảy ra.");
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setLoi((e as Error).message);
    } finally {
      setDangChay(false);
      huyRef.current = null;
      // Bỏ bong bóng rỗng nếu stream hỏng ngay từ đầu.
      setTin((cu) => (cu.at(-1)?.noiDung === "" ? cu.slice(0, -1) : cu));
    }
  }

  return (
    <div className="glass flex h-full min-h-0 flex-col rounded-2xl">
      {/* Đầu khung */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <span
          className="relative flex h-9 w-9 items-center justify-center rounded-full
                         bg-gradient-to-br from-hanh-kim to-hanh-thuy text-sm font-bold text-white"
        >
          HV
          {dangChay && (
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-hanh-moc" />
          )}
        </span>
        <div className="min-w-0">
          <p className="font-display text-[15px] font-semibold leading-tight">Huyền Vi</p>
          <p className="truncate text-xs text-ink-faint">
            {khoa
              ? "chuyên gia luận giải"
              : dangChay
                ? "đang luận giải…"
                : `đang xem lá số ${tenDuongSo}`}
          </p>
        </div>
      </div>

      {/* Khoá: chưa đăng nhập, hoặc lá số chưa đủ thông tin */}
      {khoa ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-dim">
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden
            >
              {lyDoKhoa === "chua_du" ? (
                <>
                  <path d="M6 6.2a2 2 0 113 1.8c-.6.3-1 .8-1 1.4v.3" />
                  <circle cx="8" cy="12" r=".8" fill="currentColor" stroke="none" />
                  <circle cx="8" cy="8" r="6" />
                </>
              ) : (
                <>
                  <rect x="3" y="7" width="10" height="6.5" rx="1.5" />
                  <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
                </>
              )}
            </svg>
          </span>
          {lyDoKhoa === "chua_du" ? (
            <div>
              <p className="font-display text-[15px] font-semibold">Chưa có lá số để luận</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">
                Nhập ngày, tháng, năm và giờ sinh ở khung giữa. Lá số hiện ra là
                tôi xem được ngay.
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="font-display text-[15px] font-semibold">
                  Đăng nhập để hỏi chuyên gia
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">
                  Lá số vẫn lập và in được bình thường. Luận giải cần tài khoản để gắn cuộc
                  trò chuyện với lá số của bạn.
                </p>
              </div>
              <a
                href="/login"
                className="rounded-full bg-gradient-to-r from-hanh-kim to-hanh-thuy px-5 py-2
                           text-[13px] font-semibold text-white transition hover:brightness-110"
              >
                Đăng nhập
              </a>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Nội dung */}
          <div ref={cuonRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {tin.length === 0 && (
              <div className="py-4">
                <p className="text-sm leading-relaxed text-ink-dim">
                  Tôi đã xem qua lá số của <strong className="text-ink">{tenDuongSo}</strong>. Bạn
                  muốn bắt đầu từ đâu?
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {GOI_Y_CAU_HOI.map((g) => (
                    <button
                      key={g}
                      onClick={() => gui(g)}
                      className="rounded-full border border-line px-3.5 py-2 text-left text-[13px] text-ink-dim
                             transition hover:border-cyan/40 hover:bg-white/[0.05] hover:text-ink"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tin.map((m, i) => (
              <div key={i} className={m.vai === "user" ? "flex justify-end" : ""}>
                {m.vai === "user" ? (
                  <p
                    className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-hanh-kim/20
                            px-4 py-2.5 text-sm leading-relaxed"
                  >
                    {m.noiDung}
                  </p>
                ) : (
                  <div className="max-w-none text-[15px] text-ink-dim">
                    {m.noiDung ? (
                      <Markdown>{m.noiDung}</Markdown>
                    ) : (
                      <span className="inline-flex gap-1.5 py-1" aria-label="Đang soạn">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="h-1.5 w-1.5 rounded-full bg-ink-faint"
                            style={{ animation: `go-chu 1.2s ease-in-out ${d * 0.18}s infinite` }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loi && (
              <p className="rounded-xl border border-hanh-hoa/40 bg-hanh-hoa/10 px-4 py-3 text-sm text-hanh-hoa">
                {loi}
              </p>
            )}
          </div>

          {/* Ô nhập */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              gui(nhap);
            }}
            className="border-t border-line p-3"
          >
            <div
              className="flex items-end gap-2 rounded-xl border border-line bg-white/[0.04] px-2.5 py-2
                        transition focus-within:border-cyan/40"
            >
              {/* Hỏi nhanh — luôn sẵn, kể cả khi hội thoại đã bắt đầu */}
              <Menu
                huong="len"
                canPhai={false}
                nut={(mo) => (
                  <span
                    title="Câu hỏi gợi ý"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line transition hover:bg-white/[0.07] hover:text-ink ${
                      mo ? "bg-white/[0.07] text-ink" : "text-ink-dim"
                    }`}
                  >
                    <svg
                      width="15" height="15" viewBox="0 0 16 16" fill="none"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden
                    >
                      <circle cx="8" cy="8" r="6.2" />
                      <path d="M5.9 6a2.1 2.1 0 113 1.9c-.6.3-.9.8-.9 1.4v.3" />
                      <circle cx="8" cy="12.2" r=".85" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                )}
              >
                {(dong) => (
                  <div className="max-h-[min(60vh,420px)] w-[286px] overflow-y-auto">
                    {NHOM_CAU_HOI.map((g) => (
                      <div key={g.nhom} className="mb-1 last:mb-0">
                        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                          {g.nhom}
                        </p>
                        {g.cau.map((c) => (
                          <button
                            key={c}
                            type="button"
                            disabled={dangChay}
                            onClick={() => {
                              dong();
                              gui(c);
                            }}
                            className="block w-full rounded-lg px-3 py-1.5 text-left text-[13px] leading-snug text-ink-dim transition hover:bg-white/[0.07] hover:text-ink disabled:opacity-40"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </Menu>
              <textarea
                value={nhap}
                onChange={(e) => setNhap(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    gui(nhap);
                  }
                }}
                rows={1}
                placeholder="Hỏi về lá số này…"
                disabled={dangChay}
                className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-relaxed
                       text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={dangChay || !nhap.trim()}
                aria-label="Gửi câu hỏi"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                       bg-gradient-to-br from-hanh-kim to-hanh-thuy text-white transition
                       hover:brightness-110 disabled:opacity-35"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M8 13V3M3.5 7.5L8 3l4.5 4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-2 px-1 text-[11px] leading-relaxed text-ink-faint">
              Nội dung mang tính tham khảo, không thay thế tư vấn y tế, pháp lý hay tài chính.
            </p>
          </form>
        </>
      )}
    </div>
  );
}

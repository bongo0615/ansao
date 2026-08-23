/**
 * Tuần tự hoá lá số thành văn bản cho LLM.
 *
 * Nguyên tắc: đây là **dữ liệu đã được engine tính sẵn** — model KHÔNG được
 * tự an sao. Định dạng tối ưu cho việc đọc: mỗi cung một khối, ghi rõ tầng
 * của từng sao, kèm các quan hệ tam hợp/xung chiếu đã tính sẵn để model khỏi
 * phải suy ra (dễ sai).
 */

import { CHI_POS, TAM_HOP, chiAt, pos, type Chi } from "@/lib/tuvi/constants";
import type { CungData, LaSo, Layer } from "@/lib/tuvi/types";

const TEN_TANG: Record<Layer, string> = {
  nguyen_cuc: "nguyên cục",
  dai_van: "Đại Vận",
  luu_nien: "Lưu Niên",
  luu_nguyet: "Lưu Nguyệt",
};

const TEN_HOA = { loc: "Lộc", quyen: "Quyền", khoa: "Khoa", ki: "Kị" } as const;

/** Tam hợp + xung chiếu + nhị hợp của một cung — "thế" của cung. */
function quanHe(p: number) {
  const chi = chiAt(p);
  const th = TAM_HOP.find((t) => t.chis.includes(chi))!;
  return {
    tamHop: th.chis.filter((c) => c !== chi),
    xung: chiAt(pos(p + 6)),
    // Nhị hợp: Tí-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tị-Thân, Ngọ-Mùi
    nhiHop: chiAt(pos(3 - CHI_POS[chi] + 1 + 12)),
  };
}

function moTaCung(c: CungData, ls: LaSo): string {
  const d: string[] = [];
  const nhan = [
    c.isMenh && "★ CUNG MỆNH",
    c.isThan && "☆ THÂN cư tại đây",
    c.tuan && "có Tuần án ngữ",
    c.triet && "có Triệt án ngữ",
  ].filter(Boolean);

  d.push(`### ${c.cungChuc} — cung ${c.chi} (${c.can} ${c.chi}, nạp âm ${c.napAm.ten}/${c.napAm.hanh})`);
  if (nhan.length) d.push(`- Ghi chú: ${nhan.join(" · ")}`);

  const r = quanHe(c.index);
  d.push(`- Tam hợp với: ${r.tamHop.join(", ")} · Xung chiếu: ${r.xung} · Nhị hợp: ${r.nhiHop}`);

  const theoTang = (layer: Layer) => c.sao.filter((s) => s.layer === layer);
  const ten = (s: (typeof c.sao)[number]) => {
    const hoa = s.hoa.map((h) => `[${TEN_HOA[h.hoa]} ${TEN_TANG[h.layer]}]`).join("");
    return `${s.name}(${s.element})${hoa}`;
  };

  const chinh = theoTang("nguyen_cuc").filter((s) => s.cap1 === "Chính Tinh");
  d.push(`- Chính tinh: ${chinh.length ? chinh.map(ten).join(", ") : "VÔ CHÍNH DIỆU"}`);

  const phu = theoTang("nguyen_cuc").filter((s) => s.cap1 !== "Chính Tinh");
  const nhom = (cap: string) => phu.filter((s) => s.cap1 === cap).map(ten);
  const cat = nhom("Cát Tinh"), sat = nhom("Sát Tinh");
  if (cat.length) d.push(`- Cát tinh: ${cat.join(", ")}`);
  if (sat.length) d.push(`- Sát tinh: ${sat.join(", ")}`);
  const vong = phu.filter((s) => s.cap1.startsWith("Vòng")).map(ten);
  if (vong.length) d.push(`- Sao vòng: ${vong.join(", ")}`);

  d.push(`- Vòng Trường Sinh (theo cung Mệnh): ${c.vts} · Khí TS nạp âm cung: ${c.khiTruongSinh.nguyenCuc}`);
  d.push(`- Đại Vận ${c.daiVanRange} tuổi${c.cungChucDV ? ` — ${c.cungChucDV}` : ""}${c.cungChucLN ? `, ${c.cungChucLN}` : ""}`);

  (["dai_van", "luu_nien", "luu_nguyet"] as Layer[]).forEach((l) => {
    const s = theoTang(l);
    if (s.length) d.push(`- Sao ${TEN_TANG[l]}: ${s.map(ten).join(", ")}`);
  });

  if (c.thangLuu) d.push(`- Tháng lưu tại cung: ${c.thangLuu} (${c.canChiThangLuu?.label})`);

  if (c.tuHoaNoiCung.length) {
    const s = c.tuHoaNoiCung.map((t) =>
      `${t.sao} hoá ${TEN_HOA[t.hoa]} → ${t.tuHoa ? "TỰ HOÁ (ngay trong cung)" : t.cungChucDich}`);
    d.push(`- Tứ hoá nội cung (theo can ${c.can} của cung): ${s.join("; ")}`);
  }
  return d.join("\n");
}

/** Toàn bộ lá số dưới dạng văn bản có cấu trúc. */
export function laSoThanhVanBan(ls: LaSo): string {
  const b = ls.batTu;
  const p: string[] = [];

  p.push("## THÔNG TIN ĐƯƠNG SỐ");
  p.push(`- Họ tên: ${ls.input.hoTen || "(chưa đặt tên)"}`);
  p.push(`- Giới tính: ${ls.input.gioiTinh === "nam" ? "Nam" : "Nữ"} — **${ls.amDuongGioiTinh}**, ${ls.thuanLy === 1 ? "THUẬN LÝ" : "NGHỊCH LÝ"}`);
  p.push(`- Sinh: ${ls.input.duong.day}/${ls.input.duong.month}/${ls.input.duong.year} dương lịch, ${String(ls.input.duong.hour).padStart(2, "0")}:${String(ls.input.duong.minute).padStart(2, "0")}, tại ${ls.input.noiSinh}`);
  p.push(`- Âm lịch: ${b.am.day}/${b.am.month}${b.am.leap ? " (nhuận)" : ""}/${b.am.year}`);
  p.push(`- Bát tự: năm ${b.nam.can} ${b.nam.chi} (${b.nam.napAm.ten}) · tháng ${b.thang.can} ${b.thang.chi} (${b.thang.napAm.ten}) · ngày ${b.ngay.can} ${b.ngay.chi} (${b.ngay.napAm.ten}) · giờ ${b.gio.can} ${b.gio.chi} (${b.gio.napAm.ten})`);
  p.push(`- Cung Mệnh: ${chiAt(ls.menh)} · Cung Thân: ${chiAt(ls.than)} (${ls.cung.find((c) => c.index === ls.than)!.cungChuc})`);
  p.push(`- Mệnh nạp âm: ${ls.menhNapAm.ten} (${ls.menhNapAm.hanh}) → **${ls.cuc.ten}** (cục số ${ls.cuc.so})`);

  p.push("\n## BỐI CẢNH THỜI GIAN ĐANG XEM");
  const dv = ls.daiVanHienHanh;
  if (dv) {
    p.push(`- Đại Vận hiện hành: ${dv.tuoiDau}-${dv.tuoiCuoi} tuổi, tại cung ${dv.chi} (${dv.can} ${dv.chi}, ${dv.napAm.ten})`);
  }
  if (ls.luuNien) {
    p.push(`- Lưu Niên: năm ${ls.luuNien.nam} — ${ls.luuNien.can} ${ls.luuNien.chi} (${ls.luuNien.napAm.ten}), đương số ${ls.luuNien.tuoi} tuổi. Khí Trường Sinh của năm: ${ls.luuNien.khiTruongSinh}`);
  } else {
    p.push("- Lưu Niên: CHƯA CHỌN NĂM XEM → không có dữ liệu tầng Lưu Niên. Nếu câu hỏi cần tầng này, hãy nói người dùng nhập 'Năm xem'.");
  }
  if (ls.luuNguyet) {
    p.push(`- Lưu Nguyệt: tháng ${ls.luuNguyet.thang} — ${ls.luuNguyet.can} ${ls.luuNguyet.chi} (${ls.luuNguyet.napAm.ten}), Nguyệt Mệnh tại cung ${chiAt(ls.luuNguyet.cung)}`);
  } else {
    p.push("- Lưu Nguyệt: CHƯA CHỌN THÁNG XEM → không có dữ liệu tầng Lưu Nguyệt.");
  }
  p.push(`- Bảng Đại Vận đầy đủ: ${ls.daiVan.map((d) => `${d.tuoiDau}-${d.tuoiCuoi}@${d.chi}`).join(" · ")}`);

  p.push("\n## 12 CUNG");
  const thuTu = [...ls.cung].sort((a, b2) =>
    (a.index === ls.menh ? -1 : b2.index === ls.menh ? 1 : 0));
  thuTu.forEach((c) => p.push("\n" + moTaCung(c, ls)));

  return p.join("\n");
}

/** Nhãn ngắn để hiển thị / đặt tiêu đề hội thoại. */
export function tomTat(ls: LaSo): string {
  return `${ls.input.hoTen || "Đương số"} — ${ls.amDuongGioiTinh}, Mệnh ${chiAt(ls.menh)}, ${ls.cuc.ten}`;
}

export type { Chi };

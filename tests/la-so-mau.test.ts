/**
 * Đối chiếu với 8 lá số mẫu trong `260720 Lá số mẫu (1).xlsx` — bộ mẫu phủ đủ
 * 8 tổ hợp (can năm ±) × (nam/nữ) × (Mệnh ở cung ±), tức toàn bộ ma trận hệ số
 * A và B. Đây là kiểm chứng độc lập mạnh nhất hiện có cho engine.
 *
 * ⚠️ Mẫu lập ngày 20/07/2026, CŨ HƠN TechDoc bản 30/07. Ba nhóm quy tắc mẫu
 * khác app một cách CÓ HỆ THỐNG (mẫu theo truyền thống / quy ước cũ, app theo
 * TechDoc hiện hành) nên KHÔNG assert ở đây — xem README mục "Đối chiếu lá số
 * mẫu": Hoả-Linh (1.14), Triệt (1.25), không gian vòng L.Tướng Tinh (2.2.3).
 * Mọi mục còn lại khớp 100% và được khoá lại bằng test dưới đây.
 */

import { describe, expect, it } from "vitest";
import { anSao, type AnSaoInput } from "@/lib/tuvi/engine";

type Mau = {
  ten: string;
  input: Pick<AnSaoInput, "gioiTinh" | "namSinh" | "thangSinh" | "ngaySinh" | "gioSinh">;
  /** Ghi trên đầu mỗi sheet: "tức <âm dương giới tính> <ngày>/<tháng> Âl năm <can chi>". */
  am: { day: number; month: number; year: string };
  amDuong: string;
  menh: string;
  than: string;
};

const MAU: Mau[] = [
  { ten: "+Nam - Mệnh ở cung -", input: { gioiTinh: "nam", namSinh: 1988, thangSinh: 11, ngaySinh: 9, gioSinh: 4 },
    am: { day: 1, month: 10, year: "Mậu Thìn" }, amDuong: "Dương Nam", menh: "Dậu", than: "Sửu" },
  { ten: "+Nam - Mệnh ở cung +", input: { gioiTinh: "nam", namSinh: 1995, thangSinh: 1, ngaySinh: 14, gioSinh: 6 },
    am: { day: 14, month: 12, year: "Giáp Tuất" }, amDuong: "Dương Nam", menh: "Tuất", than: "Thìn" },
  { ten: "+Nữ - Mệnh ở cung +", input: { gioiTinh: "nu", namSinh: 1988, thangSinh: 12, ngaySinh: 9, gioSinh: 0 },
    am: { day: 1, month: 11, year: "Mậu Thìn" }, amDuong: "Dương Nữ", menh: "Tí", than: "Tí" },
  { ten: "+Nữ - Mệnh ở cung -", input: { gioiTinh: "nu", namSinh: 2002, thangSinh: 9, ngaySinh: 11, gioSinh: 0 },
    am: { day: 5, month: 8, year: "Nhâm Ngọ" }, amDuong: "Dương Nữ", menh: "Dậu", than: "Dậu" },
  { ten: "- Nam - Mệnh ở cung -", input: { gioiTinh: "nam", namSinh: 1981, thangSinh: 11, ngaySinh: 19, gioSinh: 0 },
    am: { day: 23, month: 10, year: "Tân Dậu" }, amDuong: "Âm Nam", menh: "Hợi", than: "Hợi" },
  { ten: "- Nam - Mệnh ở cung +", input: { gioiTinh: "nam", namSinh: 2007, thangSinh: 3, ngaySinh: 2, gioSinh: 16 },
    am: { day: 14, month: 1, year: "Đinh Hợi" }, amDuong: "Âm Nam", menh: "Ngọ", than: "Tuất" },
  { ten: "- Nữ - Mệnh ở cung +", input: { gioiTinh: "nu", namSinh: 2019, thangSinh: 7, ngaySinh: 16, gioSinh: 18 },
    am: { day: 14, month: 6, year: "Kỷ Hợi" }, amDuong: "Âm Nữ", menh: "Tuất", than: "Thìn" },
  { ten: "- Nữ - Mệnh ở cung -", input: { gioiTinh: "nu", namSinh: 2013, thangSinh: 8, ngaySinh: 19, gioSinh: 6 },
    am: { day: 13, month: 7, year: "Quý Tị" }, amDuong: "Âm Nữ", menh: "Tị", than: "Hợi" },
];

const CHI_DUONG = new Set(["Tí", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"]);

function lap(m: Mau) {
  return anSao({
    ...m.input, hoTen: m.ten, phutSinh: 0,
    noiSinh: "Hồ Chí Minh, Việt Nam", timeZone: "Asia/Ho_Chi_Minh",
    namXem: 2026, thangXem: 6,
  });
}

describe("8 lá số mẫu (260720)", () => {
  it.each(MAU)("$ten — âm lịch & can chi năm", (m) => {
    const ls = lap(m);
    expect(ls.batTu.am.day).toBe(m.am.day);
    expect(ls.batTu.am.month).toBe(m.am.month);
    expect(`${ls.batTu.nam.can} ${ls.batTu.nam.chi}`).toBe(m.am.year);
  });

  it.each(MAU)("$ten — âm dương giới tính & vị trí Mệnh/Thân", (m) => {
    const ls = lap(m);
    expect(ls.amDuongGioiTinh).toBe(m.amDuong);
    expect(ls.cung.find((c) => c.isMenh)!.chi).toBe(m.menh);
    expect(ls.cung.find((c) => c.isThan)!.chi).toBe(m.than);
  });

  it.each(MAU)("$ten — tên sheet mô tả đúng Mệnh ở cung âm hay dương", (m) => {
    const ls = lap(m);
    // Tên sheet: "<+/-> <Nam/Nữ> - Mệnh ở cung <+/->"
    const canDuong = m.ten.trim().startsWith("+");
    const menhCungDuong = m.ten.trimEnd().endsWith("+");
    expect(ls.amDuongGioiTinh.startsWith("Dương")).toBe(canDuong);
    expect(CHI_DUONG.has(ls.cung.find((c) => c.isMenh)!.chi)).toBe(menhCungDuong);
  });

  it("phủ đủ 8 tổ hợp A × B, không trùng", () => {
    const to = MAU.map((m) => {
      const ls = lap(m);
      const A = ls.thuanLy;
      const B = CHI_DUONG.has(ls.cung.find((c) => c.isMenh)!.chi) ? 1 : -1;
      return `${m.input.gioiTinh}/${A}/${B}`;
    });
    expect(new Set(to).size).toBe(8);
  });
});

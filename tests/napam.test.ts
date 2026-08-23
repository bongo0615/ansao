/**
 * Đối chiếu 60/60 Lục Thập Hoa Giáp với **V5 Define Bảng 4** (nguồn chuẩn):
 * ngũ hành nạp âm + trạng thái Trường Sinh. Fixture trích trực tiếp từ
 * `260520 V5 An sao.xlsx`, sheet Define, dòng 95-154.
 */

import { describe, expect, it } from "vitest";
import { khiTruongSinh, napAmHanh, napAmTen, type Can, type Chi, type NguHanh }
  from "@/lib/tuvi/constants";

const BANG_4: [Can, Chi, NguHanh, string][] = [
  ["Giáp", "Dần", "thuy", "Bệnh"],
  ["Ất", "Mão", "thuy", "Suy"],
  ["Bính", "Thìn", "tho", "Trường Sinh"],
  ["Đinh", "Tị", "tho", "Tuyệt"],
  ["Mậu", "Ngọ", "hoa", "Đế Vượng"],
  ["Kỷ", "Mùi", "hoa", "Tử"],
  ["Canh", "Thân", "moc", "Tuyệt"],
  ["Tân", "Dậu", "moc", "Quan Đới"],
  ["Nhâm", "Tuất", "thuy", "Quan Đới"],
  ["Quý", "Hợi", "thuy", "Tuyệt"],
  ["Giáp", "Tí", "kim", "Tử"],
  ["Ất", "Sửu", "kim", "Đế Vượng"],
  ["Bính", "Dần", "hoa", "Trường Sinh"],
  ["Đinh", "Mão", "hoa", "Dưỡng"],
  ["Mậu", "Thìn", "moc", "Suy"],
  ["Kỷ", "Tị", "moc", "Bệnh"],
  ["Canh", "Ngọ", "tho", "Đế Vượng"],
  ["Tân", "Mùi", "tho", "Trường Sinh"],
  ["Nhâm", "Thân", "kim", "Lâm Quan"],
  ["Quý", "Dậu", "kim", "Mộ"],
  ["Giáp", "Tuất", "hoa", "Mộ"],
  ["Ất", "Hợi", "hoa", "Lâm Quan"],
  ["Bính", "Tí", "thuy", "Đế Vượng"],
  ["Đinh", "Sửu", "thuy", "Tử"],
  ["Mậu", "Dần", "tho", "Lâm Quan"],
  ["Kỷ", "Mão", "tho", "Mộ"],
  ["Canh", "Thìn", "kim", "Dưỡng"],
  ["Tân", "Tị", "kim", "Trường Sinh"],
  ["Nhâm", "Ngọ", "moc", "Tử"],
  ["Quý", "Mùi", "moc", "Đế Vượng"],
  ["Giáp", "Thân", "thuy", "Trường Sinh"],
  ["Ất", "Dậu", "thuy", "Dưỡng"],
  ["Bính", "Tuất", "tho", "Trường Sinh"],
  ["Đinh", "Hợi", "tho", "Tuyệt"],
  ["Mậu", "Tí", "hoa", "Thai"],
  ["Kỷ", "Sửu", "hoa", "Mộc Dục"],
  ["Canh", "Dần", "moc", "Lâm Quan"],
  ["Tân", "Mão", "moc", "Mộ"],
  ["Nhâm", "Thìn", "thuy", "Mộ"],
  ["Quý", "Tị", "thuy", "Lâm Quan"],
  ["Giáp", "Ngọ", "kim", "Mộc Dục"],
  ["Ất", "Mùi", "kim", "Thai"],
  ["Bính", "Thân", "hoa", "Bệnh"],
  ["Đinh", "Dậu", "hoa", "Suy"],
  ["Mậu", "Tuất", "moc", "Dưỡng"],
  ["Kỷ", "Hợi", "moc", "Trường Sinh"],
  ["Canh", "Tí", "tho", "Đế Vượng"],
  ["Tân", "Sửu", "tho", "Trường Sinh"],
  ["Nhâm", "Dần", "kim", "Tuyệt"],
  ["Quý", "Mão", "kim", "Quan Đới"],
  ["Giáp", "Thìn", "hoa", "Quan Đới"],
  ["Ất", "Tị", "hoa", "Tuyệt"],
  ["Bính", "Ngọ", "thuy", "Thai"],
  ["Đinh", "Mùi", "thuy", "Mộc Dục"],
  ["Mậu", "Thân", "tho", "Lâm Quan"],
  ["Kỷ", "Dậu", "tho", "Mộ"],
  ["Canh", "Tuất", "kim", "Suy"],
  ["Tân", "Hợi", "kim", "Bệnh"],
  ["Nhâm", "Tí", "moc", "Mộc Dục"],
  ["Quý", "Sửu", "moc", "Thai"],
];

describe("Define Bảng 4 — 60 Lục Thập Hoa Giáp", () => {
  it("đủ 60 cặp, không trùng", () => {
    expect(BANG_4).toHaveLength(60);
    expect(new Set(BANG_4.map(([c, h]) => `${c} ${h}`)).size).toBe(60);
  });

  it.each(BANG_4)("%s %s → nạp âm %s, Trường Sinh %s", (can, chi, hanh, ts) => {
    expect(napAmHanh(can, chi)).toBe(hanh);
    expect(khiTruongSinh(can, chi)).toBe(ts);
  });

  it("mọi cặp đều có tên lục thập hoa giáp để hiển thị", () => {
    BANG_4.forEach(([can, chi]) => {
      expect(napAmTen(can, chi), `${can} ${chi}`).not.toBe("");
    });
  });

  it("tên nạp âm khớp các ví dụ trong Design Spec §7.3", () => {
    const vd: [Can, Chi, string][] = [
      ["Canh", "Tí", "Bích Thượng Thổ"], ["Tân", "Sửu", "Bích Thượng Thổ"],
      ["Quý", "Tị", "Trường Lưu Thuỷ"], ["Nhâm", "Thìn", "Trường Lưu Thuỷ"],
      ["Giáp", "Ngọ", "Sa Trung Kim"], ["Ất", "Mùi", "Sa Trung Kim"],
      ["Bính", "Thân", "Sơn Hạ Hoả"], ["Đinh", "Dậu", "Sơn Hạ Hoả"],
      ["Tân", "Mão", "Tùng Bách Mộc"], ["Canh", "Dần", "Tùng Bách Mộc"],
      ["Mậu", "Tuất", "Bình Địa Mộc"], ["Kỷ", "Hợi", "Bình Địa Mộc"],
      ["Canh", "Ngọ", "Lộ Bàng Thổ"], ["Bính", "Ngọ", "Thiên Hà Thuỷ"],
      ["Nhâm", "Tuất", "Đại Hải Thuỷ"], ["Canh", "Thìn", "Bạch Lạp Kim"],
      ["Quý", "Mão", "Kim Bạch Kim"], ["Mậu", "Tí", "Tích Lịch Hoả"],
    ];
    vd.forEach(([can, chi, ten]) => expect(napAmTen(can, chi)).toBe(ten));
  });
});

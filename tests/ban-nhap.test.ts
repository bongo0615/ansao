/**
 * Cổng "đã đủ thông tin chưa" quyết định lá số có được dựng, có được lưu, và
 * chuyên gia có được hỏi hay không — nên phải khoá bằng test.
 */

import { describe, expect, it } from "vitest";
import { banNhapRong, conThieu, hoanChinh, type BanNhap } from "@/lib/tuvi/ban-nhap";

const day = (p: Partial<BanNhap> = {}): BanNhap => ({
  ...banNhapRong(),
  namSinh: 1981, thangSinh: 9, ngaySinh: 21, gioSinh: 18, phutSinh: 5,
  ...p,
});

describe("Bản nhập lá số", () => {
  it("form rỗng thiếu đủ bốn trường bát tự", () => {
    expect(conThieu(banNhapRong()).sort())
      .toEqual(["gio", "ngay", "nam", "thang"].sort());
  });

  it("form rỗng KHÔNG dựng được lá số", () => {
    expect(hoanChinh(banNhapRong())).toBeNull();
  });

  it("đủ thông tin thì dựng được", () => {
    expect(conThieu(day())).toEqual([]);
    expect(hoanChinh(day())).not.toBeNull();
  });

  it("phút bỏ trống coi như 0, không tính là thiếu", () => {
    expect(conThieu(day({ phutSinh: null }))).toEqual([]);
    expect(hoanChinh(day({ phutSinh: null }))!.phutSinh).toBe(0);
  });

  it("giờ 0 là hợp lệ, không nhầm với chưa nhập", () => {
    expect(conThieu(day({ gioSinh: 0 }))).toEqual([]);
  });

  it("bắt ngày không có thật", () => {
    expect(conThieu(day({ thangSinh: 2, ngaySinh: 30 }))).toEqual(["ngay_khong_co_that"]);
    expect(hoanChinh(day({ thangSinh: 2, ngaySinh: 30 }))).toBeNull();
    // 2024 nhuận nên 29/02 hợp lệ
    expect(conThieu(day({ namSinh: 2024, thangSinh: 2, ngaySinh: 29 }))).toEqual([]);
  });

  it("bắt giá trị ngoài khoảng", () => {
    expect(conThieu(day({ thangSinh: 13 }))).toContain("thang");
    expect(conThieu(day({ gioSinh: 24 }))).toContain("gio");
    expect(conThieu(day({ namSinh: 1899 }))).toContain("nam");
  });

  it("nơi sinh không có trong danh mục là thiếu", () => {
    expect(conThieu(day({ noiSinh: "Sao Hoả" }))).toContain("noi_sinh");
    expect(conThieu(day({ noiSinh: "" }))).toContain("noi_sinh");
  });

  it("múi giờ suy từ nơi sinh, không lấy từ trường timeZone", () => {
    const b = day({ noiSinh: "Los Angeles, Hoa Kỳ", timeZone: "Asia/Ho_Chi_Minh" });
    expect(hoanChinh(b)!.timeZone).toBe("America/Los_Angeles");
  });

  it("họ tên trống KHÔNG chặn việc lập lá số", () => {
    expect(conThieu(day({ hoTen: "" }))).toEqual([]);
  });
});

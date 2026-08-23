/**
 * Hạn mức cho người chưa đăng nhập là thứ duy nhất chắn giữa endpoint LLM mở
 * và hoá đơn API, nên phải có test.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { diaChi, kiemTra } from "@/lib/gioi-han";

describe("Giới hạn tần suất", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-01-01T00:00:00Z")); });

  it("cho qua đúng số lượt rồi mới chặn", () => {
    const k = `a-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(kiemTra(k, 3, 60_000).choPhep, `lượt ${i + 1}`).toBe(true);
    }
    expect(kiemTra(k, 3, 60_000).choPhep).toBe(false);
  });

  it("báo số lượt còn lại", () => {
    const k = `b-${Math.random()}`;
    expect(kiemTra(k, 3, 60_000).conLai).toBe(2);
    expect(kiemTra(k, 3, 60_000).conLai).toBe(1);
    expect(kiemTra(k, 3, 60_000).conLai).toBe(0);
  });

  it("mở lại sau khi hết cửa sổ", () => {
    const k = `c-${Math.random()}`;
    kiemTra(k, 1, 60_000);
    expect(kiemTra(k, 1, 60_000).choPhep).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(kiemTra(k, 1, 60_000).choPhep).toBe(true);
  });

  it("nói rõ còn bao lâu mới được thử lại", () => {
    const k = `d-${Math.random()}`;
    kiemTra(k, 1, 60_000);
    vi.advanceTimersByTime(20_000);
    const r = kiemTra(k, 1, 60_000);
    expect(r.choPhep).toBe(false);
    expect(r.thuLaiSauGiay).toBeGreaterThan(35);
    expect(r.thuLaiSauGiay).toBeLessThanOrEqual(40);
  });

  it("mỗi khoá đếm riêng — IP này hết lượt không ảnh hưởng IP khác", () => {
    const a = `e-${Math.random()}`, b = `f-${Math.random()}`;
    kiemTra(a, 1, 60_000);
    expect(kiemTra(a, 1, 60_000).choPhep).toBe(false);
    expect(kiemTra(b, 1, 60_000).choPhep).toBe(true);
  });

  it("đọc IP từ header proxy, lấy địa chỉ đầu tiên của x-forwarded-for", () => {
    expect(diaChi(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(diaChi(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(diaChi(new Headers())).toBe("khong-ro");
  });
});

/**
 * Chế độ khách lưu lá số vào localStorage. Test bằng stub vì logic này là thứ
 * duy nhất trong app không kiểm được qua HTTP.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnSaoInput } from "@/lib/tuvi/engine";

function stubLocalStorage() {
  const kho = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => kho.get(k) ?? null,
      setItem: (k: string, v: string) => void kho.set(k, v),
      removeItem: (k: string) => void kho.delete(k),
    },
  });
  return kho;
}

const MAU: AnSaoInput = {
  hoTen: "Nhã Trần", gioiTinh: "nu",
  namSinh: 1981, thangSinh: 9, ngaySinh: 21, gioSinh: 18, phutSinh: 5,
  noiSinh: "Hồ Chí Minh, Việt Nam", timeZone: "Asia/Ho_Chi_Minh",
  namXem: 2026, thangXem: 6, daiVanTuoiDau: 45,
};

describe("Lưu trữ cục bộ (chế độ khách)", () => {
  beforeEach(() => { vi.resetModules(); stubLocalStorage(); });

  it("lưu rồi đọc lại được nguyên vẹn", async () => {
    const m = await import("@/lib/luu-tru-cuc-bo");
    const id = m.luuCucBo(MAU);
    const row = m.layCucBo(id);
    expect(row).not.toBeNull();
    expect(row!.ho_ten).toBe("Nhã Trần");
    expect(row!.nam_xem).toBe(2026);
    expect(row!.thang_xem).toBe(6);
    // time_zone suy từ nơi sinh, không lấy từ input.
    expect(row!.time_zone).toBe("Asia/Ho_Chi_Minh");
  });

  it("rowToInput khứ hồi khớp input ban đầu", async () => {
    const m = await import("@/lib/luu-tru-cuc-bo");
    const { rowToInput } = await import("@/lib/la-so-io");
    const id = m.luuCucBo(MAU);
    expect(rowToInput(m.layCucBo(id)!)).toEqual(MAU);
  });

  it("lưu lại cùng id là CẬP NHẬT, không tạo bản ghi mới", async () => {
    const m = await import("@/lib/luu-tru-cuc-bo");
    const id = m.luuCucBo(MAU);
    m.luuCucBo({ ...MAU, hoTen: "Tên mới" }, id);
    expect(m.danhSachCucBo()).toHaveLength(1);
    expect(m.layCucBo(id)!.ho_ten).toBe("Tên mới");
  });

  it("lưu không kèm id thì tạo bản ghi mới", async () => {
    const m = await import("@/lib/luu-tru-cuc-bo");
    m.luuCucBo(MAU);
    m.luuCucBo({ ...MAU, hoTen: "Người thứ hai" });
    expect(m.danhSachCucBo()).toHaveLength(2);
  });

  it("danh sách sắp xếp mới nhất lên đầu", async () => {
    const m = await import("@/lib/luu-tru-cuc-bo");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    m.luuCucBo({ ...MAU, hoTen: "Cũ" });
    vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));
    m.luuCucBo({ ...MAU, hoTen: "Mới" });
    vi.useRealTimers();
    expect(m.danhSachCucBo().map((r) => r.ho_ten)).toEqual(["Mới", "Cũ"]);
  });

  it("xoá đúng bản ghi, giữ nguyên phần còn lại", async () => {
    const m = await import("@/lib/luu-tru-cuc-bo");
    const a = m.luuCucBo({ ...MAU, hoTen: "A" });
    m.luuCucBo({ ...MAU, hoTen: "B" });
    m.xoaCucBo(a);
    expect(m.danhSachCucBo().map((r) => r.ho_ten)).toEqual(["B"]);
    expect(m.layCucBo(a)).toBeNull();
  });

  it("localStorage bị chặn thì không ném lỗi", async () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => { throw new Error("bị chặn"); },
        setItem: () => { throw new Error("bị chặn"); },
      },
    });
    const m = await import("@/lib/luu-tru-cuc-bo");
    expect(() => m.danhSachCucBo()).not.toThrow();
    expect(() => m.luuCucBo(MAU)).not.toThrow();
  });
});

/**
 * Test case acceptance BẮT BUỘC — TechDoc AnSao Ảo Bí v1.0 mục 4.3 & 4.4.
 * Phải chạy CẢ HAI: case #2 (nghịch lý) phát hiện lỗi thiếu hệ số A mà case
 * #1 (thuận lý) che khuất.
 */

import { describe, expect, it } from "vitest";
import { anSao } from "@/lib/tuvi/engine";
import { CHI_POS, type Chi } from "@/lib/tuvi/constants";
import type { LaSo, Layer } from "@/lib/tuvi/types";

const TZ = "Asia/Ho_Chi_Minh";

/** Vị trí (tên chi) của một sao ở một tầng. */
function at(ls: LaSo, name: string, layer: Layer = "nguyen_cuc"): Chi[] {
  return ls.cung
    .filter((c) => c.sao.some((s) => s.name === name && s.layer === layer))
    .map((c) => c.chi);
}
const one = (ls: LaSo, name: string, layer: Layer = "nguyen_cuc") => {
  const r = at(ls, name, layer);
  expect(r, `${name} (${layer})`).toHaveLength(1);
  return r[0];
};
const chiOf = (ls: LaSo, p: number) => ls.cung.find((c) => c.index === p)!.chi;

/** Các hoá gắn trên một sao ở một tầng. */
function hoaCua(ls: LaSo, layer: Layer): Record<string, string> {
  const out: Record<string, string> = {};
  ls.cung.forEach((c) => c.sao.forEach((s) => s.hoa
    .filter((h) => h.layer === layer)
    .forEach((h) => { out[h.hoa] = s.name; })));
  return out;
}

// ===========================================================================
describe("Test case #1 — Nữ, 21/09/1981 DL 18:05, VN (TechDoc 4.3)", () => {
  const base = {
    hoTen: "Nhã Trần", gioiTinh: "nu" as const,
    namSinh: 1981, thangSinh: 9, ngaySinh: 21, gioSinh: 18, phutSinh: 5,
    noiSinh: "Hồ Chí Minh, Việt Nam", timeZone: TZ,
  };
  const ls = anSao(base);

  it("âm lịch & can chi", () => {
    expect(ls.batTu.am).toMatchObject({ day: 24, month: 8, year: 1981 });
    expect(`${ls.batTu.nam.can} ${ls.batTu.nam.chi}`).toBe("Tân Dậu");
    expect(`${ls.batTu.thang.can} ${ls.batTu.thang.chi}`).toBe("Đinh Dậu");
    expect(`${ls.batTu.ngay.can} ${ls.batTu.ngay.chi}`).toBe("Nhâm Dần");
    expect(`${ls.batTu.gio.can} ${ls.batTu.gio.chi}`).toBe("Kỷ Dậu");
    expect(ls.batTu.H).toBe(10);
    expect(ls.amDuongGioiTinh).toBe("Âm Nữ");
    expect(ls.thuanLy).toBe(1); // thuận lý
  });

  it("Mệnh / Thân / Cục", () => {
    expect(chiOf(ls, ls.menh)).toBe("Tí");
    expect(chiOf(ls, ls.than)).toBe("Ngọ");
    expect(ls.cung.find((c) => c.index === ls.than)!.cungChuc).toBe("THIÊN DI");
    const menh = ls.cung.find((c) => c.isMenh)!;
    expect(`${menh.can} ${menh.chi}`).toBe("Canh Tí");
    expect(ls.cuc).toMatchObject({ hanh: "tho", so: 5 });
  });

  it("Tử Vi / Thiên Phủ + 2 vòng chính tinh", () => {
    expect(one(ls, "Tử Vi")).toBe("Tị");
    expect(one(ls, "Thiên Phủ")).toBe("Hợi");
    expect(one(ls, "Thiên Cơ")).toBe("Thìn");
    expect(one(ls, "Thái Dương")).toBe("Dần");
    expect(one(ls, "Vũ Khúc")).toBe("Sửu");
    expect(one(ls, "Thiên Đồng")).toBe("Tí");
    expect(one(ls, "Liêm Trinh")).toBe("Dậu");
    expect(one(ls, "Thái Âm")).toBe("Tí");
    expect(one(ls, "Tham Lang")).toBe("Sửu");
    expect(one(ls, "Cự Môn")).toBe("Dần");
    expect(one(ls, "Thiên Tướng")).toBe("Mão");
    expect(one(ls, "Thiên Lương")).toBe("Thìn");
    expect(one(ls, "Thất Sát")).toBe("Tị");
    expect(one(ls, "Phá Quân")).toBe("Dậu");
  });

  it("sao lẻ nguyên cục", () => {
    expect(one(ls, "Lộc Tồn")).toBe("Dậu");
    expect(one(ls, "Kình Dương")).toBe("Tuất");
    expect(one(ls, "Đà La")).toBe("Thân");
    expect(one(ls, "Địa Kiếp")).toBe("Thân");
    expect(one(ls, "Địa Không")).toBe("Dần");
    expect(one(ls, "Tả Phù")).toBe("Hợi");
    expect(one(ls, "Hữu Bật")).toBe("Mão");
    expect(one(ls, "Văn Xương")).toBe("Sửu");
    expect(one(ls, "Văn Khúc")).toBe("Sửu");
    expect(one(ls, "Thiên Khôi")).toBe("Tị");
    expect(one(ls, "Thiên Việt")).toBe("Mão");
    expect(one(ls, "Hoả Tinh")).toBe("Hợi");
    expect(one(ls, "Linh Tinh")).toBe("Mùi");
    expect(one(ls, "Thái Tuế")).toBe("Dậu");
    expect(one(ls, "Tướng Tinh")).toBe("Dậu");
    expect(one(ls, "Tam Thai")).toBe("Tuất");
    expect(one(ls, "Bát Toạ")).toBe("Thìn");
    expect(one(ls, "Ân Quang")).toBe("Hợi");
    expect(one(ls, "Thiên Quý")).toBe("Mão");
    expect(one(ls, "Thiên Quan")).toBe("Thân");
    expect(one(ls, "Thiên Phúc")).toBe("Tị");
    expect(one(ls, "Thiên Trù")).toBe("Ngọ");
    expect(one(ls, "Cô Thần")).toBe("Hợi");
    expect(one(ls, "Quả Tú")).toBe("Mùi");
    expect(one(ls, "Thiên Khốc")).toBe("Dậu");
    expect(one(ls, "Thiên Hư")).toBe("Mão");
    expect(one(ls, "Thiên Hình")).toBe("Thìn");
    expect(one(ls, "Thiên Diêu")).toBe("Thân");
    expect(one(ls, "Hồng Loan")).toBe("Ngọ");
    expect(one(ls, "Thiên Hỉ")).toBe("Tí");
    expect(one(ls, "Long Trì")).toBe("Sửu");
    expect(one(ls, "Phượng Các")).toBe("Sửu");
  });

  it("ngũ hành ĐỘNG", () => {
    const hoaTinh = ls.cung.flatMap((c) => c.sao)
      .find((s) => s.name === "Hoả Tinh" && s.layer === "nguyen_cuc")!;
    expect(hoaTinh.element).toBe("kim"); // tam hợp Tị-Dậu-Sửu
    const coThan = ls.cung.flatMap((c) => c.sao)
      .find((s) => s.name === "Cô Thần" && s.layer === "nguyen_cuc")!;
    expect(coThan.element).toBe("kim"); // tam hội Thân-Dậu-Tuất
  });

  it("Tứ Hoá nguyên cục (Tân)", () => {
    expect(hoaCua(ls, "nguyen_cuc")).toEqual({
      loc: "Cự Môn", quyen: "Thái Dương", khoa: "Văn Khúc", ki: "Văn Xương",
    });
  });

  it("Tuần / Triệt", () => {
    const tuan = ls.cung.filter((c) => c.tuan).map((c) => c.chi).sort();
    expect(tuan.sort()).toEqual(["Sửu", "Tí"].sort());
    const triet = ls.cung.filter((c) => c.triet).map((c) => c.chi);
    expect(triet.sort()).toEqual(["Hợi", "Tuất"].sort());
  });

  it("VTS cung Mệnh — Canh Tí thổ, khởi Thân, thuận", () => {
    const map = Object.fromEntries(ls.cung.map((c) => [c.chi, c.vts]));
    expect(map).toMatchObject({
      Thân: "Trường Sinh", Dậu: "Mộc Dục", Tuất: "Quan Đới", Hợi: "Lâm Quan",
      Tí: "Đế Vượng", Sửu: "Suy", Dần: "Bệnh", Mão: "Tử", Thìn: "Mộ",
      Tị: "Tuyệt", Ngọ: "Thai", Mùi: "Dưỡng",
    });
    // "khí cung Mệnh = Đế Vượng" trong TechDoc 4.3 là sao VTS đóng tại Mệnh.
    expect(ls.cung.find((c) => c.isMenh)!.vts).toBe("Đế Vượng");
    // Khí TS tầng nguyên cục (PHẦN 3 tầng 2) tra nạp âm Canh Tí → cùng giá trị.
    expect(ls.cung.find((c) => c.isMenh)!.khiTruongSinh.nguyenCuc).toBe("Đế Vượng");
  });

  it("Đại Vận — khởi 5, vòng vận thuận", () => {
    expect(ls.daiVan[0]).toMatchObject({ cung: ls.menh, tuoiDau: 5, tuoiCuoi: 14 });
    expect(chiOf(ls, ls.daiVan[1].cung)).toBe("Sửu");
    expect(ls.cung.find((c) => c.index === ls.daiVan[1].cung)!.cungChuc).toBe("PHỤ MẪU");
    expect(ls.daiVan[1]).toMatchObject({ tuoiDau: 15, tuoiCuoi: 24 });
  });

  it("Tứ Hoá ĐV2 (cung Tân Sửu)", () => {
    const dv2 = anSao({ ...base, namXem: 1996, daiVanTuoiDau: 15 });
    expect(`${dv2.daiVanHienHanh!.can} ${dv2.daiVanHienHanh!.chi}`).toBe("Tân Sửu");
    expect(hoaCua(dv2, "dai_van")).toEqual({
      loc: "Cự Môn", quyen: "Thái Dương", khoa: "Văn Khúc", ki: "Văn Xương",
    });
  });

  describe("Lưu Niên 2026 (Bính Ngọ)", () => {
    const ls26 = anSao({ ...base, namXem: 2026 });
    it("Thái Tuế, Lưu Dần, khí năm, Tứ Hoá", () => {
      expect(one(ls26, "Thái Tuế", "luu_nien")).toBe("Ngọ");
      expect(chiOf(ls26, ls26.luuNien!.luuDan)).toBe("Thân");
      expect(ls26.luuNien!.khiTruongSinh).toBe("Thai");
      expect(hoaCua(ls26, "luu_nien")).toEqual({
        loc: "Thiên Đồng", quyen: "Thiên Cơ", khoa: "Văn Xương", ki: "Liêm Trinh",
      });
    });
    it("Ngũ Hổ Độn năm xem 2026 — 12 tháng", () => {
      const expected: [number, string, Chi][] = [
        [1, "Canh Dần", "Thân"], [2, "Tân Mão", "Dậu"], [3, "Nhâm Thìn", "Tuất"],
        [4, "Quý Tị", "Hợi"], [5, "Giáp Ngọ", "Tí"], [6, "Ất Mùi", "Sửu"],
        [7, "Bính Thân", "Dần"], [8, "Đinh Dậu", "Mão"], [9, "Mậu Tuất", "Thìn"],
        [10, "Kỷ Hợi", "Tị"], [11, "Canh Tí", "Ngọ"], [12, "Tân Sửu", "Mùi"],
      ];
      expected.forEach(([thang, canChi, cungChi]) => {
        const c = ls26.cung.find((x) => x.thangLuu === `T.${thang}`)!;
        expect(c.chi, `tháng ${thang}`).toBe(cungChi);
        const [can, chi] = canChi.split(" ");
        expect(c.canChiThangLuu!.label).toBe(
          `${{ Giáp: "G", Ất: "Â", Bính: "B", Đinh: "Đ", Mậu: "M", Kỷ: "K",
               Canh: "C", Tân: "T", Nhâm: "N", Quý: "Q" }[can as never]}.${chi}`,
        );
      });
    });
  });

  describe("Lưu Niên 2025 (Ất Tị) — không có tháng xem", () => {
    const ls25 = anSao({ ...base, namXem: 2025 });
    it("Lưu Dần, L.Lộc Tồn chiều nghịch, L.Kình-Đà, L.Khôi-Việt", () => {
      expect(chiOf(ls25, ls25.luuNien!.luuDan)).toBe("Mùi");
      expect(one(ls25, "Lộc Tồn", "luu_nien")).toBe("Thân");
      expect(one(ls25, "Kình Dương", "luu_nien")).toBe("Mùi");
      expect(one(ls25, "Đà La", "luu_nien")).toBe("Dậu");
      expect(one(ls25, "Thiên Khôi", "luu_nien")).toBe("Thìn");
      expect(one(ls25, "Thiên Việt", "luu_nien")).toBe("Dần");
    });
    it("vòng L.Tướng Tinh khởi lưu Dậu → physical Dần", () => {
      expect(one(ls25, "Tướng Tinh", "luu_nien")).toBe("Dần");
    });
    it("L.Tứ Hoá (Ất)", () => {
      expect(hoaCua(ls25, "luu_nien")).toEqual({
        loc: "Thiên Cơ", quyen: "Thiên Lương", khoa: "Tử Vi", ki: "Thái Âm",
      });
    });
    it("nhãn Zone 5 tháng lưu", () => {
      expect(ls25.cung.find((c) => c.chi === "Tị")!.thangLuu).toBe("T.11");
      expect(ls25.cung.find((c) => c.chi === "Tị")!.canChiThangLuu!.label).toBe("M.Tí");
      expect(ls25.cung.find((c) => c.chi === "Mùi")!.thangLuu).toBe("T.1");
      expect(ls25.cung.find((c) => c.chi === "Mùi")!.canChiThangLuu!.label).toBe("M.Dần");
    });
    it("tầng N. KHÔNG hiển thị", () => {
      expect(ls25.luuNguyet).toBeNull();
      expect(ls25.cung.flatMap((c) => c.sao).filter((s) => s.layer === "luu_nguyet"))
        .toHaveLength(0);
    });
    it("KHÔNG an L.Hồng/Hỉ/Long/Phượng (chốt 30/07)", () => {
      ["Hồng Loan", "Thiên Hỉ", "Long Trì", "Phượng Các"].forEach((s) => {
        expect(at(ls25, s, "luu_nien"), s).toHaveLength(0);
      });
    });
  });
});

// ===========================================================================
describe("Test case #2 — NAM NGHỊCH LÝ, 02/05/2001 DL 15:10 VN (TechDoc 4.4)", () => {
  const base = {
    hoTen: "Test", gioiTinh: "nam" as const,
    namSinh: 2001, thangSinh: 5, ngaySinh: 2, gioSinh: 15, phutSinh: 10,
    noiSinh: "Hồ Chí Minh, Việt Nam", timeZone: TZ,
  };
  const ls = anSao({ ...base, namXem: 2027, thangXem: 2 });

  it("âm lịch & can chi — Âm Nam → NGHỊCH LÝ", () => {
    expect(ls.batTu.am).toMatchObject({ day: 10, month: 4, year: 2001 });
    expect(`${ls.batTu.nam.can} ${ls.batTu.nam.chi}`).toBe("Tân Tị");
    expect(`${ls.batTu.thang.can} ${ls.batTu.thang.chi}`).toBe("Quý Tị");
    expect(`${ls.batTu.ngay.can} ${ls.batTu.ngay.chi}`).toBe("Ất Sửu");
    expect(`${ls.batTu.gio.can} ${ls.batTu.gio.chi}`).toBe("Giáp Thân");
    expect(ls.batTu.H).toBe(9);
    expect(ls.amDuongGioiTinh).toBe("Âm Nam");
    expect(ls.thuanLy).toBe(-1);
  });

  it("Mệnh / Thân / Cục", () => {
    const menh = ls.cung.find((c) => c.isMenh)!;
    expect(menh.chi).toBe("Dậu");
    expect(`${menh.can} ${menh.chi}`).toBe("Đinh Dậu");
    expect(menh.tuan).toBe(true);
    expect(chiOf(ls, ls.than)).toBe("Sửu");
    expect(ls.cung.find((c) => c.index === ls.than)!.cungChuc).toBe("QUAN LỘC");
    expect(ls.menhNapAm.ten).toBe("Sơn Hạ Hoả");
    expect(ls.cuc).toMatchObject({ hanh: "hoa", so: 6 });
  });

  it("Tử Vi / Phủ", () => {
    expect(one(ls, "Tử Vi")).toBe("Tị");
    expect(one(ls, "Thiên Phủ")).toBe("Hợi");
  });

  it("Lộc Tồn / Kình-Đà ĐẢO so với thuận lý", () => {
    expect(one(ls, "Lộc Tồn")).toBe("Dậu");
    expect(one(ls, "Kình Dương")).toBe("Thân");
    expect(one(ls, "Đà La")).toBe("Tuất");
    // vòng Lộc Tồn nguyên cục chạy NGHỊCH
    expect(one(ls, "Lực Sĩ")).toBe("Thân");
  });

  it("sao lẻ", () => {
    expect(one(ls, "Tả Phù")).toBe("Mùi");
    expect(one(ls, "Hữu Bật")).toBe("Mùi");
    expect(one(ls, "Thiên Trù")).toBe("Ngọ");
    expect(one(ls, "Hoả Tinh")).toBe("Tuất");
    expect(one(ls, "Linh Tinh")).toBe("Ngọ");
    expect(one(ls, "Cô Thần")).toBe("Thân");
    expect(one(ls, "Quả Tú")).toBe("Thìn");
  });

  it("ngũ hành ĐỘNG", () => {
    const flat = ls.cung.flatMap((c) => c.sao);
    expect(flat.find((s) => s.name === "Hoả Tinh" && s.layer === "nguyen_cuc")!.element)
      .toBe("kim"); // Tị-Dậu-Sửu
    expect(flat.find((s) => s.name === "Cô Thần" && s.layer === "nguyen_cuc")!.element)
      .toBe("hoa"); // tam hội Tị-Ngọ-Mùi
  });

  it("Tuần / Triệt (Tân Tị)", () => {
    expect(ls.cung.filter((c) => c.tuan).map((c) => c.chi).sort())
      .toEqual(["Dậu", "Thân"].sort());
    expect(ls.cung.filter((c) => c.triet).map((c) => c.chi).sort())
      .toEqual(["Hợi", "Tuất"].sort());
  });

  it("VTS Mệnh — hoả khởi Dần, D=+1, khí cung Mệnh = Tử", () => {
    expect(ls.cung.find((c) => c.chi === "Dần")!.vts).toBe("Trường Sinh");
    expect(ls.cung.find((c) => c.isMenh)!.vts).toBe("Tử");
    // Khí TS nạp âm Đinh Dậu (Define Bảng 4) là "Suy" — khái niệm khác với
    // sao VTS đóng tại cung, hai giá trị không bắt buộc trùng nhau.
    expect(ls.cung.find((c) => c.isMenh)!.khiTruongSinh.nguyenCuc).toBe("Suy");
  });

  it("Đại Vận — khởi 6, vòng vận NGHỊCH, ĐV3 26-35 Ất Mùi", () => {
    expect(ls.daiVan[0]).toMatchObject({ tuoiDau: 6, tuoiCuoi: 15 });
    expect(chiOf(ls, ls.daiVan[0].cung)).toBe("Dậu");
    expect(chiOf(ls, ls.daiVan[1].cung)).toBe("Thân");
    expect(ls.daiVan[2]).toMatchObject({ tuoiDau: 26, tuoiCuoi: 35 });
    expect(`${ls.daiVan[2].can} ${ls.daiVan[2].chi}`).toBe("Ất Mùi");
    // Năm xem 2027 → tuổi 27 → rơi đúng ĐV3
    expect(ls.luuNien!.tuoi).toBe(27);
    expect(ls.daiVanHienHanh!.thuTu).toBe(3);
  });

  it("Sao lưu Đại Vận (can Ất)", () => {
    expect(one(ls, "Lộc Tồn", "dai_van")).toBe("Mão");
    expect(one(ls, "Kình Dương", "dai_van")).toBe("Thìn");
    expect(one(ls, "Đà La", "dai_van")).toBe("Dần");
    expect(one(ls, "Thiên Khôi", "dai_van")).toBe("Hợi");
    expect(one(ls, "Thiên Việt", "dai_van")).toBe("Dậu");
    expect(hoaCua(ls, "dai_van")).toEqual({
      loc: "Thiên Cơ", quyen: "Thiên Lương", khoa: "Tử Vi", ki: "Thái Âm",
    });
  });

  it("Lưu Niên 2027 (Đinh Mùi)", () => {
    expect(chiOf(ls, CHI_POS[ls.luuNien!.chi])).toBe("Mùi");
    expect(chiOf(ls, ls.luuNien!.luuDan)).toBe("Tí");
    expect(one(ls, "Lộc Tồn", "luu_nien")).toBe("Thìn");
    expect(one(ls, "Kình Dương", "luu_nien")).toBe("Mão");
    expect(one(ls, "Đà La", "luu_nien")).toBe("Tị");
    expect(one(ls, "Thiên Khôi", "luu_nien")).toBe("Mùi");
    expect(one(ls, "Thiên Việt", "luu_nien")).toBe("Dậu");
    expect(one(ls, "Tướng Tinh", "luu_nien")).toBe("Sửu");
    expect(hoaCua(ls, "luu_nien")).toEqual({
      loc: "Thái Âm", quyen: "Thiên Đồng", khoa: "Thiên Cơ", ki: "Cự Môn",
    });
  });

  it("Lưu Nguyệt tháng 2 (Quý Mão)", () => {
    expect(chiOf(ls, ls.luuNguyet!.cung)).toBe("Sửu");
    expect(`${ls.luuNguyet!.can} ${ls.luuNguyet!.chi}`).toBe("Quý Mão");
    expect(one(ls, "Lộc Tồn", "luu_nguyet")).toBe("Tuất");
    expect(one(ls, "Tướng Tinh", "luu_nguyet")).toBe("Sửu");
    expect(hoaCua(ls, "luu_nguyet")).toEqual({
      loc: "Phá Quân", quyen: "Cự Môn", khoa: "Thái Âm", ki: "Tham Lang",
    });
  });

  it("Ngũ Hổ Độn 2027 — tháng 2 Quý Mão @ Sửu", () => {
    const c = ls.cung.find((x) => x.thangLuu === "T.2")!;
    expect(c.chi).toBe("Sửu");
    expect(c.canChiThangLuu!.label).toBe("Q.Mão");
    expect(ls.cung.find((x) => x.thangLuu === "T.1")!.chi).toBe("Tí");
  });
});

// ===========================================================================
describe("Bất biến toàn hệ thống", () => {
  const ls = anSao({
    hoTen: "x", gioiTinh: "nu", namSinh: 1981, thangSinh: 9, ngaySinh: 21,
    gioSinh: 18, phutSinh: 5, noiSinh: "HCM", timeZone: TZ,
    namXem: 2026, thangXem: 6,
  });

  it("mỗi vòng 12 sao phủ đủ 12 cung, mỗi cung đúng 1 sao", () => {
    const vong: [string[], Layer][] = [
      [["Lộc Tồn", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư",
        "Phi Liêm", "Hỉ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ"], "nguyen_cuc"],
      [["Tướng Tinh", "Phan An", "Thiên Mã", "Tức Thần", "Hoa Cái", "Kiếp Sát",
        "Tai Sát", "Thiên Sát", "Chỉ Bối", "Đào Hoa", "Nguyệt Sát", "Vong Thần"], "luu_nguyet"],
    ];
    vong.forEach(([names, layer]) => {
      ls.cung.forEach((c) => {
        const k = c.sao.filter((s) => s.layer === layer && names.includes(s.name));
        expect(k, `cung ${c.chi} / ${layer}`).toHaveLength(1);
      });
    });
  });

  it("mọi sao render đều resolve ra hành hoặc none — cấm fallback trắng", () => {
    const hopLe = new Set(["kim", "moc", "thuy", "hoa", "tho", "none"]);
    ls.cung.flatMap((c) => c.sao).forEach((s) => {
      expect(hopLe.has(s.element), `${s.name}: ${s.element}`).toBe(true);
    });
  });

  it("mỗi sao mang tối đa 4 icon Tứ Hoá (1/tầng)", () => {
    ls.cung.flatMap((c) => c.sao).forEach((s) => {
      expect(s.hoa.length).toBeLessThanOrEqual(4);
      expect(new Set(s.hoa.map((h) => h.layer)).size).toBe(s.hoa.length);
    });
  });

  it("Thân luôn rơi vào Mệnh/Phúc/Quan/Di/Tài/Phối", () => {
    const cc = ls.cung.find((c) => c.index === ls.than)!.cungChuc;
    expect(["MỆNH", "PHÚC ĐỨC", "QUAN LỘC", "THIÊN DI", "TÀI BẠCH", "PHU THÊ"])
      .toContain(cc);
  });

  it("bất biến Tử Vi + Thiên Phủ ≡ 2 (mod 12)", () => {
    const tv = CHI_POS[one(ls, "Tử Vi")];
    const tp = CHI_POS[one(ls, "Thiên Phủ")];
    expect((tv + tp) % 12).toBe(2 % 12);
  });
});

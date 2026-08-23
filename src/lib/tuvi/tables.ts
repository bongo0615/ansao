/**
 * Bảng tra an sao — TechDoc AnSao Ảo Bí v1.0, PHẦN 1.
 * Mọi vị trí ở hệ Dần = 1.
 */

import { CHI_POS, type Can, type Chi } from "./constants";
import type { HoaKey } from "./sao";

const P = (c: Chi) => CHI_POS[c];

/** B6 — vị trí Lộc Tồn theo Can. */
export const LOC_TON: Record<Can, number> = {
  Giáp: P("Dần"), Ất: P("Mão"), Bính: P("Tị"), Đinh: P("Ngọ"), Mậu: P("Tị"),
  Kỷ: P("Ngọ"), Canh: P("Thân"), Tân: P("Dậu"), Nhâm: P("Hợi"), Quý: P("Tí"),
};

/** B13 — Thiên Khôi / Thiên Việt theo Can (≠TT, chủ đích Ảo Bí). */
export const KHOI_VIET: Record<Can, { khoi: Chi; viet: Chi }> = {
  Giáp: { khoi: "Tí", viet: "Thân" },
  Ất: { khoi: "Hợi", viet: "Dậu" },
  Bính: { khoi: "Thân", viet: "Tí" },
  Đinh: { khoi: "Dậu", viet: "Hợi" },
  Mậu: { khoi: "Sửu", viet: "Mùi" },
  Kỷ: { khoi: "Mùi", viet: "Sửu" },
  Canh: { khoi: "Ngọ", viet: "Dần" },
  Tân: { khoi: "Tị", viet: "Mão" },
  Nhâm: { khoi: "Dần", viet: "Ngọ" },
  Quý: { khoi: "Mão", viet: "Tị" },
};

/** B14 — cung khởi Hoả Tinh / Linh Tinh theo tam hợp chi năm sinh. */
export const HOA_LINH_GOC: Record<string, { hoa: Chi; linh: Chi }> = {
  thuy: { hoa: "Tị", linh: "Sửu" },   // Thân-Tí-Thìn
  moc: { hoa: "Thân", linh: "Thìn" }, // Hợi-Mão-Mùi
  hoa: { hoa: "Hợi", linh: "Mùi" },   // Dần-Ngọ-Tuất
  kim: { hoa: "Dần", linh: "Tuất" },  // Tị-Dậu-Sửu
};

/** B15 — bảng Tứ Hoá theo Can. ⚠️ Nhâm Khoa = **Tả Phù** (≠TT dùng Thiên Phủ). */
export const TU_HOA: Record<Can, Record<HoaKey, string>> = {
  Giáp: { loc: "Liêm Trinh", quyen: "Phá Quân", khoa: "Vũ Khúc", ki: "Thái Dương" },
  Ất: { loc: "Thiên Cơ", quyen: "Thiên Lương", khoa: "Tử Vi", ki: "Thái Âm" },
  Bính: { loc: "Thiên Đồng", quyen: "Thiên Cơ", khoa: "Văn Xương", ki: "Liêm Trinh" },
  Đinh: { loc: "Thái Âm", quyen: "Thiên Đồng", khoa: "Thiên Cơ", ki: "Cự Môn" },
  Mậu: { loc: "Tham Lang", quyen: "Thái Âm", khoa: "Hữu Bật", ki: "Thiên Cơ" },
  Kỷ: { loc: "Vũ Khúc", quyen: "Tham Lang", khoa: "Thiên Lương", ki: "Văn Khúc" },
  Canh: { loc: "Thái Dương", quyen: "Vũ Khúc", khoa: "Thái Âm", ki: "Thiên Đồng" },
  Tân: { loc: "Cự Môn", quyen: "Thái Dương", khoa: "Văn Khúc", ki: "Văn Xương" },
  Nhâm: { loc: "Thiên Lương", quyen: "Tử Vi", khoa: "Tả Phù", ki: "Vũ Khúc" },
  Quý: { loc: "Phá Quân", quyen: "Cự Môn", khoa: "Thái Âm", ki: "Tham Lang" },
};

/** B19 — Thiên Quan theo Can năm sinh. */
export const THIEN_QUAN: Record<Can, Chi> = {
  Giáp: "Mùi", Ất: "Thìn", Bính: "Tị", Đinh: "Dần", Mậu: "Mão",
  Kỷ: "Tuất", Canh: "Hợi", Tân: "Thân", Nhâm: "Dậu", Quý: "Ngọ",
};

/** B20 — Thiên Phúc theo Can năm sinh. */
export const THIEN_PHUC: Record<Can, Chi> = {
  Giáp: "Dậu", Ất: "Thân", Bính: "Tí", Đinh: "Hợi", Mậu: "Mão",
  Kỷ: "Dần", Canh: "Ngọ", Tân: "Tị", Nhâm: "Ngọ", Quý: "Tị",
};

/** B20b — Thiên Trù theo Can năm sinh (bổ sung 30/07, chỉ nguyên cục). */
export const THIEN_TRU: Record<Can, Chi> = {
  Giáp: "Tị", Ất: "Ngọ", Bính: "Tí", Đinh: "Tị", Mậu: "Ngọ",
  Kỷ: "Thân", Canh: "Dần", Tân: "Ngọ", Nhâm: "Dậu", Quý: "Hợi",
};

/**
 * B25 — Triệt theo Can năm. **Bảng lookup là chuẩn** (≠TT: Ất và Canh tách
 * riêng); công thức 25.2 trong sheet V5 SAI, không dùng. Giá trị = cung đầu p,
 * Triệt phủ (p, p+1).
 */
export const TRIET_P: Record<Can, number> = {
  Giáp: 7, Ất: 5, Bính: 9, Đinh: 3, Mậu: 1,
  Kỷ: 7, Canh: 11, Tân: 9, Nhâm: 3, Quý: 1,
};

/** 2.2.3 — L.Thiên Mã theo tam hợp chi năm xem. */
export const LUU_THIEN_MA: Record<string, Chi> = {
  hoa: "Thân",  // Dần-Ngọ-Tuất
  thuy: "Dần",  // Thân-Tí-Thìn
  kim: "Hợi",   // Tị-Dậu-Sửu
  moc: "Tị",    // Hợi-Mão-Mùi
};

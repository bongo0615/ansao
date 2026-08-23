/**
 * Danh mục sao — nguồn ngũ hành DUY NHẤT của engine.
 *
 * Chép từ `Bang_PhanLoai_Sao_DRAFT.md` (96 mục + Thiên Trù = 97). Front-end
 * **cấm tự suy hành của sao và cấm fallback trắng âm thầm** (TechDoc 0.8,
 * Design Spec v3.3 quy tắc 1-2): mọi thực thể hiển thị nhận `element` từ đây
 * hoặc từ 3 cơ chế màu động.
 */

import type { Element, NguHanh } from "./constants";

export type Cap1 =
  | "Chính Tinh" | "Cát Tinh" | "Sát Tinh" | "Tứ Hoá"
  | "Vòng Lộc Tồn" | "Vòng Thái Tuế" | "Vòng Tướng Tinh" | "Vòng Trường Sinh"
  | "Án";

/** Mô hình nguồn ngũ hành 3 lớp (TechDoc 0.8, chốt 30/07). */
export type NguonHanh =
  | NguHanh                       // Lớp 1 TĨNH
  | "DONG:TAMHOP_CHI_TANG"        // Lớp 2 ĐỘNG — vòng Tướng Tinh
  | "DONG:TAMHOP_NAM"             // Lớp 2 ĐỘNG — Hoả Tinh, Linh Tinh
  | "DONG:TAMHOI_NAM"             // Lớp 2 ĐỘNG — Cô Thần, Quả Tú
  | "none";                       // Lớp 3 NONE

export type SaoDef = {
  name: string;
  /** Tên hiển thị viết tắt (TechDoc 0.8); mặc định bằng `name`. */
  display?: string;
  hanh: NguonHanh;
  cap1: Cap1;
};

const S = (name: string, hanh: NguonHanh, cap1: Cap1, display?: string): SaoDef =>
  ({ name, hanh, cap1, display });

/** 14 chính tinh — ⚠️ Thiên Lương hành THỔ (chủ đích Ảo Bí, ≠ sách vở). */
export const CHINH_TINH: SaoDef[] = [
  S("Tử Vi", "tho", "Chính Tinh"),
  S("Thiên Cơ", "moc", "Chính Tinh"),
  S("Thái Dương", "hoa", "Chính Tinh"),
  S("Vũ Khúc", "kim", "Chính Tinh"),
  S("Thiên Đồng", "thuy", "Chính Tinh"),
  S("Liêm Trinh", "hoa", "Chính Tinh"),
  S("Thiên Phủ", "tho", "Chính Tinh"),
  S("Thái Âm", "thuy", "Chính Tinh"),
  S("Tham Lang", "moc", "Chính Tinh"),
  S("Cự Môn", "thuy", "Chính Tinh"),
  S("Thiên Tướng", "thuy", "Chính Tinh"),
  S("Thiên Lương", "tho", "Chính Tinh"),
  S("Thất Sát", "kim", "Chính Tinh"),
  S("Phá Quân", "thuy", "Chính Tinh"),
];

/** Vòng Lộc Tồn (12 sao, k=0..11) — không dùng tên "Bác Sĩ". */
export const VONG_LOC_TON: SaoDef[] = [
  S("Lộc Tồn", "tho", "Vòng Lộc Tồn"),
  S("Lực Sĩ", "kim", "Vòng Lộc Tồn"),
  S("Thanh Long", "moc", "Vòng Lộc Tồn"),
  S("Tiểu Hao", "moc", "Vòng Lộc Tồn"),
  S("Tướng Quân", "hoa", "Vòng Lộc Tồn"),
  S("Tấu Thư", "hoa", "Vòng Lộc Tồn"),
  S("Phi Liêm", "hoa", "Vòng Lộc Tồn"),
  S("Hỉ Thần", "moc", "Vòng Lộc Tồn"),
  S("Bệnh Phù", "kim", "Vòng Lộc Tồn"),
  S("Đại Hao", "kim", "Vòng Lộc Tồn"),
  S("Phục Binh", "thuy", "Vòng Lộc Tồn"),
  S("Quan Phủ", "thuy", "Vòng Lộc Tồn"),
];

/** Vòng Thái Tuế (12 sao) — luôn an thuận. */
export const VONG_THAI_TUE: SaoDef[] = [
  S("Thái Tuế", "tho", "Vòng Thái Tuế"),
  S("Thiếu Dương", "hoa", "Vòng Thái Tuế"),
  S("Tang Môn", "moc", "Vòng Thái Tuế"),
  S("Thiếu Âm", "moc", "Vòng Thái Tuế"),
  S("Quan Phù", "thuy", "Vòng Thái Tuế"),
  S("Tử Phù", "moc", "Vòng Thái Tuế"),
  S("Tuế Phá", "thuy", "Vòng Thái Tuế"),
  S("Long Đức", "thuy", "Vòng Thái Tuế"),
  S("Bạch Hổ", "kim", "Vòng Thái Tuế"),
  S("Phúc Đức", "kim", "Vòng Thái Tuế"),
  S("Điếu Khách", "hoa", "Vòng Thái Tuế"),
  S("Trực Phù", "kim", "Vòng Thái Tuế"),
];

/** Vòng Tướng Tinh (12 sao) — ngũ hành ĐỘNG theo tam hợp chi của tầng. */
export const VONG_TUONG_TINH: SaoDef[] = [
  "Tướng Tinh", "Phan An", "Thiên Mã", "Tức Thần", "Hoa Cái", "Kiếp Sát",
  "Tai Sát", "Thiên Sát", "Chỉ Bối", "Đào Hoa", "Nguyệt Sát", "Vong Thần",
].map((n) => S(n, "DONG:TAMHOP_CHI_TANG", "Vòng Tướng Tinh"));

/** Sao lẻ nguyên cục (B9-B24 + Thiên Trù). */
export const SAO_LE: Record<string, SaoDef> = Object.fromEntries(
  [
    S("Kình Dương", "kim", "Sát Tinh"),
    S("Đà La", "kim", "Sát Tinh"),
    S("Địa Không", "hoa", "Sát Tinh"),
    S("Địa Kiếp", "thuy", "Sát Tinh"),
    S("Tả Phù", "thuy", "Cát Tinh", "T.Phù"),
    S("Hữu Bật", "hoa", "Cát Tinh", "H.Bật"),
    S("Văn Xương", "hoa", "Cát Tinh", "V.Xương"),
    S("Văn Khúc", "thuy", "Cát Tinh", "V.Khúc"),
    S("Thiên Khôi", "hoa", "Cát Tinh"),
    S("Thiên Việt", "thuy", "Cát Tinh"),
    S("Hoả Tinh", "DONG:TAMHOP_NAM", "Sát Tinh"),
    S("Linh Tinh", "DONG:TAMHOP_NAM", "Sát Tinh"),
    S("Tam Thai", "moc", "Cát Tinh"),
    S("Bát Toạ", "kim", "Cát Tinh"),
    S("Ân Quang", "kim", "Cát Tinh"),
    S("Thiên Quý", "moc", "Cát Tinh"),
    S("Thiên Quan", "tho", "Cát Tinh"),
    S("Thiên Phúc", "tho", "Cát Tinh"),
    S("Thiên Trù", "moc", "Cát Tinh"),
    S("Cô Thần", "DONG:TAMHOI_NAM", "Sát Tinh"),
    S("Quả Tú", "DONG:TAMHOI_NAM", "Sát Tinh"),
    S("Thiên Khốc", "hoa", "Sát Tinh"),
    S("Thiên Hư", "hoa", "Sát Tinh"),
    S("Thiên Hình", "kim", "Sát Tinh"),
    S("Thiên Diêu", "thuy", "Sát Tinh"),
    S("Hồng Loan", "moc", "Cát Tinh"),
    S("Thiên Hỉ", "kim", "Cát Tinh"),
    S("Long Trì", "thuy", "Cát Tinh"),
    S("Phượng Các", "hoa", "Cát Tinh"),
  ].map((s) => [s.name, s]),
);

/** Ngũ hành của 4 hoá: Lộc kim · Quyền hoả · Khoa mộc · Kị thuỷ. */
export const HOA_HANH: Record<HoaKey, NguHanh> = {
  loc: "kim", quyen: "hoa", khoa: "moc", ki: "thuy",
};
export type HoaKey = "loc" | "quyen" | "khoa" | "ki";
export const HOA_TEN: Record<HoaKey, string> = {
  loc: "Lộc", quyen: "Quyền", khoa: "Khoa", ki: "Kị",
};

/** Tra định nghĩa sao bất kỳ theo tên. */
const ALL: Record<string, SaoDef> = Object.fromEntries(
  [...CHINH_TINH, ...VONG_LOC_TON, ...VONG_THAI_TUE, ...VONG_TUONG_TINH,
   ...Object.values(SAO_LE)].map((s) => [s.name, s]),
);

export function saoDef(name: string): SaoDef {
  const def = ALL[name];
  if (!def) throw new Error(`Sao chưa khai báo trong bảng phân loại: ${name}`);
  return def;
}

/** Tên hiển thị (viết tắt nếu có). */
export const tenHienThi = (name: string) => saoDef(name).display ?? name;

// ---------------------------------------------------------------------------
// Thứ tự ưu tiên hiển thị Zone 3 (TechDoc 4.2, chốt 20/07 + 30/07)
// ---------------------------------------------------------------------------

/** Cột TRÁI — 17 Cát Tinh, theo đúng thứ tự ưu tiên từ trên xuống. */
export const ZONE3_TRAI = [
  "Văn Xương", "Văn Khúc", "Tả Phù", "Hữu Bật", "Thiên Khôi", "Thiên Việt",
  "Ân Quang", "Thiên Quý", "Hồng Loan", "Thiên Hỉ", "Long Trì", "Phượng Các",
  "Tam Thai", "Bát Toạ", "Thiên Quan", "Thiên Phúc", "Thiên Trù",
];

/** Cột PHẢI thứ tự ④ — 12 Sát Tinh (sau 3 vòng LT → Thái Tuế → Tướng Tinh). */
export const ZONE3_PHAI_SAT = [
  "Kình Dương", "Đà La", "Địa Không", "Địa Kiếp", "Hoả Tinh", "Linh Tinh",
  "Thiên Hình", "Thiên Diêu", "Cô Thần", "Quả Tú", "Thiên Khốc", "Thiên Hư",
];

/** Sao nhận Tứ Hoá — 18 sao (TechDoc 0.8). */
export const NHAN_TU_HOA = new Set([
  ...CHINH_TINH.map((s) => s.name).filter(
    (n) => !["Thiên Phủ", "Thiên Tướng", "Thất Sát"].includes(n),
  ),
  "Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc",
]);

export type { Element };

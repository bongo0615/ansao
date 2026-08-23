/**
 * Hằng số & bảng tra nền tảng — TechDoc AnSao Ảo Bí v1.0, PHẦN 0.
 *
 * QUY ƯỚC TOẠ ĐỘ QUAN TRỌNG NHẤT (TechDoc 0.1):
 *   - Vị trí cung dùng hệ **Dần = 1** (Dần 1 … Sửu 12).
 *   - Ngoại lệ duy nhất: GIỜ SINH dùng hệ **Tí = 1**. Biến `H` luôn là hệ Tí=1.
 */

export type NguHanh = "kim" | "moc" | "thuy" | "hoa" | "tho";
/** `none` = nhóm cố ý không có ngũ hành (vòng Trường Sinh, Tuần/Triệt). */
export type Element = NguHanh | "none";

// ---------------------------------------------------------------------------
// Chi — hệ Dần = 1
// ---------------------------------------------------------------------------

/** 12 chi theo hệ Dần=1; index 0 tương ứng vị trí 1 (Dần). */
export const CHI = [
  "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi",
  "Thân", "Dậu", "Tuất", "Hợi", "Tí", "Sửu",
] as const;
export type Chi = (typeof CHI)[number];

/** Vị trí hệ Dần=1 của một chi. */
export const CHI_POS: Record<Chi, number> = CHI.reduce(
  (acc, c, i) => ({ ...acc, [c]: i + 1 }),
  {} as Record<Chi, number>,
);

/** Chi theo hệ Tí=1 (dùng cho giờ sinh — TechDoc 0.1/0.6). */
export const CHI_TI1 = [
  "Tí", "Sửu", "Dần", "Mão", "Thìn", "Tị",
  "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi",
] as const;

/** Âm dương & ngũ hành của chi — V5 Define Bảng 6 (TechDoc 0.3). */
export const CHI_INFO: Record<Chi, { duong: boolean; hanh: NguHanh }> = {
  Tí:   { duong: true,  hanh: "thuy" },
  Sửu:  { duong: false, hanh: "tho" },
  Dần:  { duong: true,  hanh: "moc" },
  Mão:  { duong: false, hanh: "moc" },
  Thìn: { duong: true,  hanh: "tho" },
  Tị:   { duong: false, hanh: "hoa" },
  Ngọ:  { duong: true,  hanh: "hoa" },
  Mùi:  { duong: false, hanh: "tho" },
  Thân: { duong: true,  hanh: "kim" },
  Dậu:  { duong: false, hanh: "kim" },
  Tuất: { duong: true,  hanh: "tho" },
  Hợi:  { duong: false, hanh: "thuy" },
};

// ---------------------------------------------------------------------------
// Can — n = 1..10 (Giáp 1 … Quý 10, KHÔNG dùng n=0)
// ---------------------------------------------------------------------------

export const CAN = [
  "Giáp", "Ất", "Bính", "Đinh", "Mậu",
  "Kỷ", "Canh", "Tân", "Nhâm", "Quý",
] as const;
export type Can = (typeof CAN)[number];

export const CAN_NUM: Record<Can, number> = CAN.reduce(
  (acc, c, i) => ({ ...acc, [c]: i + 1 }),
  {} as Record<Can, number>,
);

/** Can lẻ = dương, chẵn = âm (TechDoc 0.3). */
export const canDuong = (can: Can) => CAN_NUM[can] % 2 === 1;

/** Ngũ hành của can — Giáp-Ất mộc, Bính-Đinh hoả, … (TechDoc 0.3). */
export const CAN_HANH: Record<Can, NguHanh> = {
  Giáp: "moc", Ất: "moc",
  Bính: "hoa", Đinh: "hoa",
  Mậu: "tho", Kỷ: "tho",
  Canh: "kim", Tân: "kim",
  Nhâm: "thuy", Quý: "thuy",
};

/** Viết tắt Can 1 ký tự cho nhãn `<Can>.<Chi>` ở Zone 5 (TechDoc 0.8). */
export const CAN_ABBR: Record<Can, string> = {
  Giáp: "G", Ất: "Â", Bính: "B", Đinh: "Đ", Mậu: "M",
  Kỷ: "K", Canh: "C", Tân: "T", Nhâm: "N", Quý: "Q",
};

// ---------------------------------------------------------------------------
// Số học vị trí cung
// ---------------------------------------------------------------------------

/**
 * Chuẩn hoá vị trí cung về 1..12. TechDoc 0.1: `pos = MOD(x − 1, 12) + 1`,
 * với lưu ý JS cần `((x % 12) + 12) % 12` để MOD của số âm ra 0..11.
 */
export function pos(x: number): number {
  return (((x - 1) % 12) + 12) % 12 + 1;
}

/** Chi đóng tại vị trí (hệ Dần=1). */
export const chiAt = (p: number): Chi => CHI[pos(p) - 1];

/** Cung dương = cung mang chi dương → hệ số B = +1; cung âm → B = −1. */
export const heSoB = (p: number): 1 | -1 => (CHI_INFO[chiAt(p)].duong ? 1 : -1);

// ---------------------------------------------------------------------------
// Tương tác 12 cung (TechDoc 0.4)
// ---------------------------------------------------------------------------

/** 4 nhóm tam hợp, khai báo theo tên chi. */
export const TAM_HOP: { chis: Chi[]; hanh: NguHanh; deVuong: Chi }[] = [
  { chis: ["Dần", "Ngọ", "Tuất"], hanh: "hoa", deVuong: "Ngọ" },
  { chis: ["Hợi", "Mão", "Mùi"], hanh: "moc", deVuong: "Mão" },
  { chis: ["Thân", "Tí", "Thìn"], hanh: "thuy", deVuong: "Tí" },
  { chis: ["Tị", "Dậu", "Sửu"], hanh: "kim", deVuong: "Dậu" },
];

export function tamHopCua(chi: Chi) {
  return TAM_HOP.find((t) => t.chis.includes(chi))!;
}

/** 4 nhóm tam hội — dùng ở B21 Cô-Quả (TechDoc 0.4). */
export const TAM_HOI: { chis: Chi[]; hanh: NguHanh; k: number }[] = [
  { chis: ["Dần", "Mão", "Thìn"], hanh: "moc", k: 0 },
  { chis: ["Tị", "Ngọ", "Mùi"], hanh: "hoa", k: 1 },
  { chis: ["Thân", "Dậu", "Tuất"], hanh: "kim", k: 2 },
  { chis: ["Hợi", "Tí", "Sửu"], hanh: "thuy", k: 3 },
];

export function tamHoiCua(chi: Chi) {
  return TAM_HOI.find((t) => t.chis.includes(chi))!;
}

/** Lục xung: cung đối diện (cách 6 cung) — dùng cho Thiên Hỉ (B24). */
export const lucXung = (p: number) => pos(p + 6);

// ---------------------------------------------------------------------------
// Nạp âm — Lục Thập Hoa Giáp (TechDoc 0.7, V5 Define Bảng 4)
// ---------------------------------------------------------------------------

/**
 * Ngũ hành nạp âm tính bằng công thức nhanh của V5 sheet Tử Vi 5.1:
 * trị Can (Giáp-Ất 1 … Nhâm-Quý 5) + trị Chi (Tí-Sửu-Ngọ-Mùi 0;
 * Dần-Mão-Thân-Dậu 1; Thìn-Tị-Tuất-Hợi 2); tổng > 5 thì −5;
 * 1 Kim · 2 Thuỷ · 3 Hoả · 4 Thổ · 5 Mộc.
 *
 * Đã đối chiếu 60/60 với Define Bảng 4 (xem tests/napam.test.ts).
 */
const TRI_CHI: Record<Chi, number> = {
  Tí: 0, Sửu: 0, Ngọ: 0, Mùi: 0,
  Dần: 1, Mão: 1, Thân: 1, Dậu: 1,
  Thìn: 2, Tị: 2, Tuất: 2, Hợi: 2,
};
const HANH_THEO_SO: NguHanh[] = ["kim", "thuy", "hoa", "tho", "moc"];

export function napAmHanh(can: Can, chi: Chi): NguHanh {
  const triCan = Math.ceil(CAN_NUM[can] / 2);
  let s = triCan + TRI_CHI[chi];
  if (s > 5) s -= 5;
  return HANH_THEO_SO[s - 1];
}

/** Cục số của một hành nạp âm — Thuỷ 2, Mộc 3, Kim 4, Thổ 5, Hoả 6. */
export const CUC_SO: Record<NguHanh, number> = {
  thuy: 2, moc: 3, kim: 4, tho: 5, hoa: 6,
};

export const TEN_CUC: Record<NguHanh, string> = {
  thuy: "Thuỷ Nhị Cục",
  moc: "Mộc Tam Cục",
  kim: "Kim Tứ Cục",
  tho: "Thổ Ngũ Cục",
  hoa: "Hoả Lục Cục",
};

/**
 * Tên lục thập hoa giáp (30 cặp) — hiển thị ở Input Panel ("Lộ Bàng Thổ").
 * Khoá theo cặp can-chi đầu của mỗi cặp; cặp thứ 2 dùng chung tên.
 */
const NAP_AM_TEN: Record<string, string> = {
  "Giáp Tí": "Hải Trung Kim", "Ất Sửu": "Hải Trung Kim",
  "Bính Dần": "Lư Trung Hoả", "Đinh Mão": "Lư Trung Hoả",
  "Mậu Thìn": "Đại Lâm Mộc", "Kỷ Tị": "Đại Lâm Mộc",
  "Canh Ngọ": "Lộ Bàng Thổ", "Tân Mùi": "Lộ Bàng Thổ",
  "Nhâm Thân": "Kiếm Phong Kim", "Quý Dậu": "Kiếm Phong Kim",
  "Giáp Tuất": "Sơn Đầu Hoả", "Ất Hợi": "Sơn Đầu Hoả",
  "Bính Tí": "Giản Hạ Thuỷ", "Đinh Sửu": "Giản Hạ Thuỷ",
  "Mậu Dần": "Thành Đầu Thổ", "Kỷ Mão": "Thành Đầu Thổ",
  "Canh Thìn": "Bạch Lạp Kim", "Tân Tị": "Bạch Lạp Kim",
  "Nhâm Ngọ": "Dương Liễu Mộc", "Quý Mùi": "Dương Liễu Mộc",
  "Giáp Thân": "Tuyền Trung Thuỷ", "Ất Dậu": "Tuyền Trung Thuỷ",
  "Bính Tuất": "Ốc Thượng Thổ", "Đinh Hợi": "Ốc Thượng Thổ",
  "Mậu Tí": "Tích Lịch Hoả", "Kỷ Sửu": "Tích Lịch Hoả",
  "Canh Dần": "Tùng Bách Mộc", "Tân Mão": "Tùng Bách Mộc",
  "Nhâm Thìn": "Trường Lưu Thuỷ", "Quý Tị": "Trường Lưu Thuỷ",
  "Giáp Ngọ": "Sa Trung Kim", "Ất Mùi": "Sa Trung Kim",
  "Bính Thân": "Sơn Hạ Hoả", "Đinh Dậu": "Sơn Hạ Hoả",
  "Mậu Tuất": "Bình Địa Mộc", "Kỷ Hợi": "Bình Địa Mộc",
  "Canh Tí": "Bích Thượng Thổ", "Tân Sửu": "Bích Thượng Thổ",
  "Nhâm Dần": "Kim Bạch Kim", "Quý Mão": "Kim Bạch Kim",
  "Giáp Thìn": "Phú Đăng Hoả", "Ất Tị": "Phú Đăng Hoả",
  "Bính Ngọ": "Thiên Hà Thuỷ", "Đinh Mùi": "Thiên Hà Thuỷ",
  "Mậu Thân": "Đại Trạch Thổ", "Kỷ Dậu": "Đại Trạch Thổ",
  "Canh Tuất": "Thoa Xuyến Kim", "Tân Hợi": "Thoa Xuyến Kim",
  "Nhâm Tí": "Tang Đố Mộc", "Quý Sửu": "Tang Đố Mộc",
  "Giáp Dần": "Đại Khê Thuỷ", "Ất Mão": "Đại Khê Thuỷ",
  "Bính Thìn": "Sa Trung Thổ", "Đinh Tị": "Sa Trung Thổ",
  "Mậu Ngọ": "Thiên Thượng Hoả", "Kỷ Mùi": "Thiên Thượng Hoả",
  "Canh Thân": "Thạch Lựu Mộc", "Tân Dậu": "Thạch Lựu Mộc",
  "Nhâm Tuất": "Đại Hải Thuỷ", "Quý Hợi": "Đại Hải Thuỷ",
};

export function napAmTen(can: Can, chi: Chi): string {
  return NAP_AM_TEN[`${can} ${chi}`] ?? "";
}

// ---------------------------------------------------------------------------
// Vòng Trường Sinh & khí Trường Sinh (TechDoc 0.7 + 1.26)
// ---------------------------------------------------------------------------

export const VONG_TRUONG_SINH = [
  "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
  "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng",
] as const;

/**
 * Cung khởi Trường Sinh theo nạp âm (TechDoc 1.26.1). Kim→Tị, Mộc→Hợi,
 * Thuỷ→Thân, Hoả→Dần; riêng **Thổ khởi theo từng cặp nạp âm**.
 */
const KHOI_TS_THO: Record<string, number> = {
  "Đinh Tị": 1, "Canh Ngọ": 1,
  "Bính Thìn": 3,
  "Mậu Thân": 4, "Kỷ Dậu": 4,
  "Tân Mùi": 6,
  "Canh Tí": 7, "Đinh Hợi": 7,
  "Bính Tuất": 9,
  "Mậu Dần": 10, "Kỷ Mão": 10,
  "Tân Sửu": 12,
};

export function khoiTruongSinh(can: Can, chi: Chi): number {
  const hanh = napAmHanh(can, chi);
  if (hanh === "kim") return 4;   // Tị
  if (hanh === "moc") return 10;  // Hợi
  if (hanh === "thuy") return 7;  // Thân
  if (hanh === "hoa") return 1;   // Dần
  const khoi = KHOI_TS_THO[`${can} ${chi}`];
  if (khoi === undefined) {
    throw new Error(`Thiếu cung khởi Trường Sinh cho nạp âm thổ: ${can} ${chi}`);
  }
  return khoi;
}

/**
 * Khí Trường Sinh của một nạp âm = trạng thái của CHI đó trong vòng Trường
 * Sinh của ngũ hành nạp âm ấy, tính từ cung khởi (TechDoc 0.7) — dùng cho
 * PHẦN 3 (khí TS 5 tầng, nền tảng luận giải).
 *
 * ⚠️ Chiều đếm suy ra từ Define Bảng 4: **can dương đếm thuận, can âm đếm
 * nghịch** (đối chiếu 60/60, xem tests/napam.test.ts). Wording "đếm thuận"
 * ở TechDoc 0.7 chỉ đúng cho nửa dương của bảng.
 *
 * KHÁC với vòng Trường Sinh cung Mệnh (B26 / `LaSo.cung[].vts`) — vòng đó
 * an trên lá số với chiều D = A × B(cung Mệnh), là khái niệm riêng.
 */
export function khiTruongSinh(can: Can, chi: Chi): string {
  const khoi = khoiTruongSinh(can, chi);
  const chieu = canDuong(can) ? 1 : -1;
  const k = pos((CHI_POS[chi] - khoi) * chieu + 1) - 1;
  return VONG_TRUONG_SINH[k];
}

// ---------------------------------------------------------------------------
// Ngũ Hổ Độn (TechDoc 0.6)
// ---------------------------------------------------------------------------

/** Can của tháng M trong năm có can số n. Tháng 1 luôn là tháng Dần. */
export function canThang(canNamNum: number, thang: number): Can {
  return CAN[((2 * canNamNum + thang - 1) % 10 + 10) % 10];
}

/** Can của cung Dần trên la võng theo can năm sinh — B3: `MOD(2n, 10) + 1`. */
export const canCungDan = (canNamNum: number): Can => CAN[(2 * canNamNum) % 10];

// ---------------------------------------------------------------------------
// Cung chức
// ---------------------------------------------------------------------------

/** 12 cung chức nguyên cục, thứ tự an thuận từ Mệnh (TechDoc 1.4). */
export const CUNG_CHUC = [
  "MỆNH", "PHỤ MẪU", "PHÚC ĐỨC", "ĐIỀN TRẠCH", "QUAN LỘC", "NÔ BỘC",
  "THIÊN DI", "TẬT ÁCH", "TÀI BẠCH", "TỬ TÔN", "PHU THÊ", "HUYNH ĐỆ",
] as const;

/** Viết tắt cung chức dùng ở khu Địa Vị Zone 2 (TechDoc 0.8). */
export const CUNG_CHUC_TAT = [
  "Mệnh", "Phụ", "Phúc", "Điền", "Quan", "Nô",
  "Di", "Tật", "Tài", "Tử", "Phối", "Huynh",
] as const;

/** Thứ tự cung chức tầng Đại Vận (TechDoc 2.1.2) — "Bào" thay cho "Huynh". */
export const CUNG_CHUC_DV = [
  "Mệnh", "Phụ", "Phúc", "Điền", "Quan", "Nô",
  "Di", "Tật", "Tài", "Tử", "Phối", "Bào",
] as const;

/**
 * Thứ tự cung chức tầng Lưu Niên / Lưu Nguyệt (TechDoc 2.2.2).
 * ⚠️ Thứ tự này NGƯỢC với Đại Vận — TechDoc PHẦN 6 mục 2 ghi nhận đây là
 * open item chờ team xác nhận; tạm giữ theo V5 như tài liệu quy định.
 */
export const CUNG_CHUC_LUU = [
  "Mệnh", "Bào", "Phối", "Tử", "Tài", "Tật",
  "Di", "Nô", "Quan", "Điền", "Phúc", "Phụ",
] as const;

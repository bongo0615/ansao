/**
 * Danh mục nơi sinh → IANA time zone.
 *
 * Engine chỉ cần `timeZone`; phần quy đổi DST lịch sử do `Intl` lo (xem
 * `lunar.ts`). Danh sách ưu tiên 34 tỉnh/thành Việt Nam, kèm các nước có
 * nhiều người Việt sinh sống.
 */

export type NoiSinh = { ten: string; timeZone: string; nuoc: string };

const VN = (ten: string): NoiSinh => ({ ten, timeZone: "Asia/Ho_Chi_Minh", nuoc: "Việt Nam" });

export const NOI_SINH: NoiSinh[] = [
  // Việt Nam — 34 tỉnh/thành sau sáp nhập 2025
  "Hà Nội", "Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", "Huế",
  "An Giang", "Bắc Ninh", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Điện Biên",
  "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Tĩnh", "Hưng Yên", "Khánh Hoà",
  "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Nghệ An", "Ninh Bình",
  "Phú Thọ", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sơn La", "Tây Ninh",
  "Thái Nguyên", "Thanh Hoá", "Tuyên Quang", "Vĩnh Long",
].map(VN);

const NGOAI: NoiSinh[] = [
  { ten: "Phnom Penh", timeZone: "Asia/Phnom_Penh", nuoc: "Campuchia" },
  { ten: "Viêng Chăn", timeZone: "Asia/Vientiane", nuoc: "Lào" },
  { ten: "Bangkok", timeZone: "Asia/Bangkok", nuoc: "Thái Lan" },
  { ten: "Bắc Kinh", timeZone: "Asia/Shanghai", nuoc: "Trung Quốc" },
  { ten: "Hồng Kông", timeZone: "Asia/Hong_Kong", nuoc: "Hồng Kông" },
  { ten: "Đài Bắc", timeZone: "Asia/Taipei", nuoc: "Đài Loan" },
  { ten: "Seoul", timeZone: "Asia/Seoul", nuoc: "Hàn Quốc" },
  { ten: "Tokyo", timeZone: "Asia/Tokyo", nuoc: "Nhật Bản" },
  { ten: "Singapore", timeZone: "Asia/Singapore", nuoc: "Singapore" },
  { ten: "Kuala Lumpur", timeZone: "Asia/Kuala_Lumpur", nuoc: "Malaysia" },
  { ten: "Sydney", timeZone: "Australia/Sydney", nuoc: "Úc" },
  { ten: "Melbourne", timeZone: "Australia/Melbourne", nuoc: "Úc" },
  { ten: "Paris", timeZone: "Europe/Paris", nuoc: "Pháp" },
  { ten: "Berlin", timeZone: "Europe/Berlin", nuoc: "Đức" },
  { ten: "Praha", timeZone: "Europe/Prague", nuoc: "Séc" },
  { ten: "Warszawa", timeZone: "Europe/Warsaw", nuoc: "Ba Lan" },
  { ten: "Moskva", timeZone: "Europe/Moscow", nuoc: "Nga" },
  { ten: "London", timeZone: "Europe/London", nuoc: "Anh" },
  { ten: "Toronto", timeZone: "America/Toronto", nuoc: "Canada" },
  { ten: "Vancouver", timeZone: "America/Vancouver", nuoc: "Canada" },
  { ten: "New York", timeZone: "America/New_York", nuoc: "Hoa Kỳ" },
  { ten: "Houston", timeZone: "America/Chicago", nuoc: "Hoa Kỳ" },
  { ten: "Denver", timeZone: "America/Denver", nuoc: "Hoa Kỳ" },
  { ten: "Los Angeles", timeZone: "America/Los_Angeles", nuoc: "Hoa Kỳ" },
  { ten: "San Jose", timeZone: "America/Los_Angeles", nuoc: "Hoa Kỳ" },
  { ten: "Honolulu", timeZone: "Pacific/Honolulu", nuoc: "Hoa Kỳ" },
];

export const TAT_CA_NOI_SINH = [...NOI_SINH, ...NGOAI];

export const nhanNoiSinh = (n: NoiSinh) => `${n.ten}, ${n.nuoc}`;

export function timNoiSinh(nhan: string): NoiSinh | undefined {
  return TAT_CA_NOI_SINH.find((n) => nhanNoiSinh(n) === nhan);
}

/** Chuỗi GMT±X hiển thị cạnh ô Nơi Sinh, tính tại đúng thời điểm sinh. */
export function nhanGmt(timeZone: string, y: number, m: number, d: number, h: number): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, timeZoneName: "longOffset", year: "numeric",
  }).formatToParts(new Date(Date.UTC(y, m - 1, d, h)));
  const tzn = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  return tzn.replace(":00", "").replace("GMT", "GMT") || "GMT+0";
}

/**
 * Bản nhập — trạng thái form khi lá số CHƯA đủ thông tin.
 *
 * `AnSaoInput` đòi mọi trường bát tự là số, nhưng lúc mới mở "Lập lá số" thì
 * chưa có gì cả. Nếu điền sẵn một ngày mặc định, người dùng sẽ thấy một lá số
 * hoàn chỉnh của một người không có thật — và tệ hơn, hỏi được chuyên gia về nó.
 * Vì vậy các trường số ở đây cho phép `null`, và chỉ khi đủ mới dựng lá số.
 */

import type { AnSaoInput } from "./engine";
import { timNoiSinh } from "./noi-sinh";

export type BanNhap = Omit<
  AnSaoInput, "namSinh" | "thangSinh" | "ngaySinh" | "gioSinh" | "phutSinh"
> & {
  namSinh: number | null;
  thangSinh: number | null;
  ngaySinh: number | null;
  gioSinh: number | null;
  phutSinh: number | null;
};

export const banNhapRong = (): BanNhap => ({
  hoTen: "",
  gioiTinh: "nu",
  namSinh: null, thangSinh: null, ngaySinh: null, gioSinh: null, phutSinh: null,
  noiSinh: "Hồ Chí Minh, Việt Nam",
  timeZone: "Asia/Ho_Chi_Minh",
  namXem: null, thangXem: null, daiVanTuoiDau: null,
});

/** Lá số đã lưu → bản nhập (mọi trường đều có sẵn). */
export const tuAnSaoInput = (v: AnSaoInput): BanNhap => ({ ...v });

const trongKhoang = (v: number | null, a: number, b: number) =>
  v !== null && Number.isInteger(v) && v >= a && v <= b;

/** Ngày có thật hay không — bắt 31/02 mà kiểm khoảng không bắt được. */
function ngayCoThat(y: number, m: number, d: number) {
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

export type ThieuGi = "nam" | "thang" | "ngay" | "gio" | "noi_sinh" | "ngay_khong_co_that";

/** Những trường còn thiếu/sai. Rỗng nghĩa là đã đủ để dựng lá số. */
export function conThieu(b: BanNhap): ThieuGi[] {
  const t: ThieuGi[] = [];
  if (!trongKhoang(b.namSinh, 1900, 2100)) t.push("nam");
  if (!trongKhoang(b.thangSinh, 1, 12)) t.push("thang");
  if (!trongKhoang(b.ngaySinh, 1, 31)) t.push("ngay");
  if (!trongKhoang(b.gioSinh, 0, 23)) t.push("gio");
  if (!b.noiSinh.trim() || !timNoiSinh(b.noiSinh)) t.push("noi_sinh");
  if (t.length === 0 && !ngayCoThat(b.namSinh!, b.thangSinh!, b.ngaySinh!)) {
    t.push("ngay_khong_co_that");
  }
  return t;
}

export const NHAN_THIEU: Record<ThieuGi, string> = {
  nam: "năm sinh",
  thang: "tháng sinh",
  ngay: "ngày sinh",
  gio: "giờ sinh",
  noi_sinh: "nơi sinh",
  ngay_khong_co_that: "ngày sinh không có thật",
};

/** Bản nhập → input engine; trả null khi chưa đủ. */
export function hoanChinh(b: BanNhap): AnSaoInput | null {
  if (conThieu(b).length > 0) return null;
  return {
    ...b,
    namSinh: b.namSinh!, thangSinh: b.thangSinh!, ngaySinh: b.ngaySinh!,
    gioSinh: b.gioSinh!, phutSinh: b.phutSinh ?? 0,
    timeZone: timNoiSinh(b.noiSinh)?.timeZone ?? b.timeZone,
  };
}

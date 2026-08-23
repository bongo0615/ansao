/**
 * Chuyển đổi giữa bản ghi DB và input engine, kèm validate.
 * Dùng chung cho API route và form client.
 */

import { z } from "zod";
import type { AnSaoInput } from "@/lib/tuvi/engine";
import { timNoiSinh } from "@/lib/tuvi/noi-sinh";

export const laSoSchema = z.object({
  hoTen: z.string().trim().min(1, "Chưa nhập họ tên").max(100),
  gioiTinh: z.enum(["nam", "nu"]),
  namSinh: z.number().int().min(1900).max(2100),
  thangSinh: z.number().int().min(1).max(12),
  ngaySinh: z.number().int().min(1).max(31),
  gioSinh: z.number().int().min(0).max(23),
  phutSinh: z.number().int().min(0).max(59),
  noiSinh: z.string().trim().min(1).max(120),
  namXem: z.number().int().min(1900).max(2100).nullable().optional(),
  thangXem: z.number().int().min(1).max(12).nullable().optional(),
  daiVanTuoiDau: z.number().int().min(1).max(200).nullable().optional(),
  ghiChu: z.string().max(5000).nullable().optional(),
}).refine((v) => v.thangXem == null || v.namXem != null, {
  message: "Chọn tháng xem thì phải có năm xem",
  path: ["thangXem"],
});

export type LaSoPayload = z.infer<typeof laSoSchema>;

/** Ngày sinh phải là ngày có thật (bắt 31/02 mà zod range không bắt được). */
export function kiemTraNgay(p: { namSinh: number; thangSinh: number; ngaySinh: number }) {
  const d = new Date(Date.UTC(p.namSinh, p.thangSinh - 1, p.ngaySinh));
  return d.getUTCMonth() === p.thangSinh - 1 && d.getUTCDate() === p.ngaySinh;
}

export type LaSoRow = {
  id: string;
  ho_ten: string;
  gioi_tinh: "nam" | "nu";
  nam_sinh: number; thang_sinh: number; ngay_sinh: number;
  gio_sinh: number; phut_sinh: number;
  noi_sinh: string; time_zone: string;
  nam_xem: number | null; thang_xem: number | null; dai_van_tuoi_dau: number | null;
  ghi_chu: string | null;
  updated_at: string;
};

export function rowToInput(r: LaSoRow): AnSaoInput {
  return {
    hoTen: r.ho_ten, gioiTinh: r.gioi_tinh,
    namSinh: r.nam_sinh, thangSinh: r.thang_sinh, ngaySinh: r.ngay_sinh,
    gioSinh: r.gio_sinh, phutSinh: r.phut_sinh,
    noiSinh: r.noi_sinh, timeZone: r.time_zone,
    namXem: r.nam_xem, thangXem: r.thang_xem, daiVanTuoiDau: r.dai_van_tuoi_dau,
  };
}

export function payloadToRow(p: LaSoPayload, ownerId: string) {
  return {
    owner_id: ownerId,
    ho_ten: p.hoTen, gioi_tinh: p.gioiTinh,
    nam_sinh: p.namSinh, thang_sinh: p.thangSinh, ngay_sinh: p.ngaySinh,
    gio_sinh: p.gioSinh, phut_sinh: p.phutSinh,
    noi_sinh: p.noiSinh,
    // Múi giờ suy từ danh mục nơi sinh phía server — client không tự đặt được.
    time_zone: timNoiSinh(p.noiSinh)?.timeZone ?? "Asia/Ho_Chi_Minh",
    nam_xem: p.namXem ?? null,
    thang_xem: p.thangXem ?? null,
    dai_van_tuoi_dau: p.daiVanTuoiDau ?? null,
    ghi_chu: p.ghiChu ?? null,
  };
}

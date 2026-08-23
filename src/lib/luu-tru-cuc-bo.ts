"use client";

/**
 * Lưu lá số vào localStorage cho chế độ khách.
 *
 * Giữ đúng hình dạng `LaSoRow` của Supabase để hai chế độ dùng chung mọi
 * component — đổi chế độ không phải sửa UI.
 */

import type { LaSoRow } from "./la-so-io";
import type { AnSaoInput } from "./tuvi/engine";
import { timNoiSinh } from "./tuvi/noi-sinh";

const KHOA = "ansao.la-so.v1";

function doc(): LaSoRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KHOA);
    return raw ? (JSON.parse(raw) as LaSoRow[]) : [];
  } catch {
    // localStorage có thể bị chặn (chế độ riêng tư) — coi như chưa có gì.
    return [];
  }
}

function ghi(rows: LaSoRow[]): void {
  try {
    window.localStorage.setItem(KHOA, JSON.stringify(rows));
  } catch {
    /* hết dung lượng hoặc bị chặn — bỏ qua, UI đã báo lỗi ở tầng trên */
  }
}

export function danhSachCucBo(): LaSoRow[] {
  return doc().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function layCucBo(id: string): LaSoRow | null {
  return doc().find((r) => r.id === id) ?? null;
}

function inputToRow(v: AnSaoInput, id: string): LaSoRow {
  return {
    id,
    ho_ten: v.hoTen, gioi_tinh: v.gioiTinh,
    nam_sinh: v.namSinh, thang_sinh: v.thangSinh, ngay_sinh: v.ngaySinh,
    gio_sinh: v.gioSinh, phut_sinh: v.phutSinh,
    noi_sinh: v.noiSinh,
    time_zone: timNoiSinh(v.noiSinh)?.timeZone ?? "Asia/Ho_Chi_Minh",
    nam_xem: v.namXem ?? null,
    thang_xem: v.thangXem ?? null,
    dai_van_tuoi_dau: v.daiVanTuoiDau ?? null,
    ghi_chu: null,
    updated_at: new Date().toISOString(),
  };
}

/** Tạo mới hoặc cập nhật; trả về id của bản ghi. */
export function luuCucBo(v: AnSaoInput, id?: string): string {
  const rows = doc();
  const maId = id ?? crypto.randomUUID();
  const row = inputToRow(v, maId);
  const i = rows.findIndex((r) => r.id === maId);
  if (i >= 0) rows[i] = row;
  else rows.push(row);
  ghi(rows);
  return maId;
}

export function xoaCucBo(id: string): void {
  ghi(doc().filter((r) => r.id !== id));
}

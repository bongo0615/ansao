/**
 * Giới hạn tần suất đơn giản, lưu trong bộ nhớ tiến trình.
 *
 * Đủ cho demo và một instance duy nhất. Khi chạy nhiều instance (hoặc serverless
 * co giãn) thì bộ đếm không dùng chung — lúc đó phải chuyển sang Redis/Upstash
 * hoặc bảng Postgres. Ghi rõ ở đây để không ai tưởng nhầm là đã đủ cho production.
 */

type Ban = { moc: number[] };
const kho = new Map<string, Ban>();

/** Dọn khoá đã hết hạn để Map không phình mãi. */
function don(cuaSoMs: number, bayGio: number) {
  for (const [k, v] of kho) {
    v.moc = v.moc.filter((t) => bayGio - t < cuaSoMs);
    if (v.moc.length === 0) kho.delete(k);
  }
}

export type KetQua = { choPhep: boolean; conLai: number; thuLaiSauGiay: number };

export function kiemTra(khoa: string, soLan: number, cuaSoMs: number): KetQua {
  const bayGio = Date.now();
  if (kho.size > 5000) don(cuaSoMs, bayGio);

  const ban = kho.get(khoa) ?? { moc: [] };
  ban.moc = ban.moc.filter((t) => bayGio - t < cuaSoMs);

  if (ban.moc.length >= soLan) {
    kho.set(khoa, ban);
    const cuNhat = Math.min(...ban.moc);
    return {
      choPhep: false,
      conLai: 0,
      thuLaiSauGiay: Math.max(1, Math.ceil((cuaSoMs - (bayGio - cuNhat)) / 1000)),
    };
  }

  ban.moc.push(bayGio);
  kho.set(khoa, ban);
  return { choPhep: true, conLai: soLan - ban.moc.length, thuLaiSauGiay: 0 };
}

/** IP người gọi, đọc từ header proxy; không có thì gom chung một khoá. */
export function diaChi(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") ?? "khong-ro";
}

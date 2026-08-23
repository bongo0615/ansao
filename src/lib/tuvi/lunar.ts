/**
 * Chuyển đổi lịch & bóc can chi — TechDoc AnSao Ảo Bí v1.0, mục 0.6.
 *
 * Pipeline: (nơi sinh, ngày giờ dương lịch) → quy đổi múi giờ về GMT+7
 * (dùng IANA tz database qua `Intl`, tự động đúng cả DST lịch sử) → đổi âm
 * lịch → bóc can chi năm/tháng/ngày/giờ.
 *
 * Thuật toán âm lịch: Hồ Ngọc Đức (chuẩn cho âm lịch Việt Nam, tính theo
 * múi giờ +7) — cùng thuật toán mà thư viện `vnlunar` trong TechDoc dùng.
 */

import { CAN, CAN_NUM, CHI_TI1, canThang, type Can, type Chi, CHI } from "./constants";

// ---------------------------------------------------------------------------
// Số học lịch thiên văn
// ---------------------------------------------------------------------------

const PI = Math.PI;

/** Julian day number của một ngày dương lịch (dd/mm/yyyy). */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) -
    Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

/** Ngày dương lịch từ Julian day number. */
export function jdToDate(jd: number): { day: number; month: number; year: number } {
  let a: number, b: number, c: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: b * 100 + d - 4800 + Math.floor(m / 10),
  };
}

/** Thời điểm sóc (new moon) thứ k tính từ 1900-01-01, trả về Julian day. */
function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat =
      0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  return Jd1 + C1 - deltat;
}

/** Kinh độ mặt trời (đơn vị: 1/30 vòng ≈ cung 30°) tại Julian day jdn. */
function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - PI * 2 * Math.floor(L / (PI * 2));
  return L;
}

const TZ_LUNAR = 7; // âm lịch Việt Nam tính theo GMT+7

function getSunLongitude(dayNumber: number, timeZone: number): number {
  return Math.floor((sunLongitude(dayNumber - 0.5 - timeZone / 24) / PI) * 6);
}

function getNewMoonDay(k: number, timeZone: number): number {
  return Math.floor(newMoon(k) + 0.5 + timeZone / 24);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) nm = getNewMoonDay(k - 1, timeZone);
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last: number;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i += 1;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export type LunarDate = {
  day: number;
  /** Số tháng âm lịch 1-12. Tháng nhuận dùng CÙNG số với tháng bị nhuận. */
  month: number;
  year: number;
  leap: boolean;
  jd: number;
};

/** Đổi ngày dương lịch (múi giờ +7) sang âm lịch Việt Nam. */
export function solarToLunar(dd: number, mm: number, yy: number): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, TZ_LUNAR);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, TZ_LUNAR);
  let a11 = getLunarMonth11(yy, TZ_LUNAR);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, TZ_LUNAR);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, TZ_LUNAR);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, TZ_LUNAR);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap, jd: dayNumber };
}

// ---------------------------------------------------------------------------
// Múi giờ nơi sinh → GMT+7
// ---------------------------------------------------------------------------

/**
 * Offset (phút) của một IANA time zone tại đúng thời điểm `utcMs`. Dựa vào
 * `Intl` nên tự động đúng với DST lịch sử của nơi sinh (VD: Việt Nam từng
 * dùng giờ mùa hè thập niên 1960-70).
 */
function zoneOffsetMinutes(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUTC = Date.UTC(
    get("year"), get("month") - 1, get("day"),
    get("hour") % 24, get("minute"), get("second"),
  );
  return (asUTC - Math.floor(utcMs / 1000) * 1000) / 60000;
}

/**
 * Giờ tường (wall clock) tại nơi sinh → giờ tường theo GMT+7.
 * Trả về ngày/giờ dương lịch đã quy đổi, dùng làm input cho đổi âm lịch.
 */
export function toGmt7(
  y: number, m: number, d: number, hour: number, minute: number, timeZone: string,
): { year: number; month: number; day: number; hour: number; minute: number } {
  // Giờ tường → UTC cần tra ngược offset; lặp 2 lần là đủ hội tụ kể cả quanh
  // mốc đổi DST.
  let utcGuess = Date.UTC(y, m - 1, d, hour, minute, 0);
  for (let i = 0; i < 2; i += 1) {
    const off = zoneOffsetMinutes(utcGuess, timeZone);
    utcGuess = Date.UTC(y, m - 1, d, hour, minute, 0) - off * 60000;
  }
  const gmt7 = new Date(utcGuess + 7 * 3600 * 1000);
  return {
    year: gmt7.getUTCFullYear(),
    month: gmt7.getUTCMonth() + 1,
    day: gmt7.getUTCDate(),
    hour: gmt7.getUTCHours(),
    minute: gmt7.getUTCMinutes(),
  };
}

// ---------------------------------------------------------------------------
// Bóc can chi
// ---------------------------------------------------------------------------

export type CanChi = { can: Can; chi: Chi };

/** Chỉ số giờ theo hệ **Tí = 1** (Bảng giờ Define Bảng 1). */
export function gioIndex(hour: number): number {
  // Tí 23:00–00:59, Sửu 01:00–02:59, … Hợi 21:00–22:59
  return (Math.floor((hour + 1) / 2) % 12) + 1;
}

/** Can chi năm âm lịch. */
export function canChiNam(lunarYear: number): CanChi {
  return {
    can: CAN[(lunarYear + 6) % 10],
    chi: CHI_TI1[(lunarYear + 8) % 12] as Chi,
  };
}

/** Can chi tháng âm lịch — Ngũ Hổ Độn; tháng 1 luôn là tháng Dần. */
export function canChiThang(lunarYear: number, thang: number): CanChi {
  const canNam = canChiNam(lunarYear).can;
  return { can: canThang(CAN_NUM[canNam], thang), chi: CHI[thang - 1] };
}

/** Can chi ngày theo Julian day number. */
export function canChiNgay(jd: number): CanChi {
  return { can: CAN[(jd + 9) % 10], chi: CHI_TI1[(jd + 1) % 12] as Chi };
}

/**
 * Can chi giờ — Ngũ Thử Độn: can của giờ Tí suy từ can ngày, rồi đếm thuận
 * đến chi giờ sinh (TechDoc 0.6: ngày Nhâm Dần → giờ Tí là Canh Tí).
 */
export function canChiGio(canNgay: Can, H: number): CanChi {
  const canGioTi = ((CAN_NUM[canNgay] - 1) * 2) % 10; // 0-indexed
  return { can: CAN[(canGioTi + H - 1) % 10], chi: CHI_TI1[H - 1] as Chi };
}

// ---------------------------------------------------------------------------
// Bát tự đầy đủ từ input
// ---------------------------------------------------------------------------

export type BatTu = {
  duong: { year: number; month: number; day: number; hour: number; minute: number };
  /** Ngày giờ đã quy đổi về GMT+7 (trước khi áp quy tắc giờ Tí). */
  gmt7: { year: number; month: number; day: number; hour: number; minute: number };
  am: LunarDate;
  nam: CanChi;
  thang: CanChi;
  ngay: CanChi;
  gio: CanChi;
  /** Chỉ số giờ hệ Tí=1 — biến `H` trong mọi công thức an sao. */
  H: number;
  /** Tháng âm lịch — biến `M`. */
  M: number;
  /** Ngày âm lịch — biến `D`. */
  D: number;
};

/**
 * Dựng bát tự từ ngày giờ sinh dương lịch + múi giờ nơi sinh.
 *
 * Quy tắc edge case đã chốt (TechDoc 0.6):
 *   - Giờ Tí 23:00–23:59 **thuộc ngày hôm sau** → cộng 1 ngày trước khi đổi
 *     âm lịch và bóc can ngày; 00:00–00:59 thuộc ngày hiện tại.
 *   - Tháng nhuận dùng cùng số tháng (và cùng can chi tháng) với tháng bị
 *     nhuận đứng trước.
 */
export function tinhBatTu(input: {
  year: number; month: number; day: number; hour: number; minute: number;
  timeZone: string;
}): BatTu {
  const g = toGmt7(
    input.year, input.month, input.day, input.hour, input.minute, input.timeZone,
  );

  // Giờ Tí muộn (23:00–23:59) tính sang ngày hôm sau.
  let { year: y, month: m, day: d } = g;
  if (g.hour === 23) {
    const next = jdToDate(jdFromDate(d, m, y) + 1);
    y = next.year; m = next.month; d = next.day;
  }

  const am = solarToLunar(d, m, y);
  const H = gioIndex(g.hour);
  const nam = canChiNam(am.year);
  const thang = canChiThang(am.year, am.month);
  const ngay = canChiNgay(am.jd);
  const gio = canChiGio(ngay.can, H);

  return {
    duong: { year: input.year, month: input.month, day: input.day, hour: input.hour, minute: input.minute },
    gmt7: g,
    am,
    nam, thang, ngay, gio,
    H, M: am.month, D: am.day,
  };
}

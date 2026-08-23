/**
 * Engine an sao Tử Vi — trường phái Ảo Bí.
 * Nguồn quy tắc DUY NHẤT: `TechDoc_AnSao_AoBi_v1.0.md` (+ bảng phân loại sao).
 *
 * Quy ước: mọi vị trí hệ **Dần = 1**; `H` = giờ hệ **Tí = 1**; `M` tháng âm;
 * `D` ngày âm; `n` số Can năm; `Y` chi năm hệ Dần=1.
 */

import {
  CAN, CAN_ABBR, CAN_NUM, CHI, CHI_INFO, CHI_POS, CUC_SO, CUNG_CHUC,
  CUNG_CHUC_DV, CUNG_CHUC_LUU, CUNG_CHUC_TAT, TEN_CUC, VONG_TRUONG_SINH,
  canDuong, canThang, chiAt, heSoB, khiTruongSinh, khoiTruongSinh, lucXung,
  napAmHanh, napAmTen, pos, tamHoiCua, tamHopCua,
  type Can, type Chi, type Element, type NguHanh,
} from "./constants";
import { canChiNam, tinhBatTu, type BatTu } from "./lunar";
import {
  CHINH_TINH, SAO_LE, VONG_LOC_TON, VONG_THAI_TUE, VONG_TUONG_TINH,
  saoDef, tenHienThi, type HoaKey, type NguonHanh,
} from "./sao";
import {
  HOA_LINH_GOC, KHOI_VIET, LOC_TON, LUU_THIEN_MA, THIEN_PHUC, THIEN_QUAN,
  THIEN_TRU, TRIET_P, TU_HOA,
} from "./tables";
import { PREFIX, type CungData, type DaiVanItem, type LaSo, type Layer, type SaoAn } from "./types";

export type AnSaoInput = {
  hoTen: string;
  gioiTinh: "nam" | "nu";
  namSinh: number;
  thangSinh: number;
  ngaySinh: number;
  gioSinh: number;
  phutSinh: number;
  noiSinh: string;
  /** IANA time zone của nơi sinh, VD "Asia/Ho_Chi_Minh". */
  timeZone: string;
  /** Năm xem — thiếu thì toàn bộ tầng `L.` và `N.` để trống (TechDoc 4.0). */
  namXem?: number | null;
  /** Tháng xem — đòi hỏi có năm xem. */
  thangXem?: number | null;
  /** Tuổi khởi của Đại Vận đang chọn; bỏ trống → suy từ năm xem/tuổi hiện tại. */
  daiVanTuoiDau?: number | null;
};

const napAm = (can: Can, chi: Chi) => ({ ten: napAmTen(can, chi), hanh: napAmHanh(can, chi) });

/** Can của cung p trên la võng (B3): đếm thuận từ can cung Dần. */
const canCua = (n: number, p: number): Can => CAN[(2 * n + p - 1) % 10];

// ---------------------------------------------------------------------------

export function anSao(input: AnSaoInput): LaSo {
  const batTu: BatTu = tinhBatTu({
    year: input.namSinh, month: input.thangSinh, day: input.ngaySinh,
    hour: input.gioSinh, minute: input.phutSinh, timeZone: input.timeZone,
  });

  const { H, M, D } = batTu;
  const n = CAN_NUM[batTu.nam.can];
  const Y = CHI_POS[batTu.nam.chi];
  const chiNam = batTu.nam.chi;

  // 0.5 — Thuận lý (A=+1): Dương Nam hoặc Âm Nữ.
  const namDuong = canDuong(batTu.nam.can);
  const laNam = input.gioiTinh === "nam";
  const A: 1 | -1 = (namDuong === laNam) ? 1 : -1;
  const amDuongGioiTinh = `${namDuong ? "Dương" : "Âm"} ${laNam ? "Nam" : "Nữ"}`;

  // --- B4: cung chức ------------------------------------------------------
  const menh = pos(M - H + 1);
  const than = pos(M + H - 1);

  // --- B3.3 / B5: cục ------------------------------------------------------
  const canMenh = canCua(n, menh);
  const menhNapAm = napAm(canMenh, chiAt(menh));
  const C = CUC_SO[menhNapAm.hanh];

  // --- Khung 12 cung -------------------------------------------------------
  const sao: SaoAn[][] = Array.from({ length: 13 }, () => []);
  const push = (
    p: number, name: string, layer: Layer, elementOverride?: Element,
  ) => {
    const def = saoDef(name);
    sao[pos(p)].push({
      name,
      display: `${PREFIX[layer]}${PREFIX[layer] ? " " : ""}${tenHienThi(name)}`.trim(),
      element: elementOverride ?? resolveTinh(def.hanh),
      layer,
      cap1: def.cap1,
      cung: pos(p),
      hoa: [],
    });
  };

  /** Lớp 1 TĨNH + lớp 3 NONE; lớp 2 ĐỘNG phải truyền `elementOverride`. */
  function resolveTinh(h: NguonHanh): Element {
    if (h.startsWith("DONG:")) {
      throw new Error("Sao ngũ hành ĐỘNG phải được engine tính runtime");
    }
    return h as Element;
  }

  // --- B5: Tử Vi / Thiên Phủ + 14 chính tinh --------------------------------
  const Bnum = (C - (D % C)) % C;
  const Q = (D + Bnum) / C;
  const Pv = pos(Q);
  const tuVi = Bnum % 2 === 0 ? pos(Pv + Bnum) : pos(Pv - Bnum);
  const thienPhu = pos(14 - tuVi);

  push(tuVi, "Tử Vi", "nguyen_cuc");
  ([["Thiên Cơ", -1], ["Thái Dương", -3], ["Vũ Khúc", -4], ["Thiên Đồng", -5],
    ["Liêm Trinh", -8]] as const).forEach(([s, o]) => push(tuVi + o, s, "nguyen_cuc"));
  push(thienPhu, "Thiên Phủ", "nguyen_cuc");
  ([["Thái Âm", 1], ["Tham Lang", 2], ["Cự Môn", 3], ["Thiên Tướng", 4],
    ["Thiên Lương", 5], ["Thất Sát", 6], ["Phá Quân", 10]] as const)
    .forEach(([s, o]) => push(thienPhu + o, s, "nguyen_cuc"));

  // --- B6: vòng Lộc Tồn (chiều nguyên cục chỉ theo A) -----------------------
  const locTon = LOC_TON[batTu.nam.can];
  VONG_LOC_TON.forEach((s, k) => push(locTon + k * A, s.name, "nguyen_cuc"));

  // --- B7: vòng Thái Tuế (luôn thuận) --------------------------------------
  VONG_THAI_TUE.forEach((s, k) => push(Y + k, s.name, "nguyen_cuc"));

  // --- B8: vòng Tướng Tinh (luôn thuận; ngũ hành ĐỘNG theo tam hợp CUNG) ----
  const ttKhoi = CHI_POS[tamHopCua(chiNam).deVuong];
  VONG_TUONG_TINH.forEach((s, k) => {
    const p = pos(ttKhoi + k);
    push(p, s.name, "nguyen_cuc", tamHopCua(chiAt(p)).hanh);
  });

  // --- B9: Kình Dương / Đà La (nguyên cục chỉ theo A) -----------------------
  push(locTon + A, "Kình Dương", "nguyen_cuc");
  push(locTon - A, "Đà La", "nguyen_cuc");

  // --- B10-B14, B17-B24 -----------------------------------------------------
  push(9 + H, "Địa Kiếp", "nguyen_cuc");
  push(11 - H, "Địa Không", "nguyen_cuc");
  const taPhu = pos(2 + M);
  const huuBat = pos(10 - M);
  push(taPhu, "Tả Phù", "nguyen_cuc");
  push(huuBat, "Hữu Bật", "nguyen_cuc");
  push(2 + H, "Văn Khúc", "nguyen_cuc");
  push(10 - H, "Văn Xương", "nguyen_cuc");

  const kv = KHOI_VIET[batTu.nam.can];
  push(CHI_POS[kv.khoi], "Thiên Khôi", "nguyen_cuc");
  push(CHI_POS[kv.viet], "Thiên Việt", "nguyen_cuc");

  const thNam = tamHopCua(chiNam);
  const hlGoc = HOA_LINH_GOC[thNam.hanh];
  push(CHI_POS[hlGoc.hoa] + H - 1, "Hoả Tinh", "nguyen_cuc", thNam.hanh);
  push(CHI_POS[hlGoc.linh] + H - 1, "Linh Tinh", "nguyen_cuc", thNam.hanh);

  push(taPhu + D - 1, "Tam Thai", "nguyen_cuc");
  push(huuBat - D + 1, "Bát Toạ", "nguyen_cuc");
  push(8 - H + D, "Ân Quang", "nguyen_cuc");
  push(4 + H - D, "Thiên Quý", "nguyen_cuc");
  push(CHI_POS[THIEN_QUAN[batTu.nam.can]], "Thiên Quan", "nguyen_cuc");
  push(CHI_POS[THIEN_PHUC[batTu.nam.can]], "Thiên Phúc", "nguyen_cuc");
  push(CHI_POS[THIEN_TRU[batTu.nam.can]], "Thiên Trù", "nguyen_cuc");

  const thoi = tamHoiCua(chiNam);
  const coThan = pos(4 + 3 * thoi.k);
  push(coThan, "Cô Thần", "nguyen_cuc", thoi.hanh);
  push(coThan - 4, "Quả Tú", "nguyen_cuc", thoi.hanh);

  push(4 - Y, "Thiên Khốc", "nguyen_cuc");
  push(Y + 6, "Thiên Hư", "nguyen_cuc");
  push(7 + M, "Thiên Hình", "nguyen_cuc");
  push(11 + M, "Thiên Diêu", "nguyen_cuc");

  const hongLoan = pos(13 - Y);
  push(hongLoan, "Hồng Loan", "nguyen_cuc");
  push(lucXung(hongLoan), "Thiên Hỉ", "nguyen_cuc");
  push(Y - 8, "Long Trì", "nguyen_cuc");
  push(20 - Y, "Phượng Các", "nguyen_cuc");

  // --- B25: Tuần / Triệt (án, không phải sao) -------------------------------
  const tuanCung = new Set([pos(Y - n), pos(Y - n - 1)]);
  const trietP = TRIET_P[batTu.nam.can];
  const trietCung = new Set([pos(trietP), pos(trietP + 1)]);

  // --- B26: vòng Trường Sinh cung Mệnh --------------------------------------
  const vtsKhoi = khoiTruongSinh(canMenh, chiAt(menh));
  const vtsChieu = A * heSoB(menh);
  const vts: string[] = Array(13).fill("");
  VONG_TRUONG_SINH.forEach((s, k) => { vts[pos(vtsKhoi + k * vtsChieu)] = s; });

  // --- PHẦN 2.1: Đại Vận ----------------------------------------------------
  const daiVan: DaiVanItem[] = Array.from({ length: 12 }, (_, i) => {
    const p = pos(menh + i * A);
    const can = canCua(n, p);
    const chi = chiAt(p);
    return {
      thuTu: i + 1, cung: p,
      tuoiDau: C + 10 * i, tuoiCuoi: C + 10 * i + 9,
      can, chi, napAm: napAm(can, chi),
    };
  });

  // Năm xem quyết định tuổi; thiếu năm xem thì dùng năm dương lịch hiện tại.
  const namXem = input.namXem ?? null;
  const namTinhTuoi = namXem ?? new Date().getFullYear();
  const tuoi = namTinhTuoi - batTu.am.year + 1; // tuổi mụ (TechDoc 4.4: 2027−2001+1=27)
  const dvTuTuoi = C + 10 * Math.max(0, Math.floor((tuoi - C) / 10));
  const dvChon = input.daiVanTuoiDau ?? dvTuTuoi;
  const daiVanHienHanh =
    daiVan.find((d) => d.tuoiDau === dvChon) ?? daiVan[0];

  const dvMenh = daiVanHienHanh.cung;
  const dvChieuChuc = A * heSoB(menh);
  const cungChucDV: (string | null)[] = Array(13).fill(null);
  CUNG_CHUC_DV.forEach((c, k) => {
    cungChucDV[pos(dvMenh + k * dvChieuChuc)] = `Đv.${c}`;
  });

  // Sao lưu Đại Vận — an theo Can/Chi của cung ĐV Mệnh (TechDoc 2.1.3).
  anSaoTangVan({
    layer: "dai_van",
    can: daiVanHienHanh.can,
    chiPos: dvMenh,
    A, push,
    /** ĐV dùng chi nguyên thuỷ → tên chi map thẳng sang vị trí vật lý. */
    toPhysical: (c) => CHI_POS[c],
    chiCuaCung: (p) => chiAt(p),
  });

  // --- PHẦN 2.2: Lưu Niên ---------------------------------------------------
  let luuDan = 0;
  const luuChiCua: (Chi | null)[] = Array(13).fill(null);
  const cungChucLN: (string | null)[] = Array(13).fill(null);
  const cungChucLNg: (string | null)[] = Array(13).fill(null);
  const thangLuu: (number | null)[] = Array(13).fill(null);
  const canChiThangLuuArr: ({ label: string; hanh: NguHanh } | null)[] = Array(13).fill(null);
  const khiTSLuuNien: (string | null)[] = Array(13).fill(null);

  let luuNien: LaSo["luuNien"] = null;
  let luuNguyet: LaSo["luuNguyet"] = null;

  if (namXem !== null) {
    const ccXem = canChiNam(namXem);
    const nXem = CAN_NUM[ccXem.can];
    const Yxem = CHI_POS[ccXem.chi];

    // 2.2.1 — Lưu Cục: an lại 12 chi + 12 tháng của năm xem.
    luuDan = pos(Yxem - M + H);
    const luuChiToPhysical = (c: Chi) => pos(luuDan + CHI_POS[c] - 1);
    for (let k = 0; k < 12; k += 1) {
      luuChiCua[pos(luuDan + k)] = CHI[k];
    }
    for (let j = 1; j <= 12; j += 1) {
      const p = pos(luuDan + j - 1);
      thangLuu[p] = j;
      const can = canThang(nXem, j);
      const chi = CHI[j - 1];
      canChiThangLuuArr[p] = {
        label: `${CAN_ABBR[can]}.${chi}`,
        hanh: napAmHanh(can, chi),
      };
      // Khí TS tầng Lưu Niên từng cung = nạp âm THÁNG an tại cung (PHẦN 3).
      khiTSLuuNien[p] = khiTruongSinh(can, chi);
    }

    // 2.2.2 — cung chức Lưu Niên: P = cung mang chi năm xem NGUYÊN THUỶ.
    const lnMenh = Yxem;
    const lnChieu = A * heSoB(lnMenh);
    CUNG_CHUC_LUU.forEach((c, k) => {
      cungChucLN[pos(lnMenh + k * lnChieu)] = `L.${c}`;
    });

    // 2.2.3 — sao theo CHI năm xem, KHÔNG GIAN NGUYÊN THUỶ.
    push(Yxem, "Thái Tuế", "luu_nien");
    push(Yxem + 8, "Bạch Hổ", "luu_nien");
    push(Yxem + 2, "Tang Môn", "luu_nien");
    const tmChi = LUU_THIEN_MA[tamHopCua(ccXem.chi).hanh];
    push(CHI_POS[tmChi], "Thiên Mã", "luu_nien",
      tamHopCua(chiAt(CHI_POS[tmChi])).hanh);
    push(4 - Yxem, "Thiên Khốc", "luu_nien");
    push(Yxem + 6, "Thiên Hư", "luu_nien");

    // Vòng L.Tướng Tinh — KHÔNG GIAN LƯU CHI (chốt 30/07).
    const ttLuuKhoi = luuChiToPhysical(tamHopCua(ccXem.chi).deVuong);
    VONG_TUONG_TINH.forEach((s, k) => {
      const p = pos(ttLuuKhoi + k);
      push(p, s.name, "luu_nien", tamHopCua(luuChiCua[p]!).hanh);
    });

    // Theo CAN năm xem, KHÔNG GIAN LƯU CHI.
    anSaoTangVan({
      layer: "luu_nien",
      can: ccXem.can,
      chiPos: lnMenh,
      A, push,
      toPhysical: luuChiToPhysical,
      chiCuaCung: (p) => luuChiCua[p]!,
      boQuaKhocHu: true,     // L.Khốc-Hư đã an theo chi năm xem ở trên
      boQuaTuongTinh: true,  // vòng L.Tướng Tinh đã an ở trên
    });

    const napAmXem = napAm(ccXem.can, ccXem.chi);
    luuNien = {
      nam: namXem, can: ccXem.can, chi: ccXem.chi, napAm: napAmXem,
      tuoi, khiTruongSinh: khiTruongSinh(ccXem.can, ccXem.chi), luuDan,
    };

    // --- PHẦN 2.3: Lưu Nguyệt ---------------------------------------------
    const thangXem = input.thangXem ?? null;
    if (thangXem !== null) {
      const nguyetMenh = pos(luuDan + thangXem - 1);
      const canNguyet = canThang(nXem, thangXem);
      const chiNguyet = CHI[thangXem - 1];

      // Chiều thứ tự cung chức LNg dùng LƯU CHI của cung Nguyệt Mệnh.
      const lngChieu = A * (CHI_INFO[luuChiCua[nguyetMenh]!].duong ? 1 : -1);
      CUNG_CHUC_LUU.forEach((c, k) => {
        cungChucLNg[pos(nguyetMenh + k * lngChieu)] = `N.${c}`;
      });

      anSaoTangVan({
        layer: "luu_nguyet",
        can: canNguyet,
        chiPos: nguyetMenh,
        A, push,
        toPhysical: luuChiToPhysical,
        chiCuaCung: (p) => luuChiCua[p]!,
      });

      luuNguyet = {
        thang: thangXem, can: canNguyet, chi: chiNguyet,
        napAm: napAm(canNguyet, chiNguyet), cung: nguyetMenh,
      };
    }
  }

  // --- B15: Tứ Hoá 4 tầng — gắn icon vào SAO đích ---------------------------
  const ganHoa = (can: Can, layer: Layer) => {
    (Object.keys(TU_HOA[can]) as HoaKey[]).forEach((hoa) => {
      const target = TU_HOA[can][hoa];
      for (let p = 1; p <= 12; p += 1) {
        const s = sao[p].find((x) => x.name === target && x.layer === "nguyen_cuc");
        if (s) { s.hoa.push({ hoa, layer }); break; }
      }
    });
  };
  ganHoa(batTu.nam.can, "nguyen_cuc");
  ganHoa(daiVanHienHanh.can, "dai_van");
  if (luuNien) ganHoa(luuNien.can, "luu_nien");
  if (luuNguyet) ganHoa(luuNguyet.can, "luu_nguyet");

  // --- Dựng 12 cung ---------------------------------------------------------
  const cungChucCua: string[] = Array(13).fill("");
  const cungChucTatCua: string[] = Array(13).fill("");
  CUNG_CHUC.forEach((c, k) => {
    const p = pos(menh + k);
    cungChucCua[p] = c;
    cungChucTatCua[p] = CUNG_CHUC_TAT[k];
  });

  const cung: CungData[] = [];
  for (let p = 1; p <= 12; p += 1) {
    const can = canCua(n, p);
    const chi = chiAt(p);
    const na = napAm(can, chi);
    const dv = daiVan.find((d) => d.cung === p)!;
    cung.push({
      index: p, chi, can, napAm: na,
      cungChuc: cungChucCua[p],
      cungChucTat: cungChucTatCua[p],
      cungChucDV: cungChucDV[p],
      cungChucLN: cungChucLN[p],
      cungChucLNg: cungChucLNg[p],
      isMenh: p === menh,
      isThan: p === than,
      tuan: tuanCung.has(p),
      triet: trietCung.has(p),
      sao: sao[p],
      vts: vts[p],
      daiVanRange: `${dv.tuoiDau}-${dv.tuoiCuoi}`,
      thangLuu: thangLuu[p] ? `T.${thangLuu[p]}` : null,
      canChiThangLuu: canChiThangLuuArr[p],
      luuChi: luuChiCua[p],
      khiTruongSinh: {
        nguyenCuc: khiTruongSinh(can, chi),
        luuNien: khiTSLuuNien[p],
      },
      tuHoaNoiCung: [],
    });
  }

  // --- B16: Tứ Hoá nội cung -------------------------------------------------
  cung.forEach((c) => {
    (Object.keys(TU_HOA[c.can]) as HoaKey[]).forEach((hoa) => {
      const target = TU_HOA[c.can][hoa];
      const dich = cung.find((x) =>
        x.sao.some((s) => s.name === target && s.layer === "nguyen_cuc"));
      if (!dich) return;
      c.tuHoaNoiCung.push({
        sao: target, hoa,
        cungChucDich: dich.cungChuc,
        cungDich: dich.index,
        tuHoa: dich.index === c.index,
      });
    });
  });

  return {
    input: {
      hoTen: input.hoTen,
      gioiTinh: input.gioiTinh,
      noiSinh: input.noiSinh,
      timeZone: input.timeZone,
      duong: batTu.duong,
      namXem, thangXem: input.thangXem ?? null,
      daiVanTuoiDau: daiVanHienHanh.tuoiDau,
    },
    batTu: {
      am: { day: batTu.am.day, month: batTu.am.month, year: batTu.am.year, leap: batTu.am.leap },
      nam: { ...batTu.nam, napAm: napAm(batTu.nam.can, batTu.nam.chi) },
      thang: { ...batTu.thang, napAm: napAm(batTu.thang.can, batTu.thang.chi) },
      ngay: { ...batTu.ngay, napAm: napAm(batTu.ngay.can, batTu.ngay.chi) },
      gio: { ...batTu.gio, napAm: napAm(batTu.gio.can, batTu.gio.chi) },
      H, M, D,
    },
    amDuongGioiTinh,
    thuanLy: A,
    menh, than,
    cuc: { hanh: menhNapAm.hanh, so: C, ten: TEN_CUC[menhNapAm.hanh] },
    menhNapAm,
    daiVan,
    daiVanHienHanh,
    luuNien,
    luuNguyet,
    cung,
  };
}

// ---------------------------------------------------------------------------
// Sao tầng vận dùng chung cho ĐV / LN / LNg (TechDoc 2.1.3, 2.2.3, 2.3.2)
// ---------------------------------------------------------------------------

function anSaoTangVan(o: {
  layer: Layer;
  /** Can dùng để tra bảng (can cung ĐV Mệnh / can năm xem / can tháng xem). */
  can: Can;
  /** Vị trí VẬT LÝ của cung Mệnh tầng đó — dùng cho Khốc-Hư & Tướng Tinh. */
  chiPos: number;
  A: 1 | -1;
  push: (p: number, name: string, layer: Layer, el?: Element) => void;
  /** Chi (tên) trong không gian của tầng → vị trí vật lý. */
  toPhysical: (c: Chi) => number;
  /** Chi trong không gian của tầng tại một vị trí vật lý. */
  chiCuaCung: (p: number) => Chi;
  boQuaKhocHu?: boolean;
  boQuaTuongTinh?: boolean;
}) {
  const { layer, can, A, push, toPhysical, chiCuaCung } = o;

  // Vòng Lộc Tồn + Kình-Đà: chiều = A × B(chi của Lộc Tồn TRONG KHÔNG GIAN
  // CỦA TẦNG) — quy tắc vận, khác nguyên cục (chỉ theo A).
  const ltChi = chiAt(LOC_TON[can]);          // tên chi theo bảng 1.6
  const ltPos = toPhysical(ltChi);            // vị trí vật lý
  const chieu = A * (CHI_INFO[ltChi].duong ? 1 : -1);
  VONG_LOC_TON.forEach((s, k) => push(ltPos + k * chieu, s.name, layer));
  push(ltPos + chieu, "Kình Dương", layer);
  push(ltPos - chieu, "Đà La", layer);

  // Khôi - Việt theo bảng 1.13.
  const kv = KHOI_VIET[can];
  push(toPhysical(kv.khoi), "Thiên Khôi", layer);
  push(toPhysical(kv.viet), "Thiên Việt", layer);

  // Khốc - Hư theo công thức 1.22 với chi cung Mệnh của tầng.
  if (!o.boQuaKhocHu) {
    const chiMenh = chiCuaCung(pos(o.chiPos));
    const Yl = CHI_POS[chiMenh];
    push(toPhysical(chiAt(pos(4 - Yl))), "Thiên Khốc", layer);
    push(toPhysical(chiAt(pos(Yl + 6))), "Thiên Hư", layer);
  }

  // Vòng Tướng Tinh: khởi đế vượng tam hợp chi cung Mệnh của tầng, luôn thuận;
  // ngũ hành = tam hợp của chi TRONG KHÔNG GIAN CỦA TẦNG tại cung đóng.
  if (!o.boQuaTuongTinh) {
    const khoi = toPhysical(tamHopCua(chiCuaCung(pos(o.chiPos))).deVuong);
    VONG_TUONG_TINH.forEach((s, k) => {
      const p = pos(khoi + k);
      push(p, s.name, layer, tamHopCua(chiCuaCung(p)).hanh);
    });
  }
}

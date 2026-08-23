import type { Can, Chi, Element, NguHanh } from "./constants";
import type { Cap1, HoaKey } from "./sao";

export type Layer = "nguyen_cuc" | "dai_van" | "luu_nien" | "luu_nguyet";

/** Tiền tố hiển thị theo tầng (TechDoc 0.8). */
export const PREFIX: Record<Layer, string> = {
  nguyen_cuc: "",
  dai_van: "Đv.",
  luu_nien: "L.",
  luu_nguyet: "N.",
};

export type HoaIcon = { hoa: HoaKey; layer: Layer };

/** Một sao đã an tại một cung. */
export type SaoAn = {
  name: string;
  /** Tên hiển thị đã gắn tiền tố tầng. */
  display: string;
  element: Element;
  layer: Layer;
  cap1: Cap1;
  cung: number;
  /** Icon Tứ Hoá gắn vào sao này (tối đa 4 — mỗi tầng 1). */
  hoa: HoaIcon[];
};

export type TuHoaNoiCung = {
  sao: string;
  hoa: HoaKey;
  /** Cung chức nơi sao bị hoá đang đóng. */
  cungChucDich: string;
  cungDich: number;
  tuHoa: boolean;
};

export type CungData = {
  /** Vị trí hệ Dần = 1. */
  index: number;
  chi: Chi;
  can: Can;
  napAm: { ten: string; hanh: NguHanh };
  cungChuc: string;
  cungChucTat: string;
  /** Địa vị dòng 1 — cung chức tầng Đại Vận (`Đv.` + viết tắt). */
  cungChucDV: string | null;
  /** Địa vị dòng 2 — cung chức tầng Lưu Niên (`L.` + viết tắt). */
  cungChucLN: string | null;
  /** Cung chức Lưu Nguyệt — engine VẪN TÍNH nhưng KHÔNG hiển thị (TechDoc 4.2). */
  cungChucLNg: string | null;
  isMenh: boolean;
  isThan: boolean;
  tuan: boolean;
  triet: boolean;
  sao: SaoAn[];
  /** Sao vòng Trường Sinh cung Mệnh đóng tại cung này (Zone 5 trái). */
  vts: string;
  /** Khoảng tuổi Đại Vận của cung (Zone 5 giữa), VD "5-14". */
  daiVanRange: string;
  /** Tháng lưu của năm xem đóng tại cung (Zone 5 phải trên), VD "T.11". */
  thangLuu: string | null;
  /** Can chi tháng lưu, format `<Can 1 ký tự>.<Chi>` — VD "M.Tí". */
  canChiThangLuu: { label: string; hanh: NguHanh } | null;
  /** Lưu chi của cung ở tầng Lưu Niên/Lưu Nguyệt. */
  luuChi: Chi | null;
  /** Khí Trường Sinh từng tầng (TechDoc PHẦN 3) — metadata luận giải. */
  khiTruongSinh: {
    nguyenCuc: string;
    luuNien: string | null;
  };
  tuHoaNoiCung: TuHoaNoiCung[];
};

export type DaiVanItem = {
  /** Thứ tự vận (1-12). */
  thuTu: number;
  cung: number;
  tuoiDau: number;
  tuoiCuoi: number;
  can: Can;
  chi: Chi;
  napAm: { ten: string; hanh: NguHanh };
};

export type LaSo = {
  input: {
    hoTen: string;
    gioiTinh: "nam" | "nu";
    noiSinh: string;
    timeZone: string;
    duong: { year: number; month: number; day: number; hour: number; minute: number };
    namXem: number | null;
    thangXem: number | null;
    daiVanTuoiDau: number | null;
  };
  batTu: {
    am: { day: number; month: number; year: number; leap: boolean };
    nam: { can: Can; chi: Chi; napAm: { ten: string; hanh: NguHanh } };
    thang: { can: Can; chi: Chi; napAm: { ten: string; hanh: NguHanh } };
    ngay: { can: Can; chi: Chi; napAm: { ten: string; hanh: NguHanh } };
    gio: { can: Can; chi: Chi; napAm: { ten: string; hanh: NguHanh } };
    H: number; M: number; D: number;
  };
  /** "Dương Nam" / "Âm Nữ" … — hậu tố User Header. */
  amDuongGioiTinh: string;
  /** A = +1 thuận lý (Dương Nam / Âm Nữ), −1 nghịch lý. */
  thuanLy: 1 | -1;
  menh: number;
  than: number;
  cuc: { hanh: NguHanh; so: number; ten: string };
  menhNapAm: { ten: string; hanh: NguHanh };
  daiVan: DaiVanItem[];
  daiVanHienHanh: DaiVanItem | null;
  luuNien: {
    nam: number;
    can: Can; chi: Chi;
    napAm: { ten: string; hanh: NguHanh };
    tuoi: number;
    khiTruongSinh: string;
    luuDan: number;
  } | null;
  luuNguyet: {
    thang: number;
    can: Can; chi: Chi;
    napAm: { ten: string; hanh: NguHanh };
    cung: number;
  } | null;
  cung: CungData[];
};

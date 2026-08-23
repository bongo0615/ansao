"use client";

/**
 * Input Panel (ô 2×2 giữa la võng) — Design Spec §8.
 *
 * Bên trái mỗi dòng là ô nhập; bên phải là giá trị engine tính (can chi +
 * nạp âm, tô theo ngũ hành nạp âm — Design Spec §5.4).
 */

import type { AnSaoInput } from "@/lib/tuvi/engine";
import { TAT_CA_NOI_SINH, nhanGmt, nhanNoiSinh, timNoiSinh } from "@/lib/tuvi/noi-sinh";
import type { LaSo } from "@/lib/tuvi/types";

const HANH_CLASS: Record<string, string> = {
  kim: "c-kim", hoa: "c-hoa", moc: "c-moc", thuy: "c-thuy", tho: "c-tho",
};

const NapAm = ({ na }: { na: { ten: string; hanh: string } }) => (
  <span className={HANH_CLASS[na.hanh]}>{na.ten}</span>
);

export function InputPanel({
  laSo, value, onChange, readOnly,
}: {
  laSo: LaSo;
  value: AnSaoInput;
  onChange?: (next: AnSaoInput) => void;
  readOnly: boolean;
}) {
  const set = <K extends keyof AnSaoInput>(k: K, v: AnSaoInput[K]) =>
    onChange?.({ ...value, [k]: v });

  const bt = laSo.batTu;
  const dv = laSo.daiVanHienHanh;
  const gmt = nhanGmt(
    value.timeZone, value.namSinh, value.thangSinh, value.ngaySinh, value.gioSinh,
  );

  return (
    <div className="input-panel">
      <div className="user-header">
        <input
          type="text"
          className="field field-name"
          placeholder="Họ và tên"
          value={value.hoTen}
          readOnly={readOnly}
          onChange={(e) => set("hoTen", e.target.value)}
        />
        <span className="user-header-suffix">
          - {laSo.amDuongGioiTinh.toUpperCase()}
        </span>
      </div>

      <div className="birth-data-box">
        <div className="input-section">
          <div className="input-label">GIỚI TÍNH</div>
          <div className="input-value-row">
            <select
              className="field"
              value={value.gioiTinh}
              disabled={readOnly}
              onChange={(e) => set("gioiTinh", e.target.value as "nam" | "nu")}
            >
              <option value="nu">Nữ</option>
              <option value="nam">Nam</option>
            </select>
            <span className="input-computed">{laSo.amDuongGioiTinh}</span>
          </div>
        </div>

        <div className="input-section">
          <div className="input-label">NĂM</div>
          <div className="input-value-row">
            <input
              type="number" className="field field-year" value={value.namSinh}
              readOnly={readOnly} min={1900} max={2100}
              onChange={(e) => set("namSinh", Number(e.target.value))}
            />
            <span className="input-computed">
              {bt.nam.can} {bt.nam.chi} ({bt.am.year}) - <NapAm na={bt.nam.napAm} />
            </span>
          </div>
        </div>

        <div className="input-section">
          <div className="input-label">THÁNG</div>
          <div className="input-value-row">
            <input
              type="number" className="field field-2digit" value={value.thangSinh}
              readOnly={readOnly} min={1} max={12}
              onChange={(e) => set("thangSinh", Number(e.target.value))}
            />
            <span className="input-computed">
              {bt.thang.can} {bt.thang.chi} ({bt.am.month}
              {bt.am.leap ? " nhuận" : ""}) - <NapAm na={bt.thang.napAm} />
            </span>
          </div>
        </div>

        <div className="input-section">
          <div className="input-label">NGÀY</div>
          <div className="input-value-row">
            <input
              type="number" className="field field-2digit" value={value.ngaySinh}
              readOnly={readOnly} min={1} max={31}
              onChange={(e) => set("ngaySinh", Number(e.target.value))}
            />
            <span className="input-computed">
              {bt.ngay.can} {bt.ngay.chi} ({bt.am.day}) - <NapAm na={bt.ngay.napAm} />
            </span>
          </div>
        </div>

        <div className="input-section" style={{ marginBottom: 0 }}>
          <div className="input-label" style={{ display: "flex", gap: 24 }}>
            <span style={{ width: 56 }}>GIỜ</span>
            <span>PHÚT</span>
          </div>
          <div className="input-value-row">
            <span style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
              <input
                type="number" className="field field-2digit" value={value.gioSinh}
                readOnly={readOnly} min={0} max={23}
                onChange={(e) => set("gioSinh", Number(e.target.value))}
              />
              <input
                type="number" className="field field-2digit" value={value.phutSinh}
                readOnly={readOnly} min={0} max={59}
                onChange={(e) => set("phutSinh", Number(e.target.value))}
              />
            </span>
            <span className="input-computed">
              {bt.gio.can} {bt.gio.chi} - <NapAm na={bt.gio.napAm} />
            </span>
          </div>
        </div>
      </div>

      <div className="input-section">
        <div className="input-label">Nơi Sinh</div>
        <div className="input-value-row">
          <select
            className="field field-place"
            value={value.noiSinh}
            disabled={readOnly}
            onChange={(e) => {
              const n = timNoiSinh(e.target.value);
              if (!n) return;
              onChange?.({ ...value, noiSinh: e.target.value, timeZone: n.timeZone });
            }}
          >
            {TAT_CA_NOI_SINH.map((n) => (
              <option key={nhanNoiSinh(n)} value={nhanNoiSinh(n)}>{nhanNoiSinh(n)}</option>
            ))}
          </select>
          <span className="input-computed">{gmt}</span>
        </div>
      </div>

      <div className="menh-cuc-box">
        <div className="menh-cuc-row">
          <span className="menh-cuc-label">MỆNH:</span>
          <span className={`menh-cuc-value ${HANH_CLASS[laSo.menhNapAm.hanh]}`}>
            {laSo.menhNapAm.ten}
          </span>
        </div>
        <div className="menh-cuc-row">
          <span className="menh-cuc-label">CỤC:</span>
          <span className={`menh-cuc-value ${HANH_CLASS[laSo.cuc.hanh]}`}>
            {laSo.cuc.ten}
          </span>
        </div>
      </div>

      <div className="dai-van-section">
        <div className="dai-van-label">Đại Vận</div>
        <div className="dai-van-row">
          <span className="dai-van-can-chi">{dv ? `${dv.can} ${dv.chi}` : "—"}</span>
          <select
            className="field"
            value={dv?.tuoiDau ?? ""}
            disabled={readOnly}
            onChange={(e) => set("daiVanTuoiDau", Number(e.target.value))}
          >
            {laSo.daiVan.map((d) => (
              <option key={d.tuoiDau} value={d.tuoiDau}>
                {d.tuoiDau} - {d.tuoiCuoi}
              </option>
            ))}
          </select>
          <span className={`dai-van-nap-am ${dv ? HANH_CLASS[dv.napAm.hanh] : ""}`}>
            {dv?.napAm.ten ?? "—"}
          </span>
        </div>

        <div className="luu-nien-row">
          <span className="luu-nien-label">Năm xem:</span>
          <input
            type="number" className="field field-year"
            value={value.namXem ?? ""} placeholder="—" readOnly={readOnly}
            onChange={(e) => {
              const v = e.target.value === "" ? null : Number(e.target.value);
              // Tháng xem đòi hỏi năm xem (TechDoc 4.0) — xoá năm thì xoá luôn tháng.
              onChange?.({ ...value, namXem: v, thangXem: v === null ? null : value.thangXem });
            }}
          />
          <span className={`luu-nien-computed ${laSo.luuNien ? HANH_CLASS[laSo.luuNien.napAm.hanh] : ""}`}>
            {laSo.luuNien
              ? `${laSo.luuNien.can} ${laSo.luuNien.chi} (${laSo.luuNien.nam})`
              : "—"}
          </span>
        </div>

        <div className="luu-nien-row">
          <span className="luu-nien-label">Tuổi:</span>
          <span className="luu-nien-value val-static">{laSo.luuNien?.tuoi ?? "—"}</span>
          <span />
        </div>

        <div className="luu-nien-row">
          <span className="luu-nien-label">Tháng xem:</span>
          <input
            type="number" className="field field-2digit" min={1} max={12}
            value={value.thangXem ?? ""} placeholder="—"
            readOnly={readOnly} disabled={value.namXem == null}
            onChange={(e) =>
              set("thangXem", e.target.value === "" ? null : Number(e.target.value))}
          />
          <span className={`luu-nien-computed ${laSo.luuNguyet ? HANH_CLASS[laSo.luuNguyet.napAm.hanh] : ""}`}>
            {laSo.luuNguyet
              ? `${laSo.luuNguyet.can} ${laSo.luuNguyet.chi} - ${laSo.luuNguyet.napAm.ten}`
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Ô Cung — 6 zone theo `VM_AnSao_UI_Design_Spec_v3.md` §7.
 *
 * Quy tắc hiển thị đã chốt (TechDoc 4.2):
 *   Zone 3 cột TRÁI = 17 Cát Tinh theo thứ tự ưu tiên; cột PHẢI = vòng Lộc Tồn
 *   → vòng Thái Tuế → vòng Tướng Tinh → 12 Sát Tinh.
 *   Zone 4 = sao Đv./L. (cát trái, sát phải), neo đáy vùng sao.
 *   Zone 6 = 3 hàng Đv. → L. → N., mỗi hàng 1 sao vòng Lộc Tồn + 1 vòng Tướng Tinh.
 */

import { ZONE3_PHAI_SAT, ZONE3_TRAI } from "@/lib/tuvi/sao";
import type { CungData, HoaIcon, Layer, SaoAn } from "@/lib/tuvi/types";

const HANH_CLASS: Record<string, string> = {
  kim: "c-kim", hoa: "c-hoa", moc: "c-moc", thuy: "c-thuy", tho: "c-tho", none: "",
};

const HOA_CHU = { loc: "L", quyen: "Q", khoa: "K", ki: "K" } as const;
const HOA_CLASS = { loc: "th-loc", quyen: "th-quyen", khoa: "th-khoa", ki: "th-ky" } as const;
const HOA_SHAPE: Record<Layer, string> = {
  nguyen_cuc: "tu-hoa-nguyen-cuc",
  dai_van: "tu-hoa-dai-van",
  luu_nien: "tu-hoa-luu-nien",
  luu_nguyet: "tu-hoa-luu-nguyet",
};
const LAYER_ORDER: Layer[] = ["nguyen_cuc", "dai_van", "luu_nien", "luu_nguyet"];

function TuHoaIcons({ hoa }: { hoa: HoaIcon[] }) {
  const sorted = [...hoa].sort(
    (a, b) => LAYER_ORDER.indexOf(a.layer) - LAYER_ORDER.indexOf(b.layer),
  );
  return (
    <>
      {sorted.map((h) => (
        <span
          key={`${h.layer}-${h.hoa}`}
          className={`tu-hoa-icon ${HOA_CLASS[h.hoa]} ${HOA_SHAPE[h.layer]}`}
          title={`${h.hoa} — ${h.layer}`}
        >
          <span>{HOA_CHU[h.hoa]}</span>
        </span>
      ))}
    </>
  );
}

/** Sắp sao nguyên cục vào 2 cột Zone 3 theo đúng thứ tự ưu tiên đã chốt. */
function zone3(sao: SaoAn[]) {
  const nc = sao.filter((s) => s.layer === "nguyen_cuc");
  const byName = (n: string) => nc.filter((s) => s.name === n);

  const trai = ZONE3_TRAI.flatMap(byName);
  const phai = [
    ...nc.filter((s) => s.cap1 === "Vòng Lộc Tồn"),
    ...nc.filter((s) => s.cap1 === "Vòng Thái Tuế"),
    ...nc.filter((s) => s.cap1 === "Vòng Tướng Tinh"),
    ...ZONE3_PHAI_SAT.flatMap(byName),
  ];
  return { trai, phai };
}

/** Sao tầng vận Zone 4: Cát Tinh cột trái, Sát Tinh cột phải. */
function zone4(sao: SaoAn[]) {
  const van = sao.filter((s) => s.layer === "dai_van" || s.layer === "luu_nien");
  const ordered = (cap1: string) => [
    ...van.filter((s) => s.layer === "dai_van" && s.cap1 === cap1),
    ...van.filter((s) => s.layer === "luu_nien" && s.cap1 === cap1),
  ];
  return { trai: ordered("Cát Tinh"), phai: ordered("Sát Tinh") };
}

/** Zone 6: đúng 1 sao vòng Lộc Tồn + 1 sao vòng Tướng Tinh cho mỗi tầng vận. */
function zone6(sao: SaoAn[], layer: Layer) {
  return {
    locTon: sao.find((s) => s.layer === layer && s.cap1 === "Vòng Lộc Tồn") ?? null,
    tuongTinh: sao.find((s) => s.layer === layer && s.cap1 === "Vòng Tướng Tinh") ?? null,
  };
}

const SaoText = ({ s }: { s: SaoAn }) => (
  <>
    <span className={HANH_CLASS[s.element]}>{s.display}</span>
    {s.hoa.length > 0 && <TuHoaIcons hoa={s.hoa} />}
  </>
);

export function OCung({ c, col, row }: { c: CungData; col: number; row: number }) {
  const { trai, phai } = zone3(c.sao);
  const z4 = zone4(c.sao);
  const chinhTinh = c.sao.filter(
    (s) => s.layer === "nguyen_cuc" && s.cap1 === "Chính Tinh",
  );
  const anTuanTriet = [c.tuan && "Tuần", c.triet && "Triệt"].filter(Boolean).join(" ");

  return (
    <div className="cung" style={{ gridColumn: col, gridRow: row }}>
      {/* Zone 1 — Header */}
      <div className="zone-header">
        <span className="cung-chuc">
          {c.cungChuc}{" "}
          {c.isMenh && <span className="menh-marker">★</span>}
          {c.isThan && <span className="than-marker">☆</span>}
        </span>
        <span className="tuan-triet-zone1">{anTuanTriet}</span>
        <span className={`can-chi-cung ${HANH_CLASS[c.napAm.hanh]}`}>
          {c.can} {c.chi}
        </span>
      </div>

      {/* Zone 2 — Chính Tinh + khu Địa Vị (giữ 66px kể cả Vô Chính Diệu) */}
      <div className="zone-chinh-tinh">
        <div className="dia-vi-col">
          <span className="dia-vi">{c.cungChucDV ?? " "}</span>
          <span className="dia-vi">{c.cungChucLN ?? " "}</span>
        </div>
        <div className="chinh-tinh-col">
          {chinhTinh.map((s) => (
            <div className="chinh-tinh-row" key={s.name}>
              <span className={`chinh-tinh-name ${HANH_CLASS[s.element]}`}>
                {s.hoa.length > 0 && <TuHoaIcons hoa={s.hoa} />}
                {s.display}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone 3 — Sao nguyên cục */}
      <div className="zone-sao">
        <div className="zone-sao-left">
          {trai.map((s) => (
            <div className="sao-name" key={s.name}><SaoText s={s} /></div>
          ))}
        </div>
        <div className="zone-sao-right">
          {phai.map((s) => (
            <div
              className={`sao-name${s.cap1 === "Sát Tinh" ? " sat-tinh" : ""}`}
              key={s.name}
            >
              <SaoText s={s} />
            </div>
          ))}
        </div>
      </div>

      {/* Zone 4 — Sao Đv./L., neo đáy vùng sao */}
      <div className="zone-dai-van">
        <div className="zone-dai-van-left">
          {z4.trai.map((s) => (
            <div key={`${s.layer}-${s.name}`}>
              <span className={HANH_CLASS[s.element]}>{s.display}</span>
            </div>
          ))}
        </div>
        <div className="zone-dai-van-right">
          {z4.phai.map((s) => (
            <div key={`${s.layer}-${s.name}`}>
              <span className={HANH_CLASS[s.element]}>{s.display}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone 5 — VTS | tuổi Đại Vận | tháng lưu */}
      <div className="zone-vts">
        <span className="zone-vts-lquan">{c.vts}</span>
        <div className="zone-vts-thang-highlight"><span>{c.daiVanRange}</span></div>
        <span className="zone-vts-thang">{c.thangLuu ?? " "}</span>
        <span
          className={`zone-vts-canchi ${c.canChiThangLuu ? HANH_CLASS[c.canChiThangLuu.hanh] : ""}`}
        >
          {c.canChiThangLuu?.label ?? " "}
        </span>
      </div>

      {/* Zone 6 — 3 hàng vòng lưu: Đv. → L. → N. */}
      <div className="zone-luu">
        {(["dai_van", "luu_nien", "luu_nguyet"] as Layer[]).map((layer) => {
          const { locTon, tuongTinh } = zone6(c.sao, layer);
          return (
            <div className="zone-luu-row" key={layer}>
              <span className="zone-luu-left">
                {locTon
                  ? <span className={HANH_CLASS[locTon.element]}>{locTon.display}</span>
                  : " "}
              </span>
              <span className="zone-luu-right">
                {tuongTinh
                  ? <span className={HANH_CLASS[tuongTinh.element]}>{tuongTinh.display}</span>
                  : " "}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

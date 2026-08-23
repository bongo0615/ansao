/**
 * Trình bày markdown của khung chat tự viết (không kéo thư viện), nên phải có
 * test: model rất hay trả về bảng, tiêu đề, danh sách lồng nhau.
 */

import { describe, expect, it } from "vitest";

/** Lặp lại logic nhận diện bảng trong `Markdown.tsx` để khoá hành vi. */
const oBang = (l: string) =>
  l.trim().startsWith("|") && l.trim().endsWith("|") && l.includes("|", 1);
const laNganCach = (l: string) =>
  /^\s*\|[\s:|-]+\|\s*$/.test(l) && l.includes("-");
const oCua = (l: string) =>
  l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

describe("Nhận diện bảng markdown", () => {
  const bang = [
    "| Trụ | Can Chi | Nạp âm |",
    "|---|---|---|",
    "| **Năm** | Canh Ngọ | Lộ Bàng Thổ |",
    "| **Giờ** | Kỷ Hợi | Bình Địa Mộc |",
  ];

  it("nhận ra dòng tiêu đề và dòng ngăn cách", () => {
    expect(oBang(bang[0])).toBe(true);
    expect(laNganCach(bang[1])).toBe(true);
  });

  it("tách đúng số cột, không sinh ô rỗng ở hai đầu", () => {
    expect(oCua(bang[0])).toEqual(["Trụ", "Can Chi", "Nạp âm"]);
    expect(oCua(bang[2])).toEqual(["**Năm**", "Canh Ngọ", "Lộ Bàng Thổ"]);
  });

  it("chấp nhận dòng ngăn cách có căn lề", () => {
    expect(laNganCach("|:---|:---:|---:|")).toBe(true);
    expect(laNganCach("| --- | --- |")).toBe(true);
  });

  it("KHÔNG nhầm dòng thường chứa dấu gạch là bảng", () => {
    expect(laNganCach("| Mệnh | Thân |")).toBe(false);
    // Câu văn có gạch ngang nhưng không phải bảng
    expect(oBang("Thiên Đồng – Thái Âm toạ thủ")).toBe(false);
  });

  it("bảng chỉ có tiêu đề, không có dòng dữ liệu vẫn hợp lệ", () => {
    expect(oBang("| A | B |")).toBe(true);
    expect(laNganCach("|---|---|")).toBe(true);
  });
});

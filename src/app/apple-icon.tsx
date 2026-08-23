import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Apple touch icon — iOS đòi PNG, nên dựng từ chính `icon.svg` qua ImageResponse.
 * Không viền bo góc: iOS tự bo, vẽ sẵn sẽ bị bo hai lần.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const svg = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8");
  const uri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#080810" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={uri} width={180} height={180} alt="" />
      </div>
    ),
    size,
  );
}

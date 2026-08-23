"use client";

/**
 * Trình bày markdown tối giản cho câu trả lời của chuyên gia.
 *
 * Tự viết thay vì kéo thư viện: câu trả lời chỉ dùng tiêu đề, danh sách, in đậm
 * và trích dẫn. Toàn bộ nội dung được escape trước khi dựng thẻ, không dùng
 * dangerouslySetInnerHTML ở đâu cả.
 */

import { Fragment, type ReactNode } from "react";

/** In đậm / nghiêng / mã trong một dòng. */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) {
      out.push(<strong key={`${key}-${i}`} className="font-semibold text-ink">{t.slice(2, -2)}</strong>);
    } else if (t.startsWith("`")) {
      out.push(<code key={`${key}-${i}`} className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[0.9em]">{t.slice(1, -1)}</code>);
    } else {
      out.push(<em key={`${key}-${i}`} className="italic text-ink-dim">{t.slice(1, -1)}</em>);
    }
    last = m.index + t.length; i += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ children }: { children: string }) {
  const dong = children.split("\n");
  const khoi: ReactNode[] = [];
  let danhSach: { thuTu: boolean; muc: string[] } | null = null;

  const xaDanhSach = (k: number) => {
    if (!danhSach) return;
    const Tag = danhSach.thuTu ? "ol" : "ul";
    khoi.push(
      <Tag key={`l${k}`} className={`my-3 space-y-1.5 pl-5 ${danhSach.thuTu ? "list-decimal" : "list-disc"} marker:text-ink-faint`}>
        {danhSach.muc.map((m, i) => <li key={i} className="leading-relaxed">{inline(m, `l${k}-${i}`)}</li>)}
      </Tag>,
    );
    danhSach = null;
  };

  dong.forEach((raw, k) => {
    const l = raw.trimEnd();
    const mHead = /^(#{1,4})\s+(.*)$/.exec(l);
    const mList = /^\s*[-*•]\s+(.*)$/.exec(l);
    const mNum = /^\s*\d+[.)]\s+(.*)$/.exec(l);
    const mQuote = /^>\s?(.*)$/.exec(l);

    if (mHead) {
      xaDanhSach(k);
      const cap = mHead[1].length;
      khoi.push(
        <p key={k} className={
          cap <= 2
            ? "mt-5 font-display text-lg font-semibold text-ink first:mt-0"
            : "mt-4 font-display text-base font-semibold text-cyan first:mt-0"
        }>{inline(mHead[2], `h${k}`)}</p>,
      );
    } else if (mList) {
      if (!danhSach || danhSach.thuTu) { xaDanhSach(k); danhSach = { thuTu: false, muc: [] }; }
      danhSach.muc.push(mList[1]);
    } else if (mNum) {
      if (!danhSach || !danhSach.thuTu) { xaDanhSach(k); danhSach = { thuTu: true, muc: [] }; }
      danhSach.muc.push(mNum[1]);
    } else if (mQuote) {
      xaDanhSach(k);
      khoi.push(
        <blockquote key={k} className="my-3 border-l-2 border-gold/50 py-0.5 pl-4 text-ink-dim">
          {inline(mQuote[1], `q${k}`)}
        </blockquote>,
      );
    } else if (l.trim() === "") {
      xaDanhSach(k);
    } else {
      xaDanhSach(k);
      khoi.push(<p key={k} className="my-2.5 leading-[1.75] first:mt-0">{inline(l, `p${k}`)}</p>);
    }
  });
  xaDanhSach(dong.length);

  return <Fragment>{khoi}</Fragment>;
}

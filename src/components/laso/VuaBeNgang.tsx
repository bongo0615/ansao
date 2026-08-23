"use client";

/**
 * Bọc một dòng chữ KHÔNG xuống dòng và tự thu nhỏ khi rộng hơn chỗ chứa.
 *
 * Ô cung là khung cứng 270px, `.cung` lại `overflow: hidden`, nên chữ dài hơn
 * chỗ chứa sẽ bị cắt cụt mà không báo gì — đúng kiểu lỗi "sai rất êm" mà dự án
 * này cố tránh. Thà chữ nhỏ đi vài phần trăm còn hơn mất chữ.
 *
 * Dùng `transform: scale` (không phải `font-size`) để chiều cao dòng giữ nguyên
 * 29px, khỏi phá ngân sách 66px của Zone 2.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

export function VuaBeNgang({
  children, className, style, san = 0.62, canPhai = true,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Không thu nhỏ quá mức này — dưới nữa thì chữ không còn đọc được. */
  san?: number;
  /** Neo về bên phải (mặc định, theo Design Spec §7.4) hay bên trái. */
  canPhai?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [ti, setTi] = useState(1);

  useEffect(() => {
    const el = ref.current;
    const cha = el?.parentElement;
    if (!el || !cha) return;

    const do_ = () => {
      // Đo ở tỉ lệ 1:1, không thì lần đo sau bị chính scale trước làm lệch.
      el.style.transform = "none";
      const co = cha.clientWidth;
      const can = el.scrollWidth;
      setTi(can > co && co > 0 ? Math.max(san, co / can) : 1);
    };

    do_();
    const ro = new ResizeObserver(do_);
    ro.observe(cha);
    return () => ro.disconnect();
  });

  return (
    <span
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: ti < 1 ? `scale(${ti})` : undefined,
        transformOrigin: canPhai ? "right center" : "left center",
      }}
    >
      {children}
    </span>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field } from "@/components/ui";

export function HoSoForm({ email, hoTenBanDau }: { email: string; hoTenBanDau: string }) {
  const router = useRouter();
  const [hoTen, setHoTen] = useState(hoTenBanDau);
  const [trangThai, setTrangThai] = useState<"nghi" | "dang_luu" | "da_luu" | "loi">("nghi");
  const [loi, setLoi] = useState<string | null>(null);
  const doi = hoTen.trim() !== hoTenBanDau.trim();

  async function luu(e: React.FormEvent) {
    e.preventDefault();
    setTrangThai("dang_luu"); setLoi(null);
    try {
      const res = await fetch("/api/ho-so", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hoTen: hoTen.trim() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Lưu không thành công");
      setTrangThai("da_luu");
      router.refresh();
    } catch (err) {
      setTrangThai("loi"); setLoi((err as Error).message);
    }
  }

  return (
    <form onSubmit={luu} className="glass mt-8 space-y-5 rounded-2xl p-6">
      <div>
        <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">Email</span>
        <p className="rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-sm text-ink-faint">
          {email}
        </p>
        <span className="mt-1 block text-xs text-ink-faint">
          Email dùng để đăng nhập, không đổi được tại đây.
        </span>
      </div>

      <Field
        label="Tên hiển thị"
        value={hoTen}
        onChange={(e) => { setHoTen(e.target.value); setTrangThai("nghi"); }}
        placeholder="Tên bạn muốn hiển thị"
        maxLength={100}
        hint="Chỉ dùng để chào bạn trong ứng dụng."
      />

      {loi && (
        <p className="rounded-xl border border-hanh-hoa/40 bg-hanh-hoa/10 px-4 py-3 text-sm text-hanh-hoa">
          {loi}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!doi || trangThai === "dang_luu"}>
          {{ nghi: "Lưu thay đổi", dang_luu: "Đang lưu…", da_luu: "Lưu thay đổi", loi: "Thử lại" }[trangThai]}
        </Button>
        {trangThai === "da_luu" && !doi && (
          <span className="text-[13px] text-hanh-moc">Đã lưu</span>
        )}
      </div>
    </form>
  );
}

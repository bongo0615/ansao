"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field } from "@/components/ui";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { choDangKy } from "@/lib/che-do";

type Che = "dang_nhap" | "dang_ky" | "magic";

const NHAN: Record<Che, { nut: string; doi: string }> = {
  dang_nhap: { nut: "Đăng nhập", doi: "Đăng nhập bằng mật khẩu" },
  dang_ky: { nut: "Tạo tài khoản", doi: "Chưa có tài khoản? Đăng ký" },
  magic: { nut: "Gửi liên kết đăng nhập", doi: "Gửi liên kết qua email" },
};

export function LoginForm() {
  const router = useRouter();
  const moDangKy = choDangKy();
  const [che, setChe] = useState<Che>("dang_nhap");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [dangChay, setDangChay] = useState(false);
  const [tb, setTb] = useState<{ loai: "loi" | "ok"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setDangChay(true); setTb(null);
    try {
      if (!moDangKy && che !== "dang_nhap") {
        throw new Error("Hiện chưa mở đăng ký tài khoản mới.");
      }
      if (che === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setTb({ loai: "ok", text: "Đã gửi liên kết đăng nhập tới email của bạn. Kiểm tra hộp thư nhé." });
      } else if (che === "dang_ky") {
        const { error } = await supabase.auth.signUp({
          email, password: matKhau,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setTb({ loai: "ok", text: "Đã tạo tài khoản. Mở email để xác nhận rồi quay lại đăng nhập." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: matKhau });
        if (error) throw error;
        router.push("/la-so"); router.refresh();
      }
    } catch (err) {
      setTb({ loai: "loi", text: dichLoi((err as Error).message) });
    } finally {
      setDangChay(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <Field label="Email" type="email" required autoComplete="email" placeholder="ban@email.com"
             value={email} onChange={(e) => setEmail(e.target.value)} />
      {che !== "magic" && (
        <Field
          label="Mật khẩu" type="password" required minLength={8}
          autoComplete={che === "dang_ky" ? "new-password" : "current-password"}
          value={matKhau} onChange={(e) => setMatKhau(e.target.value)}
          hint={che === "dang_ky" ? "Tối thiểu 8 ký tự." : undefined}
        />
      )}

      {tb && (
        <p className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
          tb.loai === "loi"
            ? "border-hanh-hoa/40 bg-hanh-hoa/10 text-hanh-hoa"
            : "border-hanh-moc/40 bg-hanh-moc/10 text-hanh-moc"}`}>
          {tb.text}
        </p>
      )}

      <Button type="submit" disabled={dangChay} className="w-full py-3">
        {dangChay ? "Đang xử lý…" : NHAN[che].nut}
      </Button>

      {/* Tắt đăng ký thì chỉ còn một lối vào — bỏ luôn thanh chuyển chế độ. */}
      {moDangKy && (
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-2 pt-1 text-[13px] text-ink-faint">
          {(Object.keys(NHAN) as Che[])
            .filter((k) => k !== che)
            .map((k) => (
              <button key={k} type="button" onClick={() => { setChe(k); setTb(null); }}
                      className="underline underline-offset-2 transition hover:text-ink-dim">
                {NHAN[k].doi}
              </button>
            ))}
        </div>
      )}
    </form>
  );
}

/** Supabase trả lỗi tiếng Anh; dịch các trường hợp hay gặp. */
function dichLoi(msg: string): string {
  const map: [RegExp, string][] = [
    [/invalid login credentials/i, "Email hoặc mật khẩu không đúng."],
    [/email not confirmed/i, "Email chưa được xác nhận. Kiểm tra hộp thư của bạn."],
    [/user already registered/i, "Email này đã có tài khoản. Hãy đăng nhập."],
    [/password should be at least/i, "Mật khẩu phải có ít nhất 8 ký tự."],
    [/rate limit|too many requests/i, "Bạn thao tác quá nhanh, thử lại sau ít phút."],
    [/for security purposes/i, "Vui lòng đợi một chút trước khi thử lại."],
  ];
  return map.find(([re]) => re.test(msg))?.[1] ?? msg;
}

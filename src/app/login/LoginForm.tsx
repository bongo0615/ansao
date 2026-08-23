"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field } from "@/components/ui";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Che = "dang_nhap" | "dang_ky" | "magic";

export function LoginForm() {
  const router = useRouter();
  const [che, setChe] = useState<Che>("dang_nhap");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [dangChay, setDangChay] = useState(false);
  const [thongBao, setThongBao] = useState<{ loai: "loi" | "ok"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setDangChay(true);
    setThongBao(null);

    try {
      if (che === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setThongBao({ loai: "ok", text: "Đã gửi liên kết đăng nhập tới email của bạn." });
      } else if (che === "dang_ky") {
        const { error } = await supabase.auth.signUp({
          email,
          password: matKhau,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setThongBao({
          loai: "ok",
          text: "Đã tạo tài khoản. Kiểm tra email để xác nhận rồi đăng nhập.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: matKhau });
        if (error) throw error;
        router.push("/la-so");
        router.refresh();
      }
    } catch (err) {
      setThongBao({ loai: "loi", text: dichLoi((err as Error).message) });
    } finally {
      setDangChay(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field
        label="Email" type="email" required autoComplete="email"
        value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="ban@email.com"
      />
      {che !== "magic" && (
        <Field
          label="Mật khẩu" type="password" required minLength={8}
          autoComplete={che === "dang_ky" ? "new-password" : "current-password"}
          value={matKhau} onChange={(e) => setMatKhau(e.target.value)}
          hint={che === "dang_ky" ? "Tối thiểu 8 ký tự." : undefined}
        />
      )}

      {thongBao && (
        <p
          className={
            thongBao.loai === "loi"
              ? "rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200"
              : "rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200"
          }
        >
          {thongBao.text}
        </p>
      )}

      <Button type="submit" disabled={dangChay} className="w-full">
        {dangChay ? "Đang xử lý…" : {
          dang_nhap: "Đăng nhập",
          dang_ky: "Tạo tài khoản",
          magic: "Gửi liên kết đăng nhập",
        }[che]}
      </Button>

      <div className="flex flex-wrap justify-between gap-3 text-sm text-ink-400">
        {che !== "dang_ky" && (
          <button type="button" className="underline" onClick={() => setChe("dang_ky")}>
            Chưa có tài khoản? Đăng ký
          </button>
        )}
        {che !== "dang_nhap" && (
          <button type="button" className="underline" onClick={() => setChe("dang_nhap")}>
            Đăng nhập bằng mật khẩu
          </button>
        )}
        {che !== "magic" && (
          <button type="button" className="underline" onClick={() => setChe("magic")}>
            Gửi liên kết qua email
          </button>
        )}
      </div>
    </form>
  );
}

/** Supabase trả lỗi tiếng Anh; dịch các trường hợp hay gặp sang tiếng Việt. */
function dichLoi(msg: string): string {
  const map: [RegExp, string][] = [
    [/invalid login credentials/i, "Email hoặc mật khẩu không đúng."],
    [/email not confirmed/i, "Email chưa được xác nhận. Kiểm tra hộp thư của bạn."],
    [/user already registered/i, "Email này đã có tài khoản. Hãy đăng nhập."],
    [/password should be at least/i, "Mật khẩu phải có ít nhất 8 ký tự."],
    [/rate limit|too many requests/i, "Bạn thao tác quá nhanh, thử lại sau ít phút."],
  ];
  return map.find(([re]) => re.test(msg))?.[1] ?? msg;
}

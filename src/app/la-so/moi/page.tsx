import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";
import { LaSoWorkspace, type NoiLuu } from "@/components/laso/LaSoWorkspace";
import type { AnSaoInput } from "@/lib/tuvi/engine";

export const metadata = { title: "Lập lá số mới" };

function macDinh(): AnSaoInput {
  return {
    hoTen: "", gioiTinh: "nu",
    namSinh: 1990, thangSinh: 1, ngaySinh: 1, gioSinh: 12, phutSinh: 0,
    noiSinh: "Hồ Chí Minh, Việt Nam", timeZone: "Asia/Ho_Chi_Minh",
    namXem: new Date().getFullYear(), thangXem: null, daiVanTuoiDau: null,
  };
}

export default async function TrangLaSoMoi() {
  const khach = cheDoKhach();
  let noiLuu: NoiLuu = "khong";
  let nguoiDung: { email: string; hoTen: string | null } | null = null;
  if (khach) {
    noiLuu = "cuc_bo";
  } else {
    const supabase = await getServerSupabase();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (data?.user) {
      noiLuu = "supabase";
      const hoSo = (await supabase!.from("profiles").select("ho_ten").eq("id", data.user.id).maybeSingle()).data;
      nguoiDung = { email: data.user.email ?? "", hoTen: hoSo?.ho_ten ?? null };
    }
  }
  return <LaSoWorkspace banDau={macDinh()} noiLuu={noiLuu} nguoiDung={nguoiDung} />;
}

import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";
import { LaSoWorkspace, type NoiLuu } from "@/components/laso/LaSoWorkspace";
import type { AnSaoInput } from "@/lib/tuvi/engine";

export const metadata = { title: "Lập lá số mới — An Sao" };

/** Mặc định: nữ, sinh tại TP.HCM, năm xem = năm hiện tại. */
function macDinh(): AnSaoInput {
  return {
    hoTen: "",
    gioiTinh: "nu",
    namSinh: 1990, thangSinh: 1, ngaySinh: 1, gioSinh: 12, phutSinh: 0,
    noiSinh: "Hồ Chí Minh, Việt Nam",
    timeZone: "Asia/Ho_Chi_Minh",
    namXem: new Date().getFullYear(),
    thangXem: null,
    daiVanTuoiDau: null,
  };
}

export default async function TrangLaSoMoi() {
  let noiLuu: NoiLuu = "khong";
  if (cheDoKhach()) {
    noiLuu = "cuc_bo";
  } else {
    const supabase = await getServerSupabase();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (data?.user) noiLuu = "supabase";
  }

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8">
      <LaSoWorkspace banDau={macDinh()} noiLuu={noiLuu} />
    </main>
  );
}

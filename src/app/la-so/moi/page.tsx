import { cheDoKhach } from "@/lib/che-do";
import { getServerSupabase } from "@/lib/supabase/server";
import { LaSoWorkspace, type NoiLuu } from "@/components/laso/LaSoWorkspace";
import { banNhapRong } from "@/lib/tuvi/ban-nhap";

export const metadata = { title: "Lập lá số mới" };

/**
 * Form bắt đầu RỖNG. Trước đây điền sẵn 01/01/1990 làm chỗ dựa, nhưng người
 * dùng nhìn thấy một lá số hoàn chỉnh của người không có thật — và hỏi được
 * chuyên gia về nó. Chỉ "Năm xem" được đặt trước, vì đó là bối cảnh xem chứ
 * không phải dữ kiện của đương số.
 */
const macDinh = () => ({ ...banNhapRong(), namXem: new Date().getFullYear() });

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

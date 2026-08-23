import { LinkButton } from "@/components/ui";
import { ThienBan } from "@/components/graphics/ThienBan";

/** Trạng thái rỗng — mời lập lá số đầu tiên. */
export function LuoiRong() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
      <ThienBan className="w-40 opacity-40" />
      <h2 className="mt-6 font-display text-2xl font-semibold">Chưa có lá số nào</h2>
      <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-ink-dim">
        Lập lá số đầu tiên chỉ mất chưa đầy một phút — bạn chỉ cần ngày sinh,
        giờ sinh và nơi sinh.
      </p>
      <LinkButton href="/la-so/moi" className="mt-7">Lập lá số đầu tiên</LinkButton>
    </div>
  );
}

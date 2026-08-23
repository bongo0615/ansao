import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { anSao } from "@/lib/tuvi/engine";
import { laSoThanhVanBan } from "@/lib/ai/serialize";
import { TRI_THUC } from "@/lib/ai/system-prompt";
import { laSoSchema, rowToInput, type LaSoRow } from "@/lib/la-so-io";
import { timNoiSinh } from "@/lib/tuvi/noi-sinh";
import { getServerSupabase } from "@/lib/supabase/server";
import { chatMo, cheDoKhach } from "@/lib/che-do";
import { diaChi, kiemTra } from "@/lib/gioi-han";

export const runtime = "nodejs";
// Luận giải sâu có thể chạy lâu; streaming giữ kết nối sống.
export const maxDuration = 300;

const MODEL = "claude-opus-5";

/** Hạn mức cho người CHƯA đăng nhập, tính theo IP. */
const KHACH_SO_LUOT = 15;
const KHACH_CUA_SO_MS = 60 * 60 * 1000; // 1 giờ

const bodySchema = z.object({
  /** Lá số đã lưu — server tự đọc từ DB, an toàn hơn tin client. */
  laSoId: z.string().uuid().optional(),
  /** Chế độ khách: client gửi thẳng input vì chưa có bản ghi trong DB. */
  laSo: laSoSchema.optional(),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(8000),
  })).min(1).max(60),
});

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Chưa cấu hình ANTHROPIC_API_KEY — tính năng luận giải đang tắt." },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const { laSoId, laSo, messages } = parsed.data;

  // Lá số đã lưu: đọc từ DB theo id, RLS đảm bảo đúng chủ sở hữu — không tin
  // dữ liệu client gửi lên. Lá số CHƯA lưu (đang lập ở /la-so/moi, hoặc chế độ
  // khách): nhận thẳng input, vì đó là bát tự người dùng vừa tự nhập, không
  // đụng tới bản ghi của ai khác.
  let input;
  if (laSoId) {
    const supabase = await getServerSupabase();
    if (!supabase) return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    const { data } = await supabase.from("la_so").select("*").eq("id", laSoId).maybeSingle();
    if (!data) return NextResponse.json({ error: "Không tìm thấy lá số" }, { status: 404 });
    input = rowToInput(data as LaSoRow);
  } else if (laSo) {
    // Lá số chưa lưu. Ai được hỏi:
    //   - chế độ khách, hoặc cờ CHAT MỞ đang bật → cho, nhưng có hạn mức theo IP
    //   - còn lại → phải đăng nhập
    if (!cheDoKhach()) {
      const supabase = await getServerSupabase();
      const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
      if (!data?.user) {
        if (!chatMo()) {
          return NextResponse.json(
            { error: "Đăng nhập để trò chuyện cùng chuyên gia luận giải." },
            { status: 401 },
          );
        }
        const gh = kiemTra(`chat:${diaChi(request.headers)}`, KHACH_SO_LUOT, KHACH_CUA_SO_MS);
        if (!gh.choPhep) {
          const phut = Math.ceil(gh.thuLaiSauGiay / 60);
          return NextResponse.json(
            {
              error: `Bạn đã dùng hết ${KHACH_SO_LUOT} lượt hỏi miễn phí trong giờ này. `
                + `Thử lại sau ${phut} phút, hoặc đăng nhập để hỏi thoải mái.`,
            },
            { status: 429, headers: { "Retry-After": String(gh.thuLaiSauGiay) } },
          );
        }
      }
    }
    input = {
      ...laSo,
      // Múi giờ suy từ danh mục nơi sinh, không lấy từ client và không mặc định
      // cứng GMT+7 — sinh ở nước ngoài sẽ ra bát tự sai.
      timeZone: timNoiSinh(laSo.noiSinh)?.timeZone ?? "Asia/Ho_Chi_Minh",
    };
  } else {
    return NextResponse.json({ error: "Thiếu lá số" }, { status: 400 });
  }

  let vanBanLaSo: string;
  try {
    vanBanLaSo = laSoThanhVanBan(anSao(input));
  } catch (e) {
    return NextResponse.json({ error: `Không lập được lá số: ${(e as Error).message}` }, { status: 400 });
  }

  const client = new Anthropic();

  // Thứ tự system block quan trọng cho prompt caching: khối TRI_THUC bất biến
  // đứng trước và được cache; khối lá số đổi theo từng người nên đứng sau.
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: [
      { type: "text", text: TRI_THUC, cache_control: { type: "ephemeral" } },
      { type: "text", text: `# LÁ SỐ ĐANG XEM\n\n${vanBanLaSo}` },
    ],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const gui = (o: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(o)}\n\n`));
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            gui({ t: "text", v: event.delta.text });
          }
        }
        const cuoi = await stream.finalMessage();
        if (cuoi.stop_reason === "refusal") {
          gui({ t: "error", v: "Nội dung này tôi không luận giải được. Bạn thử hỏi cách khác nhé." });
        }
        gui({ t: "done" });
      } catch (e) {
        const thongBao =
          e instanceof Anthropic.RateLimitError
            ? "Hệ thống đang quá tải, bạn thử lại sau ít phút."
            : e instanceof Anthropic.AuthenticationError
              ? "Cấu hình API key không hợp lệ."
              : `Có lỗi khi luận giải: ${(e as Error).message}`;
        gui({ t: "error", v: thongBao });
      } finally {
        controller.close();
      }
    },
    cancel() { stream.abort(); },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

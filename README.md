# An Sao — Lập lá số Tử Vi (trường phái Ảo Bí)

Ứng dụng web tiếng Việt lập **lá số Tử Vi** từ ngày–giờ–nơi sinh theo đúng quy
tắc an sao của trường phái Ảo Bí, rồi cho người dùng **trò chuyện với chuyên gia
luận giải AI** đọc đúng lá số đó.

## Nguồn quy tắc

Engine cài đặt nguyên văn theo bộ tài liệu trong `Dropbox/Huyền Vi - An Sao/`:

| Tài liệu | Vai trò trong code |
|---|---|
| `TechDoc_AnSao_AoBi_v1.0.md` | **Nguồn chân lý** cho toàn bộ công thức an sao (`src/lib/tuvi/`) |
| `Bang_PhanLoai_Sao_DRAFT.md` | Nguồn ngũ hành + phân loại Cấp 1 duy nhất (`src/lib/tuvi/sao.ts`) |
| `VM_AnSao_UI_Design_Spec_v3.md` | Layout, typography, palette (`src/styles/la-so.css`) |
| `VM_AnSao_Van_08041990.html` | Mockup v10 — bản chuẩn hiển thị, CSS được port nguyên trạng |
| `260520 V5 An sao.xlsx` | Bảng tra gốc; Define Bảng 4 dùng làm fixture test nạp âm |
| `QuyTac_KhoiDaiVan_BoSung.md` | Quy tắc tuổi khởi + 2 khái niệm chiều của Đại Vận |

> ⚠️ Khi quy tắc Ảo Bí thay đổi: sửa `src/lib/tuvi/`, **không** sửa front-end.
> Front-end cấm tự suy ngũ hành của sao và cấm fallback màu trắng âm thầm
> (TechDoc 0.8 / Design Spec v3.3).

## Phạm vi đã cài đặt

**Nguyên cục (B1–B26)** — dựng la võng, can chi cung, nạp âm; cung chức + Mệnh/Thân;
Tử Vi–Thiên Phủ và 14 chính tinh; vòng Lộc Tồn, vòng Thái Tuế, vòng Tướng Tinh;
Kình–Đà, Không–Kiếp, Tả–Hữu, Xương–Khúc, Khôi–Việt, Hoả–Linh; Tứ Hoá + Tứ Hoá nội
cung; Thai–Toạ, Quang–Quý, Thiên Quan, Thiên Phúc, **Thiên Trù**, Cô–Quả, Khốc–Hư,
Hình–Diêu, Hồng–Hỉ, Long–Phượng; Tuần–Triệt; vòng Trường Sinh cung Mệnh.

**Tầng vận** — Đại Vận (tuổi khởi = cục số, 2 khái niệm chiều), Lưu Niên (lưu cục,
12 lưu chi + 12 tháng, vòng Lộc Tồn đủ 12 sao, Tướng Tinh theo **lưu chi**),
Lưu Nguyệt (cung chức tính nhưng không hiển thị, đúng spec).

**Hiển thị có điều kiện** — thiếu *Năm xem* → toàn bộ tầng `L.` để trống giữ chỗ;
thiếu *Tháng xem* → tầng `N.` để trống.

### Còn mở (theo TechDoc PHẦN 6)
- Quy tắc an NGÀY vào 12 cung trong tháng xem → khí Trường Sinh tầng Lưu Nguyệt
  (mục 1, chờ Nhã). Hiện engine xuất khí TS tầng 1–4, chưa có tầng 5.
- Thứ tự cung chức LN/LNg ngược với ĐV (mục 2) — code theo đúng V5 như TechDoc
  quy định, xem `CUNG_CHUC_LUU` trong `constants.ts`.
- Panel "tap mở chi tiết cung" (Tứ Hoá nội cung + khí TS): engine đã xuất đủ
  dữ liệu (`cung[].tuHoaNoiCung`, `cung[].khiTruongSinh`), UI chưa dựng.

## Kiến trúc

```
src/lib/tuvi/     engine thuần TypeScript, không phụ thuộc React/DB
  constants.ts    hệ toạ độ Dần=1, can chi, nạp âm 60 hoa giáp, khí Trường Sinh
  lunar.ts        quy đổi múi giờ → GMT+7, âm lịch (Hồ Ngọc Đức), bóc bát tự
  sao.ts          danh mục 97 sao: ngũ hành 3 lớp + phân loại Cấp 1
  tables.ts       bảng tra an sao (Lộc Tồn, Khôi–Việt, Tứ Hoá, Triệt…)
  engine.ts       anSao() — an đủ 4 tầng, trả về LaSo
  noi-sinh.ts     danh mục nơi sinh → IANA time zone
src/lib/ai/       system prompt + tuần tự hoá lá số cho LLM
src/components/laso/     OCung (6 zone) · InputPanel · LaSoView · LaSoWorkspace · TheLaSo
src/components/chat/     KhungChat (SSE) · Markdown (tự viết, không dangerouslySetInnerHTML)
src/components/graphics/ ThienBan · VongNguHanh · Logo · StarField — SVG thuần
src/styles/la-so.css   port nguyên trạng CSS mockup v10, scope vào .la-so-root
src/app/          Next.js App Router (trang chủ, đăng nhập, danh sách, lá số)
supabase/migrations/   schema + RLS
tests/            2 test case acceptance bắt buộc + đối chiếu 60 hoa giáp
```

Lá số **không** được lưu vào DB — chỉ lưu input (bát tự + nơi sinh). Engine là
nguồn chân lý, lá số luôn tính lại nên khi quy tắc đổi, mọi lá số cũ tự đúng theo.

## Chuyên gia luận giải (AI)

Khung chat bên phải lá số nói chuyện với **Claude Opus 5** đóng vai chuyên gia Tử
Vi trường phái Ảo Bí.

**Kiến trúc — điểm quan trọng nhất:** model **không bao giờ tự an sao**. Engine
tính lá số, `src/lib/ai/serialize.ts` tuần tự hoá thành văn bản có cấu trúc (kèm
sẵn tam hợp / xung chiếu / nhị hợp để model khỏi phải tự suy), rồi nạp vào system
prompt như **dữ kiện**. Model chỉ luận. Nhờ vậy mọi câu trả lời truy ngược được
về cung và sao cụ thể, và chuyên gia người thật kiểm chứng được.

| Tệp | Vai trò |
|---|---|
| `src/lib/ai/system-prompt.ts` | **Tài sản tri thức lõi** — vai trò, đặc thù Ảo Bí, khung luận giải, ranh giới đạo đức, văn phong |
| `src/lib/ai/serialize.ts` | Lá số → văn bản cho model |
| `src/app/api/chat/route.ts` | Route streaming (SSE) |

Chi tiết đáng lưu ý:

- **Lá số lấy từ server, không tin client.** Client chỉ gửi `laSoId` + lịch sử
  chat; server đọc lá số từ CSDL (RLS chặn cross-tenant) rồi mới dựng prompt.
  Không thể hỏi về lá số của người khác.
- **Prompt caching**: khối tri thức bất biến đặt trước và bật `cache_control`,
  khối lá số đặt sau — lượt thứ hai trở đi chỉ trả ~10% giá cho phần tri thức.
- **Ranh giới đạo đức** nằm trong prompt: không chẩn đoán bệnh, không tiên đoán
  cái chết, không tư vấn đầu tư/pháp lý như điều chắc chắn, luôn nhấn mạnh lá số
  là khuynh hướng chứ không phải bản án.
- Thiếu `ANTHROPIC_API_KEY` → API trả 503 và khung chat báo tắt; phần lập lá số
  vẫn chạy bình thường.

## Giao diện

- **Trang chủ** — hero với **Thiên Bàn**: ba vòng can chi quay ngược chiều nhau
  bao quanh khung la võng 4×4. SVG thuần, không ảnh, không thư viện đồ hoạ.
- **Quản lý lá số** — lưới thẻ (tile card), mỗi thẻ có **mini la võng** tô theo
  ngũ hành nạp âm 12 cung của chính lá số đó nên nhận ra nhau bằng mắt.
- **Màn làm việc** — lá số bên trái, chuyên gia bên phải; màn hẹp chuyển thành tab.
- Bảng màu ngũ hành của lá số được dùng làm nền tảng cho cả app, nên phần vỏ và
  phần lá số không đá màu nhau. Chữ: Playfair Display + Be Vietnam Pro (cả hai
  đều có subset tiếng Việt đủ dấu).

Xem nhanh không cần chạy app:

```bash
node scripts/xuat-trang.mjs http://localhost:3000/ trang-chu.html
```

## Chạy dự án

```bash
./dev.sh
```

Script lo hết phần preflight: cài dependency khi thiếu, tạo `.env.local`, dọn cổng
3000 nếu còn tiến trình cũ, **chạy test rồi mới mở server**.

| Lệnh | Việc |
|---|---|
| `./dev.sh` | Kiểm tra rồi chạy dev server |
| `./dev.sh nhanh` | Chạy ngay, bỏ qua test (khi đang lặp nhanh) |
| `./dev.sh test` | Chỉ chạy test |
| `./dev.sh kiem-tra` | Typecheck + test + build production |
| `./dev.sh xuat [file]` | Xuất lá số ra HTML tĩnh để đối chiếu mockup |
| `./dev.sh dung` | Dừng dev server |

Đổi cổng: `PORT=3001 ./dev.sh`.

> Mặc định chạy test trước khi mở server là có chủ đích: engine sai thì lá số sai
> **âm thầm** — sao vẫn hiện đủ, chỉ sai vị trí. Test là thứ duy nhất bắt được.

### Chế độ khách — tắt đăng nhập để kiểm thử

```bash
# .env.local
NEXT_PUBLIC_CHE_DO_KHACH=1
```

Bật cờ này thì **toàn bộ luồng đăng nhập tắt**: `/login` chuyển thẳng về danh
sách, mọi trang mở được ngay, lá số lưu vào `localStorage` của trình duyệt. Dùng
để kiểm thử engine + giao diện mà không vướng auth.

Đặt `0` (hoặc xoá dòng) là quay lại luồng Supabase — không phải sửa dòng code nào.

| | Chế độ khách | Supabase |
|---|---|---|
| Đăng nhập | tắt | bắt buộc |
| Lá số lưu ở | trình duyệt hiện tại | Postgres + RLS |
| Chia sẻ giữa máy | không | có |

Không bật cờ mà cũng không có env Supabase, app chỉ lập và in được lá số, không
lưu được.

### Supabase

Chạy `supabase/migrations/0001_init.sql` trong SQL Editor của project. Schema gồm
`profiles`, `la_so`, `luan_giai`; RLS bật mặc định, mỗi người chỉ thấy dữ liệu của
mình. Trong Authentication → URL Configuration, thêm redirect
`http://localhost:3000/auth/callback` (và domain production).

## Kiểm thử

```bash
npm test        # 99 test
```

- `tests/engine.test.ts` — **2 test case acceptance bắt buộc** của TechDoc §4.3
  (nữ 21/09/1981, thuận lý) và §4.4 (nam 02/05/2001, **nghịch lý**). Phải chạy cả
  hai: case #2 bắt được lỗi thiếu hệ số A mà case #1 che khuất.
- `tests/napam.test.ts` — đối chiếu **60/60** Lục Thập Hoa Giáp với V5 Define
  Bảng 4 (ngũ hành nạp âm + khí Trường Sinh).

## Đối chiếu lá số mẫu (`260720 Lá số mẫu (1).xlsx`)

Bộ mẫu có 8 lá số phủ đủ ma trận **(can năm ±) × (nam/nữ) × (Mệnh ở cung ±)** —
tức toàn bộ tổ hợp hệ số A và B. Đây là kiểm chứng độc lập mạnh nhất cho engine.

**Khớp 100%:** đổi âm lịch (8/8) · can chi năm/tháng/ngày/giờ · âm dương giới
tính & thuận-nghịch lý (8/8) · vị trí Mệnh, Thân, Cục (8/8) · can chi 12 cung
(96/96) · tên 12 cung chức · cung chức Đại Vận · cung chức Lưu Niên · vòng
Trường Sinh · Tuần · 14 chính tinh · vòng Lộc Tồn · vòng Thái Tuế · Kình-Đà ·
Không-Kiếp · Tả-Hữu · Xương-Khúc · Khôi-Việt · Thai-Toạ · Quang-Quý ·
Quan-Phúc · Cô-Quả · Khốc-Hư · Hình-Diêu · Hồng-Hỉ-Long-Phượng · sao tầng ĐV ·
sao tầng Lưu Nguyệt. Khoảng **143/154 vị trí sao mỗi lá số**.

**3 nhóm lệch — đều do mẫu (20/07) CŨ HƠN TechDoc (bản 30/07):**

| # | Mục | Mẫu | App (theo TechDoc) |
|---|---|---|---|
| 1 | Hoả Tinh / Linh Tinh | bảng **truyền thống** (16/16) | bảng riêng Ảo Bí, TechDoc 1.14 ghi rõ "(≠TT, đã chốt)" |
| 2 | Triệt | bảng **truyền thống** (7/8) | bảng lookup TechDoc 1.25, ghi rõ "(≠TT, Ất và Canh tách riêng)" |
| 3 | Vòng L.Tướng Tinh | không gian **chi nguyên thuỷ** (cả 8 lá số đều khởi ở Ngọ = chi năm xem 2026) | không gian **LƯU CHI** — TechDoc 2.2.3 "chốt 30/07, GHI ĐÈ ghi chú *chi nguyên thuỷ* trong sheet Sao Lưu niên" |

Dấu hiệu khác cho thấy mẫu cũ hơn: còn **Đài Phụ, Phong Cáo** (TechDoc 1.24 đã
loại khỏi trường phái), có **Quốc Ấn, Đường Phù** (không nằm trong 97 sao),
dùng tên **"Bác Sĩ"** (TechDoc 1.6 đổi thành "Lộc Tồn") và **"TỬ TỨC"**
(TechDoc chốt "TỬ TÔN"), và **thiếu Thiên Trù** (thêm 30/07).

> ⚠️ Ba điểm lệch trên là **quyết định nghiệp vụ, không phải lỗi code**. Engine
> đang theo TechDoc — nguồn chân lý được chỉ định. Cần Nhã xác nhận: bảng
> Hoả-Linh và Triệt lấy theo TechDoc hay theo mẫu?

Chạy lại đối chiếu bất cứ lúc nào:

```bash
node scripts/xuat-la-so.mjs …          # xuất HTML để soi mắt thường
npx vitest run tests/la-so-mau.test.ts # 25 test khoá phần đã khớp
```

## Ghi chú kỹ thuật đáng lưu ý

- **Hệ toạ độ**: mọi vị trí cung hệ `Dần = 1`; riêng giờ sinh `H` hệ `Tí = 1`.
- **Giờ Tí 23:00–23:59 thuộc ngày hôm sau** — cộng 1 ngày trước khi đổi âm lịch.
- **Tháng nhuận** dùng cùng số tháng và cùng can chi tháng với tháng bị nhuận.
- **Múi giờ**: quy đổi qua `Intl` + IANA tzdata nên đúng cả DST lịch sử của nơi sinh.
- **Khí Trường Sinh của nạp âm** (`khiTruongSinh`) đếm **thuận với can dương,
  nghịch với can âm** — suy ra từ Define Bảng 4, đối chiếu 60/60. Khác với **vòng
  Trường Sinh cung Mệnh** (`cung[].vts`) vốn chạy theo chiều `D = A × B(cung Mệnh)`.
  Hai khái niệm này không bắt buộc trùng giá trị.
- **Thiên Lương hành THỔ** (chủ đích Ảo Bí, khác sách vở) — đừng "sửa" lại theo
  bảng màu ngoài.

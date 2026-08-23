# An Sao — Lập lá số Tử Vi (trường phái Ảo Bí)

Ứng dụng web tiếng Việt lập **lá số Tử Vi** từ ngày–giờ–nơi sinh, theo đúng
quy tắc an sao của trường phái Ảo Bí. Lá số sinh ra để **chuyên gia luận giải**.

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
src/components/laso/   OCung (6 zone) · InputPanel · LaSoView · LaSoWorkspace
src/styles/la-so.css   port nguyên trạng CSS mockup v10, scope vào .la-so-root
src/app/          Next.js App Router (trang chủ, đăng nhập, danh sách, lá số)
supabase/migrations/   schema + RLS
tests/            2 test case acceptance bắt buộc + đối chiếu 60 hoa giáp
```

Lá số **không** được lưu vào DB — chỉ lưu input (bát tự + nơi sinh). Engine là
nguồn chân lý, lá số luôn tính lại nên khi quy tắc đổi, mọi lá số cũ tự đúng theo.

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

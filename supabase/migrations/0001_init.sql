-- =============================================================================
-- An Sao — schema khởi tạo
-- Lưu INPUT của lá số (bát tự + nơi sinh), KHÔNG lưu kết quả an sao: engine là
-- nguồn chân lý và có thể được cập nhật khi quy tắc Ảo Bí thay đổi, nên lá số
-- luôn được tính lại từ input.
-- =============================================================================

create extension if not exists "pgcrypto";

-- --- Hồ sơ người dùng -------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  ho_ten      text,
  -- 'khach' = người dùng thường; 'chuyen_gia' = chuyên gia luận giải
  vai_tro     text not null default 'khach' check (vai_tro in ('khach', 'chuyen_gia')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Hồ sơ mở rộng của auth.users';

-- --- Lá số ------------------------------------------------------------------
create table if not exists public.la_so (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users(id) on delete cascade,

  ho_ten            text not null,
  gioi_tinh         text not null check (gioi_tinh in ('nam', 'nu')),

  -- Bát tự đầu vào là DƯƠNG LỊCH tại nơi sinh; engine tự quy đổi GMT+7 + âm lịch.
  nam_sinh          int  not null check (nam_sinh between 1900 and 2100),
  thang_sinh        int  not null check (thang_sinh between 1 and 12),
  ngay_sinh         int  not null check (ngay_sinh between 1 and 31),
  gio_sinh          int  not null check (gio_sinh between 0 and 23),
  phut_sinh         int  not null default 0 check (phut_sinh between 0 and 59),

  noi_sinh          text not null,
  time_zone         text not null default 'Asia/Ho_Chi_Minh',

  -- Bối cảnh xem (tuỳ chọn) — thiếu năm xem thì tầng L./N. để trống.
  nam_xem           int,
  thang_xem         int check (thang_xem between 1 and 12),
  dai_van_tuoi_dau  int,

  ghi_chu           text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Tháng xem đòi hỏi năm xem (TechDoc 4.0).
  constraint thang_xem_can_nam_xem check (thang_xem is null or nam_xem is not null)
);

create index if not exists la_so_owner_updated_idx
  on public.la_so (owner_id, updated_at desc);

comment on table public.la_so is 'Input lá số; kết quả an sao luôn tính lại từ engine';

-- --- Ghi chú luận giải của chuyên gia ---------------------------------------
create table if not exists public.luan_giai (
  id          uuid primary key default gen_random_uuid(),
  la_so_id    uuid not null references public.la_so(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade,
  -- Cung được luận (hệ Dần=1); null = luận tổng quan cả lá số.
  cung        int check (cung between 1 and 12),
  tang        text check (tang in ('nguyen_cuc', 'dai_van', 'luu_nien', 'luu_nguyet')),
  noi_dung    text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists luan_giai_la_so_idx on public.luan_giai (la_so_id, created_at);

-- --- updated_at tự động ------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists la_so_touch on public.la_so;
create trigger la_so_touch before update on public.la_so
  for each row execute function public.touch_updated_at();

drop trigger if exists luan_giai_touch on public.luan_giai;
create trigger luan_giai_touch before update on public.luan_giai
  for each row execute function public.touch_updated_at();

-- --- Tạo profile khi có user mới ---------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, ho_ten)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'ho_ten', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- RLS — mặc định khoá, mỗi người chỉ thấy dữ liệu của mình
-- =============================================================================
alter table public.profiles  enable row level security;
alter table public.la_so     enable row level security;
alter table public.luan_giai enable row level security;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists la_so_owner on public.la_so;
create policy la_so_owner on public.la_so
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Ghi chú luận giải: chỉ đọc/ghi được trên lá số mình sở hữu, và chỉ sửa được
-- ghi chú do chính mình viết.
drop policy if exists luan_giai_read on public.luan_giai;
create policy luan_giai_read on public.luan_giai
  for select using (
    exists (select 1 from public.la_so l
            where l.id = luan_giai.la_so_id and l.owner_id = auth.uid())
  );

drop policy if exists luan_giai_write on public.luan_giai;
create policy luan_giai_write on public.luan_giai
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from public.la_so l
                where l.id = luan_giai.la_so_id and l.owner_id = auth.uid())
  );

drop policy if exists luan_giai_modify on public.luan_giai;
create policy luan_giai_modify on public.luan_giai
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists luan_giai_delete on public.luan_giai;
create policy luan_giai_delete on public.luan_giai
  for delete using (author_id = auth.uid());

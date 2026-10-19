create extension if not exists pgcrypto;
create table if not exists public.registrations (
 id uuid primary key default gen_random_uuid(),
 name text not null, school text not null, email text not null, phone text not null,
 practice_date date not null check (practice_date in ('2026-10-29','2026-11-19','2026-12-10')),
 amount numeric(12,2) not null default 10000 check (amount=10000),
 status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled','refunded','charged_back')),
 preference_id text, payment_id text, created_at timestamptz not null default now(),paid_at timestamptz
);
create index if not exists registrations_date_idx on public.registrations(practice_date);
create index if not exists registrations_created_idx on public.registrations(created_at desc);
alter table public.registrations enable row level security;
-- No se crean políticas públicas. La API usa exclusivamente service_role del servidor.

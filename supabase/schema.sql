-- ============================================================
-- LabHouse Equipment – Supabase Database Schema
-- ============================================================
-- Run this SQL in the Supabase SQL Editor to create all tables.
-- ============================================================

-- ── Extensions ─────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── 1. app_users ───────────────────────────────────────────
-- Application users (username + password auth, not Supabase Auth)
create table if not exists public.app_users (
  id              bigserial primary key,
  username        text        not null unique,
  password_hash   text        not null,           -- bcrypt hash via pgcrypto
  full_name       text        not null,
  role            text        not null,           -- see UserRole type
  department      text,                           -- e.g. 'IT', 'Lab'
  employee_id     text,
  position        text,
  branch          text,
  signature       text,
  managed_devices jsonb       not null default '[]',
  profile_ids     jsonb       not null default '[]',
  email           text,
  phone           text,
  avatar          text,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz
);

-- Add columns to existing table if they don't exist yet (idempotent migration)
alter table public.app_users add column if not exists password_hash   text;
alter table public.app_users add column if not exists department      text;
alter table public.app_users add column if not exists employee_id     text;
alter table public.app_users add column if not exists position        text;
alter table public.app_users add column if not exists branch          text;
alter table public.app_users add column if not exists signature       text;
alter table public.app_users add column if not exists managed_devices jsonb not null default '[]';
alter table public.app_users add column if not exists profile_ids     jsonb not null default '[]';

-- Seed default users – passwords are hashed with bcrypt via pgcrypto
-- ON CONFLICT DO UPDATE refreshes metadata but PRESERVES existing passwords
-- so re-running the schema does not lock out users who changed their passwords.
insert into public.app_users (username, password_hash, full_name, role, department, email, phone) values
  ('admin',       crypt('admin123', gen_salt('bf')), 'Nguyễn Văn Admin',      'Admin',                       'IT',  'admin@labhouse.vn',       '0901234567'),
  ('giamdoc',     crypt('gd123',    gen_salt('bf')), 'Trần Thị Giám Đốc',     'Giám đốc',                   null, 'giamdoc@labhouse.vn',     '0902345678'),
  ('truongphong', crypt('tp123',    gen_salt('bf')), 'Lê Văn Trưởng Phòng',  'Trưởng phòng xét nghiệm',   null, 'truongphong@labhouse.vn', '0903456789'),
  ('ktv',         crypt('ktv123',   gen_salt('bf')), 'Phạm Thị Kỹ Thuật',    'Kỹ thuật viên',              null, 'ktv@labhouse.vn',         '0904567890'),
  ('qlcl',        crypt('qlcl123',  gen_salt('bf')), 'Hoàng Văn Chất Lượng', 'Quản lý chất lượng',         null, 'qlcl@labhouse.vn',        '0905678901'),
  ('qltb',        crypt('qltb123',  gen_salt('bf')), 'Vũ Thị Thiết Bị',      'Quản lý trang thiết bị',     null, 'qltb@labhouse.vn',        '0906789012')
on conflict (username) do update set
  full_name     = excluded.full_name,
  role          = excluded.role,
  department    = excluded.department,
  email         = excluded.email,
  phone         = excluded.phone,
  is_active     = true,
  updated_at    = now();
  -- Note: password_hash is intentionally NOT updated here so that user-changed
  -- passwords survive a schema re-run. Use `npm run seed-admin` to reset the
  -- admin password to the default.

-- ── 2. branches ────────────────────────────────────────────
create table if not exists public.branches (
  id          bigserial primary key,
  name        text    not null,
  code        text    not null unique,
  departments text[]  not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── 3. positions ───────────────────────────────────────────
create table if not exists public.positions (
  id          bigserial primary key,
  name        text    not null,
  code        text    not null unique,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── 4. suppliers ───────────────────────────────────────────
create table if not exists public.suppliers (
  id             bigserial primary key,
  name           text    not null,
  code           text    not null unique,
  address        text,
  phone          text,
  email          text,
  contact_person text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ── 5. devices ─────────────────────────────────────────────
create table if not exists public.devices (
  id                     bigserial primary key,
  code                   text        not null unique,
  name                   text        not null,
  specialty              text,
  category               text,
  device_type            text,
  model                  text,
  serial                 text,
  location               text,
  manufacturer           text,
  country_of_origin      text,
  year_of_manufacture    text,
  distributor            text,
  usage_start_date       text,
  usage_time             text,
  installation_location  text,
  image_url              text,
  status                 text        not null default 'Đăng ký mới',
  condition_on_receive   text,
  calibration_required   boolean     not null default false,
  calibration_frequency  text,
  maintenance_required   boolean     not null default false,
  maintenance_frequency  text,
  inspection_required    boolean     not null default false,
  inspection_frequency   text,
  last_calibration       text,
  next_calibration       text,
  last_maintenance       text,
  next_maintenance       text,
  description            text,
  accessories            jsonb       not null default '[]',
  contacts               jsonb       not null default '[]',
  manager_history        jsonb       not null default '[]',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz
);

-- ── 6. new_device_proposals ────────────────────────────────
create table if not exists public.new_device_proposals (
  id                    bigserial primary key,
  proposal_code         text        not null unique,
  necessity             text,
  device_requirements   jsonb       not null default '[]',
  proposed_by           text,
  proposed_by_id        text,
  proposed_date         text,
  created_date          text,
  status                text        not null default 'Bản nháp',
  approvers             jsonb       not null default '[]',
  approved_by           text,
  approved_date         text,
  rejected_by           text,
  rejected_date         text,
  rejection_reason      text,
  registered_to_system  boolean     not null default false,
  department            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz
);

-- ── 7. calibration_schedules ───────────────────────────────
create table if not exists public.calibration_schedules (
  id             bigserial primary key,
  device_id      bigint      references public.devices(id) on delete set null,
  device_name    text        not null,
  device_code    text        not null,
  scheduled_date text        not null,
  type           text        not null,   -- 'Hiệu chuẩn' | 'Bảo dưỡng'
  status         text        not null default 'Chờ thực hiện',
  assigned_to    text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz
);

-- ── 8. incident_reports ────────────────────────────────────
create table if not exists public.incident_reports (
  id                    bigserial primary key,
  report_code           text        not null unique,
  device_id             bigint      references public.devices(id) on delete set null,
  device_name           text        not null,
  device_code           text        not null,
  specialty             text,
  incident_date_time    text,
  discovered_by         text,
  discovered_by_role    text,
  supplier              text,
  description           text,
  immediate_action      text,
  supplier_action       text,
  affects_patient_result boolean    not null default false,
  affected_patient_sid  text,
  how_affected          text,
  requires_device_stop  boolean     not null default false,
  stop_from             text,
  stop_to               text,
  has_proposal          boolean     not null default false,
  proposal              text,
  reported_by           text,
  device_manager        text,
  related_users         text[]      not null default '{}',
  status                text        not null default 'Nháp',
  conclusion            text,
  resolved_by           text,
  resolved_by_type      text,
  linked_work_order_code text,
  completion_date_time  text,
  work_orders           jsonb       not null default '[]',
  approved_by           text,
  approved_date         text,
  rejected_by           text,
  rejected_reason       text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz
);

-- ── 9. history_logs ────────────────────────────────────────
create table if not exists public.history_logs (
  id            bigserial primary key,
  action_code   text        not null,
  action_number bigint      not null default 0,
  user_id       text,
  user_name     text,
  user_role     text,
  action        text        not null,
  description   text,
  target_type   text,
  target_id     text,
  target_name   text,
  timestamp     text        not null,
  ip_address    text,
  created_at    timestamptz not null default now()
);

-- ── 10. Row-Level Security ──────────────────────────────────
-- Enable RLS on all tables; allow authenticated service-role full access.
-- Anon key gets read-only access to non-sensitive tables.

alter table public.app_users          enable row level security;
alter table public.branches           enable row level security;
alter table public.positions          enable row level security;
alter table public.suppliers          enable row level security;
alter table public.devices            enable row level security;
alter table public.new_device_proposals enable row level security;
alter table public.calibration_schedules enable row level security;
alter table public.incident_reports   enable row level security;
alter table public.history_logs       enable row level security;

-- Service role bypasses RLS automatically (no policy needed).

-- ── 11. Indexes ────────────────────────────────────────────
create index if not exists idx_devices_status         on public.devices(status);
create index if not exists idx_proposals_status       on public.new_device_proposals(status);
create index if not exists idx_calibration_device_id  on public.calibration_schedules(device_id);
create index if not exists idx_incidents_device_id    on public.incident_reports(device_id);
create index if not exists idx_history_user_id        on public.history_logs(user_id);
create index if not exists idx_history_timestamp      on public.history_logs(timestamp);

-- ── 12. Helper functions ────────────────────────────────────
-- hash_password: wraps pgcrypto bcrypt so the API can hash passwords without
-- embedding the plain-text in the INSERT statement itself.
create or replace function public.hash_password(plain_password text)
returns text
language sql
security definer
as $$
  select crypt(plain_password, gen_salt('bf'));
$$;
-- Called from the /api/auth/login route so the plain-text password never needs
-- to leave the database engine.
create or replace function public.verify_user_password(
  p_username text,
  p_password text
)
returns table (
  id         bigint,
  username   text,
  full_name  text,
  role       text,
  department text,
  email      text,
  phone      text,
  avatar     text
)
language sql
security definer
as $$
  select id, username, full_name, role, department, email, phone, avatar
  from   public.app_users
  where  username  = p_username
    and  is_active = true
    and  password_hash = crypt(p_password, password_hash);
$$;

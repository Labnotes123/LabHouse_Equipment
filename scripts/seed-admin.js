#!/usr/bin/env node
/**
 * seed-admin.js
 * -------------
 * Creates (or resets) the admin user in the LabHouse Supabase database.
 *
 * This is useful when:
 *   - Setting up a fresh database that has never had the schema applied
 *   - Resetting the admin password to the default (admin123)
 *   - The initial seed in schema.sql was skipped
 *
 * Prerequisites:
 *   1. Create a Personal Access Token (PAT) at https://supabase.com/dashboard/account/tokens
 *   2. Export it:  export SUPABASE_ACCESS_TOKEN=sbp_xxxx...
 *   3. Run:        node scripts/seed-admin.js
 *        or:       npm run seed-admin
 *
 * By default this script ONLY creates the admin user if it does NOT already
 * exist.  To also RESET the password for an existing admin user, set:
 *   RESET_ADMIN_PASSWORD=1 node scripts/seed-admin.js
 *
 * Optional override:
 *   SUPABASE_PROJECT_REF=<your-ref> node scripts/seed-admin.js
 *
 * Credentials created:
 *   username  : admin
 *   password  : admin123
 *   role      : Admin  (full access to all features)
 *   department: IT
 */

const https = require("https");

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const token = process.env.SUPABASE_ACCESS_TOKEN;
const resetPassword = process.env.RESET_ADMIN_PASSWORD === "1";

if (!PROJECT_REF) {
  console.error(
    "❌  SUPABASE_PROJECT_REF is not set.\n" +
    "   Set it to your Supabase project reference (e.g. zqykubyimjpofztuokfd)."
  );
  process.exit(1);
}

if (!token) {
  console.error(
    "❌  SUPABASE_ACCESS_TOKEN is not set.\n" +
    "   Create one at https://supabase.com/dashboard/account/tokens\n" +
    "   then run:  SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/seed-admin.js"
  );
  process.exit(1);
}

// Build the conflict resolution clause:
// - Default: insert only, don't change existing password
// - RESET_ADMIN_PASSWORD=1: also reset the password to admin123
const conflictClause = resetPassword
  ? `on conflict (username) do update set
  password_hash = crypt('admin123', gen_salt('bf')),
  full_name     = 'Nguyễn Văn Admin',
  role          = 'Admin',
  department    = 'IT',
  email         = 'admin@labhouse.vn',
  phone         = '0901234567',
  is_active     = true,
  updated_at    = now()`
  : `on conflict (username) do update set
  full_name     = 'Nguyễn Văn Admin',
  role          = 'Admin',
  department    = 'IT',
  email         = 'admin@labhouse.vn',
  phone         = '0901234567',
  is_active     = true,
  updated_at    = now()`;

const sql = `
-- Ensure pgcrypto is available for bcrypt
create extension if not exists "pgcrypto";

-- Ensure all app_users columns exist (idempotent)
alter table public.app_users add column if not exists password_hash   text;
alter table public.app_users add column if not exists department      text;
alter table public.app_users add column if not exists employee_id     text;
alter table public.app_users add column if not exists position        text;
alter table public.app_users add column if not exists branch          text;
alter table public.app_users add column if not exists signature       text;
alter table public.app_users add column if not exists managed_devices jsonb not null default '[]';
alter table public.app_users add column if not exists profile_ids     jsonb not null default '[]';

-- Ensure hash_password helper exists for the /api/users route
create or replace function public.hash_password(plain_password text)
returns text language sql security definer as \$\$
  select crypt(plain_password, gen_salt('bf'));
\$\$;

-- Insert or update the admin user
insert into public.app_users (username, password_hash, full_name, role, department, email, phone, is_active)
values (
  'admin',
  crypt('admin123', gen_salt('bf')),
  'Nguyễn Văn Admin',
  'Admin',
  'IT',
  'admin@labhouse.vn',
  '0901234567',
  true
)
${conflictClause};

-- Ensure the verify_user_password function exists and returns department
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
as \$\$
  select id, username, full_name, role, department, email, phone, avatar
  from   public.app_users
  where  username  = p_username
    and  is_active = true
    and  password_hash = crypt(p_password, password_hash);
\$\$;
`;

const body = JSON.stringify({ query: sql });
const options = {
  hostname: "api.supabase.com",
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  },
};

if (resetPassword) {
  console.log("⚠️   RESET_ADMIN_PASSWORD=1 – the admin password will be reset to 'admin123'");
}
console.log(`⏳  Seeding admin user in project ${PROJECT_REF}...`);

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log("✅  Admin user created/updated successfully!");
      console.log("   username  : admin");
      if (resetPassword) {
        console.log("   password  : admin123  ← RESET to default");
      } else {
        console.log("   password  : (unchanged if user already existed)");
      }
      console.log("   role      : Admin (full access)");
      console.log("   department: IT");
    } else {
      console.error(`❌  Request failed (HTTP ${res.statusCode}):`);
      try {
        console.error(JSON.stringify(JSON.parse(data), null, 2));
      } catch {
        console.error(data);
      }
      process.exit(1);
    }
  });
});

req.on("error", (err) => {
  console.error("❌  Network error:", err.message);
  process.exit(1);
});

req.write(body);
req.end();

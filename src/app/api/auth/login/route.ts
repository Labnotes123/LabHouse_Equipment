import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
}

// Use the service-role key so RLS does not block the login query.
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json() as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên đăng nhập và mật khẩu" },
        { status: 400 }
      );
    }

    // Verify password using pgcrypto's crypt() – the DB stores bcrypt hashes.
    // We use a single RPC call so the plain-text password never leaves the DB engine.
    const { data: rows, error: dbError } = await supabaseAdmin
      .rpc("verify_user_password", { p_username: username, p_password: password });

    if (dbError || !rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    const userRow = rows[0] as {
      id: number;
      username: string;
      full_name: string;
      role: string;
      email: string;
      phone: string;
      avatar?: string;
    };

    const user = {
      id: String(userRow.id),
      username: userRow.username,
      fullName: userRow.full_name,
      role: userRow.role,
      email: userRow.email,
      phone: userRow.phone,
      avatar: userRow.avatar,
    };

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Lỗi hệ thống, vui lòng thử lại" },
      { status: 500 }
    );
  }
}

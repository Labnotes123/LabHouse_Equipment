import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json() as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên đăng nhập và mật khẩu" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

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
      department: string | null;
      email: string;
      phone: string;
      avatar?: string;
    };

    const user = {
      id: String(userRow.id),
      username: userRow.username,
      fullName: userRow.full_name,
      role: userRow.role,
      department: userRow.department ?? undefined,
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

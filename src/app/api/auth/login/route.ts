import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Mock users for local development when Supabase is not available
const MOCK_USERS = [
  { id: "1", username: "admin", password: "admin123", fullName: "Nguyễn Văn Admin", role: "Admin", email: "admin@labhouse.vn", phone: "0901234567" },
  { id: "2", username: "giamdoc", password: "gd123", fullName: "Trần Thị Giám Đốc", role: "Giám đốc", email: "giamdoc@labhouse.vn", phone: "0902345678" },
  { id: "3", username: "truongphong", password: "tp123", fullName: "Lê Văn Trưởng Phòng", role: "Trưởng phòng xét nghiệm", email: "truongphong@labhouse.vn", phone: "0903456789" },
  { id: "4", username: "ktv", password: "ktv123", fullName: "Phạm Thị Kỹ Thuật", role: "Kỹ thuật viên", email: "ktv@labhouse.vn", phone: "0904567890" },
  { id: "5", username: "qlcl", password: "qlcl123", fullName: "Hoàng Văn Chất Lượng", role: "Quản lý chất lượng", email: "qlcl@labhouse.vn", phone: "0905678901" },
  { id: "6", username: "qltb", password: "qltb123", fullName: "Vũ Thị Thiết Bị", role: "Quản lý trang thiết bị", email: "qltb@labhouse.vn", phone: "0906789012" },
];

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json() as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên đăng nhập và mật khẩu" },
        { status: 400 }
      );
    }

    // Try to authenticate with Supabase
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { data: rows, error: dbError } = await supabaseAdmin
        .rpc("verify_user_password", { p_username: username, p_password: password });

      if (!dbError && rows && rows.length > 0) {
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
      }
    } catch (supabaseError) {
      console.log("Supabase not available, using mock login:", supabaseError);
    }

    // Fallback to mock users for local development
    const mockUser = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (mockUser) {
      return NextResponse.json({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          fullName: mockUser.fullName,
          role: mockUser.role,
          email: mockUser.email,
          phone: mockUser.phone,
        }
      });
    }

    return NextResponse.json(
      { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Lỗi hệ thống, vui lòng thử lại" },
      { status: 500 }
    );
  }
}

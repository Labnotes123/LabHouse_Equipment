import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { dbToUser } from "@/lib/user-utils";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json((data ?? []).map(dbToUser));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json() as {
      username: string;
      password: string;
      fullName: string;
      employeeId?: string;
      phone?: string;
      email?: string;
      position?: string;   // UserProfile.position maps to app_users.role (auth role)
      department?: string;
      branch?: string;
      signature?: string;
      managedDevices?: string[];
      profileIds?: string[];
      isActive?: boolean;
    };

    if (!body.username || !body.password || !body.fullName) {
      return NextResponse.json(
        { error: "username, password và fullName là bắt buộc" },
        { status: 400 }
      );
    }

    // Hash password via pgcrypto in the database
    const { data: hashData, error: hashError } = await supabase
      .rpc("hash_password", { plain_password: body.password });
    if (hashError) throw hashError;
    const passwordHash = hashData as string;

    const { data, error } = await supabase
      .from("app_users")
      .insert({
        username: body.username,
        password_hash: passwordHash,
        full_name: body.fullName,
        role: body.position || "Kỹ thuật viên",  // UserProfile.position = auth role
        department: body.department ?? null,
        employee_id: body.employeeId ?? null,
        position: body.position ?? null,          // also store in position column
        branch: body.branch ?? null,
        signature: body.signature ?? null,
        managed_devices: body.managedDevices ?? [],
        profile_ids: body.profileIds ?? [],
        email: body.email ?? null,
        phone: body.phone ?? null,
        is_active: body.isActive ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(dbToUser(data), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

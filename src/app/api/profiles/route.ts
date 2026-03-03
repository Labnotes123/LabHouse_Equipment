import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json() as {
      name: string;
      description?: string;
      permissions?: Array<{
        id: string;
        name: string;
        category: string;
        enabled: boolean;
      }>;
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên profile là bắt buộc" }, { status: 400 });
    }

    // Generate unique profile code
    const year = new Date().getFullYear();
    const { data: countData } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    const count = (countData?.length ?? 0) + 1;
    const code = `PRF-${year}-${String(count).padStart(4, "0")}`;

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        name: body.name,
        description: body.description ?? null,
        permissions: body.permissions ?? [],
        is_active: body.isActive ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

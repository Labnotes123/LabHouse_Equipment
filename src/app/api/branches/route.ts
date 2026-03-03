import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("branches")
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
      code?: string;
      departments?: string[];
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên chi nhánh là bắt buộc" }, { status: 400 });
    }

    // Generate unique branch code if not provided
    let branchCode = body.code;
    if (!branchCode) {
      const year = new Date().getFullYear();
      const { data: countData } = await supabase
        .from("branches")
        .select("id", { count: "exact", head: true });
      const count = (countData?.length ?? 0) + 1;
      branchCode = `CN-${year}-${String(count).padStart(3, "0")}`;
    }

    const { data, error } = await supabase
      .from("branches")
      .insert({
        name: body.name,
        code: branchCode,
        departments: body.departments ?? [],
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

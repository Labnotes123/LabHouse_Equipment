import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("suppliers")
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
      address?: string;
      phone?: string;
      email?: string;
      contactPerson?: string;
      isActive?: boolean;
    };

    if (!body.name) {
      return NextResponse.json({ error: "Tên nhà cung cấp là bắt buộc" }, { status: 400 });
    }

    // Generate unique supplier code if not provided
    let supplierCode = body.code;
    if (!supplierCode) {
      const year = new Date().getFullYear();
      const { data: countData } = await supabase
        .from("suppliers")
        .select("id", { count: "exact", head: true });
      const count = (countData?.length ?? 0) + 1;
      supplierCode = `NCC-${year}-${String(count).padStart(3, "0")}`;
    }

    const { data, error } = await supabase
      .from("suppliers")
      .insert({
        name: body.name,
        code: supplierCode,
        address: body.address ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        contact_person: body.contactPerson ?? null,
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

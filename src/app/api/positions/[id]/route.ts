import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("id", parseInt(id))
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const body = await req.json() as {
      name?: string;
      code?: string;
      description?: string;
      isActive?: boolean;
    };

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.code !== undefined) updateData.code = body.code;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data, error } = await supabase
      .from("positions")
      .update(updateData)
      .eq("id", parseInt(id))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("positions")
      .delete()
      .eq("id", parseInt(id));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function dbToHistory(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    actionCode: row.action_code,
    actionNumber: row.action_number,
    userId: row.user_id,
    userName: row.user_name,
    userRole: row.user_role,
    action: row.action,
    description: row.description,
    targetType: row.target_type,
    targetId: row.target_id,
    targetName: row.target_name,
    timestamp: row.timestamp,
    ipAddress: row.ip_address,
  };
}

function historyToDb(data: Record<string, unknown>) {
  return {
    action_code: data.actionCode,
    action_number: data.actionNumber,
    user_id: data.userId,
    user_name: data.userName,
    user_role: data.userRole,
    action: data.action,
    description: data.description,
    target_type: data.targetType,
    target_id: data.targetId,
    target_name: data.targetName,
    timestamp: data.timestamp,
    ip_address: data.ipAddress,
  };
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from("history_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return NextResponse.json((data ?? []).map(dbToHistory));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { data, error } = await supabase
      .from("history_logs")
      .insert(historyToDb(body))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(dbToHistory(data), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

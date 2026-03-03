import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function dbToSchedule(row: Record<string, unknown>) {
  return {
    id: row.id,
    deviceId: row.device_id,
    deviceName: row.device_name,
    deviceCode: row.device_code,
    scheduledDate: row.scheduled_date,
    type: row.type,
    status: row.status,
    assignedTo: row.assigned_to,
    notes: row.notes,
  };
}

function scheduleToDb(data: Record<string, unknown>) {
  return {
    device_id: data.deviceId,
    device_name: data.deviceName,
    device_code: data.deviceCode,
    scheduled_date: data.scheduledDate,
    type: data.type,
    status: data.status,
    assigned_to: data.assignedTo,
    notes: data.notes,
  };
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let query = supabase
      .from("calibration_schedules")
      .select("*")
      .order("scheduled_date", { ascending: true });
    if (type) query = query.eq("type", type);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json((data ?? []).map(dbToSchedule));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { data, error } = await supabase
      .from("calibration_schedules")
      .insert(scheduleToDb(body))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(dbToSchedule(data), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

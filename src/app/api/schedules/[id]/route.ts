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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("calibration_schedules")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(dbToSchedule(data));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { data, error } = await supabase
      .from("calibration_schedules")
      .update(scheduleToDb(body))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(dbToSchedule(data));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("calibration_schedules").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

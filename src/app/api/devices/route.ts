import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function dbToDevice(row: Record<string, unknown>) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    specialty: row.specialty,
    category: row.category,
    deviceType: row.device_type,
    model: row.model,
    serial: row.serial,
    location: row.location,
    manufacturer: row.manufacturer,
    countryOfOrigin: row.country_of_origin,
    yearOfManufacture: row.year_of_manufacture,
    distributor: row.distributor,
    usageStartDate: row.usage_start_date,
    usageTime: row.usage_time,
    installationLocation: row.installation_location,
    imageUrl: row.image_url,
    status: row.status,
    conditionOnReceive: row.condition_on_receive,
    calibrationRequired: row.calibration_required,
    calibrationFrequency: row.calibration_frequency,
    maintenanceRequired: row.maintenance_required,
    maintenanceFrequency: row.maintenance_frequency,
    inspectionRequired: row.inspection_required,
    inspectionFrequency: row.inspection_frequency,
    lastCalibration: row.last_calibration,
    nextCalibration: row.next_calibration,
    lastMaintenance: row.last_maintenance,
    nextMaintenance: row.next_maintenance,
    description: row.description,
    accessories: row.accessories ?? [],
    contacts: row.contacts ?? [],
    managerHistory: row.manager_history ?? [],
  };
}

function deviceToDb(data: Record<string, unknown>) {
  return {
    code: data.code,
    name: data.name,
    specialty: data.specialty,
    category: data.category,
    device_type: data.deviceType,
    model: data.model,
    serial: data.serial,
    location: data.location,
    manufacturer: data.manufacturer,
    country_of_origin: data.countryOfOrigin,
    year_of_manufacture: data.yearOfManufacture,
    distributor: data.distributor,
    usage_start_date: data.usageStartDate,
    usage_time: data.usageTime,
    installation_location: data.installationLocation,
    image_url: data.imageUrl,
    status: data.status,
    condition_on_receive: data.conditionOnReceive,
    calibration_required: data.calibrationRequired,
    calibration_frequency: data.calibrationFrequency,
    maintenance_required: data.maintenanceRequired,
    maintenance_frequency: data.maintenanceFrequency,
    inspection_required: data.inspectionRequired,
    inspection_frequency: data.inspectionFrequency,
    last_calibration: data.lastCalibration,
    next_calibration: data.nextCalibration,
    last_maintenance: data.lastMaintenance,
    next_maintenance: data.nextMaintenance,
    description: data.description,
    accessories: data.accessories,
    contacts: data.contacts,
    manager_history: data.managerHistory,
  };
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase.from("devices").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json((data ?? []).map(dbToDevice));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { data, error } = await supabase
      .from("devices")
      .insert(deviceToDb(body))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(dbToDevice(data), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

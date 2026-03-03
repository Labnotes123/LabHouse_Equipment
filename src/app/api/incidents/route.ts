import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function dbToIncident(row: Record<string, unknown>) {
  return {
    id: row.id,
    reportCode: row.report_code,
    deviceId: row.device_id,
    deviceName: row.device_name,
    deviceCode: row.device_code,
    specialty: row.specialty,
    incidentDateTime: row.incident_date_time,
    discoveredBy: row.discovered_by,
    discoveredByRole: row.discovered_by_role,
    supplier: row.supplier,
    description: row.description,
    immediateAction: row.immediate_action,
    supplierAction: row.supplier_action,
    affectsPatientResult: row.affects_patient_result,
    affectedPatientSid: row.affected_patient_sid,
    howAffected: row.how_affected,
    requiresDeviceStop: row.requires_device_stop,
    stopFrom: row.stop_from,
    stopTo: row.stop_to,
    hasProposal: row.has_proposal,
    proposal: row.proposal,
    reportedBy: row.reported_by,
    deviceManager: row.device_manager,
    relatedUsers: row.related_users ?? [],
    status: row.status,
    conclusion: row.conclusion,
    resolvedBy: row.resolved_by,
    resolvedByType: row.resolved_by_type,
    linkedWorkOrderCode: row.linked_work_order_code,
    completionDateTime: row.completion_date_time,
    workOrders: row.work_orders ?? [],
    approvedBy: row.approved_by,
    approvedDate: row.approved_date,
    rejectedBy: row.rejected_by,
    rejectedReason: row.rejected_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function incidentToDb(data: Record<string, unknown>) {
  return {
    report_code: data.reportCode,
    device_id: data.deviceId,
    device_name: data.deviceName,
    device_code: data.deviceCode,
    specialty: data.specialty,
    incident_date_time: data.incidentDateTime,
    discovered_by: data.discoveredBy,
    discovered_by_role: data.discoveredByRole,
    supplier: data.supplier,
    description: data.description,
    immediate_action: data.immediateAction,
    supplier_action: data.supplierAction,
    affects_patient_result: data.affectsPatientResult,
    affected_patient_sid: data.affectedPatientSid,
    how_affected: data.howAffected,
    requires_device_stop: data.requiresDeviceStop,
    stop_from: data.stopFrom,
    stop_to: data.stopTo,
    has_proposal: data.hasProposal,
    proposal: data.proposal,
    reported_by: data.reportedBy,
    device_manager: data.deviceManager,
    related_users: data.relatedUsers,
    status: data.status,
    conclusion: data.conclusion,
    resolved_by: data.resolvedBy,
    resolved_by_type: data.resolvedByType,
    linked_work_order_code: data.linkedWorkOrderCode,
    completion_date_time: data.completionDateTime,
    work_orders: data.workOrders,
    approved_by: data.approvedBy,
    approved_date: data.approvedDate,
    rejected_by: data.rejectedBy,
    rejected_reason: data.rejectedReason,
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("incident_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json((data ?? []).map(dbToIncident));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { data, error } = await supabase
      .from("incident_reports")
      .insert(incidentToDb(body))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(dbToIncident(data), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

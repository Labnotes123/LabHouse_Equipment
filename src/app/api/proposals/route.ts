import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function dbToProposal(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    proposalCode: row.proposal_code,
    necessity: row.necessity,
    deviceRequirements: row.device_requirements ?? [],
    proposedBy: row.proposed_by,
    proposedById: row.proposed_by_id,
    proposedDate: row.proposed_date,
    createdDate: row.created_date,
    status: row.status,
    approvers: row.approvers ?? [],
    approvedBy: row.approved_by,
    approvedDate: row.approved_date,
    rejectedBy: row.rejected_by,
    rejectedDate: row.rejected_date,
    rejectionReason: row.rejection_reason,
    registeredToSystem: row.registered_to_system,
    department: row.department,
  };
}

function proposalToDb(data: Record<string, unknown>) {
  return {
    proposal_code: data.proposalCode,
    necessity: data.necessity,
    device_requirements: data.deviceRequirements,
    proposed_by: data.proposedBy,
    proposed_by_id: data.proposedById,
    proposed_date: data.proposedDate,
    created_date: data.createdDate,
    status: data.status,
    approvers: data.approvers,
    approved_by: data.approvedBy,
    approved_date: data.approvedDate,
    rejected_by: data.rejectedBy,
    rejected_date: data.rejectedDate,
    rejection_reason: data.rejectionReason,
    registered_to_system: data.registeredToSystem,
    department: data.department,
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("new_device_proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json((data ?? []).map(dbToProposal));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { data, error } = await supabase
      .from("new_device_proposals")
      .insert(proposalToDb(body))
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(dbToProposal(data), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function dbToProposal(row: Record<string, unknown>) {
  return {
    id: row.id,
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("new_device_proposals")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(dbToProposal(data));
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
      .from("new_device_proposals")
      .update(proposalToDb(body))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(dbToProposal(data));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("new_device_proposals").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

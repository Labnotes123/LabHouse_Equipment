import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { dbToUser } from "@/lib/user-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const body = await req.json() as {
      username?: string;
      password?: string;
      fullName?: string;
      employeeId?: string;
      phone?: string;
      email?: string;
      position?: string;   // UserProfile.position maps to app_users.role (auth role)
      department?: string;
      branch?: string;
      signature?: string;
      managedDevices?: string[];
      profileIds?: string[];
      isActive?: boolean;
    };

    // Build update object; only include password_hash if a new password was provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (body.username !== undefined)        updates.username        = body.username;
    if (body.fullName !== undefined)        updates.full_name       = body.fullName;
    if (body.employeeId !== undefined)      updates.employee_id     = body.employeeId;
    if (body.phone !== undefined)           updates.phone           = body.phone;
    if (body.email !== undefined)           updates.email           = body.email;
    if (body.position !== undefined) {
      // UserProfile.position = auth role; keep both columns in sync
      updates.role     = body.position;
      updates.position = body.position;
    }
    if (body.department !== undefined)      updates.department      = body.department;
    if (body.branch !== undefined)          updates.branch          = body.branch;
    if (body.signature !== undefined)       updates.signature       = body.signature;
    if (body.managedDevices !== undefined)  updates.managed_devices = body.managedDevices;
    if (body.profileIds !== undefined)      updates.profile_ids     = body.profileIds;
    if (body.isActive !== undefined)        updates.is_active       = body.isActive;

    // Hash new password if provided and non-empty
    if (body.password && body.password.trim() !== "") {
      const { data: hashData, error: hashError } = await supabase
        .rpc("hash_password", { plain_password: body.password });
      if (hashError) throw hashError;
      updates.password_hash = hashData as string;
    }

    const { data, error } = await supabase
      .from("app_users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(dbToUser(data));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("app_users").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

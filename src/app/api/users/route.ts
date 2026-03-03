import { NextRequest, NextResponse } from "next/server";
import { mockUserProfiles, UserProfile } from "@/lib/mockData";

// In-memory store for users
let usersStore: UserProfile[] = [...mockUserProfiles];

// Generate ID for new users
function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    // Sort by created date descending
    const result = [...usersStore].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      username: string;
      password: string;
      fullName: string;
      employeeId?: string;
      phone?: string;
      email?: string;
      position?: string;
      department?: string;
      branch?: string;
      signature?: string;
      managedDevices?: string[];
      profileIds?: string[];
      isActive?: boolean;
    };

    if (!body.username || !body.password || !body.fullName) {
      return NextResponse.json(
        { error: "username, password và fullName là bắt buộc" },
        { status: 400 }
      );
    }

    const newUser: UserProfile = {
      id: generateId(),
      username: body.username,
      password: body.password,
      fullName: body.fullName,
      employeeId: body.employeeId || "",
      phone: body.phone || "",
      email: body.email || "",
      position: body.position || "",
      department: body.department || "",
      branch: body.branch || "",
      signature: body.signature || "",
      managedDevices: body.managedDevices || [],
      profileIds: body.profileIds || [],
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    usersStore = [newUser, ...usersStore];
    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

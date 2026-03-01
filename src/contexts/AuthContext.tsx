"use client";

import React, { createContext, useContext, useState } from "react";

export type UserRole =
  | "Admin"
  | "Giám đốc"
  | "Trưởng phòng xét nghiệm"
  | "Trưởng nhóm"
  | "Kỹ thuật viên"
  | "Quản lý chất lượng"
  | "Quản lý trang thiết bị";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  labName: string;
  setLabName: (name: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock users database
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    fullName: "Nguyễn Văn Admin",
    role: "Admin",
    email: "admin@labhouse.vn",
    phone: "0901234567",
  },
  {
    id: "2",
    username: "giamdoc",
    password: "gd123",
    fullName: "Trần Thị Giám Đốc",
    role: "Giám đốc",
    email: "giamdoc@labhouse.vn",
    phone: "0902345678",
  },
  {
    id: "3",
    username: "truongphong",
    password: "tp123",
    fullName: "Lê Văn Trưởng Phòng",
    role: "Trưởng phòng xét nghiệm",
    email: "truongphong@labhouse.vn",
    phone: "0903456789",
  },
  {
    id: "4",
    username: "ktv",
    password: "ktv123",
    fullName: "Phạm Thị Kỹ Thuật",
    role: "Kỹ thuật viên",
    email: "ktv@labhouse.vn",
    phone: "0904567890",
  },
  {
    id: "5",
    username: "qlcl",
    password: "qlcl123",
    fullName: "Hoàng Văn Chất Lượng",
    role: "Quản lý chất lượng",
    email: "qlcl@labhouse.vn",
    phone: "0905678901",
  },
  {
    id: "6",
    username: "qltb",
    password: "qltb123",
    fullName: "Vũ Thị Thiết Bị",
    role: "Quản lý trang thiết bị",
    email: "qltb@labhouse.vn",
    phone: "0906789012",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [labName, setLabName] = useState("TRUNG TÂM XÉT NGHIỆM Y KHOA LABHOUSE");
  const [logoUrl, setLogoUrl] = useState("");
  const [passwords, setPasswords] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_USERS.map((u) => [u.id, u.password]))
  );

  const login = async (username: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800)); // simulate API call
    const found = MOCK_USERS.find(
      (u) => u.username === username && passwords[u.id] === password
    );
    if (found) {
      const { password: _p, ...userWithoutPass } = found;
      void _p;
      setUser(userWithoutPass);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  const updatePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!user) return false;
    if (passwords[user.id] !== oldPass) return false;
    setPasswords((prev) => ({ ...prev, [user.id]: newPass }));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        updatePassword,
        labName,
        setLabName,
        logoUrl,
        setLogoUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

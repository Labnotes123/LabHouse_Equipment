"use client";

import { useState } from "react";
import {
  Settings,
  Users,
  Building2,
  Cpu,
  Package,
  History,
  Shield,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  FlaskConical,
  ImageIcon,
  Type,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { departments } from "@/lib/mockData";

type AdminSection =
  | "general"
  | "users"
  | "devices"
  | "proposals"
  | "labs"
  | "history";

const sections: { id: AdminSection; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { id: "general", label: "Cấu hình chung", icon: <Settings size={20} />, desc: "Logo, tên lab, cài đặt hệ thống", color: "from-blue-500 to-indigo-600" },
  { id: "users", label: "Cấu hình người dùng", icon: <Users size={20} />, desc: "Quản lý tài khoản và phân quyền", color: "from-purple-500 to-violet-600" },
  { id: "devices", label: "Cấu hình hồ sơ thiết bị", icon: <Cpu size={20} />, desc: "Trường dữ liệu, danh mục thiết bị", color: "from-cyan-500 to-blue-600" },
  { id: "proposals", label: "Cấu hình thiết bị mới", icon: <Package size={20} />, desc: "Quy trình đề xuất và phê duyệt", color: "from-emerald-500 to-teal-600" },
  { id: "labs", label: "Cấu hình phòng lab", icon: <Building2 size={20} />, desc: "Danh sách phòng ban và vị trí", color: "from-orange-500 to-amber-600" },
  { id: "history", label: "Cấu hình lịch sử", icon: <History size={20} />, desc: "Cài đặt ghi nhật ký hành động", color: "from-rose-500 to-pink-600" },
];

const mockUsers = [
  { id: "1", username: "admin", fullName: "Nguyễn Văn Admin", role: "Admin", email: "admin@labhouse.vn", active: true },
  { id: "2", username: "giamdoc", fullName: "Trần Thị Giám Đốc", role: "Giám đốc", email: "giamdoc@labhouse.vn", active: true },
  { id: "3", username: "truongphong", fullName: "Lê Văn Trưởng Phòng", role: "Trưởng phòng xét nghiệm", email: "truongphong@labhouse.vn", active: true },
  { id: "4", username: "ktv", fullName: "Phạm Thị Kỹ Thuật", role: "Kỹ thuật viên", email: "ktv@labhouse.vn", active: true },
  { id: "5", username: "qlcl", fullName: "Hoàng Văn Chất Lượng", role: "Quản lý chất lượng", email: "qlcl@labhouse.vn", active: true },
  { id: "6", username: "qltb", fullName: "Vũ Thị Thiết Bị", role: "Quản lý trang thiết bị", email: "qltb@labhouse.vn", active: true },
];

const roles = ["Admin", "Giám đốc", "Trưởng phòng xét nghiệm", "Trưởng nhóm", "Kỹ thuật viên", "Quản lý chất lượng", "Quản lý trang thiết bị"];

export default function AdminTab() {
  const { user, labName, setLabName, logoUrl, setLogoUrl } = useAuth();
  const { success, error, info } = useToast();
  const [activeSection, setActiveSection] = useState<AdminSection | null>(null);
  const [depts, setDepts] = useState<string[]>(departments);
  const [newDept, setNewDept] = useState("");
  const [editingDept, setEditingDept] = useState<{ idx: number; value: string } | null>(null);
  const [tempLabName, setTempLabName] = useState(labName);
  const [tempLogoUrl, setTempLogoUrl] = useState(logoUrl);

  const canAccess = user?.role === "Admin" || user?.role === "Giám đốc";

  if (!canAccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Shield size={40} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-400 text-sm">Bạn không có quyền truy cập vào trang quản trị</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Type size={18} className="text-blue-600" />
                Tên trung tâm xét nghiệm
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={tempLabName}
                  onChange={(e) => setTempLabName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="Nhập tên trung tâm xét nghiệm"
                />
                <p className="text-xs text-slate-400">Tên này sẽ hiển thị trên màn hình đăng nhập</p>
                <button
                  onClick={() => { setLabName(tempLabName); success("Đã lưu", "Tên trung tâm đã được cập nhật"); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                  style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
                >
                  <Save size={16} />
                  Lưu tên
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-600" />
                Logo hệ thống
              </h3>
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {tempLogoUrl && <img src={tempLogoUrl} alt="Logo xem trước" className="h-16 object-contain rounded-xl border border-slate-200 p-2" />}
                <input
                  type="text"
                  value={tempLogoUrl}
                  onChange={(e) => setTempLogoUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="Nhập URL logo (https://...)"
                />
                <p className="text-xs text-slate-400">Nhập URL hình ảnh logo để hiển thị trên màn hình đăng nhập</p>
                <button
                  onClick={() => { setLogoUrl(tempLogoUrl); success("Đã lưu", "Logo đã được cập nhật"); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                  style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
                >
                  <Save size={16} />
                  Lưu logo
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FlaskConical size={18} className="text-blue-600" />
                Thông tin hệ thống
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Phiên bản", value: "1.0.0" },
                  { label: "Tiêu chuẩn", value: "ISO 15189:2022" },
                  { label: "Quy trình", value: "Số 18 - Quản lý trang thiết bị" },
                  { label: "Đơn vị", value: labName },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Danh sách người dùng</h3>
              <button
                onClick={() => info("Thêm người dùng", "Tính năng đang được phát triển")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
              >
                <Plus size={16} />
                Thêm người dùng
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    {["Tên đăng nhập", "Họ và tên", "Vai trò", "Email", "Trạng thái", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mockUsers.map((u) => (
                    <tr key={u.id} className="table-row-hover">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">{u.username}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-700 text-sm">{u.fullName}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{u.role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-500">{u.email}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          <Check size={12} />
                          Hoạt động
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => info("Chỉnh sửa", `Chỉnh sửa người dùng ${u.fullName}`)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => error("Xóa", `Không thể xóa người dùng ${u.fullName}`)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "labs":
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-orange-600" />
              Danh sách phòng ban / phòng lab
            </h3>
            <div className="space-y-2 mb-4">
              {depts.map((dept, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 group">
                  {editingDept?.idx === idx ? (
                    <>
                      <input
                        type="text"
                        value={editingDept.value}
                        onChange={(e) => setEditingDept({ idx, value: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg border-2 border-orange-300 text-sm focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (editingDept.value.trim()) {
                            setDepts((prev) => prev.map((d, i) => i === idx ? editingDept.value : d));
                            success("Đã cập nhật", `Phòng ban đã được đổi tên thành "${editingDept.value}"`);
                          }
                          setEditingDept(null);
                        }}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingDept(null)} className="p-1.5 rounded-lg bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Building2 size={16} className="text-orange-500 flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium text-slate-700">{dept}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingDept({ idx, value: dept })}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setDepts((prev) => prev.filter((_, i) => i !== idx));
                            success("Đã xóa", `Phòng ban "${dept}" đã được xóa`);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="Tên phòng ban mới..."
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newDept.trim()) {
                    setDepts((prev) => [...prev, newDept.trim()]);
                    success("Đã thêm", `Phòng ban "${newDept}" đã được thêm`);
                    setNewDept("");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newDept.trim()) {
                    setDepts((prev) => [...prev, newDept.trim()]);
                    success("Đã thêm", `Phòng ban "${newDept}" đã được thêm`);
                    setNewDept("");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
              >
                <Plus size={16} />
                Thêm
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <Settings size={48} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 font-medium">Chọn một mục cấu hình từ danh sách bên trái</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            <Settings size={20} className="text-white" />
          </div>
          Quản Trị Hệ Thống
        </h1>
        <p className="text-slate-500 text-sm mt-1">Cấu hình và quản lý hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
                activeSection === section.id
                  ? "bg-white shadow-md border border-slate-200"
                  : "hover:bg-white hover:shadow-sm"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${section.color} flex-shrink-0`}>
                <span className="text-white">{section.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${activeSection === section.id ? "text-slate-800" : "text-slate-600"}`}>
                  {section.label}
                </p>
                <p className="text-xs text-slate-400 truncate">{section.desc}</p>
              </div>
              <ChevronRight size={14} className={`flex-shrink-0 transition-colors ${activeSection === section.id ? "text-blue-500" : "text-slate-300"}`} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection ? (
            <div className="fade-in">
              <div className="flex items-center gap-3 mb-4">
                {sections.find((s) => s.id === activeSection) && (
                  <>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${sections.find((s) => s.id === activeSection)!.color}`}>
                      <span className="text-white">{sections.find((s) => s.id === activeSection)!.icon}</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800">{sections.find((s) => s.id === activeSection)!.label}</h2>
                      <p className="text-xs text-slate-400">{sections.find((s) => s.id === activeSection)!.desc}</p>
                    </div>
                  </>
                )}
              </div>
              {renderSection()}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <Settings size={40} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Chọn mục cấu hình</h3>
              <p className="text-slate-400 text-sm">Chọn một mục từ danh sách bên trái để bắt đầu cấu hình</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

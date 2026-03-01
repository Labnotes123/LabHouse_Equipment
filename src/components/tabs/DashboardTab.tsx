"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Wrench,
  Bell,
  ChevronRight,
  Activity,
  Package,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
} from "lucide-react";
import {
  mockProposals,
  mockIncidents,
  mockSchedules,
  mockDevices,
  formatDate,
} from "@/lib/mockData";
import { useToast } from "@/contexts/ToastContext";

export default function DashboardTab() {
  const { info } = useToast();
  const [activeFilter, setActiveFilter] = useState<"all" | "calibration" | "maintenance">("all");

  const pendingProposals = mockProposals.filter((p) => p.status === "Chờ duyệt");
  const pendingIncidents = mockIncidents.filter((i) => i.status === "Chờ duyệt");
  const overdueSchedules = mockSchedules.filter((s) => s.status === "Quá hạn");
  const activeDevices = mockDevices.filter((d) => d.status === "Đang hoạt động");

  const filteredSchedules = mockSchedules.filter((s) => {
    if (activeFilter === "calibration") return s.type === "Hiệu chuẩn";
    if (activeFilter === "maintenance") return s.type === "Bảo dưỡng";
    return true;
  });

  const stats = [
    {
      label: "Thiết bị hoạt động",
      value: activeDevices.length,
      total: mockDevices.length,
      icon: <Activity size={22} />,
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Chờ duyệt đề xuất",
      value: pendingProposals.length,
      icon: <Package size={22} />,
      color: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Báo cáo sự cố",
      value: pendingIncidents.length,
      icon: <AlertTriangle size={22} />,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Lịch quá hạn",
      value: overdueSchedules.length,
      icon: <AlertCircle size={22} />,
      color: "from-red-500 to-rose-500",
      bg: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    "Chờ thực hiện": { color: "text-blue-600", bg: "bg-blue-50", icon: <Clock size={14} /> },
    "Đã hoàn thành": { color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle size={14} /> },
    "Quá hạn": { color: "text-red-600", bg: "bg-red-50", icon: <AlertCircle size={14} /> },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <TrendingUp size={20} className="text-white" />
            </div>
            Quản Lý Chung
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tổng quan hệ thống và các cảnh báo cần xử lý</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Cập nhật lần cuối</p>
          <p className="text-sm font-semibold text-slate-600">{new Date().toLocaleString("vi-VN")}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <span className={stat.textColor}>{stat.icon}</span>
              </div>
              {stat.total && (
                <span className="text-xs text-slate-400 font-medium">/{stat.total}</span>
              )}
            </div>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Proposals */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Bell size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Chờ duyệt đề xuất thiết bị</h3>
                <p className="text-xs text-slate-400">{pendingProposals.length} đề xuất</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
              {pendingProposals.length}
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingProposals.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                <CheckCircle size={32} className="mx-auto mb-2 text-emerald-300" />
                Không có đề xuất chờ duyệt
              </div>
            ) : (
              pendingProposals.map((p) => (
                <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => info("Xem đề xuất", `Đề xuất ${p.proposalCode}: ${p.deviceName}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm truncate">{p.deviceName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.proposalCode} • {p.proposedBy}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Chờ duyệt
                      </span>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Incidents */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Báo cáo sự cố chờ duyệt</h3>
                <p className="text-xs text-slate-400">{pendingIncidents.length} sự cố</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
              {pendingIncidents.length}
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingIncidents.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                <CheckCircle size={32} className="mx-auto mb-2 text-emerald-300" />
                Không có sự cố chờ duyệt
              </div>
            ) : (
              pendingIncidents.map((inc) => (
                <div key={inc.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => info("Xem sự cố", `Sự cố ${inc.reportCode}: ${inc.deviceName}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm truncate">{inc.deviceName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{inc.reportCode} • {formatDate(inc.incidentDate)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        inc.severity === "Nghiêm trọng" ? "bg-red-100 text-red-700" :
                        inc.severity === "Trung bình" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {inc.severity}
                      </span>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <CalendarCheck size={18} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Lịch hiệu chuẩn & bảo dưỡng</h3>
                <p className="text-xs text-slate-400">Tất cả thiết bị đã lên lịch</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { key: "all", label: "Tất cả", icon: <Calendar size={13} /> },
                { key: "calibration", label: "Hiệu chuẩn", icon: <Activity size={13} /> },
                { key: "maintenance", label: "Bảo dưỡng", icon: <Wrench size={13} /> },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key as typeof activeFilter)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === f.key
                      ? "text-white shadow-sm"
                      : "text-slate-500 bg-slate-100 hover:bg-slate-200"
                  }`}
                  style={activeFilter === f.key ? { background: "linear-gradient(135deg, #2563eb, #7c3aed)" } : {}}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Thiết bị</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Loại</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Ngày lên lịch</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Phụ trách</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSchedules.map((s) => {
                const sc = statusConfig[s.status];
                return (
                  <tr key={s.id} className="table-row-hover">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-700 text-sm">{s.deviceName}</p>
                      <p className="text-xs text-slate-400">{s.deviceCode}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        s.type === "Hiệu chuẩn" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"
                      }`}>
                        {s.type === "Hiệu chuẩn" ? <Activity size={12} /> : <Wrench size={12} />}
                        {s.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600 font-medium">{formatDate(s.scheduledDate)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600">{s.assignedTo}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                        {sc.icon}
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

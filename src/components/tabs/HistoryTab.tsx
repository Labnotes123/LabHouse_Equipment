"use client";

import { useState } from "react";
import {
  History,
  Search,
  Filter,
  Cpu,
  Users,
  Settings,
  Package,
  AlertTriangle,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Hash,
  User,
  Shield,
} from "lucide-react";
import { mockHistoryLogs, HistoryLog, formatDateTime } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";

const targetTypeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  "Thiết bị": { icon: <Cpu size={14} />, color: "text-blue-600", bg: "bg-blue-50" },
  "Người dùng": { icon: <Users size={14} />, color: "text-purple-600", bg: "bg-purple-50" },
  "Hệ thống": { icon: <Settings size={14} />, color: "text-slate-600", bg: "bg-slate-100" },
  "Đề xuất": { icon: <Package size={14} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  "Sự cố": { icon: <AlertTriangle size={14} />, color: "text-red-600", bg: "bg-red-50" },
  "Lịch": { icon: <Calendar size={14} />, color: "text-amber-600", bg: "bg-amber-50" },
};

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700",
  "Giám đốc": "bg-blue-100 text-blue-700",
  "Trưởng phòng xét nghiệm": "bg-indigo-100 text-indigo-700",
  "Trưởng nhóm": "bg-cyan-100 text-cyan-700",
  "Kỹ thuật viên": "bg-green-100 text-green-700",
  "Quản lý chất lượng": "bg-amber-100 text-amber-700",
  "Quản lý trang thiết bị": "bg-orange-100 text-orange-700",
};

export default function HistoryTab() {
  const { user } = useAuth();
  const [logs] = useState<HistoryLog[]>(mockHistoryLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const canAccess = user?.role === "Admin" || user?.role === "Giám đốc" || user?.role === "Trưởng phòng xét nghiệm";

  if (!canAccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Shield size={40} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-400 text-sm">Bạn không có quyền xem lịch sử hành động</p>
        </div>
      </div>
    );
  }

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetName ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filterType === "all" || log.targetType === filterType;
    const matchUser = !filterUser || log.userName.toLowerCase().includes(filterUser.toLowerCase());

    let matchDate = true;
    if (dateFrom) {
      matchDate = matchDate && new Date(log.timestamp) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchDate = matchDate && new Date(log.timestamp) <= new Date(dateTo + "T23:59:59");
    }

    return matchSearch && matchType && matchUser && matchDate;
  });

  const uniqueUsers = [...new Set(logs.map((l) => l.userName))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #64748b, #475569)" }}>
              <History size={20} className="text-white" />
            </div>
            Lịch Sử Hành Động
          </h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi tất cả hoạt động trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            {filtered.length} / {logs.length} bản ghi
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo người dùng, hành động, mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              showFilters ? "text-white shadow-sm" : "text-slate-600 bg-slate-100 hover:bg-slate-200"
            }`}
            style={showFilters ? { background: "linear-gradient(135deg, #64748b, #475569)" } : {}}
          >
            <Filter size={16} />
            Bộ lọc
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Loại đối tượng</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-slate-500 transition-all"
              >
                <option value="all">Tất cả</option>
                {Object.keys(targetTypeConfig).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Người dùng</label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-slate-500 transition-all"
              >
                <option value="">Tất cả</option>
                {uniqueUsers.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-slate-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-slate-500 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Log List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <History size={48} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 font-medium">Không tìm thấy bản ghi nào</p>
          </div>
        ) : (
          filtered
            .sort((a, b) => b.actionNumber - a.actionNumber)
            .map((log) => {
              const tc = targetTypeConfig[log.targetType] ?? targetTypeConfig["Hệ thống"];
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Action Number */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-500">#{log.actionNumber}</span>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-800 text-sm">{log.action}</span>
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>
                                {tc.icon}
                                {log.targetType}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <User size={11} />
                                {log.userName}
                              </span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[log.userRole] ?? "bg-slate-100 text-slate-600"}`}>
                                {log.userRole}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={11} />
                                {formatDateTime(log.timestamp)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{log.actionCode}</span>
                            {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Hash size={11} /> Mã hành động
                          </p>
                          <p className="text-sm font-mono font-bold text-slate-700">{log.actionCode}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <User size={11} /> Người thực hiện
                          </p>
                          <p className="text-sm font-semibold text-slate-700">{log.userName}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Clock size={11} /> Thời gian
                          </p>
                          <p className="text-sm font-semibold text-slate-700">{formatDateTime(log.timestamp)}</p>
                        </div>
                        {log.targetName && (
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Đối tượng</p>
                            <p className="text-sm font-semibold text-slate-700">{log.targetName}</p>
                          </div>
                        )}
                        {log.ipAddress && (
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Địa chỉ IP</p>
                            <p className="text-sm font-mono text-slate-700">{log.ipAddress}</p>
                          </div>
                        )}
                        <div className="bg-slate-50 rounded-xl p-3 md:col-span-3">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Mô tả chi tiết</p>
                          <p className="text-sm text-slate-700">{log.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

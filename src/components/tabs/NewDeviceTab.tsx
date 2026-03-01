"use client";

import { useState } from "react";
import {
  Plus,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  Building2,
  DollarSign,
  User,
  Calendar,
  X,
} from "lucide-react";
import { mockProposals, NewDeviceProposal, formatDate, formatCurrency, departments } from "@/lib/mockData";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

export default function NewDeviceTab() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const [proposals, setProposals] = useState<NewDeviceProposal[]>(mockProposals);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    deviceName: "",
    quantity: 1,
    purpose: "",
    estimatedCost: "",
    department: departments[0],
    notes: "",
  });

  const filtered = proposals.filter((p) => {
    const matchSearch =
      p.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proposalCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSubmit = () => {
    if (!form.deviceName.trim() || !form.purpose.trim() || !form.estimatedCost) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    const newProposal: NewDeviceProposal = {
      id: `p${Date.now()}`,
      proposalCode: `DX-2024-${String(proposals.length + 1).padStart(3, "0")}`,
      deviceName: form.deviceName,
      quantity: form.quantity,
      purpose: form.purpose,
      estimatedCost: Number(form.estimatedCost),
      proposedBy: user?.fullName ?? "Unknown",
      proposedDate: new Date().toISOString().split("T")[0],
      status: "Chờ duyệt",
      department: form.department,
      notes: form.notes,
    };
    setProposals((prev) => [newProposal, ...prev]);
    setForm({ deviceName: "", quantity: 1, purpose: "", estimatedCost: "", department: departments[0], notes: "" });
    setShowForm(false);
    success("Đề xuất thành công", `Đề xuất ${newProposal.proposalCode} đã được gửi chờ duyệt`);
  };

  const handleApprove = (id: string) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "Đã duyệt" as const, approvedBy: user?.fullName, approvedDate: new Date().toISOString().split("T")[0] }
          : p
      )
    );
    success("Đã phê duyệt", "Đề xuất thiết bị đã được phê duyệt thành công");
  };

  const handleReject = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Từ chối" as const } : p))
    );
    error("Đã từ chối", "Đề xuất thiết bị đã bị từ chối");
  };

  const statusConfig = {
    "Chờ duyệt": { color: "text-amber-700", bg: "bg-amber-100", icon: <Clock size={13} /> },
    "Đã duyệt": { color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle size={13} /> },
    "Từ chối": { color: "text-red-700", bg: "bg-red-100", icon: <XCircle size={13} /> },
  };

  const canApprove = user?.role === "Admin" || user?.role === "Giám đốc" || user?.role === "Trưởng phòng xét nghiệm";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}>
              <Package size={20} className="text-white" />
            </div>
            Thiết Bị Mới
          </h1>
          <p className="text-slate-500 text-sm mt-1">Đề xuất và quản lý thiết bị mới</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}
        >
          <Plus size={18} />
          Đề xuất thiết bị mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng đề xuất", value: proposals.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Chờ duyệt", value: proposals.filter((p) => p.status === "Chờ duyệt").length, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Đã duyệt", value: proposals.filter((p) => p.status === "Đã duyệt").length, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm đề xuất..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["all", "Chờ duyệt", "Đã duyệt", "Từ chối"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === s ? "text-white shadow-sm" : "text-slate-500 bg-slate-100 hover:bg-slate-200"
              }`}
              style={filterStatus === s ? { background: "linear-gradient(135deg, #2563eb, #7c3aed)" } : {}}
            >
              {s === "all" ? "Tất cả" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <Package size={48} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 font-medium">Không tìm thấy đề xuất nào</p>
          </div>
        ) : (
          filtered.map((p) => {
            const sc = statusConfig[p.status];
            const isExpanded = expandedId === p.id;
            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800">{p.deviceName}</h3>
                          <span className="text-xs text-slate-400 font-mono">{p.proposalCode}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Building2 size={12} /> {p.department}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <User size={12} /> {p.proposedBy}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(p.proposedDate)}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <DollarSign size={12} /> {formatCurrency(p.estimatedCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                        {sc.icon}
                        {p.status}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Mục đích sử dụng</p>
                        <p className="text-sm text-slate-700">{p.purpose}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Số lượng</p>
                        <p className="text-sm text-slate-700 font-semibold">{p.quantity} thiết bị</p>
                      </div>
                      {p.notes && (
                        <div className="md:col-span-2">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Ghi chú</p>
                          <p className="text-sm text-slate-700">{p.notes}</p>
                        </div>
                      )}
                      {p.approvedBy && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Người phê duyệt</p>
                          <p className="text-sm text-slate-700">{p.approvedBy} • {formatDate(p.approvedDate ?? "")}</p>
                        </div>
                      )}
                    </div>

                    {p.status === "Chờ duyệt" && canApprove && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                        >
                          <CheckCircle size={16} />
                          Phê duyệt
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                        >
                          <XCircle size={16} />
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Proposal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus size={20} className="text-blue-600" />
                Đề xuất thiết bị mới
              </h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={18} className="text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Tên thiết bị *", key: "deviceName", type: "text", placeholder: "Nhập tên thiết bị cần đề xuất" },
                { label: "Mục đích sử dụng *", key: "purpose", type: "textarea", placeholder: "Mô tả mục đích sử dụng thiết bị" },
                { label: "Chi phí dự kiến (VNĐ) *", key: "estimatedCost", type: "number", placeholder: "Nhập chi phí dự kiến" },
                { label: "Số lượng", key: "quantity", type: "number", placeholder: "1" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={form[field.key as keyof typeof form] as string}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.key as keyof typeof form] as string | number}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Phòng ban</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                >
                  {departments.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Ghi chú</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Ghi chú thêm (không bắt buộc)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowForm(false); info("Đã hủy", "Đề xuất thiết bị đã bị hủy"); }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}
                >
                  Gửi đề xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

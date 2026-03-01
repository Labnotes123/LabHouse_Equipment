"use client";

import { useState } from "react";
import {
  Cpu,
  Search,
  Grid3X3,
  List,
  Plus,
  Activity,
  Wrench,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Building2,
  User,
  Calendar,
  ChevronRight,
  X,
  Save,
  Tag,
  Hash,
  Factory,
  DollarSign,
} from "lucide-react";
import { mockDevices, Device, DeviceStatus, formatDate, formatCurrency, departments } from "@/lib/mockData";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig: Record<DeviceStatus, { color: string; bg: string; icon: React.ReactNode; dot: string }> = {
  "Đang hoạt động": { color: "text-emerald-700", bg: "bg-emerald-100", icon: <Activity size={13} />, dot: "bg-emerald-500" },
  "Bảo dưỡng": { color: "text-cyan-700", bg: "bg-cyan-100", icon: <Wrench size={13} />, dot: "bg-cyan-500" },
  "Hỏng": { color: "text-red-700", bg: "bg-red-100", icon: <XCircle size={13} />, dot: "bg-red-500" },
  "Ngừng sử dụng": { color: "text-slate-600", bg: "bg-slate-100", icon: <XCircle size={13} />, dot: "bg-slate-400" },
  "Chờ hiệu chuẩn": { color: "text-amber-700", bg: "bg-amber-100", icon: <Clock size={13} />, dot: "bg-amber-500" },
};

const deviceColors = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
];

export default function DeviceProfileTab() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState<Partial<Device>>({
    code: "",
    name: "",
    model: "",
    manufacturer: "",
    serial: "",
    purchaseDate: "",
    warrantyExpiry: "",
    location: "",
    department: departments[0],
    status: "Đang hoạt động",
    responsiblePerson: user?.fullName ?? "",
    description: "",
  });

  const filtered = devices.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    const matchDept = filterDept === "all" || d.department === filterDept;
    return matchSearch && matchStatus && matchDept;
  });

  const handleAddDevice = () => {
    if (!form.code || !form.name || !form.manufacturer) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc (Mã, Tên, Hãng sản xuất)");
      return;
    }
    const newDevice: Device = {
      id: `d${Date.now()}`,
      code: form.code!,
      name: form.name!,
      model: form.model ?? "",
      manufacturer: form.manufacturer!,
      serial: form.serial ?? "",
      purchaseDate: form.purchaseDate ?? "",
      warrantyExpiry: form.warrantyExpiry ?? "",
      location: form.location ?? "",
      department: form.department ?? departments[0],
      status: form.status ?? "Đang hoạt động",
      responsiblePerson: form.responsiblePerson ?? "",
      description: form.description ?? "",
    };
    setDevices((prev) => [newDevice, ...prev]);
    setShowAddForm(false);
    setForm({ code: "", name: "", model: "", manufacturer: "", serial: "", purchaseDate: "", warrantyExpiry: "", location: "", department: departments[0], status: "Đang hoạt động", responsiblePerson: user?.fullName ?? "", description: "" });
    success("Thêm thành công", `Thiết bị ${newDevice.code} - ${newDevice.name} đã được thêm vào hệ thống`);
  };

  const canManage = user?.role === "Admin" || user?.role === "Quản lý trang thiết bị" || user?.role === "Trưởng phòng xét nghiệm";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
              <Cpu size={20} className="text-white" />
            </div>
            Hồ Sơ Thiết Bị
          </h1>
          <p className="text-slate-500 text-sm mt-1">{devices.length} thiết bị trong hệ thống</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <Plus size={18} />
            Thêm thiết bị
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.keys(statusConfig).map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
        >
          <option value="all">Tất cả phòng ban</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-purple-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-purple-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Device Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((device, idx) => {
            const sc = statusConfig[device.status];
            const colorClass = deviceColors[idx % deviceColors.length];
            return (
              <div
                key={device.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover cursor-pointer"
                onClick={() => setSelectedDevice(device)}
              >
                {/* Card Header */}
                <div className={`h-24 bg-gradient-to-br ${colorClass} relative flex items-center justify-center`}>
                  <Cpu size={40} className="text-white/30" />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{device.code}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {device.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{device.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{device.model} • {device.manufacturer}</p>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{device.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{device.responsiblePerson}</span>
                    </div>
                    {device.nextCalibration && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                        <span>HC tiếp theo: {formatDate(device.nextCalibration)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{device.department}</span>
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {["Mã TB", "Tên thiết bị", "Hãng / Model", "Phòng ban", "Vị trí", "Trạng thái", "HC tiếp theo", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((device) => {
                  const sc = statusConfig[device.status];
                  return (
                    <tr key={device.id} className="table-row-hover cursor-pointer" onClick={() => setSelectedDevice(device)}>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">{device.code}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-700 text-sm">{device.name}</p>
                        <p className="text-xs text-slate-400">{device.serial}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-slate-600">{device.manufacturer}</p>
                        <p className="text-xs text-slate-400">{device.model}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{device.department}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-500">{device.location}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                          {sc.icon}
                          {device.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-500">{formatDate(device.nextCalibration ?? "")}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ChevronRight size={14} className="text-slate-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`p-6 bg-gradient-to-br ${deviceColors[devices.indexOf(selectedDevice) % deviceColors.length]} relative`}>
              <button
                onClick={() => setSelectedDevice(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Cpu size={32} className="text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white/70 bg-white/20 px-2 py-0.5 rounded-full">{selectedDevice.code}</span>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedDevice.name}</h2>
                  <p className="text-white/70 text-sm">{selectedDevice.model} • {selectedDevice.manufacturer}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Status */}
              <div className="flex items-center gap-3 mb-6">
                {(() => {
                  const sc = statusConfig[selectedDevice.status];
                  return (
                    <span className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl ${sc.bg} ${sc.color}`}>
                      {sc.icon}
                      {selectedDevice.status}
                    </span>
                  );
                })()}
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">{selectedDevice.department}</span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: <Hash size={14} />, label: "Số serial", value: selectedDevice.serial },
                  { icon: <Factory size={14} />, label: "Hãng sản xuất", value: selectedDevice.manufacturer },
                  { icon: <MapPin size={14} />, label: "Vị trí", value: selectedDevice.location },
                  { icon: <User size={14} />, label: "Phụ trách", value: selectedDevice.responsiblePerson },
                  { icon: <Calendar size={14} />, label: "Ngày mua", value: formatDate(selectedDevice.purchaseDate) },
                  { icon: <Calendar size={14} />, label: "Hết bảo hành", value: formatDate(selectedDevice.warrantyExpiry) },
                  { icon: <Activity size={14} />, label: "HC lần cuối", value: formatDate(selectedDevice.lastCalibration ?? "") },
                  { icon: <Activity size={14} />, label: "HC tiếp theo", value: formatDate(selectedDevice.nextCalibration ?? "") },
                  { icon: <Wrench size={14} />, label: "BĐ lần cuối", value: formatDate(selectedDevice.lastMaintenance ?? "") },
                  { icon: <Wrench size={14} />, label: "BĐ tiếp theo", value: formatDate(selectedDevice.nextMaintenance ?? "") },
                  ...(selectedDevice.price ? [{ icon: <DollarSign size={14} />, label: "Giá trị", value: formatCurrency(selectedDevice.price) }] : []),
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      {item.icon}
                      <span className="text-xs font-semibold uppercase tracking-wide">{item.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{item.value || "—"}</p>
                  </div>
                ))}
              </div>

              {selectedDevice.description && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Mô tả</p>
                  <p className="text-sm text-slate-700">{selectedDevice.description}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { info("Chức năng", "Tính năng chỉnh sửa đang được phát triển"); }}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                  <Save size={16} />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus size={20} className="text-purple-600" />
                Thêm thiết bị mới
              </h2>
              <button onClick={() => setShowAddForm(false)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={18} className="text-slate-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Mã thiết bị *", key: "code", icon: <Tag size={14} /> },
                  { label: "Tên thiết bị *", key: "name", icon: <Cpu size={14} /> },
                  { label: "Model", key: "model", icon: <Hash size={14} /> },
                  { label: "Hãng sản xuất *", key: "manufacturer", icon: <Factory size={14} /> },
                  { label: "Số serial", key: "serial", icon: <Hash size={14} /> },
                  { label: "Vị trí", key: "location", icon: <MapPin size={14} /> },
                  { label: "Ngày mua", key: "purchaseDate", type: "date" },
                  { label: "Hết bảo hành", key: "warrantyExpiry", type: "date" },
                  { label: "Người phụ trách", key: "responsiblePerson", icon: <User size={14} /> },
                ].map((field) => (
                  <div key={field.key} className={field.key === "name" ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{field.label}</label>
                    <input
                      type={field.type ?? "text"}
                      value={form[field.key as keyof typeof form] as string ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Phòng ban</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  >
                    {departments.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as DeviceStatus }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  >
                    {Object.keys(statusConfig).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Mô tả</label>
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddDevice}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                  Thêm thiết bị
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <AlertTriangle size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="text-slate-400 font-medium">Không tìm thấy thiết bị nào</p>
        </div>
      )}
    </div>
  );
}

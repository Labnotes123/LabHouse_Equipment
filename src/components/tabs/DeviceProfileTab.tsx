"use client";

import { useState, useMemo, useRef, useId } from "react";
import {
  Cpu,
  Search,
  Grid3X3,
  List,
  Plus,
  X,
  Save,
  Tag,
  Hash,
  Factory,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Globe,
  Package,
  Clock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  FileText,
  Download,
  Upload,
  Eye,
  Settings,
  Printer,
  QrCode,
  RotateCcw,
  Wrench,
  ClipboardCheck,
  Truck,
  AlertTriangle,
  History,
  MoreHorizontal,
  Trash2,
  Edit,
  XCircle,
  Check,
} from "lucide-react";
import {
  Device,
  DeviceStatus,
  DeviceContact,
  DeviceAccessory,
  DeviceManagerHistory,
  mockDevices,
  generateDeviceCode,
  formatDate,
  MOCK_USERS_LIST,
  specialties,
  deviceCategories,
  deviceTypes,
  deviceLocations,
  countries,
} from "@/lib/mockData";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

type ViewMode = "grid" | "list";
type SortDirection = "asc" | "desc";

interface Column {
  key: string;
  label: string;
  visible: boolean;
  width?: number;
}

const statusConfig: Record<DeviceStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  "Đăng ký mới": { color: "text-blue-700", bg: "bg-blue-100", icon: <FileText size={13} /> },
  "Chờ vận hành": { color: "text-amber-700", bg: "bg-amber-100", icon: <Clock size={13} /> },
  "Đang vận hành": { color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 size={13} /> },
  "Tạm dừng": { color: "text-red-700", bg: "bg-red-100", icon: <AlertCircle size={13} /> },
  "Tạm điều chuyển": { color: "text-purple-700", bg: "bg-purple-100", icon: <Truck size={13} /> },
  "Ngừng sử dụng": { color: "text-slate-600", bg: "bg-slate-100", icon: <XCircle size={13} /> },
};

const deviceColors = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
];

// Default columns for table view
const defaultColumns: Column[] = [
  { key: "code", label: "Mã thiết bị", visible: true, width: 100 },
  { key: "name", label: "Tên thiết bị", visible: true, width: 200 },
  { key: "model", label: "Model", visible: true, width: 150 },
  { key: "serial", label: "Số serial", visible: true, width: 150 },
  { key: "location", label: "Vị trí", visible: true, width: 180 },
  { key: "manufacturer", label: "Nhà sản xuất", visible: true, width: 150 },
  { key: "yearOfManufacture", label: "Năm sản xuất", visible: true, width: 100 },
  { key: "countryOfOrigin", label: "Xuất xứ", visible: true, width: 100 },
  { key: "distributor", label: "Nhà phân phối", visible: false, width: 150 },
  { key: "contactName", label: "Người liên hệ", visible: false, width: 150 },
  { key: "contactPhone", label: "Số điện thoại", visible: false, width: 120 },
  { key: "contactEmail", label: "Email", visible: false, width: 180 },
  { key: "usageStartDate", label: "Thời gian bắt đầu sử dụng", visible: false, width: 120 },
  { key: "status", label: "Trạng thái", visible: true, width: 120 },
  { key: "actions", label: "Thao tác", visible: true, width: 80 },
];

export default function DeviceProfileTab() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const uniqueId = useId();
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  
  // Table specific states
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [sortColumn, setSortColumn] = useState<string>("code");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  
  // Filter states for each column
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedDeviceForAction, setSelectedDeviceForAction] = useState<Device | null>(null);
  const [deviceCounter, setDeviceCounter] = useState(0);

  // Device registration form
  const [form, setForm] = useState<Partial<Device>>({
    code: "",
    name: "",
    specialty: specialties[0],
    category: deviceCategories[0],
    deviceType: deviceTypes[0],
    model: "",
    serial: "",
    location: deviceLocations[0],
    manufacturer: "",
    countryOfOrigin: "",
    yearOfManufacture: "",
    distributor: "",
    usageStartDate: "",
    usageTime: "",
    installationLocation: "",
    accessories: [],
    contacts: [],
    status: "Đăng ký mới",
    conditionOnReceive: "Máy mới",
    calibrationRequired: false,
    calibrationFrequency: "",
    maintenanceRequired: false,
    maintenanceFrequency: "",
    inspectionRequired: false,
    inspectionFrequency: "",
  });

  // Accessory and contact form states
  const [newAccessory, setNewAccessory] = useState("");
  const [newContact, setNewContact] = useState<Partial<DeviceContact>>({
    fullName: "",
    phone: "",
    email: "",
  });

  // Real-time search filter
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        d.code.toLowerCase().includes(searchLower) ||
        d.serial.toLowerCase().includes(searchLower) ||
        d.model.toLowerCase().includes(searchLower) ||
        d.name.toLowerCase().includes(searchLower);
      
      const matchesStatus = filterStatus === "all" || d.status === filterStatus;
      
      // Column filters
      const matchesFilters = columns
        .filter((col) => col.visible && filters[col.key])
        .every((col) => {
          const value = getDeviceFieldValue(d, col.key);
          return value?.toLowerCase().includes(filters[col.key].toLowerCase());
        });
      
      return matchesSearch && matchesStatus && matchesFilters;
    });
  }, [devices, searchTerm, filterStatus, filters, columns]);

  // Sorting and pagination for table view
  const sortedDevices = useMemo(() => {
    if (viewMode !== "list") return filteredDevices;
    
    return [...filteredDevices].sort((a, b) => {
      const aVal = getDeviceFieldValue(a, sortColumn) || "";
      const bVal = getDeviceFieldValue(b, sortColumn) || "";
      
      if (sortDirection === "asc") {
        return aVal.localeCompare(bVal);
      }
      return bVal.localeCompare(aVal);
    });
  }, [filteredDevices, sortColumn, sortDirection, viewMode]);

  const paginatedDevices = useMemo(() => {
    if (viewMode !== "list" || pageSize === -1) return sortedDevices;
    const start = (currentPage - 1) * pageSize;
    return sortedDevices.slice(start, start + pageSize);
  }, [sortedDevices, currentPage, pageSize, viewMode]);

  const totalPages = Math.ceil(sortedDevices.length / pageSize);

  function getDeviceFieldValue(device: Device, key: string): string {
    switch (key) {
      case "code": return device.code;
      case "name": return device.name;
      case "model": return device.model;
      case "serial": return device.serial;
      case "location": return device.location;
      case "manufacturer": return device.manufacturer;
      case "yearOfManufacture": return device.yearOfManufacture;
      case "countryOfOrigin": return device.countryOfOrigin;
      case "distributor": return device.distributor;
      case "contactName": return device.contacts[0]?.fullName || "";
      case "contactPhone": return device.contacts[0]?.phone || "";
      case "contactEmail": return device.contacts[0]?.email || "";
      case "usageStartDate": return formatDate(device.usageStartDate);
      case "status": return device.status;
      default: return "";
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleAddDevice = () => {
    if (!form.code || !form.name || !form.manufacturer) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Check for duplicate serial
    if (devices.some((d) => d.serial === form.serial)) {
      error("Lỗi", "Số serial đã tồn tại trong hệ thống");
      return;
    }

    const newDeviceId = `${uniqueId}-${deviceCounter}`;
    const newDevice: Device = {
      id: newDeviceId,
      code: form.code!,
      name: form.name!,
      specialty: form.specialty || specialties[0],
      category: form.category || deviceCategories[0],
      deviceType: form.deviceType || deviceTypes[0],
      model: form.model || "",
      serial: form.serial || "",
      location: form.location || deviceLocations[0],
      manufacturer: form.manufacturer!,
      countryOfOrigin: form.countryOfOrigin || "",
      yearOfManufacture: form.yearOfManufacture || "",
      distributor: form.distributor || "",
      managerHistory: [
        {
          userId: user?.id || "1",
          fullName: user?.fullName || "Unknown",
          startDate: new Date().toISOString().split("T")[0],
          isCurrent: true,
        },
      ],
      usageStartDate: form.usageStartDate || "",
      usageTime: form.usageTime || "",
      installationLocation: form.installationLocation || "",
      accessories: form.accessories || [],
      contacts: form.contacts || [],
      status: "Đăng ký mới",
      conditionOnReceive: form.conditionOnReceive || "Máy mới",
      calibrationRequired: form.calibrationRequired || false,
      calibrationFrequency: form.calibrationFrequency,
      maintenanceRequired: form.maintenanceRequired || false,
      maintenanceFrequency: form.maintenanceFrequency,
      inspectionRequired: form.inspectionRequired || false,
      inspectionFrequency: form.inspectionFrequency,
      description: form.description,
    };

    setDevices((prev) => [newDevice, ...prev]);
    setShowAddForm(false);
    resetForm();
    success("Thành công", `Thiết bị ${newDevice.code} - ${newDevice.name} đã được đăng ký`);
  };

  const resetForm = () => {
    setForm({
      code: generateDeviceCode(devices),
      name: "",
      specialty: specialties[0],
      category: deviceCategories[0],
      deviceType: deviceTypes[0],
      model: "",
      serial: "",
      location: deviceLocations[0],
      manufacturer: "",
      countryOfOrigin: "",
      yearOfManufacture: "",
      distributor: "",
      usageStartDate: "",
      usageTime: "",
      installationLocation: "",
      accessories: [],
      contacts: [],
      status: "Đăng ký mới",
      conditionOnReceive: "Máy mới",
      calibrationRequired: false,
      calibrationFrequency: "",
      maintenanceRequired: false,
      maintenanceFrequency: "",
      inspectionRequired: false,
      inspectionFrequency: "",
    });
    setNewAccessory("");
    setNewContact({ fullName: "", phone: "", email: "" });
  };

  const handleAddAccessory = () => {
    if (!newAccessory.trim()) return;
    const accessory: DeviceAccessory = {
      id: `acc${uniqueId}`,
      name: newAccessory,
    };
    setForm((f) => ({
      ...f,
      accessories: [...(f.accessories || []), accessory],
    }));
    setNewAccessory("");
  };

  const handleRemoveAccessory = (id: string) => {
    setForm((f) => ({
      ...f,
      accessories: (f.accessories || []).filter((a) => a.id !== id),
    }));
  };

  const handleAddContact = () => {
    if (!newContact.fullName) return;
    const contact: DeviceContact = {
      id: `c${uniqueId}`,
      fullName: newContact.fullName || "",
      phone: newContact.phone || "",
      email: newContact.email || "",
    };
    setForm((f) => ({
      ...f,
      contacts: [...(f.contacts || []), contact],
    }));
    setNewContact({ fullName: "", phone: "", email: "" });
  };

  const handleRemoveContact = (id: string) => {
    setForm((f) => ({
      ...f,
      contacts: (f.contacts || []).filter((c) => c.id !== id),
    }));
  };

  const handleActionClick = (device: Device, action: string) => {
    setSelectedDeviceForAction(device);
    setShowActionMenu(null);
    
    switch (action) {
      case "receive":
        setActiveModal("receive");
        break;
      case "manage":
        setActiveModal("manage");
        break;
      case "incident":
        setActiveModal("incident");
        break;
      case "calibration":
        setActiveModal("calibration");
        break;
      case "maintenance":
        setActiveModal("maintenance");
        break;
      case "transfer":
        setActiveModal("transfer");
        break;
      case "liquidation":
        setActiveModal("liquidation");
        break;
      default:
        break;
    }
  };

  const handleStatusChange = (deviceId: string, newStatus: DeviceStatus) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d))
    );
    setActiveModal(null);
    setSelectedDeviceForAction(null);
    success("Thành công", `Trạng thái thiết bị đã được cập nhật`);
  };

  const canManage = user?.role === "Admin" || user?.role === "Quản lý trang thiết bị" || user?.role === "Trưởng phòng xét nghiệm";

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

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
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <Plus size={18} />
            Đăng ký thiết bị
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Mã thiết bị, Serial, Model..."
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
          {Object.keys(statusConfig).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-purple-600" : "text-slate-400 hover:text-slate-600"}`}
            title="Dạng thumbnail"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-purple-600" : "text-slate-400 hover:text-slate-600"}`}
            title="Dạng bảng"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Thumbnail View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDevices.map((device, idx) => {
            const sc = statusConfig[device.status];
            const colorClass = deviceColors[idx % deviceColors.length];
            return (
              <div
                key={device.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover cursor-pointer group"
              >
                {/* Card Header */}
                <div className={`h-28 bg-gradient-to-br ${colorClass} relative flex items-center justify-center`}>
                  {device.imageUrl ? (
                    <img src={device.imageUrl} alt={device.name} className="w-full h-full object-cover" />
                  ) : (
                    <Cpu size={48} className="text-white/30" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                      {device.code}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                      {sc.icon}
                      {device.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 truncate">{device.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{device.model} • {device.manufacturer}</p>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{device.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {device.managerHistory?.find((m) => m.isCurrent)?.fullName || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === device.id ? null : device.id)}
                        className="w-full flex items-center justify-center gap-1 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Settings size={14} />
                        Thao tác
                        <ChevronDown size={14} />
                      </button>
                      
                      {showActionMenu === device.id && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden">
                          {[
                            { key: "receive", icon: <ClipboardCheck size={14} />, label: "Tiếp nhận", color: "text-green-600" },
                            { key: "manage", icon: <User size={14} />, label: "Thông tin quản lý", color: "text-blue-600" },
                            { key: "incident", icon: <AlertTriangle size={14} />, label: "Báo cáo sự cố", color: "text-red-600" },
                            { key: "calibration", icon: <Settings size={14} />, label: "Hiệu chuẩn", color: "text-cyan-600" },
                            { key: "maintenance", icon: <Wrench size={14} />, label: "Bảo dưỡng", color: "text-orange-600" },
                            { key: "transfer", icon: <Truck size={14} />, label: "Điều chuyển", color: "text-purple-600" },
                            { key: "liquidation", icon: <XCircle size={14} />, label: "Thanh lý", color: "text-slate-600" },
                          ].map((action) => (
                            <button
                              key={action.key}
                              onClick={() => handleActionClick(device, action.key)}
                              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${action.color}`}
                            >
                              {action.icon}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity p-4 overflow-y-auto z-10">
                  <h3 className="font-bold text-slate-800 text-sm mb-2">{device.name}</h3>
                  <div className="space-y-1 text-xs">
                    <p><span className="font-semibold">Mã:</span> {device.code}</p>
                    <p><span className="font-semibold">Model:</span> {device.model}</p>
                    <p><span className="font-semibold">Serial:</span> {device.serial}</p>
                    <p><span className="font-semibold">Vị trí:</span> {device.location}</p>
                    <p><span className="font-semibold">Hãng:</span> {device.manufacturer}</p>
                    <p><span className="font-semibold">Năm SX:</span> {device.yearOfManufacture}</p>
                    <p><span className="font-semibold">Xuất xứ:</span> {device.countryOfOrigin}</p>
                    <p><span className="font-semibold">Nhà phân phối:</span> {device.distributor}</p>
                    {device.contacts[0] && (
                      <>
                        <p><span className="font-semibold">Liên hệ:</span> {device.contacts[0].fullName}</p>
                        <p><span className="font-semibold">Điện thoại:</span> {device.contacts[0].phone}</p>
                        <p><span className="font-semibold">Email:</span> {device.contacts[0].email}</p>
                      </>
                    )}
                    <p><span className="font-semibold">Bắt đầu SD:</span> {formatDate(device.usageStartDate)}</p>
                    <p><span className="font-semibold">Trạng thái:</span> {device.status}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Table Header with Actions */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                Hiển thị {paginatedDevices.length} / {sortedDevices.length} thiết bị
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
              >
                <option value={5}>5 dòng</option>
                <option value={10}>10 dòng</option>
                <option value={15}>15 dòng</option>
                <option value={20}>20 dòng</option>
                <option value={-1}>Tất cả</option>
              </select>
              <button
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 flex items-center gap-1"
              >
                <Settings size={14} />
                Cấu hình
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 flex items-center gap-1">
                <Download size={14} />
                Excel
              </button>
            </div>
          </div>

          {/* Column Configuration */}
          {showColumnConfig && (
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Cấu hình cột hiển thị</span>
                <button
                  onClick={() => setShowColumnConfig(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {columns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={(e) => {
                        setColumns((prev) =>
                          prev.map((c) =>
                            c.key === col.key ? { ...c, visible: e.target.checked } : c
                          )
                        );
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {columns
                    .filter((col) => col.visible)
                    .map((col) => (
                      <th
                        key={col.key}
                        className="text-left px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-slate-100"
                        style={{ width: col.width }}
                        onClick={() => col.key !== "actions" && handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortColumn === col.key && (
                            <span className="text-purple-600">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                </tr>
                {/* Filter Row */}
                <tr className="bg-slate-50/50">
                  {columns
                    .filter((col) => col.visible)
                    .map((col) => (
                      <th key={col.key} className="px-3 py-2">
                        {col.key !== "actions" && col.key !== "status" && col.key !== "code" && (
                          <input
                            type="text"
                            placeholder={`Lọc...`}
                            value={filters[col.key] || ""}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                [col.key]: e.target.value,
                              }))
                            }
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                          />
                        )}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedDevices.map((device) => {
                  const sc = statusConfig[device.status];
                  return (
                    <tr key={device.id} className="table-row-hover">
                      {columns
                        .filter((col) => col.visible)
                        .map((col) => (
                          <td key={col.key} className="px-3 py-3">
                            {col.key === "code" && (
                              <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">
                                {device.code}
                              </span>
                            )}
                            {col.key === "name" && (
                              <div>
                                <p className="font-semibold text-slate-700 text-sm">{device.name}</p>
                                <p className="text-xs text-slate-400">{device.serial}</p>
                              </div>
                            )}
                            {col.key === "model" && <span className="text-sm text-slate-600">{device.model}</span>}
                            {col.key === "serial" && <span className="text-sm text-slate-500">{device.serial}</span>}
                            {col.key === "location" && <span className="text-xs text-slate-500">{device.location}</span>}
                            {col.key === "manufacturer" && <span className="text-xs text-slate-500">{device.manufacturer}</span>}
                            {col.key === "yearOfManufacture" && <span className="text-xs text-slate-500">{device.yearOfManufacture}</span>}
                            {col.key === "countryOfOrigin" && <span className="text-xs text-slate-500">{device.countryOfOrigin}</span>}
                            {col.key === "distributor" && <span className="text-xs text-slate-500">{device.distributor}</span>}
                            {col.key === "contactName" && (
                              <span className="text-xs text-slate-500">
                                {device.contacts[0]?.fullName || "—"}
                              </span>
                            )}
                            {col.key === "contactPhone" && (
                              <span className="text-xs text-slate-500">
                                {device.contacts[0]?.phone || "—"}
                              </span>
                            )}
                            {col.key === "contactEmail" && (
                              <span className="text-xs text-slate-500">
                                {device.contacts[0]?.email || "—"}
                              </span>
                            )}
                            {col.key === "usageStartDate" && (
                              <span className="text-xs text-slate-500">
                                {formatDate(device.usageStartDate)}
                              </span>
                            )}
                            {col.key === "status" && (
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                                {sc.icon}
                                {device.status}
                              </span>
                            )}
                            {col.key === "actions" && (
                              <div className="relative">
                                <button
                                  onClick={() => setShowActionMenu(showActionMenu === device.id ? null : device.id)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100"
                                >
                                  <MoreHorizontal size={16} className="text-slate-400" />
                                </button>
                                {showActionMenu === device.id && (
                                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden min-w-40">
                                    {[
                                      { key: "receive", icon: <ClipboardCheck size={14} />, label: "Tiếp nhận" },
                                      { key: "manage", icon: <User size={14} />, label: "Thông tin quản lý" },
                                      { key: "incident", icon: <AlertTriangle size={14} />, label: "Báo cáo sự cố" },
                                      { key: "calibration", icon: <Settings size={14} />, label: "Hiệu chuẩn" },
                                      { key: "maintenance", icon: <Wrench size={14} />, label: "Bảo dưỡng" },
                                      { key: "transfer", icon: <Truck size={14} />, label: "Điều chuyển" },
                                      { key: "liquidation", icon: <XCircle size={14} />, label: "Thanh lý" },
                                    ].map((action) => (
                                      <button
                                        key={action.key}
                                        onClick={() => handleActionClick(device, action.key)}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                                      >
                                        {action.icon}
                                        {action.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageSize !== -1 && totalPages > 1 && (
            <div className="p-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Trang {currentPage} / {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
                >
                  Đầu
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
                >
                  Sau
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
                >
                  Cuối
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredDevices.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <AlertTriangle size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="text-slate-400 font-medium">Không tìm thấy thiết bị nào</p>
        </div>
      )}

      {/* Device Registration Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus size={20} className="text-purple-600" />
                Đăng ký thiết bị mới
              </h2>
              <button onClick={() => setShowAddForm(false)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={18} className="text-slate-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-purple-600" />
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Mã thiết bị <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.code || generateDeviceCode(devices)}
                        onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                      />
                      <button
                        onClick={() => setForm((f) => ({ ...f, code: generateDeviceCode(devices) }))}
                        className="px-3 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-50"
                        title="Tạo mã mới"
                      >
                        <RefreshCw size={16} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Tên thiết bị <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Chuyên khoa</label>
                    <select
                      value={form.specialty}
                      onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    >
                      {specialties.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Phân loại</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    >
                      {deviceCategories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Loại thiết bị</label>
                    <select
                      value={form.deviceType}
                      onChange={(e) => setForm((f) => ({ ...f, deviceType: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    >
                      {deviceTypes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Model</label>
                    <input
                      type="text"
                      value={form.model}
                      onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Số serial <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.serial}
                      onChange={(e) => setForm((f) => ({ ...f, serial: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Vị trí</label>
                    <select
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    >
                      {deviceLocations.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Manufacturer Info */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Factory size={16} className="text-purple-600" />
                  Thông tin nhà sản xuất & phân phối
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Nhà sản xuất <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.manufacturer}
                      onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Xuất xứ</label>
                    <input
                      type="text"
                      list="countries"
                      value={form.countryOfOrigin}
                      onChange={(e) => setForm((f) => ({ ...f, countryOfOrigin: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    />
                    <datalist id="countries">
                      {countries.map((c) => <option key={c}>{c}</option>)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Năm sản xuất</label>
                    <select
                      value={form.yearOfManufacture}
                      onChange={(e) => setForm((f) => ({ ...f, yearOfManufacture: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    >
                      <option value="">Chọn năm</option>
                      {yearOptions.map((y) => <option key={y}>{y}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Nhà phân phối</label>
                    <input
                      type="text"
                      value={form.distributor}
                      onChange={(e) => setForm((f) => ({ ...f, distributor: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Usage Info */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-purple-600" />
                  Thông tin sử dụng
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Ngày bắt đầu phụ trách
                    </label>
                    <input
                      type="date"
                      value={form.usageStartDate}
                      onChange={(e) => setForm((f) => ({ ...f, usageStartDate: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Thời gian sử dụng
                    </label>
                    <input
                      type="text"
                      placeholder="ví dụ: 08:00 - 17:00 (8 giờ)"
                      value={form.usageTime}
                      onChange={(e) => setForm((f) => ({ ...f, usageTime: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Vị trí lắp đặt
                    </label>
                    <input
                      type="text"
                      value={form.installationLocation}
                      onChange={(e) => setForm((f) => ({ ...f, installationLocation: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Tình trạng khi nhận máy
                    </label>
                    <select
                      value={form.conditionOnReceive}
                      onChange={(e) => setForm((f) => ({ ...f, conditionOnReceive: e.target.value as any }))}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-700 focus:border-purple-500"
                    >
                      <option value="Máy mới">Máy mới</option>
                      <option value="Đã qua sử dụng">Đã qua sử dụng</option>
                      <option value="Tân trang lại">Tân trang lại</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Maintenance Settings */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Wrench size={16} className="text-purple-600" />
                  Cài đặt bảo trì
                </h3>
                <div className="space-y-4">
                  {/* Hiệu chuẩn */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.calibrationRequired}
                        onChange={(e) => setForm((f) => ({ ...f, calibrationRequired: e.target.checked }))}
                        className="w-5 h-5 rounded text-purple-600"
                      />
                      <span className="font-medium">Hiệu chuẩn</span>
                      {form.calibrationRequired ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                    </label>
                    {form.calibrationRequired && (
                      <input
                        type="text"
                        placeholder="Tần suất (ví dụ: 6 tháng)"
                        value={form.calibrationFrequency}
                        onChange={(e) => setForm((f) => ({ ...f, calibrationFrequency: e.target.value }))}
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm"
                      />
                    )}
                  </div>

                  {/* Bảo trì */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.maintenanceRequired}
                        onChange={(e) => setForm((f) => ({ ...f, maintenanceRequired: e.target.checked }))}
                        className="w-5 h-5 rounded text-purple-600"
                      />
                      <span className="font-medium">Bảo trì</span>
                      {form.maintenanceRequired ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                    </label>
                    {form.maintenanceRequired && (
                      <input
                        type="text"
                        placeholder="Tần suất (ví dụ: 3 tháng)"
                        value={form.maintenanceFrequency}
                        onChange={(e) => setForm((f) => ({ ...f, maintenanceFrequency: e.target.value }))}
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm"
                      />
                    )}
                  </div>

                  {/* Kiểm tra */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.inspectionRequired}
                        onChange={(e) => setForm((f) => ({ ...f, inspectionRequired: e.target.checked }))}
                        className="w-5 h-5 rounded text-purple-600"
                      />
                      <span className="font-medium">Kiểm tra</span>
                      {form.inspectionRequired ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                    </label>
                    {form.inspectionRequired && (
                      <input
                        type="text"
                        placeholder="Tần suất (ví dụ: 1 năm)"
                        value={form.inspectionFrequency}
                        onChange={(e) => setForm((f) => ({ ...f, inspectionFrequency: e.target.value }))}
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Phone size={16} className="text-purple-600" />
                  Người liên hệ
                </h3>
                <div className="space-y-3">
                  {form.contacts?.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contact.fullName}</p>
                        <p className="text-xs text-slate-500">{contact.phone} • {contact.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveContact(contact.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Họ tên"
                      value={newContact.fullName}
                      onChange={(e) => setNewContact((c) => ({ ...c, fullName: e.target.value }))}
                      className="px-3 py-2 rounded-xl border-2 border-slate-200 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      value={newContact.phone}
                      onChange={(e) => setNewContact((c) => ({ ...c, phone: e.target.value }))}
                      className="px-3 py-2 rounded-xl border-2 border-slate-200 text-sm"
                    />
                    <div className="flex gap-1">
                      <input
                        type="email"
                        placeholder="Email"
                        value={newContact.email}
                        onChange={(e) => setNewContact((c) => ({ ...c, email: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 text-sm"
                      />
                      <button
                        onClick={handleAddContact}
                        className="px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accessories */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Package size={16} className="text-purple-600" />
                  Phụ kiện đính kèm
                </h3>
                <div className="space-y-2">
                  {form.accessories?.map((acc) => (
                    <div key={acc.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                      <span className="flex-1 text-sm">{acc.name}</span>
                      <button
                        onClick={() => handleRemoveAccessory(acc.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Thêm phụ kiện..."
                      value={newAccessory}
                      onChange={(e) => setNewAccessory(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddAccessory()}
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 text-sm"
                    />
                    <button
                      onClick={handleAddAccessory}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white rounded-b-3xl">
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
                Đăng ký thiết bị
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {activeModal && selectedDeviceForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {activeModal === "receive" && "Tiếp nhận thiết bị"}
                {activeModal === "manage" && "Thông tin quản lý"}
                {activeModal === "incident" && "Báo cáo sự cố"}
                {activeModal === "calibration" && "Hiệu chuẩn"}
                {activeModal === "maintenance" && "Bảo dưỡng"}
                {activeModal === "transfer" && "Điều chuyển thiết bị"}
                {activeModal === "liquidation" && "Thanh lý thiết bị"}
              </h2>
              <button onClick={() => { setActiveModal(null); setSelectedDeviceForAction(null); }} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200">
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Device Info */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-700">{selectedDeviceForAction.name}</p>
                <p className="text-sm text-slate-500">
                  {selectedDeviceForAction.code} • {selectedDeviceForAction.serial}
                </p>
                <p className="text-xs text-slate-400 mt-1">Trạng thái: {selectedDeviceForAction.status}</p>
              </div>

              {/* Receive Modal Content */}
              {activeModal === "receive" && (
                <div className="space-y-4">
                  {selectedDeviceForAction.status === "Đăng ký mới" ? (
                    <>
                      <p className="text-sm text-slate-600">
                        Thiết bị đang ở trạng thái "Đăng ký mới". Bạn cần hoàn tất checklist tiếp nhận để chuyển trạng thái sang "Chờ vận hành".
                      </p>
                      <div className="space-y-3">
                        {[
                          { label: "Phiếu phê duyệt", required: true },
                          { label: "Biên bản bàn giao/tiếp nhận", required: true },
                          { label: "Khảo sát điều kiện lắp đặt", required: true },
                          { label: "Tài liệu sử dụng", required: true },
                          { label: "CO (Chứng nhận nguồn gốc)", required: true },
                          { label: "CQ (Chứng nhận chất lượng)", required: true },
                          { label: "Hợp đồng", required: true },
                          { label: "Biên bản lắp đặt", required: true },
                          { label: "Xác nhận giá trị sử dụng", required: false },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <Circle size={20} className="text-slate-300" />
                            <span className="flex-1 text-sm">{item.label}</span>
                            {item.required && <span className="text-xs text-red-500">Bắt buộc</span>}
                            <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded">
                              <Upload size={14} />
                            </button>
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                              <Eye size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleStatusChange(selectedDeviceForAction.id, "Chờ vận hành")}
                        className="w-full py-3 rounded-xl text-white font-bold text-sm"
                        style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
                      >
                        Hoàn tất tiếp nhận
                      </button>
                    </>
                  ) : selectedDeviceForAction.status === "Tạm điều chuyển" ? (
                    <>
                      <p className="text-sm text-slate-600">
                        Thiết bị đang ở trạng thái "Tạm điều chuyển". Bạn cần hoàn tất thủ tục tiếp nhận trở lại.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Circle size={20} className="text-slate-300" />
                          <span className="flex-1 text-sm">Phiếu bàn giao</span>
                          <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded">
                            <Upload size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Circle size={20} className="text-slate-300" />
                          <span className="flex-1 text-sm">Phiếu tiếp nhận</span>
                          <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStatusChange(selectedDeviceForAction.id, "Đang vận hành")}
                        className="w-full py-3 rounded-xl text-white font-bold text-sm"
                        style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
                      >
                        Hoàn tất tiếp nhận trở lại
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Thiết bị đang ở trạng thái "{selectedDeviceForAction.status}". Chức năng tiếp nhận chỉ áp dụng cho thiết bị "Đăng ký mới" hoặc "Tạm điều chuyển".
                    </p>
                  )}
                </div>
              )}

              {/* Manage Modal Content */}
              {activeModal === "manage" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <button className="w-full p-3 text-left bg-slate-50 rounded-xl hover:bg-slate-100 flex items-center gap-3">
                      <History size={18} className="text-blue-600" />
                      <span>Xem lý lịch thiết bị (BM.03.QL.TC.018)</span>
                    </button>
                    <button className="w-full p-3 text-left bg-slate-50 rounded-xl hover:bg-slate-100 flex items-center gap-3">
                      <User size={18} className="text-green-600" />
                      <span>Thay đổi người quản lý</span>
                    </button>
                    <button className="w-full p-3 text-left bg-slate-50 rounded-xl hover:bg-slate-100 flex items-center gap-3">
                      <Printer size={18} className="text-purple-600" />
                      <span>In nhãn thiết bị</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Other Modals - Placeholder */}
              {["incident", "calibration", "maintenance", "transfer", "liquidation"].includes(activeModal) && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    {activeModal === "incident" && <AlertTriangle size={32} className="text-red-500" />}
                    {activeModal === "calibration" && <Settings size={32} className="text-cyan-500" />}
                    {activeModal === "maintenance" && <Wrench size={32} className="text-orange-500" />}
                    {activeModal === "transfer" && <Truck size={32} className="text-purple-500" />}
                    {activeModal === "liquidation" && <XCircle size={32} className="text-slate-500" />}
                  </div>
                  <p className="text-slate-600 mb-4">
                    Chức năng "{activeModal}" đang được phát triển.
                  </p>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setSelectedDeviceForAction(null);
                    }}
                    className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add RefreshCw icon import if not present - using a workaround
function RefreshCw({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

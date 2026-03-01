/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
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
  ChevronUp,
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
  Image,
  Paperclip,
  CheckSquare,
  Square,
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
  { key: "status", label: "Trạng thái", visible: true, width: 120 },
  { key: "actions", label: "Thao tác", visible: true, width: 80 },
];

export default function DeviceProfileTab() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const uniqueId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accessoryFileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(10);
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
  const [newAccessoryFile, setNewAccessoryFile] = useState<{ name: string; url: string } | null>(null);
  const [newContact, setNewContact] = useState<Partial<DeviceContact>>({
    fullName: "",
    phone: "",
    email: "",
  });
  
  // Device photo
  const [devicePhoto, setDevicePhoto] = useState<{ name: string; url: string } | null>(null);
  
  // Search states for dropdowns
  const [countrySearch, setCountrySearch] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  
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
      
      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, filterStatus]);
  
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
      imageUrl: devicePhoto?.url,
    };
    
    setDevices((prev) => [newDevice, ...prev]);
    setShowAddForm(false);
    resetForm();
    setDeviceCounter(deviceCounter + 1);
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
    setNewAccessoryFile(null);
    setNewContact({ fullName: "", phone: "", email: "" });
    setDevicePhoto(null);
    setCountrySearch("");
    setManagerSearch("");
  };
  
  const handleAddAccessory = () => {
    if (!newAccessory.trim()) return;
    const accessory: DeviceAccessory = {
      id: `acc${uniqueId}`,
      name: newAccessory,
      fileUrl: newAccessoryFile?.url,
      fileName: newAccessoryFile?.name,
    };
    setForm((f) => ({
      ...f,
      accessories: [...(f.accessories || []), accessory],
    }));
    setNewAccessory("");
    setNewAccessoryFile(null);
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
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDevicePhoto({
          name: file.name,
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAccessoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAccessoryFile({
          name: file.name,
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Filtered countries for dropdown
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);
  
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
      
      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDevices.map((device, idx) => {
            const sc = statusConfig[device.status];
            const colorClass = deviceColors[idx % deviceColors.length];
            return (
              <div
                key={device.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover cursor-pointer group"
                onClick={() => setSelectedDevice(device)}
              >
                {/* Card Header */}
                <div className={`h-32 bg-gradient-to-br ${colorClass} relative flex items-center justify-center`}>
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
                      <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                      {formatDate(device.usageStartDate)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  col.visible && (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      style={{ width: col.width }}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.key !== "actions" && (
                          <button
                            onClick={() => handleSort(col.key)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {sortColumn === col.key ? (
                              sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </th>
                  )
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDevices.length > 0 ? (
                paginatedDevices.map((device) => (
                  <tr 
                    key={device.id} 
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedDevice(device)}
                  >
                    {columns.map((col) => (
                      col.visible && (
                        <td key={col.key} className="px-4 py-3 text-sm text-slate-600">
                          {col.key === "status" ? (
                            <span className={`${statusConfig[device.status].bg} ${statusConfig[device.status].color} py-0.5 px-2 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                              {statusConfig[device.status].icon}
                              {device.status}
                            </span>
                          ) : (
                            getDeviceFieldValue(device, col.key)
                          )}
                        </td>
                      )
                    ))}
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDevice(device);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.filter(c => c.visible).length + 1} className="px-4 py-8 text-center text-slate-500">
                    Không có thiết bị nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {viewMode === "list" && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Hiển thị {paginatedDevices.length}/{sortedDevices.length} thiết bị
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="rotate-180" size={16} />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${currentPage === page ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDevice(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Chi tiết thiết bị</h2>
              <button onClick={() => setSelectedDevice(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Image */}
                <div>
                  <div className="aspect-video bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
                    {selectedDevice.imageUrl ? (
                      <img src={selectedDevice.imageUrl} alt={selectedDevice.name} className="w-full h-full object-cover" />
                    ) : (
                      <Cpu size={64} className="text-white/30" />
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${statusConfig[selectedDevice.status].bg} ${statusConfig[selectedDevice.status].color}`}>
                        {statusConfig[selectedDevice.status].icon}
                        {selectedDevice.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedDevice.name}</h3>
                    <p className="text-slate-500">{selectedDevice.model}</p>
                  </div>
                </div>
                
                {/* Right Column - Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500">Mã thiết bị</label>
                      <p className="font-medium text-slate-800">{selectedDevice.code}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Số serial</label>
                      <p className="font-medium text-slate-800">{selectedDevice.serial}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Chuyên khoa</label>
                      <p className="font-medium text-slate-800">{selectedDevice.specialty}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Phân loại</label>
                      <p className="font-medium text-slate-800">{selectedDevice.category}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Loại thiết bị</label>
                      <p className="font-medium text-slate-800">{selectedDevice.deviceType}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Nhà sản xuất</label>
                      <p className="font-medium text-slate-800">{selectedDevice.manufacturer}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Xuất xứ</label>
                      <p className="font-medium text-slate-800">{selectedDevice.countryOfOrigin}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Năm sản xuất</label>
                      <p className="font-medium text-slate-800">{selectedDevice.yearOfManufacture}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Vị trí</label>
                      <p className="font-medium text-slate-800">{selectedDevice.location}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Nhà phân phối</label>
                      <p className="font-medium text-slate-800">{selectedDevice.distributor}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Tình trạng khi nhận</label>
                      <p className="font-medium text-slate-800">{selectedDevice.conditionOnReceive}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Thời gian sử dụng</label>
                      <p className="font-medium text-slate-800">{selectedDevice.usageTime || "—"}</p>
                    </div>
                  </div>
                  
                  {/* Manager History */}
                  {selectedDevice.managerHistory && selectedDevice.managerHistory.length > 0 && (
                    <div className="mt-4">
                      <label className="text-xs text-slate-500 block mb-2">Lịch sử người phụ trách</label>
                      <div className="space-y-2">
                        {selectedDevice.managerHistory.map((manager, idx) => (
                          <div key={idx} className={`p-3 rounded-lg ${manager.isCurrent ? "bg-purple-50 border border-purple-200" : "bg-slate-50"}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800">{manager.fullName}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${manager.isCurrent ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-600"}`}>
                                {manager.isCurrent ? "Người phụ trách hiện tại" : "Ngừng phụ trách"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Từ: {formatDate(manager.startDate)}
                              {manager.endDate && ` - ${formatDate(manager.endDate)}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Contacts */}
                  {selectedDevice.contacts && selectedDevice.contacts.length > 0 && (
                    <div className="mt-4">
                      <label className="text-xs text-slate-500 block mb-2">Người liên hệ</label>
                      <div className="space-y-2">
                        {selectedDevice.contacts.map((contact, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium text-slate-800">{contact.fullName}</p>
                            <p className="text-xs text-slate-500">{contact.phone} • {contact.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Maintenance Info */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className={`p-3 rounded-lg ${selectedDevice.calibrationRequired ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Settings size={12} />
                        Hiệu chuẩn
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedDevice.calibrationRequired ? selectedDevice.calibrationFrequency || "Có" : "Không"}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${selectedDevice.maintenanceRequired ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Wrench size={12} />
                        Bảo trì
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedDevice.maintenanceRequired ? selectedDevice.maintenanceFrequency || "Có" : "Không"}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${selectedDevice.inspectionRequired ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <ClipboardCheck size={12} />
                        Kiểm tra
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedDevice.inspectionRequired ? selectedDevice.inspectionFrequency || "Có" : "Không"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Device Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Đăng ký thiết bị mới</h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã thiết bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    placeholder="TB-XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tên thiết bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    placeholder="Nhập tên thiết bị"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chuyên khoa</label>
                  <select
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    {deviceCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại thiết bị</label>
                  <select
                    value={form.deviceType}
                    onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    {deviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    placeholder="Nhập model"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Số serial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.serial}
                    onChange={(e) => setForm({ ...form, serial: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    placeholder="Nhập số serial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí</label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    {deviceLocations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Manufacturer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nhà sản xuất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.manufacturer}
                    onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    placeholder="Nhập tên nhà sản xuất"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Xuất xứ</label>
                  <input
                    type="text"
                    value={form.countryOfOrigin}
                    onChange={(e) => {
                      setForm({ ...form, countryOfOrigin: e.target.value });
                      setCountrySearch(e.target.value);
                      setShowCountryDropdown(true);
                    }}
                    onFocus={() => setShowCountryDropdown(true)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    placeholder="Tìm kiếm xuất xứ"
                  />
                  {showCountryDropdown && filteredCountries.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredCountries.map(c => (
                        <button
                          key={c}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                          onClick={() => {
                            setForm({ ...form, countryOfOrigin: c });
                            setShowCountryDropdown(false);
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Năm sản xuất</label>
                  <select
                    value={form.yearOfManufacture}
                    onChange={(e) => setForm({ ...form, yearOfManufacture: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="">Chọn năm</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Distributor & Usage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhà phân phối</label>
                  <input
                    type="text"
                    value={form.distributor}
                    onChange={(e) => setForm({ ...form, distributor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    placeholder="Nhập tên nhà phân phối"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu sử dụng</label>
                  <input
                    type="date"
                    value={form.usageStartDate}
                    onChange={(e) => setForm({ ...form, usageStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian sử dụng</label>
                  <input
                    type="text"
                    value={form.usageTime}
                    onChange={(e) => setForm({ ...form, usageTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    placeholder="VD: 08:00 - 17:00 (8 giờ)"
                  />
                </div>
              </div>
              
              {/* Installation Location & Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí lắp đặt</label>
                  <select
                    value={form.installationLocation}
                    onChange={(e) => setForm({ ...form, installationLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="">Chọn vị trí lắp đặt</option>
                    {deviceLocations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tình trạng khi nhận máy</label>
                  <select
                    value={form.conditionOnReceive}
                    onChange={(e) => setForm({ ...form, conditionOnReceive: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="Máy mới">Máy mới</option>
                    <option value="Đã qua sử dụng">Đã qua sử dụng</option>
                    <option value="Tân trang lại">Tân trang lại</option>
                  </select>
                </div>
              </div>
              
              {/* Device Photo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh chụp thiết bị</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                    {devicePhoto ? (
                      <img src={devicePhoto.url} alt="Device preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image size={32} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Chọn ảnh
                    </button>
                    <p className="text-xs text-slate-500 mt-1">Chọn ảnh chính diện của thiết bị</p>
                  </div>
                </div>
              </div>
              
              {/* Maintenance & Calibration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Calibration */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Hiệu chuẩn</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, calibrationRequired: !form.calibrationRequired, calibrationFrequency: form.calibrationRequired ? "" : form.calibrationFrequency })}
                      className={`p-1 rounded ${form.calibrationRequired ? "text-green-600" : "text-slate-400"}`}
                    >
                      {form.calibrationRequired ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </div>
                  {form.calibrationRequired && (
                    <input
                      type="text"
                      value={form.calibrationFrequency}
                      onChange={(e) => setForm({ ...form, calibrationFrequency: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      placeholder="VD: 6 tháng, 1 năm"
                    />
                  )}
                </div>
                
                {/* Maintenance */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Bảo trì</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, maintenanceRequired: !form.maintenanceRequired, maintenanceFrequency: form.maintenanceRequired ? "" : form.maintenanceFrequency })}
                      className={`p-1 rounded ${form.maintenanceRequired ? "text-green-600" : "text-slate-400"}`}
                    >
                      {form.maintenanceRequired ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </div>
                  {form.maintenanceRequired && (
                    <input
                      type="text"
                      value={form.maintenanceFrequency}
                      onChange={(e) => setForm({ ...form, maintenanceFrequency: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      placeholder="VD: 3 tháng, 6 tháng"
                    />
                  )}
                </div>
                
                {/* Inspection */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Kiểm tra</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, inspectionRequired: !form.inspectionRequired, inspectionFrequency: form.inspectionRequired ? "" : form.inspectionFrequency })}
                      className={`p-1 rounded ${form.inspectionRequired ? "text-green-600" : "text-slate-400"}`}
                    >
                      {form.inspectionRequired ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </div>
                  {form.inspectionRequired && (
                    <input
                      type="text"
                      value={form.inspectionFrequency}
                      onChange={(e) => setForm({ ...form, inspectionFrequency: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      placeholder="VD: 1 năm"
                    />
                  )}
                </div>
              </div>
              
              {/* Accessories */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phụ kiện đính kèm</label>
                <div className="space-y-2 mb-3">
                  {form.accessories?.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip size={16} className="text-slate-400" />
                        <span className="text-sm">{acc.name}</span>
                        {acc.fileName && <span className="text-xs text-slate-500">({acc.fileName})</span>}
                      </div>
                      <button type="button" onClick={() => handleRemoveAccessory(acc.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAccessory}
                    onChange={(e) => setNewAccessory(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Nhập tên phụ kiện"
                  />
                  <input
                    ref={accessoryFileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleAccessoryFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => accessoryFileInputRef.current?.click()}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                    title="Đính kèm file"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAccessory}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                  >
                    Thêm
                  </button>
                </div>
              </div>
              
              {/* Contacts */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Người liên hệ</label>
                <div className="space-y-2 mb-3">
                  {form.contacts?.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium">{contact.fullName}</span>
                        <span className="text-xs text-slate-500 ml-2">{contact.phone} • {contact.email}</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveContact(contact.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    value={newContact.fullName}
                    onChange={(e) => setNewContact({ ...newContact, fullName: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Họ tên"
                  />
                  <input
                    type="text"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Số điện thoại"
                  />
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="Email"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="w-full px-4 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  + Thêm người liên hệ
                </button>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAddDevice}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Lưu thiết bị
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



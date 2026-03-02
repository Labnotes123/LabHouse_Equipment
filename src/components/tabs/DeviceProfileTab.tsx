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
  Gauge,
  ArrowRightLeft,
  FileCheck,
  FilePlus,
  ClipboardList,
  Send,
  MessageSquare,
  Contact,
  Users,
  Briefcase,
  Building2,
  Link,
  File,
  EyeIcon,
  Filter,
  RefreshCw,
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
  mockIncidents,
  IncidentReport,
  WorkOrder,
  AttachedFile,
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

// Action button configuration with icons and colors
const actionButtons = [
  { key: "accept", label: "Tiếp nhận", icon: ClipboardCheck, color: "emerald", bg: "bg-emerald-500", hover: "hover:bg-emerald-600" },
  { key: "info", label: "Thông tin quản lý", icon: Settings, color: "blue", bg: "bg-blue-500", hover: "hover:bg-blue-600" },
  { key: "incident", label: "Báo cáo sự cố", icon: AlertTriangle, color: "red", bg: "bg-red-500", hover: "hover:bg-red-600" },
  { key: "calibration", label: "Hiệu chuẩn", icon: Gauge, color: "purple", bg: "bg-purple-500", hover: "hover:bg-purple-600" },
  { key: "maintenance", label: "Bảo dưỡng", icon: Wrench, color: "orange", bg: "bg-orange-500", hover: "hover:bg-orange-600" },
  { key: "transfer", label: "Điều chuyển", icon: ArrowRightLeft, color: "cyan", bg: "bg-cyan-500", hover: "hover:bg-cyan-600" },
  { key: "dispose", label: "Thanh lý", icon: Trash2, color: "slate", bg: "bg-slate-500", hover: "hover:bg-slate-600" },
];

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
  { key: "yearOfManufacture", label: "Năm SX", visible: true, width: 80 },
  { key: "countryOfOrigin", label: "Xuất xứ", visible: true, width: 100 },
  { key: "distributor", label: "Nhà phân phối", visible: false, width: 180 },
  { key: "contactPerson", label: "Người liên hệ", visible: false, width: 140 },
  { key: "phone", label: "Điện thoại", visible: false, width: 110 },
  { key: "email", label: "Email", visible: false, width: 180 },
  { key: "usageStartDate", label: "Ngày SD", visible: false, width: 100 },
  { key: "image", label: "Hình ảnh", visible: false, width: 80 },
  { key: "status", label: "Trạng thái", visible: true, width: 130 },
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
  
  // Incident Report states
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(mockIncidents);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showSupplierContact, setShowSupplierContact] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [incidentTab, setIncidentTab] = useState<"reports" | "work-orders">("reports");
  const [incidentCounter, setIncidentCounter] = useState(2); // Current max number for PSC-XXXX-XXX
  const [workOrderCounter, setWorkOrderCounter] = useState(1); // Current max number for WO-XXX
  
  // Incident form state
  const [incidentForm, setIncidentForm] = useState<Partial<IncidentReport>>({
    deviceId: "",
    deviceName: "",
    deviceCode: "",
    specialty: "",
    incidentDateTime: "",
    discoveredBy: "",
    discoveredByRole: "",
    supplier: "",
    description: "",
    immediateAction: "",
    supplierAction: "",
    affectsPatientResult: false,
    affectedPatientSid: "",
    howAffected: "",
    requiresDeviceStop: false,
    stopFrom: "",
    stopTo: "",
    hasProposal: false,
    proposal: "",
    reportedBy: "",
    deviceManager: "",
    relatedUsers: [],
    status: "Nháp",
    workOrders: [],
  });
  
  // Work order form state
  const [workOrderForm, setWorkOrderForm] = useState<Partial<WorkOrder>>({
    contactPerson: "",
    contactMethod: "điện thoại",
    startDateTime: "",
    endDateTime: "",
    actionDescription: "",
    notes: "",
    attachments: [],
    status: "Mở",
    isCompleted: false,
  });
  
  // Search states for incident reports
  const [incidentSearchTerm, setIncidentSearchTerm] = useState("");
  const [incidentFilterStatus, setIncidentFilterStatus] = useState<string>("all");
  
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
  
  // Info submenu state
  const [infoSubmenu, setInfoSubmenu] = useState<"history" | "change-manager" | "change-contact" | "print-label" | null>(null);
  const [showInfoDropdown, setShowInfoDropdown] = useState<string | null>(null);
  
  // Change manager state
  const [newManagerSearch, setNewManagerSearch] = useState("");
  const [newManagerStartDate, setNewManagerStartDate] = useState("");
  const [showManagerSearchDropdown, setShowManagerSearchDropdown] = useState(false);
  const [selectedNewManager, setSelectedNewManager] = useState<{ id: string; fullName: string } | null>(null);
  
  // Print label state
  const [showQRCode, setShowQRCode] = useState(true);
  const [showLabelInfo, setShowLabelInfo] = useState(true);
  
  // Edit contact state
  const [editingContact, setEditingContact] = useState<Partial<DeviceContact>>(() => {
    // Initialize with existing contact if available
    if (selectedDevice) {
      const existingContact = selectedDevice.contacts?.[0];
      if (existingContact) {
        return {
          fullName: existingContact.fullName,
          phone: existingContact.phone,
          email: existingContact.email,
          address: existingContact.address || "",
        };
      }
    }
    return { fullName: "", phone: "", email: "", address: "" };
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
  
  // Acceptance checklist state
  const [acceptanceChecklist, setAcceptanceChecklist] = useState({
    approvalForm: false,
    handoverRecord: false,
    installationSurvey: false,
    userManual: false,
    co: false,
    cq: false,
    contract: false,
    installationReport: false,
    usageConfirmation: false,
  });
  
  // Acceptance document attachments
  const [acceptanceDocuments, setAcceptanceDocuments] = useState<Record<string, { name: string; url: string }[]>>({});
  
  // Return acceptance state
  const [returnAcceptance, setReturnAcceptance] = useState({
    handoverForm: false,
    acceptanceForm: false,
  });
  
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
  
  // Sorting, filtering and pagination for table view
  const sortedDevices = useMemo(() => {
    if (viewMode !== "list") return filteredDevices;
    
    let result = [...filteredDevices];
    
    // Apply column filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(device => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const deviceValue = getDeviceFieldValue(device, key);
          if (typeof deviceValue === 'string') {
            return deviceValue.toLowerCase().includes(value.toLowerCase());
          }
          return true;
        });
      });
    }
    
    // Apply sorting
    return result.sort((a, b) => {
      const aVal = getDeviceFieldValue(a, sortColumn);
      const bVal = getDeviceFieldValue(b, sortColumn);
      
      const aStr = typeof aVal === 'string' ? aVal : '';
      const bStr = typeof bVal === 'string' ? bVal : '';
      
      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [filteredDevices, sortColumn, sortDirection, viewMode, filters]);

  // Export to Excel function
  const exportToExcel = () => {
    const visibleColumns = columns.filter(c => c.visible && c.key !== 'actions');
    const headers = visibleColumns.map(c => c.label);
    const rows = sortedDevices.map(device => {
      return visibleColumns.map(col => {
        const value = getDeviceFieldValue(device, col.key);
        return typeof value === 'string' ? value : '';
      });
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Danh_sach_thiet_bi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    success('Xuất file thành công', 'Danh sách thiết bị đã được xuất ra file Excel');
  };
  
  const paginatedDevices = useMemo(() => {
    if (viewMode !== "list" || pageSize === -1) return sortedDevices;
    const start = (currentPage - 1) * pageSize;
    return sortedDevices.slice(start, start + pageSize);
  }, [sortedDevices, currentPage, pageSize, viewMode]);
  
  const totalPages = Math.ceil(sortedDevices.length / pageSize);
  
  function getDeviceFieldValue(device: Device, key: string): string | React.ReactNode {
    const primaryContact = device.contacts?.[0];
    switch (key) {
      case "code": return device.code;
      case "name": return device.name;
      case "model": return device.model;
      case "serial": return device.serial;
      case "location": return device.location;
      case "manufacturer": return device.manufacturer;
      case "yearOfManufacture": return device.yearOfManufacture;
      case "countryOfOrigin": return device.countryOfOrigin;
      case "distributor": return device.distributor || '—';
      case "contactPerson": return primaryContact?.fullName || '—';
      case "phone": return primaryContact?.phone || '—';
      case "email": return primaryContact?.email || '—';
      case "usageStartDate": return formatDate(device.usageStartDate);
      case "image": return device.imageUrl ? <img src={device.imageUrl} alt="" className="w-10 h-10 object-cover rounded" /> : '—';
      case "status": return (
        <span className={`${statusConfig[device.status].bg} ${statusConfig[device.status].color} py-0.5 px-2 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
          {statusConfig[device.status].icon}
          {device.status}
        </span>
      );
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
  
  // Filtered managers for dropdown
  const filteredManagers = useMemo(() => {
    const managers = MOCK_USERS_LIST.filter(u => 
      u.fullName.toLowerCase().includes(newManagerSearch.toLowerCase())
    );
    return managers;
  }, [newManagerSearch]);
  
  // Handle action button clicks
  const handleActionClick = (device: Device, action: string) => {
    setSelectedDeviceForAction(device);
    switch (action) {
      case "accept":
        if (device.status === "Tạm điều chuyển") {
          setActiveModal("accept-return");
        } else {
          setActiveModal("accept");
        }
        break;
      case "info":
        // Open info submenu dropdown
        setShowInfoDropdown(showInfoDropdown === device.id ? null : device.id);
        break;
      case "info-history":
        setSelectedDevice(device);
        setInfoSubmenu("history");
        setShowInfoDropdown(null);
        break;
      case "info-change-manager":
        setSelectedDevice(device);
        setInfoSubmenu("change-manager");
        setShowInfoDropdown(null);
        break;
      case "info-change-contact":
        setSelectedDevice(device);
        setInfoSubmenu("change-contact");
        setShowInfoDropdown(null);
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
      case "dispose":
        setActiveModal("dispose");
        break;
      default:
        break;
    }
  };

  // Status change functions
  const updateDeviceStatus = (deviceId: string, newStatus: DeviceStatus) => {
    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, status: newStatus } : d
    ));
    success('Cập nhật trạng thái', `Thiết bị đã chuyển sang trạng thái ${newStatus}`);
  };

  // Complete acceptance - change status from "Đăng ký mới" to "Chờ vận hành"
  const completeAcceptance = (deviceId: string) => {
    updateDeviceStatus(deviceId, "Chờ vận hành");
    setActiveModal(null);
  };

  // Complete return acceptance - change status from "Tạm điều chuyển" to "Đang vận hành"
  const completeReturnAcceptance = (deviceId: string) => {
    updateDeviceStatus(deviceId, "Đang vận hành");
    setActiveModal(null);
  };

  // Handle incident report with pause
  const handleIncidentPause = (deviceId: string) => {
    updateDeviceStatus(deviceId, "Tạm dừng");
  };

  // Handle transfer proposal approval
  const handleTransferApproval = (deviceId: string) => {
    updateDeviceStatus(deviceId, "Tạm điều chuyển");
  };

  // Handle liquidation approval
  const handleLiquidationApproval = (deviceId: string) => {
    updateDeviceStatus(deviceId, "Ngừng sử dụng");
  };
  
  // Handle change manager
  const handleChangeManager = (deviceId: string) => {
    if (!selectedNewManager || !newManagerStartDate) {
      error("Lỗi", "Vui lòng chọn người quản lý và ngày bắt đầu");
      return;
    }
    
    setDevices(devices.map(d => {
      if (d.id === deviceId) {
        const currentManager = d.managerHistory?.find(m => m.isCurrent);
        const updatedHistory = d.managerHistory || [];
        
        // Mark current manager as ended
        if (currentManager) {
          const idx = updatedHistory.findIndex(m => m.isCurrent);
          if (idx !== -1) {
            updatedHistory[idx] = { ...updatedHistory[idx], isCurrent: false, endDate: newManagerStartDate };
          }
        }
        
        // Add new manager
        updatedHistory.push({
          userId: selectedNewManager.id,
          fullName: selectedNewManager.fullName,
          startDate: newManagerStartDate,
          isCurrent: true,
        });
        
        return { ...d, managerHistory: updatedHistory };
      }
      return d;
    }));
    
    success("Thành công", `Đã thay đổi người quản lý thiết bị`);
    setInfoSubmenu(null);
    setSelectedDevice(null);
    setSelectedNewManager(null);
    setNewManagerSearch("");
    setNewManagerStartDate("");
  };
  
  // Handle change contact info
  const handleChangeContact = (deviceId: string) => {
    if (!editingContact.fullName) {
      error("Lỗi", "Vui lòng nhập họ và tên");
      return;
    }
    
    const newContact: DeviceContact = {
      id: `c${uniqueId}`,
      fullName: editingContact.fullName || "",
      phone: editingContact.phone || "",
      email: editingContact.email || "",
      address: editingContact.address,
    };
    
    setDevices(devices.map(d => {
      if (d.id === deviceId) {
        const updatedContacts = d.contacts?.length ? d.contacts.map(c => ({...c, ...newContact, id: c.id })) : [newContact];
        return { ...d, contacts: updatedContacts };
      }
      return d;
    }));
    
    success("Thành công", "Đã cập nhật thông tin liên hệ");
    setInfoSubmenu(null);
    setSelectedDevice(null);
    setEditingContact({ fullName: "", phone: "", email: "", address: "" });
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
            const primaryContact = device.contacts?.[0];
            return (
              <div
                key={device.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover cursor-pointer group relative"
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
                  
                  {/* Hover overlay with action buttons */}
                  <div 
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 flex-wrap p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {actionButtons.map((btn) => (
                      <div key={btn.key} className="relative">
                        {btn.key === "info" ? (
                          <>
                            <button
                              onClick={() => handleActionClick(device, btn.key)}
                              className={`${btn.bg} ${btn.hover} text-white px-3 py-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all transform hover:scale-105 shadow-lg`}
                              title={btn.label}
                            >
                              <btn.icon size={16} />
                              <span className="whitespace-nowrap">{btn.label}</span>
                            </button>
                            {/* Info submenu dropdown */}
                            {showInfoDropdown === device.id && (
                              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl py-1 min-w-[160px] z-30">
                                <button
                                  onClick={() => handleActionClick(device, "info-history")}
                                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <FileText size={14} className="text-purple-600" />
                                  Xem lý lịch thiết bị
                                </button>
                                <button
                                  onClick={() => handleActionClick(device, "info-change-manager")}
                                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <User size={14} className="text-blue-600" />
                                  Thay đổi người quản lý
                                </button>
                                <button
                                  onClick={() => handleActionClick(device, "info-change-contact")}
                                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <Phone size={14} className="text-green-600" />
                                  Thay đổi thông tin liên hệ
                                </button>
                                <button
                                  onClick={() => handleActionClick(device, "info-print-label")}
                                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <Printer size={14} className="text-green-600" />
                                  In nhãn thiết bị
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => handleActionClick(device, btn.key)}
                            className={`${btn.bg} ${btn.hover} text-white px-3 py-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all transform hover:scale-105 shadow-lg`}
                            title={btn.label}
                          >
                            <btn.icon size={16} />
                            <span className="whitespace-nowrap">{btn.label}</span>
                          </button>
                        )}
                      </div>
                    ))}
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
                
                {/* Hover tooltip with full device info */}
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0" style={{ minWidth: '280px' }}>
                  <h4 className="font-bold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-100">
                    {device.name}
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã thiết bị:</span>
                      <span className="font-medium text-slate-800">{device.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Model:</span>
                      <span className="font-medium text-slate-800">{device.model || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số serial:</span>
                      <span className="font-medium text-slate-800">{device.serial || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vị trí:</span>
                      <span className="font-medium text-slate-800">{device.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nhà sản xuất:</span>
                      <span className="font-medium text-slate-800">{device.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Năm sản xuất:</span>
                      <span className="font-medium text-slate-800">{device.yearOfManufacture || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Xuất xứ:</span>
                      <span className="font-medium text-slate-800">{device.countryOfOrigin || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nhà phân phối:</span>
                      <span className="font-medium text-slate-800">{device.distributor || '—'}</span>
                    </div>
                    {primaryContact && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Người liên hệ:</span>
                          <span className="font-medium text-slate-800">{primaryContact.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Số điện thoại:</span>
                          <span className="font-medium text-slate-800">{primaryContact.phone || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span className="font-medium text-slate-800">{primaryContact.email || '—'}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bắt đầu sử dụng:</span>
                      <span className="font-medium text-slate-800">{formatDate(device.usageStartDate)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Trạng thái:</span>
                      <span className={`font-semibold ${sc.color}`}>{device.status}</span>
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
        <div className="space-y-4">
          {/* Table Controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value={5}>5 dòng</option>
                <option value={10}>10 dòng</option>
                <option value={15}>15 dòng</option>
                <option value={20}>20 dòng</option>
                <option value={-1}>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={16} />
                Cấu hình cột
              </button>
              <button
                onClick={() => exportToExcel()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Download size={16} />
                Xuất Excel
              </button>
            </div>
          </div>
          
          {/* Column Configuration Panel */}
          {showColumnConfig && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3">Cấu hình hiển thị cột</h4>
              <div className="flex flex-wrap gap-3">
                {columns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={(e) => {
                        setColumns(columns.map(c => 
                          c.key === col.key ? { ...c, visible: e.target.checked } : c
                        ));
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {columns.map((col) => (
                      col.visible && (
                        <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
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
                  {/* Filter Row */}
                  <tr className="bg-slate-100">
                    {columns.map((col) => (
                      col.visible && col.key !== "actions" && col.key !== "image" && col.key !== "status" && (
                        <th key={`filter-${col.key}`} className="px-2 py-2">
                          <input
                            type="text"
                            placeholder="Lọc..."
                            value={filters[col.key] || ""}
                            onChange={(e) => {
                              setFilters({ ...filters, [col.key]: e.target.value });
                              setCurrentPage(1);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-100"
                          />
                        </th>
                      )
                    ))}
                    {columns.filter(c => c.visible && (c.key === "actions" || c.key === "image" || c.key === "status")).map((col) => (
                      <th key={`filter-${col.key}`} className="px-2 py-2"></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedDevices.length > 0 ? (
                    paginatedDevices.map((device) => (
                      <tr 
                        key={device.id} 
                        className="hover:bg-slate-50 cursor-pointer group"
                      >
                        {columns.map((col) => (
                          col.visible && (
                            <td 
                              key={col.key} 
                              className={`px-4 py-3 text-sm text-slate-600 ${col.key !== 'actions' ? 'cursor-pointer' : ''}`}
                              onClick={(e) => {
                                if (col.key !== 'actions') {
                                  setSelectedDevice(device);
                                }
                              }}
                            >
                              {getDeviceFieldValue(device, col.key)}
                            </td>
                          )
                        ))}
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(showActionMenu === device.id ? null : device.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
                              title="Thao tác"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {/* Action Dropdown - fully visible */}
                            {showActionMenu === device.id && (
                              <div 
                                className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 min-w-[200px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {actionButtons.map((btn) => (
                                  <div key={btn.key} className="relative">
                                    {btn.key === "info" ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            setShowInfoDropdown(showInfoDropdown === device.id ? device.id : device.id);
                                            setShowActionMenu(null);
                                          }}
                                          className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 ${btn.color === 'emerald' ? 'text-emerald-600' : btn.color === 'blue' ? 'text-blue-600' : btn.color === 'red' ? 'text-red-600' : btn.color === 'purple' ? 'text-purple-600' : btn.color === 'orange' ? 'text-orange-600' : btn.color === 'cyan' ? 'text-cyan-600' : 'text-slate-600'}`}
                                        >
                                          <span className="flex items-center gap-3">
                                            <btn.icon size={16} />
                                            {btn.label}
                                          </span>
                                          <ChevronRight size={14} className="rotate-90" />
                                        </button>
                                        {/* Info submenu dropdown */}
                                        {showInfoDropdown === device.id && (
                                          <div className="absolute left-full top-0 ml-1 bg-white rounded-xl shadow-xl border border-slate-200 py-2 min-w-[180px]">
                                            <button
                                              onClick={() => {
                                                handleActionClick(device, "info-history");
                                                setShowInfoDropdown(null);
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-purple-50 flex items-center gap-3"
                                            >
                                              <FileText size={16} className="text-purple-600" />
                                              Xem lý lịch thiết bị
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleActionClick(device, "info-change-manager");
                                                setShowInfoDropdown(null);
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-purple-50 flex items-center gap-3"
                                            >
                                              <User size={16} className="text-blue-600" />
                                              Thay đổi người quản lý
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleActionClick(device, "info-change-contact");
                                                setShowInfoDropdown(null);
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-purple-50 flex items-center gap-3"
                                            >
                                              <Phone size={16} className="text-green-600" />
                                              Thay đổi thông tin liên hệ
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleActionClick(device, "info-print-label");
                                                setShowInfoDropdown(null);
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-purple-50 flex items-center gap-3"
                                            >
                                              <Printer size={16} className="text-green-600" />
                                              In nhãn thiết bị
                                            </button>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          handleActionClick(device, btn.key);
                                          setShowActionMenu(null);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 ${btn.color === 'emerald' ? 'text-emerald-600' : btn.color === 'blue' ? 'text-blue-600' : btn.color === 'red' ? 'text-red-600' : btn.color === 'purple' ? 'text-purple-600' : btn.color === 'orange' ? 'text-orange-600' : btn.color === 'cyan' ? 'text-cyan-600' : 'text-slate-600'}`}
                                      >
                                        <btn.icon size={16} />
                                        {btn.label}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
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
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {viewMode === "list" && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-slate-500">
            Hiển thị {paginatedDevices.length}/{sortedDevices.length} thiết bị
          </div>
          {totalPages > 1 && (
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
          )}
        </div>
      )}
      
      {/* Acceptance Modal - New Device */}
      {activeModal === "accept" && selectedDeviceForAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Tiếp nhận thiết bị mới</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* Device Info */}
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-purple-800">{selectedDeviceForAction.name}</h3>
                <p className="text-sm text-purple-600">{selectedDeviceForAction.code} • {selectedDeviceForAction.model}</p>
              </div>
              
              {/* Checklist */}
              <h4 className="font-semibold text-slate-800 mb-4">Checklist tiếp nhận thiết bị mới</h4>
              <div className="space-y-3">
                {[
                  { key: "approvalForm", label: "Phiếu phê duyệt", desc: "Search mã phiếu phê duyệt, có nút tải về" },
                  { key: "handoverRecord", label: "Biên bản bàn giao/tiếp nhận", desc: "Đính kèm file PDF, có nút view và tải" },
                  { key: "installationSurvey", label: "Khảo sát điều kiện lắp đặt", desc: "Lập phiếu khảo sát theo BM.05.QL.TC.018" },
                  { key: "userManual", label: "Tài liệu sử dụng", desc: "Tài liệu của lab và hãng" },
                  { key: "co", label: "CO (Certificate of Origin)", desc: "Chứng minh nguồn gốc xuất xứ" },
                  { key: "cq", label: "CQ (Certificate of Quality)", desc: "Chứng minh chất lượng" },
                  { key: "contract", label: "Hợp đồng", desc: "Hợp đồng mua bán" },
                  { key: "installationReport", label: "Biên bản lắp đặt", desc: "Biên bản nghiệm thu lắp đặt" },
                  { key: "usageConfirmation", label: "Xác nhận giá trị sử dụng", desc: "Không bắt buộc (tùy chọn)", required: false },
                ].map((item) => (
                  <div key={item.key} className={`p-4 rounded-xl border ${acceptanceChecklist[item.key as keyof typeof acceptanceChecklist] ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setAcceptanceChecklist({ ...acceptanceChecklist, [item.key]: !acceptanceChecklist[item.key as keyof typeof acceptanceChecklist] })}
                        className={`mt-0.5 ${acceptanceChecklist[item.key as keyof typeof acceptanceChecklist] ? 'text-emerald-600' : 'text-slate-400'}`}
                      >
                        {acceptanceChecklist[item.key as keyof typeof acceptanceChecklist] ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${acceptanceChecklist[item.key as keyof typeof acceptanceChecklist] ? 'text-emerald-800' : 'text-slate-700'}`}>
                            {item.label}
                          </span>
                          {item.required !== false && (
                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">Bắt buộc</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                        {item.key === "approvalForm" && (
                          <input
                            type="text"
                            placeholder="Nhập mã phiếu phê duyệt..."
                            className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          />
                        )}
                        {(item.key === "handoverRecord" || item.key === "userManual" || item.key === "co" || item.key === "cq" || item.key === "contract" || item.key === "installationReport" || item.key === "usageConfirmation") && (
                          <div className="mt-2 flex gap-2">
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600">
                              <Upload size={14} />
                              Đính kèm file
                            </button>
                            {acceptanceDocuments[item.key]?.length > 0 && (
                              <span className="text-sm text-emerald-600 self-center">
                                {acceptanceDocuments[item.key].length} file
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Complete Button */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  onClick={() => completeAcceptance(selectedDeviceForAction.id)}
                  disabled={!acceptanceChecklist.approvalForm || !acceptanceChecklist.handoverRecord || !acceptanceChecklist.installationSurvey || !acceptanceChecklist.userManual || !acceptanceChecklist.co || !acceptanceChecklist.cq || !acceptanceChecklist.contract || !acceptanceChecklist.installationReport}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Hoàn tất tiếp nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acceptance Modal - Return Device */}
      {activeModal === "accept-return" && selectedDeviceForAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Tiếp nhận thiết bị trở lại</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* Device Info */}
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-purple-800">{selectedDeviceForAction.name}</h3>
                <p className="text-sm text-purple-600">{selectedDeviceForAction.code} • {selectedDeviceForAction.model}</p>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-4">
                <button className="px-4 py-2 border-b-2 border-purple-600 text-purple-600 font-medium">
                  Checklist
                </button>
                <button className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700">
                  Phiếu ghi nhận vận chuyển
                </button>
              </div>
              
              {/* Checklist Tab */}
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border ${returnAcceptance.handoverForm ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setReturnAcceptance({ ...returnAcceptance, handoverForm: !returnAcceptance.handoverForm })}
                      className={`mt-0.5 ${returnAcceptance.handoverForm ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                      {returnAcceptance.handoverForm ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div className="flex-1">
                      <span className={`font-medium ${returnAcceptance.handoverForm ? 'text-emerald-800' : 'text-slate-700'}`}>
                        Phiếu bàn giao
                      </span>
                      <p className="text-sm text-slate-500 mt-1">Search mã phiếu bàn giao hoặc đính kèm file PDF</p>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập mã phiếu bàn giao..."
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                        <button className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600">
                          <Upload size={14} />
                          Đính kèm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl border ${returnAcceptance.acceptanceForm ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setReturnAcceptance({ ...returnAcceptance, acceptanceForm: !returnAcceptance.acceptanceForm })}
                      className={`mt-0.5 ${returnAcceptance.acceptanceForm ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                      {returnAcceptance.acceptanceForm ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div className="flex-1">
                      <span className={`font-medium ${returnAcceptance.acceptanceForm ? 'text-emerald-800' : 'text-slate-700'}`}>
                        Phiếu tiếp nhận
                      </span>
                      <p className="text-sm text-slate-500 mt-1">Tạo phiếu tiếp nhận với thông tin: tên phiếu, mã PTN-năm-số thứ tự, tình trạng, ghi chú, người bàn giao, người tiếp nhận</p>
                      <button className="mt-2 flex items-center gap-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-sm text-purple-700">
                        <FilePlus size={14} />
                        Tạo phiếu tiếp nhận
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Complete Button */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  onClick={() => completeReturnAcceptance(selectedDeviceForAction.id)}
                  disabled={!returnAcceptance.handoverForm || !returnAcceptance.acceptanceForm}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Hoàn tất tiếp nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Detail Modal */}
      {selectedDevice && !infoSubmenu && activeModal !== "accept" && activeModal !== "accept-return" && (
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

      {/* Device History Modal - BM.03.QL.TC.018 */}
      {infoSubmenu === "history" && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Lý lịch thiết bị</h2>
                <p className="text-sm text-slate-500">BM.03.QL.TC.018</p>
              </div>
              <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800 text-lg">{selectedDevice.name}</h3>
                <p className="text-sm text-purple-600">{selectedDevice.code} - {selectedDevice.model} - Serial: {selectedDevice.serial}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">Thong tin co ban</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><label className="text-xs text-slate-500">Ten thiet bi</label><p className="font-medium">{selectedDevice.name}</p></div>
                  <div><label className="text-xs text-slate-500">Ma thiet bi</label><p className="font-medium">{selectedDevice.code}</p></div>
                  <div><label className="text-xs text-slate-500">Model</label><p className="font-medium">{selectedDevice.model || '-'}</p></div>
                  <div><label className="text-xs text-slate-500">Serial</label><p className="font-medium">{selectedDevice.serial || '-'}</p></div>
                  <div><label className="text-xs text-slate-500">Hang san xuat</label><p className="font-medium">{selectedDevice.manufacturer}</p></div>
                  <div><label className="text-xs text-slate-500">Xuat xu</label><p className="font-medium">{selectedDevice.countryOfOrigin || '-'}</p></div>
                  <div><label className="text-xs text-slate-500">Nha cung cap</label><p className="font-medium">{selectedDevice.distributor || '-'}</p></div>
                  <div><label className="text-xs text-slate-500">Thoi gian nhan</label><p className="font-medium">{formatDate(selectedDevice.usageStartDate)}</p></div>
                  <div><label className="text-xs text-slate-500">Vi tri lap dat</label><p className="font-medium">{selectedDevice.installationLocation || selectedDevice.location}</p></div>
                  <div><label className="text-xs text-slate-500">Tinh trang khi nhan</label><p className="font-medium">{selectedDevice.conditionOnReceive}</p></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">Nguoi phu trach</h4>
                <div className="space-y-3">
                  {selectedDevice.managerHistory?.map((mgr, idx) => (
                    <div key={idx} className={`p-4 rounded-xl ${mgr.isCurrent ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{mgr.fullName}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${mgr.isCurrent ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200'}`}>
                          {mgr.isCurrent ? 'Hien tai' : `Ngung tu ${formatDate(mgr.endDate || '')}`}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Bat dau: {formatDate(mgr.startDate)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Manager Modal */}
      {infoSubmenu === "change-manager" && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Thay đổi người quản lý</h2>
              <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800">{selectedDevice.name}</h3>
                <p className="text-sm text-purple-600">{selectedDevice.code}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Người quản lý hiện tại</label>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  {selectedDevice.managerHistory?.find(m => m.isCurrent) ? (
                    <p className="font-medium text-emerald-800">{selectedDevice.managerHistory.find(m => m.isCurrent)?.fullName}</p>
                  ) : (
                    <p className="text-slate-500 italic">Chua co nguoi quan ly</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Người quản lý mới <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={newManagerSearch}
                    onChange={(e) => { setNewManagerSearch(e.target.value); setShowManagerSearchDropdown(true); }}
                    onFocus={() => setShowManagerSearchDropdown(true)}
                    placeholder="Tim kiem nguoi quan ly..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                  />
                  {showManagerSearchDropdown && filteredManagers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                      {filteredManagers.map((mgr) => (
                        <button
                          key={mgr.id}
                          onClick={() => { setSelectedNewManager(mgr); setNewManagerSearch(mgr.fullName); setShowManagerSearchDropdown(false); }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2"
                        >
                          <User size={16} className="text-slate-400" />
                          {mgr.fullName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedNewManager && <p className="text-sm text-emerald-600 mt-2">Da chon: {selectedNewManager.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ngày bắt đầu quản lý <span className="text-red-500">*</span></label>
                <input type="date" value={newManagerStartDate} onChange={(e) => setNewManagerStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Hủy</button>
                <button onClick={() => handleChangeManager(selectedDevice.id)} disabled={!selectedNewManager || !newManagerStartDate} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Label Modal with QR Code */}
      {infoSubmenu === "print-label" && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">In nhan thiet bi</h2>
              <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showQRCode} onChange={(e) => setShowQRCode(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-700">Hien QR Code</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showLabelInfo} onChange={(e) => setShowLabelInfo(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-700">Hien thong tin</span>
                </label>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6">
                <div className="flex gap-6 items-center justify-center">
                  {showLabelInfo && (
                    <div className="text-left space-y-2">
                      <p className="text-xs text-slate-500">Cong ty TNHH LABHOUSE VIET NAM</p>
                      <p className="font-bold text-slate-800">{selectedDevice.name}</p>
                      <p className="text-sm text-slate-600">Ma: {selectedDevice.code}</p>
                      <p className="text-sm text-slate-600">Ngay SD: {formatDate(selectedDevice.usageStartDate)}</p>
                      <p className="text-sm text-slate-600">Nguoi phu trach: {selectedDevice.managerHistory?.find(m => m.isCurrent)?.fullName || '-'}</p>
                    </div>
                  )}
                  {showQRCode && (
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-300">
                        <QrCode size={48} className="text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">QR Code</p>
                    </div>
                  )}
                </div>
              </div>
              
              {showQRCode && (
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-700">Thong tin trong QR:</p>
                  <p>Cong ty TNHH LABHOUSE VIET NAM</p>
                  <p>Ten: {selectedDevice.name}</p>
                  <p>Ma: {selectedDevice.code}</p>
                  <p>Ngay: {formatDate(selectedDevice.usageStartDate)}</p>
                  <p>Nguoi phu trach: {selectedDevice.managerHistory?.find(m => m.isCurrent)?.fullName || '-'}</p>
                  <p>Dien thoai: {selectedDevice.contacts?.[0]?.phone || '-'}</p>
                  <p className="text-xs text-slate-500 mt-2">Quet QR de bao cao su cu</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Đóng</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download size={18} /> Tai PDF
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <Printer size={18} /> In nhan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Contact Modal */}
      {infoSubmenu === "change-contact" && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Thay đổi thông tin liên hệ</h2>
              <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800">{selectedDevice.name}</h3>
                <p className="text-sm text-purple-600">{selectedDevice.code}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editingContact.fullName || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={editingContact.phone || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ email</label>
                <input
                  type="email"
                  value={editingContact.email || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                  placeholder="Nhập địa chỉ email"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ liên hệ</label>
                <textarea
                  value={editingContact.address || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
                  placeholder="Nhập địa chỉ liên hệ"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500 resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => { setInfoSubmenu(null); setSelectedDevice(null); }} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Hủy</button>
                <button onClick={() => handleChangeContact(selectedDevice.id)} disabled={!editingContact.fullName} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Lưu thay đổi
                </button>
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



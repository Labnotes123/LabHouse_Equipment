// Mock data for the device management system

export type DeviceStatus =
  | "Đang hoạt động"
  | "Bảo dưỡng"
  | "Hỏng"
  | "Ngừng sử dụng"
  | "Chờ hiệu chuẩn";

export type ProposalStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối";

export interface Device {
  id: string;
  code: string;
  name: string;
  model: string;
  manufacturer: string;
  serial: string;
  purchaseDate: string;
  warrantyExpiry: string;
  location: string;
  department: string;
  status: DeviceStatus;
  lastCalibration?: string;
  nextCalibration?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  imageUrl?: string;
  description?: string;
  responsiblePerson: string;
  price?: number;
}

export interface NewDeviceProposal {
  id: string;
  proposalCode: string;
  deviceName: string;
  quantity: number;
  purpose: string;
  estimatedCost: number;
  proposedBy: string;
  proposedDate: string;
  status: ProposalStatus;
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
  department: string;
}

export interface CalibrationSchedule {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  scheduledDate: string;
  type: "Hiệu chuẩn" | "Bảo dưỡng";
  status: "Chờ thực hiện" | "Đã hoàn thành" | "Quá hạn";
  assignedTo: string;
  notes?: string;
}

export interface IncidentReport {
  id: string;
  reportCode: string;
  deviceId: string;
  deviceName: string;
  incidentDate: string;
  description: string;
  severity: "Nhẹ" | "Trung bình" | "Nghiêm trọng";
  reportedBy: string;
  status: ProposalStatus;
  resolution?: string;
}

export interface HistoryLog {
  id: string;
  actionCode: string;
  actionNumber: number;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  description: string;
  targetType: "Thiết bị" | "Người dùng" | "Hệ thống" | "Đề xuất" | "Sự cố" | "Lịch";
  targetId?: string;
  targetName?: string;
  timestamp: string;
  ipAddress?: string;
}

// Mock Devices
export const mockDevices: Device[] = [
  {
    id: "d1",
    code: "TB-001",
    name: "Máy phân tích huyết học tự động",
    model: "XN-1000",
    manufacturer: "Sysmex",
    serial: "SYS-XN1000-2021-001",
    purchaseDate: "2021-03-15",
    warrantyExpiry: "2024-03-15",
    location: "Phòng Huyết học - Tầng 2",
    department: "Huyết học",
    status: "Đang hoạt động",
    lastCalibration: "2024-01-10",
    nextCalibration: "2024-07-10",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-04-05",
    responsiblePerson: "Phạm Thị Kỹ Thuật",
    price: 450000000,
    description: "Máy phân tích huyết học tự động 5 phần, công suất 100 mẫu/giờ",
  },
  {
    id: "d2",
    code: "TB-002",
    name: "Máy sinh hóa tự động",
    model: "AU5800",
    manufacturer: "Beckman Coulter",
    serial: "BC-AU5800-2020-045",
    purchaseDate: "2020-06-20",
    warrantyExpiry: "2023-06-20",
    location: "Phòng Sinh hóa - Tầng 2",
    department: "Sinh hóa",
    status: "Đang hoạt động",
    lastCalibration: "2024-02-01",
    nextCalibration: "2024-08-01",
    lastMaintenance: "2024-02-01",
    nextMaintenance: "2024-05-01",
    responsiblePerson: "Nguyễn Văn Admin",
    price: 1200000000,
    description: "Máy sinh hóa tự động tốc độ cao, 1800 test/giờ",
  },
  {
    id: "d3",
    code: "TB-003",
    name: "Máy miễn dịch tự động",
    model: "ARCHITECT i2000SR",
    manufacturer: "Abbott",
    serial: "ABB-i2000-2022-012",
    purchaseDate: "2022-01-10",
    warrantyExpiry: "2025-01-10",
    location: "Phòng Miễn dịch - Tầng 3",
    department: "Miễn dịch",
    status: "Chờ hiệu chuẩn",
    lastCalibration: "2023-12-15",
    nextCalibration: "2024-03-15",
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-04-20",
    responsiblePerson: "Vũ Thị Thiết Bị",
    price: 2500000000,
    description: "Máy miễn dịch tự động, 200 test/giờ, đa chỉ số",
  },
  {
    id: "d4",
    code: "TB-004",
    name: "Máy PCR Real-time",
    model: "CFX96 Touch",
    manufacturer: "Bio-Rad",
    serial: "BR-CFX96-2021-078",
    purchaseDate: "2021-09-05",
    warrantyExpiry: "2024-09-05",
    location: "Phòng Sinh học phân tử - Tầng 3",
    department: "Sinh học phân tử",
    status: "Đang hoạt động",
    lastCalibration: "2024-01-25",
    nextCalibration: "2024-07-25",
    lastMaintenance: "2024-01-25",
    nextMaintenance: "2024-07-25",
    responsiblePerson: "Hoàng Văn Chất Lượng",
    price: 380000000,
    description: "Máy PCR Real-time 96 giếng, độ nhạy cao",
  },
  {
    id: "d5",
    code: "TB-005",
    name: "Máy ly tâm lạnh",
    model: "Centrifuge 5430R",
    manufacturer: "Eppendorf",
    serial: "EPP-5430R-2023-003",
    purchaseDate: "2023-03-20",
    warrantyExpiry: "2026-03-20",
    location: "Phòng Tiền xử lý - Tầng 1",
    department: "Tiền xử lý",
    status: "Đang hoạt động",
    lastCalibration: "2024-02-10",
    nextCalibration: "2024-08-10",
    lastMaintenance: "2024-02-10",
    nextMaintenance: "2024-08-10",
    responsiblePerson: "Lê Văn Trưởng Phòng",
    price: 85000000,
    description: "Máy ly tâm lạnh, tốc độ tối đa 30,000 rpm",
  },
  {
    id: "d6",
    code: "TB-006",
    name: "Tủ an toàn sinh học cấp II",
    model: "Safe 2020",
    manufacturer: "Thermo Fisher",
    serial: "TF-SAFE2020-2022-007",
    purchaseDate: "2022-07-15",
    warrantyExpiry: "2025-07-15",
    location: "Phòng Vi sinh - Tầng 2",
    department: "Vi sinh",
    status: "Bảo dưỡng",
    lastCalibration: "2023-11-20",
    nextCalibration: "2024-05-20",
    lastMaintenance: "2024-02-28",
    nextMaintenance: "2024-05-28",
    responsiblePerson: "Vũ Thị Thiết Bị",
    price: 120000000,
    description: "Tủ an toàn sinh học cấp II loại A2, lọc HEPA",
  },
];

// Mock Proposals
export const mockProposals: NewDeviceProposal[] = [
  {
    id: "p1",
    proposalCode: "DX-2024-001",
    deviceName: "Máy đông máu tự động",
    quantity: 1,
    purpose: "Bổ sung năng lực xét nghiệm đông máu, đáp ứng nhu cầu tăng cao",
    estimatedCost: 350000000,
    proposedBy: "Phạm Thị Kỹ Thuật",
    proposedDate: "2024-02-15",
    status: "Chờ duyệt",
    department: "Huyết học",
    notes: "Cần thiết để mở rộng dịch vụ xét nghiệm đông máu",
  },
  {
    id: "p2",
    proposalCode: "DX-2024-002",
    deviceName: "Máy xét nghiệm nước tiểu tự động",
    quantity: 2,
    purpose: "Thay thế máy cũ đã hết hạn sử dụng",
    estimatedCost: 180000000,
    proposedBy: "Lê Văn Trưởng Phòng",
    proposedDate: "2024-02-20",
    status: "Đã duyệt",
    approvedBy: "Trần Thị Giám Đốc",
    approvedDate: "2024-02-25",
    department: "Tổng quát",
    notes: "Đã được phê duyệt, đang trong quá trình đấu thầu",
  },
  {
    id: "p3",
    proposalCode: "DX-2024-003",
    deviceName: "Máy điện giải tự động",
    quantity: 1,
    purpose: "Nâng cao chất lượng xét nghiệm điện giải",
    estimatedCost: 95000000,
    proposedBy: "Hoàng Văn Chất Lượng",
    proposedDate: "2024-03-01",
    status: "Chờ duyệt",
    department: "Sinh hóa",
  },
];

// Mock Calibration Schedules
export const mockSchedules: CalibrationSchedule[] = [
  {
    id: "s1",
    deviceId: "d1",
    deviceName: "Máy phân tích huyết học tự động",
    deviceCode: "TB-001",
    scheduledDate: "2024-07-10",
    type: "Hiệu chuẩn",
    status: "Chờ thực hiện",
    assignedTo: "Phạm Thị Kỹ Thuật",
    notes: "Hiệu chuẩn định kỳ 6 tháng",
  },
  {
    id: "s2",
    deviceId: "d2",
    deviceName: "Máy sinh hóa tự động",
    deviceCode: "TB-002",
    scheduledDate: "2024-05-01",
    type: "Bảo dưỡng",
    status: "Chờ thực hiện",
    assignedTo: "Nguyễn Văn Admin",
    notes: "Bảo dưỡng định kỳ quý",
  },
  {
    id: "s3",
    deviceId: "d3",
    deviceName: "Máy miễn dịch tự động",
    deviceCode: "TB-003",
    scheduledDate: "2024-03-15",
    type: "Hiệu chuẩn",
    status: "Quá hạn",
    assignedTo: "Vũ Thị Thiết Bị",
    notes: "Cần hiệu chuẩn gấp",
  },
  {
    id: "s4",
    deviceId: "d4",
    deviceName: "Máy PCR Real-time",
    deviceCode: "TB-004",
    scheduledDate: "2024-07-25",
    type: "Hiệu chuẩn",
    status: "Chờ thực hiện",
    assignedTo: "Hoàng Văn Chất Lượng",
  },
  {
    id: "s5",
    deviceId: "d6",
    deviceName: "Tủ an toàn sinh học cấp II",
    deviceCode: "TB-006",
    scheduledDate: "2024-05-20",
    type: "Hiệu chuẩn",
    status: "Chờ thực hiện",
    assignedTo: "Vũ Thị Thiết Bị",
  },
];

// Mock Incident Reports
export const mockIncidents: IncidentReport[] = [
  {
    id: "i1",
    reportCode: "SC-2024-001",
    deviceId: "d6",
    deviceName: "Tủ an toàn sinh học cấp II",
    incidentDate: "2024-02-28",
    description: "Quạt tủ an toàn sinh học phát ra tiếng ồn bất thường, cần kiểm tra",
    severity: "Trung bình",
    reportedBy: "Phạm Thị Kỹ Thuật",
    status: "Chờ duyệt",
  },
  {
    id: "i2",
    reportCode: "SC-2024-002",
    deviceId: "d3",
    deviceName: "Máy miễn dịch tự động",
    incidentDate: "2024-03-01",
    description: "Kết quả xét nghiệm không ổn định, cần hiệu chuẩn lại",
    severity: "Nghiêm trọng",
    reportedBy: "Vũ Thị Thiết Bị",
    status: "Chờ duyệt",
  },
];

// Mock History Logs
export const mockHistoryLogs: HistoryLog[] = [
  {
    id: "h1",
    actionCode: "ACT-000001",
    actionNumber: 1,
    userId: "1",
    userName: "Nguyễn Văn Admin",
    userRole: "Admin",
    action: "Đăng nhập hệ thống",
    description: "Người dùng đăng nhập thành công vào hệ thống",
    targetType: "Hệ thống",
    timestamp: "2024-03-01T08:00:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "h2",
    actionCode: "ACT-000002",
    actionNumber: 2,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Cập nhật hồ sơ thiết bị",
    description: "Cập nhật thông tin thiết bị TB-003 - Máy miễn dịch tự động",
    targetType: "Thiết bị",
    targetId: "d3",
    targetName: "Máy miễn dịch tự động (TB-003)",
    timestamp: "2024-03-01T09:15:00",
    ipAddress: "192.168.1.105",
  },
  {
    id: "h3",
    actionCode: "ACT-000003",
    actionNumber: 3,
    userId: "4",
    userName: "Phạm Thị Kỹ Thuật",
    userRole: "Kỹ thuật viên",
    action: "Báo cáo sự cố",
    description: "Tạo báo cáo sự cố SC-2024-001 cho thiết bị TB-006",
    targetType: "Sự cố",
    targetId: "i1",
    targetName: "SC-2024-001",
    timestamp: "2024-03-01T10:30:00",
    ipAddress: "192.168.1.102",
  },
  {
    id: "h4",
    actionCode: "ACT-000004",
    actionNumber: 4,
    userId: "3",
    userName: "Lê Văn Trưởng Phòng",
    userRole: "Trưởng phòng xét nghiệm",
    action: "Đề xuất thiết bị mới",
    description: "Tạo đề xuất DX-2024-002 - Máy xét nghiệm nước tiểu tự động",
    targetType: "Đề xuất",
    targetId: "p2",
    targetName: "DX-2024-002",
    timestamp: "2024-02-20T14:00:00",
    ipAddress: "192.168.1.103",
  },
  {
    id: "h5",
    actionCode: "ACT-000005",
    actionNumber: 5,
    userId: "2",
    userName: "Trần Thị Giám Đốc",
    userRole: "Giám đốc",
    action: "Phê duyệt đề xuất",
    description: "Phê duyệt đề xuất DX-2024-002 - Máy xét nghiệm nước tiểu tự động",
    targetType: "Đề xuất",
    targetId: "p2",
    targetName: "DX-2024-002",
    timestamp: "2024-02-25T09:00:00",
    ipAddress: "192.168.1.101",
  },
  {
    id: "h6",
    actionCode: "ACT-000006",
    actionNumber: 6,
    userId: "1",
    userName: "Nguyễn Văn Admin",
    userRole: "Admin",
    action: "Thêm thiết bị mới",
    description: "Thêm thiết bị TB-005 - Máy ly tâm lạnh vào hệ thống",
    targetType: "Thiết bị",
    targetId: "d5",
    targetName: "Máy ly tâm lạnh (TB-005)",
    timestamp: "2023-03-20T11:00:00",
    ipAddress: "192.168.1.100",
  },
  {
    id: "h7",
    actionCode: "ACT-000007",
    actionNumber: 7,
    userId: "6",
    userName: "Vũ Thị Thiết Bị",
    userRole: "Quản lý trang thiết bị",
    action: "Lên lịch hiệu chuẩn",
    description: "Lên lịch hiệu chuẩn cho thiết bị TB-001 vào ngày 10/07/2024",
    targetType: "Lịch",
    targetId: "s1",
    targetName: "Lịch hiệu chuẩn TB-001",
    timestamp: "2024-01-10T15:30:00",
    ipAddress: "192.168.1.105",
  },
  {
    id: "h8",
    actionCode: "ACT-000008",
    actionNumber: 8,
    userId: "5",
    userName: "Hoàng Văn Chất Lượng",
    userRole: "Quản lý chất lượng",
    action: "Đề xuất hiệu chuẩn",
    description: "Đề xuất hiệu chuẩn khẩn cấp cho thiết bị TB-003",
    targetType: "Thiết bị",
    targetId: "d3",
    targetName: "Máy miễn dịch tự động (TB-003)",
    timestamp: "2024-03-01T11:00:00",
    ipAddress: "192.168.1.104",
  },
];

export const departments = [
  "Huyết học",
  "Sinh hóa",
  "Miễn dịch",
  "Vi sinh",
  "Sinh học phân tử",
  "Tiền xử lý",
  "Tổng quát",
  "Nước tiểu",
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

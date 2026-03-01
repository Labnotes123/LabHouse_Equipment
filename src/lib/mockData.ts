// Mock data for the device management system

export type DeviceStatus =
  | "Đang hoạt động"
  | "Bảo dưỡng"
  | "Hỏng"
  | "Ngừng sử dụng"
  | "Chờ hiệu chuẩn";

export type ProposalStatus = "Bản nháp" | "Chờ duyệt" | "Đã duyệt" | "Từ chối";

export interface DeviceRequirement {
  id: string;
  deviceName: string;
  manufacturer: string;
  yearOfManufacture: string;
  distributor: string;
  quantity: number;
  technicalSpecs: string;
  attachments: AttachedFile[];
}

export interface AttachedFile {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc";
  url: string; // base64 or object URL
  size: number;
}

export interface ProposalApprover {
  userId: string;
  fullName: string;
  role: string;
  isApprover: boolean; // true = can approve, false = related person only
}

export interface NewDeviceProposal {
  id: string;
  proposalCode: string;
  necessity: string; // Sự cần thiết đầu tư thiết bị
  deviceRequirements: DeviceRequirement[];
  proposedBy: string;
  proposedById: string;
  proposedDate: string; // date of first submit (hoàn tất)
  createdDate: string; // date of creation
  status: ProposalStatus;
  approvers: ProposalApprover[];
  approvedBy?: string;
  approvedDate?: string; // hh:mm dd/mm/yyyy
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  registeredToSystem?: boolean; // whether device has been registered
  department?: string;
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
  status: "Chờ duyệt" | "Đã duyệt" | "Từ chối";
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

// Notification type
export interface Notification {
  id: string;
  userId: string;
  type: "proposal_pending" | "proposal_approved" | "proposal_rejected" | "proposal_related";
  title: string;
  message: string;
  proposalId: string;
  proposalCode: string;
  isRead: boolean;
  createdAt: string;
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

// Mock Proposals - new format
export const mockProposals: NewDeviceProposal[] = [
  {
    id: "p1",
    proposalCode: "PDX-2024-001",
    necessity: "Bổ sung năng lực xét nghiệm đông máu, đáp ứng nhu cầu tăng cao của bệnh nhân trong thời gian gần đây. Hiện tại phòng xét nghiệm chưa có máy đông máu tự động, phải thực hiện thủ công gây mất nhiều thời gian.",
    deviceRequirements: [
      {
        id: "dr1",
        deviceName: "Máy đông máu tự động",
        manufacturer: "Stago",
        yearOfManufacture: "2023",
        distributor: "Công ty TNHH Thiết bị Y tế ABC",
        quantity: 1,
        technicalSpecs: "Tốc độ xử lý tối thiểu 200 test/giờ, có khả năng thực hiện các xét nghiệm PT, APTT, Fibrinogen",
        attachments: [],
      },
    ],
    proposedBy: "Phạm Thị Kỹ Thuật",
    proposedById: "4",
    proposedDate: "2024-02-15",
    createdDate: "2024-02-14",
    status: "Chờ duyệt",
    approvers: [
      { userId: "2", fullName: "Trần Thị Giám Đốc", role: "Giám đốc", isApprover: true },
      { userId: "3", fullName: "Lê Văn Trưởng Phòng", role: "Trưởng phòng xét nghiệm", isApprover: false },
    ],
    department: "Huyết học",
  },
  {
    id: "p2",
    proposalCode: "PDX-2024-002",
    necessity: "Thay thế máy xét nghiệm nước tiểu cũ đã hết hạn sử dụng, không còn đảm bảo độ chính xác. Máy hiện tại đã sử dụng được 8 năm và thường xuyên gặp sự cố.",
    deviceRequirements: [
      {
        id: "dr2",
        deviceName: "Máy xét nghiệm nước tiểu tự động",
        manufacturer: "Sysmex",
        yearOfManufacture: "2023",
        distributor: "Công ty CP Thiết bị Y tế XYZ",
        quantity: 2,
        technicalSpecs: "Phân tích 10 thông số, tốc độ 120 mẫu/giờ, có module phân tích cặn lắng",
        attachments: [],
      },
    ],
    proposedBy: "Lê Văn Trưởng Phòng",
    proposedById: "3",
    proposedDate: "2024-02-20",
    createdDate: "2024-02-19",
    status: "Đã duyệt",
    approvers: [
      { userId: "2", fullName: "Trần Thị Giám Đốc", role: "Giám đốc", isApprover: true },
    ],
    approvedBy: "Trần Thị Giám Đốc",
    approvedDate: "14:30 25/02/2024",
    department: "Tổng quát",
    registeredToSystem: true,
  },
  {
    id: "p3",
    proposalCode: "PDX-2024-003",
    necessity: "Nâng cao chất lượng xét nghiệm điện giải, đáp ứng tiêu chuẩn ISO 15189. Thiết bị hiện tại không đủ độ chính xác theo yêu cầu kiểm định.",
    deviceRequirements: [
      {
        id: "dr3",
        deviceName: "Máy điện giải tự động",
        manufacturer: "Radiometer",
        yearOfManufacture: "2024",
        distributor: "Công ty TNHH Dược phẩm DEF",
        quantity: 1,
        technicalSpecs: "Đo Na+, K+, Cl-, Ca2+, pH, pCO2, pO2. Thời gian phân tích < 60 giây",
        attachments: [],
      },
    ],
    proposedBy: "Hoàng Văn Chất Lượng",
    proposedById: "5",
    proposedDate: "2024-03-01",
    createdDate: "2024-02-28",
    status: "Chờ duyệt",
    approvers: [
      { userId: "2", fullName: "Trần Thị Giám Đốc", role: "Giám đốc", isApprover: true },
      { userId: "6", fullName: "Vũ Thị Thiết Bị", role: "Quản lý trang thiết bị", isApprover: false },
    ],
    department: "Sinh hóa",
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "n1",
    userId: "2",
    type: "proposal_pending",
    title: "Yêu cầu phê duyệt mới",
    message: "Phiếu đề xuất PDX-2024-001 cần được phê duyệt",
    proposalId: "p1",
    proposalCode: "PDX-2024-001",
    isRead: false,
    createdAt: "2024-02-15T08:00:00",
  },
  {
    id: "n2",
    userId: "3",
    type: "proposal_related",
    title: "Bạn được liệt kê là người liên quan",
    message: "Phiếu đề xuất PDX-2024-001 - Bạn được liệt kê là người liên quan",
    proposalId: "p1",
    proposalCode: "PDX-2024-001",
    isRead: false,
    createdAt: "2024-02-15T08:00:00",
  },
  {
    id: "n3",
    userId: "3",
    type: "proposal_pending",
    title: "Yêu cầu phê duyệt mới",
    message: "Phiếu đề xuất PDX-2024-003 cần được phê duyệt",
    proposalId: "p3",
    proposalCode: "PDX-2024-003",
    isRead: false,
    createdAt: "2024-03-01T09:00:00",
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
    description: "Tạo đề xuất PDX-2024-002 - Máy xét nghiệm nước tiểu tự động",
    targetType: "Đề xuất",
    targetId: "p2",
    targetName: "PDX-2024-002",
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
    description: "Phê duyệt đề xuất PDX-2024-002 - Máy xét nghiệm nước tiểu tự động",
    targetType: "Đề xuất",
    targetId: "p2",
    targetName: "PDX-2024-002",
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

// Exported user list for approver selection
export const MOCK_USERS_LIST = [
  { id: "1", fullName: "Nguyễn Văn Admin", role: "Admin" },
  { id: "2", fullName: "Trần Thị Giám Đốc", role: "Giám đốc" },
  { id: "3", fullName: "Lê Văn Trưởng Phòng", role: "Trưởng phòng xét nghiệm" },
  { id: "4", fullName: "Phạm Thị Kỹ Thuật", role: "Kỹ thuật viên" },
  { id: "5", fullName: "Hoàng Văn Chất Lượng", role: "Quản lý chất lượng" },
  { id: "6", fullName: "Vũ Thị Thiết Bị", role: "Quản lý trang thiết bị" },
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

// Configurable lists
export const specialties = ["Huyết học", "Hóa sinh", "Vi sinh", "Giải phẫu bệnh"];
export const deviceCategories = ["Máy xét nghiệm chính", "Thiết bị phụ trợ"];
export const deviceTypes = [
  "Máy xét nghiệm chính",
  "Máy thành phần",
  "Máy ủ & sấy",
  "Kính hiển vi",
  "Máy ly tâm",
  "Tủ lạnh & tủ âm sâu",
  "Nồi hấp",
  "Máy xử lý nước",
  "Tủ An toàn sinh học & Tủ thao tác PCR",
  "Tủ ấm",
  "Pippette",
  "Nhiệt kế & ẩm kế",
  "Máy vortex & spindown",
  "Cân",
  "Đầu đọc",
];
export const deviceLocations = [
  "Phòng hóa sinh – Huyết học",
  "Phòng nuôi cấy vi sinh",
  "Hành lang tầng 1",
  "Hành lang tầng 2",
  "Phòng kho",
  "Phòng tách chiết",
  "Phòng lưu mẫu và hấp sấy",
  "Phòng kháng sinh đồ",
  "Phòng chuẩn bị hóa chất",
];
export const countries = [
  "Việt Nam", "Nhật Bản", "Hoa Kỳ", "Đức", "Pháp", "Anh", "Hàn Quốc",
  "Trung Quốc", "Thụy Sĩ", "Thụy Điển", "Đan Mạch", "Hà Lan", "Ý", "Tây Ban Nha",
  "Canada", "Úc", "Singapore", "Đài Loan",
];

// Helper to generate PDX code
export function generatePDXCode(existingProposals: NewDeviceProposal[]): string {
  const year = new Date().getFullYear();
  const yearStr = String(year);
  const sameYearProposals = existingProposals.filter((p) =>
    p.proposalCode.startsWith(`PDX-${yearStr}-`)
  );
  const nextNum = sameYearProposals.length + 1;
  return `PDX-${yearStr}-${String(nextNum).padStart(3, "0")}`;
}

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

"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  Paperclip,
  FileText,
  X,
  Save,
  Send,
  Contact,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  Circle,
  Filter,
  RefreshCw,
  Building2,
  Users,
  Briefcase,
  Printer,
  Trash2,
  Check,
  Square,
  User,
} from "lucide-react";
import {
  IncidentReport,
  WorkOrder,
  mockIncidents,
  Device,
  mockDevices,
  MOCK_USERS_LIST,
  AttachedFile,
} from "@/lib/mockData";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

// Generate incident report code
function generateIncidentCode(year: number, counter: number): string {
  return `PSC-${year}-${String(counter).padStart(3, "0")}`;
}

// Generate work order code
function generateWorkOrderCode(incidentCode: string, counter: number): string {
  return `${incidentCode}-WO-${String(counter).padStart(3, "0")}`;
}

const contactMethods = [
  { value: "zalo", label: "Zalo" },
  { value: "điện thoại", label: "Điện thoại" },
  { value: "email", label: "Email" },
  { value: "tin nhắn", label: "Tin nhắn" },
  { value: "trao đổi trực tiếp", label: "Trao đổi trực tiếp" },
];

export default function IncidentReportTab() {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  // State
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(mockIncidents);
  const [devices] = useState<Device[]>(mockDevices);
  const [showForm, setShowForm] = useState(false);
  const [showSupplierContact, setShowSupplierContact] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [activeTab, setActiveTab] = useState<"reports" | "work-orders">("reports");
  const [incidentCounter, setIncidentCounter] = useState(2);
  const [workOrderCounter, setWorkOrderCounter] = useState(1);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [form, setForm] = useState<Partial<IncidentReport>>({
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

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return incidentReports.filter((incident) => {
      const matchesSearch =
        !searchTerm ||
        incident.reportCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.discoveredBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || incident.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [incidentReports, searchTerm, filterStatus]);

  // All work orders from all incidents
  const allWorkOrders = useMemo(() => {
    const orders: any[] = [];
    incidentReports.forEach((incident) => {
      incident.workOrders?.forEach((wo) => {
        orders.push({ ...wo, incidentReportCode: incident.reportCode });
      });
    });
    return orders;
  }, [incidentReports]);

  // Filtered work orders
  const filteredWorkOrders = useMemo(() => {
    return allWorkOrders.filter((wo) => {
      const matchesSearch =
        !searchTerm ||
        wo.workOrderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || wo.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [allWorkOrders, searchTerm, filterStatus]);

  // Handle device selection
  const handleDeviceSelect = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    if (device) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();

      const currentUser = MOCK_USERS_LIST.find((u) => u.id === user?.id);

      setForm({
        ...form,
        deviceId: device.id,
        deviceName: device.name,
        deviceCode: device.code,
        specialty: device.specialty,
        supplier: device.distributor,
        incidentDateTime: `${hours}:${minutes} ${day}/${month}/${year}`,
        discoveredBy: currentUser?.fullName || "",
        discoveredByRole: currentUser?.role || "",
        reportedBy: currentUser?.fullName || "",
        deviceManager: device.managerHistory?.find((m) => m.isCurrent)?.fullName || "",
      });
    }
  };

  // Handle create new incident
  const handleCreateIncident = () => {
    if (!form.deviceId || !form.description || !form.immediateAction) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const currentYear = new Date().getFullYear();
    const newCounter = incidentCounter + 1;
    const newIncident: IncidentReport = {
      id: `i${Date.now()}`,
      reportCode: generateIncidentCode(currentYear, newCounter),
      deviceId: form.deviceId || "",
      deviceName: form.deviceName || "",
      deviceCode: form.deviceCode || "",
      specialty: form.specialty || "",
      incidentDateTime: form.incidentDateTime || "",
      discoveredBy: form.discoveredBy || "",
      discoveredByRole: form.discoveredByRole || "",
      supplier: form.supplier || "",
      description: form.description || "",
      immediateAction: form.immediateAction || "",
      supplierAction: "",
      affectsPatientResult: form.affectsPatientResult || false,
      affectedPatientSid: form.affectedPatientSid,
      howAffected: form.howAffected,
      requiresDeviceStop: form.requiresDeviceStop || false,
      stopFrom: form.stopFrom,
      stopTo: form.stopTo,
      hasProposal: form.hasProposal || false,
      proposal: form.proposal,
      reportedBy: form.reportedBy || "",
      deviceManager: form.deviceManager || "",
      relatedUsers: form.relatedUsers || [],
      status: "Nháp",
      createdAt: new Date().toISOString(),
      workOrders: [],
    };

    setIncidentReports([newIncident, ...incidentReports]);
    setIncidentCounter(newCounter);
    setShowForm(false);
    setForm({
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
    success("Thành công", "Đã tạo phiếu báo cáo sự cố");
  };

  // Handle send for approval
  const handleSendForApproval = (incident: IncidentReport) => {
    setIncidentReports(
      incidentReports.map((i) =>
        i.id === incident.id
          ? { ...i, status: "Chờ duyệt" as const, updatedAt: new Date().toISOString() }
          : i
      )
    );
    success("Thành công", "Đã gửi phiếu báo cáo sự cố để phê duyệt");
  };

  // Handle approve
  const handleApprove = (incident: IncidentReport) => {
    setIncidentReports(
      incidentReports.map((i) =>
        i.id === incident.id
          ? {
              ...i,
              status: "Đã duyệt" as const,
              approvedBy: user?.fullName || "",
              approvedDate: new Date().toLocaleString("vi-VN"),
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );
    success("Thành công", "Đã phê duyệt phiếu báo cáo sự cố");
  };

  // Handle add work order
  const handleAddWorkOrder = () => {
    if (!selectedIncident || !workOrderForm.contactPerson || !workOrderForm.startDateTime) {
      error("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const newCounter = workOrderCounter + 1;
    const newWorkOrder: WorkOrder = {
      id: `wo${Date.now()}`,
      workOrderCode: generateWorkOrderCode(selectedIncident.reportCode, newCounter),
      incidentReportCode: selectedIncident.reportCode,
      contactPerson: workOrderForm.contactPerson || "",
      contactMethod: workOrderForm.contactMethod as any || "điện thoại",
      startDateTime: workOrderForm.startDateTime || "",
      endDateTime: workOrderForm.endDateTime,
      actionDescription: workOrderForm.actionDescription || "",
      notes: workOrderForm.notes || "",
      attachments: workOrderForm.attachments || [],
      status: "Mở",
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setIncidentReports(
      incidentReports.map((i) =>
        i.id === selectedIncident.id
          ? { ...i, workOrders: [...(i.workOrders || []), newWorkOrder] }
          : i
      )
    );

    setWorkOrderCounter(newCounter);
    setWorkOrderForm({
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
    success("Thành công", "Đã thêm công việc mới");
  };

  // Handle complete repair (hoàn thành sửa chữa)
  const handleCompleteRepair = (incident: IncidentReport) => {
    // Generate supplier action summary from work orders
    const supplierActions = incident.workOrders
      ?.map((wo) => {
        return `${wo.endDateTime || wo.startDateTime}, ${wo.engineerName || wo.contactPerson} - ${wo.actionDescription}. ${wo.conclusion === "hoàn thành" ? "Hoàn thành." : "Xử trí 1 phần."}`;
      })
      .join(" ");

    setIncidentReports(
      incidentReports.map((i) =>
        i.id === incident.id
          ? {
              ...i,
              supplierAction: supplierActions || "",
              status: "Hoàn thành" as const,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );
    setShowSupplierContact(false);
    success("Thành công", "Đã hoàn tất sửa chữa");
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nháp":
        return "bg-slate-100 text-slate-700";
      case "Chờ duyệt":
        return "bg-amber-100 text-amber-700";
      case "Đã duyệt":
        return "bg-blue-100 text-blue-700";
      case "Hoàn thành":
        return "bg-emerald-100 text-emerald-700";
      case "Từ chối":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Get work order status color
  const getWorkOrderStatusColor = (status: string) => {
    switch (status) {
      case "Mở":
        return "bg-amber-100 text-amber-700";
      case "Đóng":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = activeTab === "reports" ? filteredIncidents : filteredWorkOrders;
    const headers = activeTab === "reports"
      ? ["Mã phiếu", "Thiết bị", "Người phát hiện", "Thời gian phát hiện", "Trạng thái"]
      : ["Mã công việc", "Người liên hệ", "Thời gian bắt đầu", "Thời gian kết thúc", "Trạng thái"];

    const rows = activeTab === "reports"
      ? data.map((i: any) => [i.reportCode, i.deviceName, i.discoveredBy, i.incidentDateTime, i.status])
      : data.map((wo: any) => [wo.workOrderCode, wo.contactPerson, wo.startDateTime, wo.endDateTime || "—", wo.status]);

    const csvContent = [headers.join(","), ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(","))].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_cao_su_co_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    success("Thành công", "Đã xuất file Excel");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Báo cáo sự cố</h2>
            <p className="text-sm text-slate-500">BM.11.QL.TC.018 - Phiếu báo cáo sự cố thiết bị</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo báo cáo sự cố
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "reports"
              ? "border-red-500 text-red-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          Báo cáo sự cố
        </button>
        <button
          onClick={() => setActiveTab("work-orders")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "work-orders"
              ? "border-red-500 text-red-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4 inline-block mr-2" />
          Công việc NCC
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Nháp">Nháp</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Từ chối">Từ chối</option>
        </select>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
        >
          <Download size={18} />
          Xuất Excel
        </button>
      </div>

      {/* Reports Table */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã phiếu</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thiết bị</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Người phát hiện</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thời gian phát hiện</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-red-600">{incident.reportCode}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-slate-800">{incident.deviceName}</div>
                    <div className="text-xs text-slate-500">{incident.deviceCode}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{incident.discoveredBy}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{incident.incidentDateTime}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowSupplierContact(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Liên hệ NCC"
                      >
                        <Contact size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {incident.status === "Nháp" && (
                        <button
                          onClick={() => handleSendForApproval(incident)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                          title="Gửi duyệt"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      {incident.status === "Chờ duyệt" && (
                        <button
                          onClick={() => handleApprove(incident)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Phê duyệt"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="In PDF">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredIncidents.length === 0 && (
            <div className="text-center py-12 text-slate-500">Không có dữ liệu</div>
          )}
        </div>
      )}

      {/* Work Orders Table */}
      {activeTab === "work-orders" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã công việc</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã báo cáo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Người thực hiện</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thời gian bắt đầu</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thời gian kết thúc</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkOrders.map((wo: any) => (
                <tr key={wo.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{wo.workOrderCode}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{wo.incidentReportCode}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{wo.contactPerson}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{wo.startDateTime}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{wo.endDateTime || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkOrderStatusColor(wo.status)}`}>
                      {wo.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="Xem chi tiết">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="In PDF">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredWorkOrders.length === 0 && (
            <div className="text-center py-12 text-slate-500">Không có dữ liệu</div>
          )}
        </div>
      )}

      {/* Create Incident Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Tạo phiếu báo cáo sự cố</h3>
                <p className="text-sm text-slate-500">BM.11.QL.TC.018</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Device Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chọn thiết bị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.deviceId}
                    onChange={(e) => handleDeviceSelect(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Chọn thiết bị --</option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.code} - {device.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã thiết bị</label>
                  <input
                    type="text"
                    value={form.deviceCode}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên thiết bị</label>
                  <input
                    type="text"
                    value={form.deviceName}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bộ phận xét nghiệm</label>
                  <input
                    type="text"
                    value={form.specialty}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày giờ phát hiện sự cố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.incidentDateTime}
                    onChange={(e) => setForm({ ...form, incidentDateTime: e.target.value })}
                    placeholder="hh:mm dd/mm/yyyy"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhà cung ứng</label>
                  <input
                    type="text"
                    value={form.supplier}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Người phát hiện sự cố
                  </label>
                  <input
                    type="text"
                    value={form.discoveredBy}
                    onChange={(e) => setForm({ ...form, discoveredBy: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chức vụ</label>
                  <input
                    type="text"
                    value={form.discoveredByRole}
                    onChange={(e) => setForm({ ...form, discoveredByRole: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả chi tiết sự cố <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  placeholder="Mô tả chi tiết sự cố..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hành động xử trí tức thời <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.immediateAction}
                  onChange={(e) => setForm({ ...form, immediateAction: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  placeholder="Hành động xử trí tức thời..."
                />
              </div>

              {/* Contact Supplier Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (!form.deviceId) {
                      error("Lỗi", "Vui lòng chọn thiết bị trước");
                      return;
                    }
                    handleCreateIncident();
                    const newIncident = incidentReports[0];
                    if (newIncident) {
                      setSelectedIncident({ ...newIncident, id: `temp-${Date.now()}` });
                      setShowSupplierContact(true);
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Contact size={18} />
                  Liên hệ nhà cung ứng
                </button>
              </div>

              {/* Required fields before sending */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <h4 className="font-medium text-slate-800">Thông tin bắt buộc trước khi gửi</h4>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="affectsPatient"
                      checked={form.affectsPatientResult}
                      onChange={(e) => setForm({ ...form, affectsPatientResult: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="affectsPatient" className="text-sm text-slate-700">
                      Có ảnh hưởng tới kết quả bệnh nhân không?
                    </label>
                  </div>
                  {form.affectsPatientResult && (
                    <div className="ml-7 space-y-2">
                      <input
                        type="text"
                        value={form.affectedPatientSid}
                        onChange={(e) => setForm({ ...form, affectedPatientSid: e.target.value })}
                        placeholder="SID bệnh nhân"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={form.howAffected}
                        onChange={(e) => setForm({ ...form, howAffected: e.target.value })}
                        placeholder="Bị ảnh hưởng như thế nào?"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="requiresStop"
                      checked={form.requiresDeviceStop}
                      onChange={(e) => setForm({ ...form, requiresDeviceStop: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="requiresStop" className="text-sm text-slate-700">
                      Có phải dừng hoạt động của máy không?
                    </label>
                  </div>
                  {form.requiresDeviceStop && (
                    <div className="ml-7 grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={form.stopFrom}
                        onChange={(e) => setForm({ ...form, stopFrom: e.target.value })}
                        placeholder="Từ (hh:mm dd/mm/yyyy)"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={form.stopTo}
                        onChange={(e) => setForm({ ...form, stopTo: e.target.value })}
                        placeholder="Đến (hh:mm dd/mm/yyyy)"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasProposal"
                      checked={form.hasProposal}
                      onChange={(e) => setForm({ ...form, hasProposal: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="hasProposal" className="text-sm text-slate-700">
                      Có đề xuất gì thêm không?
                    </label>
                  </div>
                  {form.hasProposal && (
                    <div className="ml-7">
                      <input
                        type="text"
                        value={form.proposal}
                        onChange={(e) => setForm({ ...form, proposal: e.target.value })}
                        placeholder="Đề xuất của bạn..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Related Users */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Người báo cáo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.reportedBy}
                    onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Chọn người báo cáo --</option>
                    {MOCK_USERS_LIST.map((u) => (
                      <option key={u.id} value={u.fullName}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quản lý trang thiết bị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.deviceManager}
                    onChange={(e) => setForm({ ...form, deviceManager: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Chọn quản lý --</option>
                    {MOCK_USERS_LIST.map((u) => (
                      <option key={u.id} value={u.fullName}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateIncident}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Lưu nháp
                </button>
                <button
                  onClick={() => {
                    handleCreateIncident();
                    const lastIncident = incidentReports[0];
                    if (lastIncident) {
                      handleSendForApproval(lastIncident);
                    }
                  }}
                  disabled={!form.reportedBy || !form.deviceManager}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  Gửi báo cáo sự cố
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Contact Modal */}
      {showSupplierContact && selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Liên hệ nhà cung ứng</h3>
                <p className="text-sm text-slate-500">Mã báo cáo: {selectedIncident.reportCode}</p>
              </div>
              <button
                onClick={() => {
                  setShowSupplierContact(false);
                  setSelectedIncident(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Work Orders Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã công việc</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Người liên hệ</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hình thức</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Bắt đầu</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kết thúc</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mô tả</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kết luận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedIncident.workOrders?.map((wo) => (
                      <tr key={wo.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">{wo.workOrderCode}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{wo.contactPerson}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{wo.contactMethod}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{wo.startDateTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{wo.endDateTime || "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{wo.actionDescription}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkOrderStatusColor(wo.status)}`}>
                            {wo.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {wo.conclusion === "hoàn thành" && (
                            <span className="text-emerald-600">Hoàn thành</span>
                          )}
                          {wo.conclusion === "xử trí 1 phần" && (
                            <span className="text-amber-600">Xử trí 1 phần</span>
                          )}
                          {!wo.conclusion && <span className="text-slate-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!selectedIncident.workOrders || selectedIncident.workOrders.length === 0) && (
                  <div className="text-center py-8 text-slate-500">Chưa có công việc nào</div>
                )}
              </div>

              {/* Add Work Order Form */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-medium text-slate-800 mb-4">Thêm công việc mới</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Người liên hệ NCC</label>
                    <input
                      type="text"
                      value={workOrderForm.contactPerson}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, contactPerson: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      placeholder="Tên người liên hệ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức liên hệ</label>
                    <select
                      value={workOrderForm.contactMethod}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, contactMethod: e.target.value as any })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    >
                      {contactMethods.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian bắt đầu</label>
                    <input
                      type="text"
                      value={workOrderForm.startDateTime}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, startDateTime: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      placeholder="hh:mm dd/mm/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian kết thúc</label>
                    <input
                      type="text"
                      value={workOrderForm.endDateTime}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, endDateTime: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      placeholder="hh:mm dd/mm/yyyy"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả hành động</label>
                  <textarea
                    value={workOrderForm.actionDescription}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, actionDescription: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    placeholder="Mô tả công việc đã thực hiện..."
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                  <textarea
                    value={workOrderForm.notes}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    placeholder="Ghi chú thêm..."
                  />
                </div>

                {/* Engineer Signature Section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-slate-800 mb-3">Ký xác nhận hoàn tất (Dành cho kỹ sư NCC)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tên người sửa chữa</label>
                      <input
                        type="text"
                        value={workOrderForm.engineerName}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, engineerName: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                        placeholder="Họ tên kỹ sư"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kết luận</label>
                      <select
                        value={workOrderForm.conclusion}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, conclusion: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      >
                        <option value="">-- Chọn kết luận --</option>
                        <option value="hoàn thành">Hoàn thành</option>
                        <option value="xử trí 1 phần">Xử trí 1 phần</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          isCompleted: true,
                          status: workOrderForm.conclusion === "hoàn thành" ? "Đóng" : "Mở",
                        })
                      }
                      disabled={!workOrderForm.engineerName || !workOrderForm.conclusion}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Xác nhận hoàn tất
                    </button>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleAddWorkOrder}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Thêm công việc
                  </button>
                  {selectedIncident.workOrders && selectedIncident.workOrders.length > 0 && (
                    <button
                      onClick={() => handleCompleteRepair(selectedIncident)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Hoàn thành sửa chữa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

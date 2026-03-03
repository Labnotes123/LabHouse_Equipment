"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Gauge,
  Plus,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Printer,
  FileText,
  X,
  Save,
  Send,
  Users,
  Building2,
  AlertTriangle,
} from "lucide-react";
import {
  CalibrationSchedule,
  Device,
  MOCK_USERS_LIST,
  WorkOrder,
} from "@/lib/mockData";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

// Generate calibration request code
function generateCalibrationCode(year: number, counter: number): string {
  return `PHC-${year}-${String(counter).padStart(3, "0")}`;
}

type CalibrationTab = "request" | "schedule" | "result";

export default function CalibrationTab() {
  const { user } = useAuth();
  const { success, error } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<CalibrationTab>("request");
  const [calibrationRequests, setCalibrationRequests] = useState<any[]>([]);
  const { schedules: contextSchedules, devices: contextDevices } = useData();
  const [schedules, setSchedules] = useState<CalibrationSchedule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  useEffect(() => { setSchedules(contextSchedules); }, [contextSchedules]);
  useEffect(() => { setDevices(contextDevices); }, [contextDevices]);
  const [showForm, setShowForm] = useState(false);
  const [calibrationCounter, setCalibrationCounter] = useState(1);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [form, setForm] = useState({
    deviceId: "",
    deviceName: "",
    deviceCode: "",
    serialNumber: "",
    quantity: 1,
    expectedDate: "",
    content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189, Sở ban ngành.",
    notes: "",
    approver: "",
    relatedUsers: [] as string[],
    status: "Nháp" as "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Hoàn thành",
  });

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch =
        !searchTerm ||
        s.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.deviceCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || s.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [schedules, searchTerm, filterStatus]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nháp":
        return "bg-slate-100 text-slate-700";
      case "Chờ duyệt":
        return "bg-amber-100 text-amber-700";
      case "Chờ thực hiện":
        return "bg-blue-100 text-blue-700";
      case "Đã duyệt":
        return "bg-purple-100 text-purple-700";
      case "Đã hoàn thành":
        return "bg-emerald-100 text-emerald-700";
      case "Quá hạn":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Handle device selection
  const handleDeviceSelect = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    if (device) {
      setForm({
        ...form,
        deviceId: device.id,
        deviceName: device.name,
        deviceCode: device.code,
        serialNumber: device.serial,
      });
    }
  };

  // Create calibration request
  const handleCreateRequest = () => {
    if (!form.deviceId || !form.expectedDate) {
      error("Lỗi", "Vui lòng chọn thiết bị và ngày dự kiến");
      return;
    }

    const currentYear = new Date().getFullYear();
    const newCounter = calibrationCounter + 1;
    const newRequest = {
      id: `req-${Date.now()}`,
      requestCode: generateCalibrationCode(currentYear, calibrationCounter),
      ...form,
      createdAt: new Date().toISOString(),
    };

    setCalibrationRequests([newRequest, ...calibrationRequests]);
    setCalibrationCounter(newCounter);
    setShowForm(false);
    setForm({
      deviceId: "",
      deviceName: "",
      deviceCode: "",
      serialNumber: "",
      quantity: 1,
      expectedDate: "",
      content: "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189, Sở ban ngành.",
      notes: "",
      approver: "",
      relatedUsers: [],
      status: "Nháp",
    });
    success("Thành công", "Đã tạo phiếu yêu cầu hiệu chuẩn");
  };

  // Send for approval
  const handleSendForApproval = (request: any) => {
    setCalibrationRequests(
      calibrationRequests.map((r) =>
        r.id === request.id ? { ...r, status: "Chờ duyệt" as const } : r
      )
    );
    success("Thành công", "Đã gửi yêu cầu hiệu chuẩn");
  };

  // Approve
  const handleApprove = (request: any) => {
    setCalibrationRequests(
      calibrationRequests.map((r) =>
        r.id === request.id
          ? { ...r, status: "Đã duyệt" as const, approvedBy: user?.fullName }
          : r
      )
    );
    success("Thành công", "Đã phê duyệt yêu cầu hiệu chuẩn");
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = activeTab === "schedule" ? filteredSchedules : calibrationRequests;
    const headers =
      activeTab === "schedule"
        ? ["STT", "Tên thiết bị", "Mã thiết bị", "Nội dung", "Ngày", "Trạng thái"]
        : ["Mã yêu cầu", "Thiết bị", "Mã TB", "Serial", "Ngày dự kiến", "Trạng thái"];

    const rows =
      activeTab === "schedule"
        ? data.map((s: any, i) => [i + 1, s.deviceName, s.deviceCode, s.notes || s.type, s.scheduledDate, s.status])
        : data.map((r: any) => [
            r.requestCode,
            r.deviceName,
            r.deviceCode,
            r.serialNumber,
            r.expectedDate,
            r.status,
          ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Hieu_chuan_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    success("Thành công", "Đã xuất file Excel");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Gauge className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Hiệu chuẩn</h2>
            <p className="text-sm text-slate-500">Quản lý hiệu chuẩn thiết bị</p>
          </div>
        </div>
        {activeTab === "request" && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Tạo yêu cầu hiệu chuẩn
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("request")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "request"
              ? "border-purple-500 text-purple-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          Yêu cầu hiệu chuẩn
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "schedule"
              ? "border-purple-500 text-purple-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4 inline-block mr-2" />
          Lịch hiệu chuẩn
        </button>
        <button
          onClick={() => setActiveTab("result")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "result"
              ? "border-purple-500 text-purple-600"
              : "border-transparent text-slate-600 hover:text-slate-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 inline-block mr-2" />
          Kết quả hiệu chuẩn
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
          <option value="Chờ thực hiện">Chờ thực hiện</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Đã hoàn thành">Đã hoàn thành</option>
          <option value="Quá hạn">Quá hạn</option>
        </select>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
        >
          <Download size={18} />
          Xuất Excel
        </button>
      </div>

      {/* Request Table */}
      {activeTab === "request" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã yêu cầu</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thiết bị</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã TB</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Serial</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày dự kiến</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calibrationRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-purple-600">{request.requestCode}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{request.deviceName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{request.deviceCode}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{request.serialNumber}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{request.expectedDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="Xem chi tiết">
                        <Eye size={16} />
                      </button>
                      {request.status === "Nháp" && (
                        <button
                          onClick={() => handleSendForApproval(request)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                          title="Gửi duyệt"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      {request.status === "Chờ duyệt" && (
                        <button
                          onClick={() => handleApprove(request)}
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
          {calibrationRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Gauge className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Chưa có yêu cầu hiệu chuẩn nào</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Tạo yêu cầu hiệu chuẩn
              </button>
            </div>
          )}
        </div>
      )}

      {/* Schedule Table */}
      {activeTab === "schedule" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">STT</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên thiết bị</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã thiết bị</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nội dung</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày dự kiến</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Người phụ trách</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.map((schedule, index) => (
                <tr key={schedule.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{schedule.deviceName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{schedule.deviceCode}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{schedule.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{schedule.scheduledDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{schedule.assignedTo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                      {schedule.status}
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
          {filteredSchedules.length === 0 && (
            <div className="text-center py-12 text-slate-500">Không có dữ liệu</div>
          )}
        </div>
      )}

      {/* Result Table */}
      {activeTab === "result" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="text-center py-12 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Chưa có kết quả hiệu chuẩn nào</p>
            <p className="text-sm text-slate-400 mt-2">Kết quả hiệu chuẩn sẽ hiển thị sau khi hoàn thành lịch hiệu chuẩn</p>
          </div>
        </div>
      )}

      {/* Create Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Tạo yêu cầu hiệu chuẩn</h3>
                <p className="text-sm text-slate-500">BM.08.QL.TC.018</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số serial</label>
                  <input
                    type="text"
                    value={form.serialNumber}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày dự kiến hiệu chuẩn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.expectedDate}
                    onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung đề xuất</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Người phê duyệt <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.approver}
                    onChange={(e) => setForm({ ...form, approver: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Chọn người phê duyệt --</option>
                    {MOCK_USERS_LIST.filter((u) => u.role === "Giám đốc" || u.role === "Trưởng phòng xét nghiệm").map((u) => (
                      <option key={u.id} value={u.fullName}>
                        {u.fullName} - {u.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Người liên quan</label>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_USERS_LIST.filter((u) => u.id !== user?.id).slice(0, 5).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          const newUsers = form.relatedUsers.includes(u.fullName)
                            ? form.relatedUsers.filter((x) => x !== u.fullName)
                            : [...form.relatedUsers, u.fullName];
                          setForm({ ...form, relatedUsers: newUsers });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          form.relatedUsers.includes(u.fullName)
                            ? "bg-purple-100 text-purple-700 border border-purple-300"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {u.fullName}
                      </button>
                    ))}
                  </div>
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
                  onClick={handleCreateRequest}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  Lưu bản nháp
                </button>
                <button
                  onClick={() => {
                    handleCreateRequest();
                    if (form.approver) {
                      const lastRequest = calibrationRequests[0];
                      if (lastRequest) handleSendForApproval(lastRequest);
                    }
                  }}
                  disabled={!form.approver}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  Hoàn tất và gửi phê duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

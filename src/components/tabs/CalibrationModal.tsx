import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Plus,
  Save,
  Send,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Device, MOCK_USERS_LIST } from "@/lib/mockData";

interface CalibrationModalProps {
  show: boolean;
  device: Device | null;
  onClose: () => void;
}

type CalibrationRequestStatus = "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Hoàn thành";

type CalibrationRequest = {
  id: string;
  requestCode: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  serialNumber: string;
  quantity: number;
  expectedDate: string;
  content: string;
  notes: string;
  approver: string;
  relatedUsers: string[];
  status: CalibrationRequestStatus;
  requestedBy: string;
};

type CalibrationSchedule = {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  scheduledDate: string;
  content: string;
  status: string;
  notes: string;
};

type CalibrationResult = {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  serialNumber: string;
  manufacturer: string;
  executionDate: string;
  content: string;
  unit: string;
  result: string;
  standard: string;
  conclusion: "Đạt" | "Không đạt" | "";
};

export default function CalibrationModal({ show, device, onClose }: CalibrationModalProps) {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [calibrationModalTab, setCalibrationModalTab] = useState<"request" | "schedule" | "result">("request");
  const [calibrationRequestViewMode, setCalibrationRequestViewMode] = useState<"list" | "form">("list");

  const [calibrationForm, setCalibrationForm] = useState<CalibrationRequest>({
    id: "",
    requestCode: "",
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
    requestedBy: "",
  });
  const [calibrationCounter, setCalibrationCounter] = useState(1);
  const [calibrationRequests, setCalibrationRequests] = useState<CalibrationRequest[]>([]);

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: "",
    scheduledTime: "",
    reminderDays: 3,
    content: "",
    relatedUsers: [] as string[],
  });
  const [calibrationSchedules, setCalibrationSchedules] = useState<CalibrationSchedule[]>([]);

  const [showResultForm, setShowResultForm] = useState(false);
  const [resultForm, setResultForm] = useState<CalibrationResult>({
    id: "",
    deviceId: "",
    deviceName: "",
    deviceCode: "",
    serialNumber: "",
    manufacturer: "",
    executionDate: "",
    content: "",
    unit: "",
    result: "",
    standard: "",
    conclusion: "",
  });
  const [calibrationResults, setCalibrationResults] = useState<CalibrationResult[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!device || !show) return;

    const baseRequestCode = `PHC-${new Date().getFullYear()}-${String(calibrationCounter).padStart(3, "0")}`;

    setCalibrationModalTab("request");
    setCalibrationRequestViewMode("list");
    setShowScheduleForm(false);
    setShowResultForm(false);
    setCalibrationForm((prev) => ({
      ...prev,
      id: `req-${Date.now()}`,
      requestCode: baseRequestCode,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      serialNumber: device.serial,
      quantity: 1,
      expectedDate: "",
      content: prev.content || "Hiệu chuẩn thiết bị theo yêu cầu của ISO 15189, Sở ban ngành.",
      notes: "",
      approver: "",
      relatedUsers: [],
      status: "Nháp",
      requestedBy: user?.fullName || "",
    }));
    setScheduleForm({ scheduledDate: "", scheduledTime: "", reminderDays: 3, content: "", relatedUsers: [] });
    setResultForm({
      id: `result-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      serialNumber: device.serial,
      manufacturer: device.manufacturer,
      executionDate: "",
      content: "",
      unit: "",
      result: "",
      standard: "",
      conclusion: "",
    });
  }, [device, show, calibrationCounter, user?.fullName]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!show || !device) return null;

  const requestCode = `PHC-${new Date().getFullYear()}-${String(calibrationCounter).padStart(3, "0")}`;

  const handleSubmitRequest = (status: CalibrationRequestStatus) => {
    if (!calibrationForm.expectedDate || !calibrationForm.approver) {
      error("Lỗi", "Vui lòng chọn ngày dự kiến và người phê duyệt");
      return;
    }

    const request: CalibrationRequest = {
      ...calibrationForm,
      id: `req-${Date.now()}`,
      requestCode,
      status,
      requestedBy: calibrationForm.requestedBy || user?.fullName || "",
    };

    setCalibrationRequests((prev) => [...prev, request]);
    setCalibrationCounter((prev) => prev + 1);
    setCalibrationRequestViewMode("list");
    success("Thành công", status === "Chờ duyệt" ? `Đã gửi yêu cầu hiệu chuẩn ${requestCode}` : "Đã lưu bản nháp yêu cầu hiệu chuẩn");
  };

  const handleAddSchedule = () => {
    if (!scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      error("Lỗi", "Vui lòng chọn ngày và giờ hiệu chuẩn");
      return;
    }

    const schedule: CalibrationSchedule = {
      id: `schedule-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      scheduledDate: `${scheduleForm.scheduledDate} ${scheduleForm.scheduledTime}`,
      content: scheduleForm.content || "Lên lịch hiệu chuẩn",
      status: "Chờ thực hiện",
      notes: `Nhắc trước ${scheduleForm.reminderDays} ngày`,
    };

    setCalibrationSchedules((prev) => [...prev, schedule]);
    setShowScheduleForm(false);
    success("Thành công", "Đã thêm lịch hiệu chuẩn");
  };

  const handleAddResult = () => {
    if (!resultForm.executionDate || !resultForm.conclusion) {
      error("Lỗi", "Vui lòng nhập ngày thực hiện và kết luận");
      return;
    }

    const result: CalibrationResult = {
      ...resultForm,
      id: `result-${Date.now()}`,
    };

    setCalibrationResults((prev) => [...prev, result]);
    setShowResultForm(false);
    success("Thành công", "Đã lưu kết quả hiệu chuẩn");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hiệu chuẩn thiết bị</h2>
            <p className="text-sm text-slate-500">Quản lý yêu cầu, lịch và kết quả hiệu chuẩn</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setCalibrationModalTab("request")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                calibrationModalTab === "request" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Yêu cầu hiệu chuẩn
            </button>
            <button
              onClick={() => setCalibrationModalTab("schedule")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                calibrationModalTab === "schedule" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Lịch hiệu chuẩn
            </button>
            <button
              onClick={() => setCalibrationModalTab("result")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                calibrationModalTab === "result" ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Kết quả hiệu chuẩn
            </button>
          </div>

          {/* Request Tab */}
          {calibrationModalTab === "request" && (
            <div className="space-y-4">
              {calibrationRequestViewMode === "list" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">Danh sách yêu cầu hiệu chuẩn</h3>
                      <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                    </div>
                    <button
                      onClick={() => setCalibrationRequestViewMode("form")}
                      className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 flex items-center gap-1"
                    >
                      <Plus size={16} /> Tạo yêu cầu
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã yêu cầu</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Tên thiết bị</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã thiết bị</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Serial</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Nội dung</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                          <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {calibrationRequests.filter((r) => r.deviceId === device.id).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                              <p>Chưa có yêu cầu hiệu chuẩn nào</p>
                            </td>
                          </tr>
                        ) : (
                          calibrationRequests
                            .filter((r) => r.deviceId === device.id)
                            .map((req) => (
                              <tr key={req.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-mono text-purple-600">{req.requestCode}</td>
                                <td className="px-4 py-3">{req.deviceName}</td>
                                <td className="px-4 py-3">{req.deviceCode}</td>
                                <td className="px-4 py-3">{req.serialNumber}</td>
                                <td className="px-4 py-3">{req.content}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      req.status === "Hoàn thành"
                                        ? "bg-green-100 text-green-700"
                                        : req.status === "Đã duyệt"
                                          ? "bg-blue-100 text-blue-700"
                                          : req.status === "Chờ duyệt"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {req.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex justify-center gap-2">
                                    <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Xem chi tiết">
                                      <Eye size={16} />
                                    </button>
                                    <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xuất PDF">
                                      <FileText size={16} />
                                    </button>
                                    {req.status === "Chờ duyệt" && (
                                      <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Phê duyệt">
                                        <CheckCircle2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setCalibrationRequestViewMode("list")}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                    Quay lại danh sách
                  </button>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <h3 className="font-semibold text-purple-800 text-lg">{device.name}</h3>
                    <p className="text-sm text-purple-600">{device.code} - {device.model} - Serial: {device.serial}</p>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div><span className="text-purple-500">Bộ phận:</span> <span className="font-medium">{device.specialty}</span></div>
                      <div><span className="text-purple-500">Nhà sản xuất:</span> <span className="font-medium">{device.manufacturer}</span></div>
                      <div><span className="text-purple-500">Tần suất HC:</span> <span className="font-medium">{device.calibrationFrequency || "—"}</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mã yêu cầu hiệu chuẩn</label>
                      <input
                        type="text"
                        value={requestCode}
                        readOnly
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ngày dự kiến hiệu chuẩn <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={calibrationForm.expectedDate}
                        onChange={(e) => setCalibrationForm({ ...calibrationForm, expectedDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Người đề xuất</label>
                      <input
                        type="text"
                        value={calibrationForm.requestedBy || user?.fullName || ""}
                        onChange={(e) => setCalibrationForm({ ...calibrationForm, requestedBy: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        value={calibrationForm.quantity}
                        onChange={(e) => setCalibrationForm({ ...calibrationForm, quantity: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung đề xuất</label>
                    <textarea
                      value={calibrationForm.content}
                      onChange={(e) => setCalibrationForm({ ...calibrationForm, content: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                    <textarea
                      value={calibrationForm.notes}
                      onChange={(e) => setCalibrationForm({ ...calibrationForm, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                      placeholder="Ghi chú thêm..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Người phê duyệt <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_USERS_LIST.filter((u) => ["Quản lý trang thiết bị", "Trưởng phòng xét nghiệm", "Admin"].includes(u.role)).map((approver) => (
                        <button
                          key={approver.id}
                          type="button"
                          onClick={() => setCalibrationForm({ ...calibrationForm, approver: approver.fullName })}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            calibrationForm.approver === approver.fullName
                              ? "bg-purple-500 text-white"
                              : "bg-white border border-slate-300 text-slate-700 hover:bg-purple-50"
                          }`}
                        >
                          {approver.fullName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Người liên quan</label>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_USERS_LIST.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            const current = calibrationForm.relatedUsers || [];
                            const newList = current.includes(u.fullName)
                              ? current.filter((name) => name !== u.fullName)
                              : [...current, u.fullName];
                            setCalibrationForm({ ...calibrationForm, relatedUsers: newList });
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            (calibrationForm.relatedUsers || []).includes(u.fullName)
                              ? "bg-blue-500 text-white"
                              : "bg-white border border-slate-300 text-slate-700 hover:bg-blue-50"
                          }`}
                        >
                          {u.fullName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-200">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                      Hủy
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitRequest("Nháp")}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Save size={18} /> Lưu bản nháp
                      </button>
                      <button
                        onClick={() => handleSubmitRequest("Chờ duyệt")}
                        disabled={!calibrationForm.expectedDate || !calibrationForm.approver}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send size={18} /> Hoàn tất & Gửi phê duyệt
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {calibrationModalTab === "schedule" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Lịch hiệu chuẩn - BM.08.QL.TC.018</h3>
                  <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                </div>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 flex items-center gap-1"
                >
                  <Plus size={16} /> Lên lịch
                </button>
              </div>

              {calibrationSchedules.filter((s) => s.deviceId === device.id).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Chưa có lịch hiệu chuẩn nào</p>
                  <p className="text-sm text-slate-400 mt-1">Lịch hiệu chuẩn sẽ hiển thị sau khi yêu cầu được phê duyệt</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">STT</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Tên thiết bị</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã thiết bị</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày HC</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Nội dung</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calibrationSchedules
                        .filter((s) => s.deviceId === device.id)
                        .map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">{idx + 1}</td>
                            <td className="px-4 py-3">{s.deviceName}</td>
                            <td className="px-4 py-3 font-mono">{s.deviceCode}</td>
                            <td className="px-4 py-3">{s.scheduledDate}</td>
                            <td className="px-4 py-3">{s.content}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{s.status}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showScheduleForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowScheduleForm(false)}>
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Lên lịch hiệu chuẩn</h3>
                        <p className="text-sm text-slate-500">BM.08.QL.TC.018</p>
                      </div>
                      <button onClick={() => setShowScheduleForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <h4 className="font-semibold text-purple-800">{device.name}</h4>
                        <p className="text-sm text-purple-600">{device.code} - {device.serial}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Ngày hiệu chuẩn</label>
                          <input
                            type="date"
                            value={scheduleForm.scheduledDate}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Giờ hiệu chuẩn</label>
                          <input
                            type="time"
                            value={scheduleForm.scheduledTime}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nhắc lịch trước</label>
                        <select
                          value={scheduleForm.reminderDays}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, reminderDays: parseInt(e.target.value, 10) })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        >
                          <option value={1}>1 ngày</option>
                          <option value={3}>3 ngày</option>
                          <option value={5}>5 ngày</option>
                          <option value={7}>7 ngày</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                        <textarea
                          value={scheduleForm.content}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                          placeholder="Nội dung hiệu chuẩn..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Người liên quan</label>
                        <div className="flex flex-wrap gap-2">
                          {MOCK_USERS_LIST.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                const current = scheduleForm.relatedUsers || [];
                                const newList = current.includes(u.fullName)
                                  ? current.filter((name) => name !== u.fullName)
                                  : [...current, u.fullName];
                                setScheduleForm({ ...scheduleForm, relatedUsers: newList });
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                (scheduleForm.relatedUsers || []).includes(u.fullName)
                                  ? "bg-purple-500 text-white"
                                  : "bg-white border border-slate-300 text-slate-700 hover:bg-purple-50"
                              }`}
                            >
                              {u.fullName}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => setShowScheduleForm(false)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleAddSchedule}
                          disabled={!scheduleForm.scheduledDate}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result Tab */}
          {calibrationModalTab === "result" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Xem xét kết quả hiệu chuẩn - BM.09.QL.TC.018</h3>
                  <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                </div>
                <button
                  onClick={() => setShowResultForm(true)}
                  className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center gap-1"
                >
                  <Plus size={16} /> Xem xét kết quả
                </button>
              </div>

              {calibrationResults.filter((r) => r.deviceId === device.id).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Chưa có kết quả hiệu chuẩn nào</p>
                  <p className="text-sm text-slate-400 mt-1">Kết quả hiệu chuẩn sẽ hiển thị sau khi hoàn thành</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Tên thiết bị</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã TB</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Serial</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày thực hiện</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Kết quả</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Kết luận</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calibrationResults
                        .filter((r) => r.deviceId === device.id)
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">{r.deviceName}</td>
                            <td className="px-4 py-3 font-mono">{r.deviceCode}</td>
                            <td className="px-4 py-3">{r.serialNumber}</td>
                            <td className="px-4 py-3">{r.executionDate}</td>
                            <td className="px-4 py-3">{r.result}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  r.conclusion === "Đạt" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                              >
                                {r.conclusion}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showResultForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowResultForm(false)}>
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Phiếu đánh giá kết quả hiệu chuẩn</h3>
                        <p className="text-sm text-slate-500">BM.09.QL.TC.018</p>
                      </div>
                      <button onClick={() => setShowResultForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <h4 className="font-semibold text-green-800">{device.name}</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-green-700">
                          <div>Mã: {device.code}</div>
                          <div>Serial: {device.serial}</div>
                          <div>Hãng: {device.manufacturer}</div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ngày thực hiện</label>
                        <input
                          type="date"
                          value={resultForm.executionDate}
                          onChange={(e) => setResultForm({ ...resultForm, executionDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung thực hiện</label>
                        <textarea
                          value={resultForm.content}
                          onChange={(e) => setResultForm({ ...resultForm, content: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
                          placeholder="Nội dung hiệu chuẩn đã thực hiện..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Đơn vị thực hiện</label>
                          <input
                            type="text"
                            value={resultForm.unit}
                            onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            placeholder="Tên đơn vị..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Kết quả hiệu chuẩn</label>
                          <input
                            type="text"
                            value={resultForm.result}
                            onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            placeholder="Kết quả..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu chuẩn</label>
                        <input
                          type="text"
                          value={resultForm.standard}
                          onChange={(e) => setResultForm({ ...resultForm, standard: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          placeholder="Tiêu chuẩn áp dụng..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Kết luận</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="conclusion"
                              checked={resultForm.conclusion === "Đạt"}
                              onChange={() => setResultForm({ ...resultForm, conclusion: "Đạt" })}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm text-slate-700">Đạt</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="conclusion"
                              checked={resultForm.conclusion === "Không đạt"}
                              onChange={() => setResultForm({ ...resultForm, conclusion: "Không đạt" })}
                              className="w-4 h-4 text-red-600"
                            />
                            <span className="text-sm text-slate-700">Không đạt</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Đính kèm file hiệu chuẩn có dấu</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500">Kéo thả file hoặc click để tải lên</p>
                          <p className="text-xs text-slate-400 mt-1">File PDF có dấu đỏ</p>
                        </div>
                      </div>

                      {resultForm.conclusion === "Không đạt" && (
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                          <p className="text-sm text-red-700 mb-3">Thiết bị không đạt, bạn có muốn báo cáo sự cố không?</p>
                          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2">
                            <AlertTriangle size={18} /> Báo cáo sự cố
                          </button>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => setShowResultForm(false)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleAddResult}
                          disabled={!resultForm.executionDate || !resultForm.conclusion}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                        >
                          Hoàn tất
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

# Active Context: LabHouse Equipment Management System

## Current State

**Project Status**: ✅ Active Development

LabHouse is a laboratory equipment management system for medical laboratories with Vietnamese UI.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Device management system (Phần mềm quản lý thiết bị)
- [x] Tab Hồ sơ thiết bị (DeviceProfileTab) with thumbnail/table views
- [x] Tab Báo cáo sự cố (IncidentReportTab) with BM.11.QL.TC.018 workflow
- [x] Tab Hiệu chuẩn (CalibrationTab) with PHC request workflow
- [x] **Integrate Incident Report & Calibration modals into DeviceProfileTab**
- [x] **Build AdminTab with full User/Profile configuration** - User CRUD with export, column config, filters; Profile CRUD with permission management (Quản lý chung, Thiết bị mới, Hồ sơ thiết bị, Quản trị, Lịch sử)
- [x] **Build AdminTab with Department/Position/Supplier configuration** - Branch/Department management, Position management, Country management, Supplier management
- [x] **Build AdminTab with History auto-delete configuration** - Auto-delete settings for history logs
- [x] **Rebuild HistoryTab with advanced filters** - Time range (today/yesterday/week/month/custom), Device filter, User filter, Module filter, Column filters, Pagination (20 items)
- [x] **Completed DeviceProfileTab workflows for Điều chuyển / Thanh lý / Đào tạo** - Create draft/send approval, list tracking by status, edit/view/export PDF & Excel actions with mock data
- [x] **Fixed incident report action buttons inside DeviceProfileTab** - Edit/View/Attachment/PDF/Excel now wired with real handlers and supplier work order save logic
- [x] **Rebuilt Tiếp nhận workflow in DeviceProfileTab** - One acceptance modal with 2 main tabs (Tiếp nhận mới / Tiếp nhận trở lại), BM.05 survey flow, BM.07 transport records, attachment upload/view/download/remove, configurable list columns/filter/export, and complete-status gating

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/components/tabs/DeviceProfileTab.tsx` | Device management with actions | ✅ Active |
| `src/components/tabs/IncidentReportTab.tsx` | Incident reports (separate tab) | ✅ Active |
| `src/components/tabs/CalibrationTab.tsx` | Calibration (separate tab) | ✅ Active |
| `src/lib/mockData.ts` | Mock data for devices, incidents, calibrations | ✅ Active |

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2024-03-01 | Built complete device management system (Phần mềm quản lý thiết bị) |
| 2026-03-01 | Built Tab Thiết bị mới (NewDeviceTab) with PDX proposal workflow |
| 2026-03-01 | Built Tab Hồ sơ thiết bị (DeviceProfileTab) with thumbnail/table views |
| 2026-03-02 | **Integrated Incident Report & Calibration modals into DeviceProfileTab** |
| 2026-03-02 | **Added DeviceProfileTab transfer/liquidation/training workflows + fixed incident action buttons in report list** |
| 2026-03-02 | **Rebuilt DeviceProfileTab acceptance modal to tab-first flow (new/return) with BM.05/BM.07 + attachment actions + list/filter/export** |

## Current Focus

The template is ready. Next steps depend on user requirements:

1. What type of application to build
2. What features are needed
3. Design/branding preferences

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2024-03-01 | Built complete device management system (Phần mềm quản lý thiết bị) with modern UI for LabHouse medical laboratory |
| 2026-03-01 | Rebuilt Tab Thiết bị mới (NewDeviceTab) with full PDX proposal workflow: table view with sorting/filtering/pagination, proposal form with PDX auto-code, necessity field, multi-device requirements, PDF-only attachments, draft/send workflow, approver selection modal, rejection with reason, register device form (full fields), notification system, DashboardTab navigation integration |
| 2026-03-01 | Built Tab Hồ sơ thiết bị (DeviceProfileTab) with thumbnail/table views: real-time search by code/serial/model, comprehensive registration form with all fields (specialty, category, device type, manufacturer, origin, year, distributor, manager history, contacts, accessories, maintenance schedules), thumbnail view with hover tooltips and action buttons, table view with sortable columns, filters, column configuration, pagination, status lifecycle (Đăng ký mới → Chờ vận hành → Đang vận hành → Tạm dừng/Tạm điều chuyển → Ngừng sử dụng) |
| 2026-03-02 | **Built AdminTab with full User/Profile/Department/Position/Supplier/HistoryConfig** - User management with CRUD, export CSV, column config, filters; Profile management with permission categories (Quản lý chung, Thiết bị mới, Hồ sơ thiết bị, Quản trị, Lịch sử); Branch/Department management; Position management; Country management; Supplier management; History auto-delete config |
| 2026-03-02 | **Rebuilt HistoryTab with advanced filters** - Time range (hôm nay/hôm qua/1 tuần/1 tháng/tùy chọn), multi-select Device filter, multi-select User filter, multi-select Module filter (Thiết bị mới/Hồ sơ thiết bị/Quản trị/Quản lý chung), column filters, pagination (20 items per page) |
| 2026-03-02 | **Enhanced DeviceProfileTab** - Incident actions in report list are fully wired; added Điều chuyển, Thanh lý, Đào tạo modals with draft/approval tracking, status management, and per-record PDF/Excel export using mock data |
| 2026-03-02 | **Enhanced DeviceProfileTab Acceptance flow** - Unified Tiếp nhận modal now opens tab-first UX (Tiếp nhận mới / Tiếp nhận trở lại), includes checklist state tracking, BM.05 survey actions (draft/send/approve), return acceptance form lifecycle, BM.07 transport list filters/export, and end-to-end attachment interactions |
| 2026-03-03 | **Added comprehensive mock data for full software testing** - TransferProposal, LiquidationProposal, TrainingProposal, Acceptance records (NewAcceptanceRecord, ReturnAcceptanceRecord), ReturnTransportRow data - All tabs now have complete test data including devices, proposals, incidents, calibrations, users, profiles, branches, positions, suppliers, and history logs |

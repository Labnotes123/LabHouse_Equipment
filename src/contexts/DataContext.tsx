"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type {
  Device,
  NewDeviceProposal,
  IncidentReport,
  CalibrationSchedule,
  HistoryLog,
  UserProfile,
} from "@/lib/mockData";

interface DataContextValue {
  // Data
  devices: Device[];
  proposals: NewDeviceProposal[];
  incidents: IncidentReport[];
  schedules: CalibrationSchedule[];
  history: HistoryLog[];
  users: UserProfile[];

  // Loading states
  loading: boolean;
  devicesLoading: boolean;
  proposalsLoading: boolean;
  incidentsLoading: boolean;
  schedulesLoading: boolean;
  historyLoading: boolean;
  usersLoading: boolean;

  // Refresh
  refreshData: () => Promise<void>;

  // Device mutations
  addDevice: (device: Omit<Device, "id">) => Promise<Device>;
  updateDevice: (id: string, updates: Partial<Device>) => Promise<Device>;
  deleteDevice: (id: string) => Promise<void>;

  // Proposal mutations
  addProposal: (proposal: Omit<NewDeviceProposal, "id">) => Promise<NewDeviceProposal>;
  updateProposal: (id: string, updates: Partial<NewDeviceProposal>) => Promise<NewDeviceProposal>;
  deleteProposal: (id: string) => Promise<void>;

  // Incident mutations
  addIncident: (incident: Omit<IncidentReport, "id">) => Promise<IncidentReport>;
  updateIncident: (id: string, updates: Partial<IncidentReport>) => Promise<IncidentReport>;
  deleteIncident: (id: string) => Promise<void>;

  // Schedule mutations
  addSchedule: (schedule: Omit<CalibrationSchedule, "id">) => Promise<CalibrationSchedule>;
  updateSchedule: (id: string, updates: Partial<CalibrationSchedule>) => Promise<CalibrationSchedule>;
  deleteSchedule: (id: string) => Promise<void>;

  // History mutations
  addHistory: (log: Omit<HistoryLog, "id">) => Promise<HistoryLog>;
}

const DataContext = createContext<DataContextValue | null>(null);

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [proposals, setProposals] = useState<NewDeviceProposal[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [schedules, setSchedules] = useState<CalibrationSchedule[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [devicesLoading, setDevicesLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      const data = await apiFetch<Device[]>("/api/devices");
      setDevices(data);
    } catch (e) {
      console.error("Failed to fetch devices", e);
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const fetchProposals = useCallback(async () => {
    setProposalsLoading(true);
    try {
      const data = await apiFetch<NewDeviceProposal[]>("/api/proposals");
      setProposals(data);
    } catch (e) {
      console.error("Failed to fetch proposals", e);
    } finally {
      setProposalsLoading(false);
    }
  }, []);

  const fetchIncidents = useCallback(async () => {
    setIncidentsLoading(true);
    try {
      const data = await apiFetch<IncidentReport[]>("/api/incidents");
      setIncidents(data);
    } catch (e) {
      console.error("Failed to fetch incidents", e);
    } finally {
      setIncidentsLoading(false);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    setSchedulesLoading(true);
    try {
      const data = await apiFetch<CalibrationSchedule[]>("/api/schedules");
      setSchedules(data);
    } catch (e) {
      console.error("Failed to fetch schedules", e);
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await apiFetch<HistoryLog[]>("/api/history");
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await apiFetch<UserProfile[]>("/api/users");
      setUsers(data);
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchDevices(),
      fetchProposals(),
      fetchIncidents(),
      fetchSchedules(),
      fetchHistory(),
      fetchUsers(),
    ]);
  }, [fetchDevices, fetchProposals, fetchIncidents, fetchSchedules, fetchHistory, fetchUsers]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const loading =
    devicesLoading || proposalsLoading || incidentsLoading || schedulesLoading || historyLoading || usersLoading;

  // Device mutations
  const addDevice = useCallback(async (device: Omit<Device, "id">) => {
    const created = await apiFetch<Device>("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(device),
    });
    setDevices((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateDevice = useCallback(async (id: string, updates: Partial<Device>) => {
    const updated = await apiFetch<Device>(`/api/devices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setDevices((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const deleteDevice = useCallback(async (id: string) => {
    await apiFetch(`/api/devices/${id}`, { method: "DELETE" });
    setDevices((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Proposal mutations
  const addProposal = useCallback(async (proposal: Omit<NewDeviceProposal, "id">) => {
    const created = await apiFetch<NewDeviceProposal>("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposal),
    });
    setProposals((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateProposal = useCallback(async (id: string, updates: Partial<NewDeviceProposal>) => {
    const updated = await apiFetch<NewDeviceProposal>(`/api/proposals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setProposals((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deleteProposal = useCallback(async (id: string) => {
    await apiFetch(`/api/proposals/${id}`, { method: "DELETE" });
    setProposals((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Incident mutations
  const addIncident = useCallback(async (incident: Omit<IncidentReport, "id">) => {
    const created = await apiFetch<IncidentReport>("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident),
    });
    setIncidents((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateIncident = useCallback(async (id: string, updates: Partial<IncidentReport>) => {
    const updated = await apiFetch<IncidentReport>(`/api/incidents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const deleteIncident = useCallback(async (id: string) => {
    await apiFetch(`/api/incidents/${id}`, { method: "DELETE" });
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Schedule mutations
  const addSchedule = useCallback(async (schedule: Omit<CalibrationSchedule, "id">) => {
    const created = await apiFetch<CalibrationSchedule>("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });
    setSchedules((prev) => [...prev, created]);
    return created;
  }, []);

  const updateSchedule = useCallback(async (id: string, updates: Partial<CalibrationSchedule>) => {
    const updated = await apiFetch<CalibrationSchedule>(`/api/schedules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    await apiFetch(`/api/schedules/${id}`, { method: "DELETE" });
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // History mutations
  const addHistory = useCallback(async (log: Omit<HistoryLog, "id">) => {
    const created = await apiFetch<HistoryLog>("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    setHistory((prev) => [created, ...prev]);
    return created;
  }, []);

  return (
    <DataContext.Provider
      value={{
        devices,
        proposals,
        incidents,
        schedules,
        history,
        users,
        loading,
        devicesLoading,
        proposalsLoading,
        incidentsLoading,
        schedulesLoading,
        historyLoading,
        usersLoading,
        refreshData,
        addDevice,
        updateDevice,
        deleteDevice,
        addProposal,
        updateProposal,
        deleteProposal,
        addIncident,
        updateIncident,
        deleteIncident,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addHistory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  Play,
  Plus,
  Search,
  Square,
  Trash2,
  Upload,
  Pencil,
} from "lucide-react";
import {
  costJournalService,
  CostJournalBillingType,
  CostJournalEntryType,
  CostJournalItem,
} from "@/services/cost-journal";
import { matterService, MatterItem } from "@/services/matters";

const DEFAULT_HOURLY_RATE = 500_000;

const EXPENSE_CATEGORY_OPTIONS = [
  "Administration",
  "Court Fee",
  "Transportation",
  "Accommodation",
  "Other",
];

const TIME_CATEGORY_OPTIONS = [
  "Consultation",
  "Drafting",
  "Meeting",
  "Court Session",
  "Research",
];

const getDateKey = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return value.slice(0, 10);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCurrency = (value: number) =>
  `IDR ${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const formatDate = (value: string) => {
  const dateKey = getDateKey(value);
  const parsed = dateKey ? new Date(`${dateKey}T00:00:00`) : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDuration = (totalMinutes: number) => {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const getMatterLabel = (matter?: CostJournalItem["matter"] | MatterItem | null) => {
  if (!matter) return "-";

  const base = [matter.caseArea, matter.caseType].filter(Boolean).join(" - ");
  if (matter.client?.name) {
    return `${matter.client.name} | ${base || matter.id}`;
  }

  return base || matter.id;
};

const parsePositiveInteger = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.round(parsed));
};

const toCsvValue = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

type JournalTab = "ENTRIES" | "TIMESHEET";

type TimesheetSummaryRow = {
  dateKey: string;
  matterId: string;
  matterLabel: string;
  totalMinutes: number;
  billableMinutes: number;
  nonBillableMinutes: number;
  totalCost: number;
};

const ScrollPicker = ({
  value,
  onChange,
  range,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  range: number[];
  label: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({ top: value * 40, behavior: "smooth" });
  }, [value]);

  const handleScroll = () => {
    if (!containerRef.current) {
      return;
    }

    const scrollY = containerRef.current.scrollTop;
    const index = Math.round(scrollY / 40);
    if (range[index] !== undefined && range[index] !== value) {
      onChange(range[index]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-black uppercase opacity-20 tracking-widest">{label}</span>
      <div className="relative h-[120px] w-24 overflow-hidden group">
        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#F5F2F2] dark:from-[#2B2A2A] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#F5F2F2] dark:from-[#2B2A2A] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-full h-10 -translate-y-1/2 border-y border-[#5A7ACD]/30 bg-[#5A7ACD]/5 pointer-events-none" />

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory py-10"
        >
          {range.map((num) => (
            <div
              key={num}
              className={`h-10 flex items-center justify-center text-xl font-black transition-opacity snap-center ${
                value === num ? "text-[#5A7ACD] opacity-100" : "opacity-20"
              }`}
            >
              {num.toString().padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function CostJournalPage() {
  const [activeTab, setActiveTab] = useState<JournalTab>("ENTRIES");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [modalType, setModalType] = useState<"Expense" | "Time" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [billingType, setBillingType] = useState<CostJournalBillingType>("BILLABLE");
  const [matterId, setMatterId] = useState("");
  const [category, setCategory] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [totalCostInput, setTotalCostInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [description, setDescription] = useState("");

  const [entries, setEntries] = useState<CostJournalItem[]>([]);
  const [matters, setMatters] = useState<MatterItem[]>([]);
  const [search, setSearch] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hoursRange = Array.from({ length: 24 }, (_, i) => i);
  const minutesRange = Array.from({ length: 60 }, (_, i) => i);

  const resetForm = useCallback(() => {
    const today = new Date();
    const dateText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;

    setEditingId(null);
    setBillingType("BILLABLE");
    setMatterId("");
    setCategory("");
    setEntryDate(dateText);
    setTotalCostInput("");
    setQuantityInput("1");
    setDescription("");
    setSelectedHours(0);
    setSelectedMinutes(0);
    setIsTimerRunning(false);
  }, []);

  const loadEntries = useCallback(
    async (searchTerm?: string, tab: JournalTab = activeTab) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await costJournalService.list({
          search: searchTerm || undefined,
          type: tab === "TIMESHEET" ? "TIME" : undefined,
        });
        setEntries(data);
      } catch {
        setError("Gagal memuat cost journal.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    let isActive = true;

    Promise.allSettled([matterService.list(), costJournalService.list()])
      .then((results) => {
        if (!isActive) return;

        const [matterResult, journalResult] = results;

        if (matterResult.status === "fulfilled") {
          setMatters(matterResult.value);
        }

        if (journalResult.status === "fulfilled") {
          setEntries(journalResult.value);
          setError(null);
        } else {
          setError("Gagal memuat cost journal.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
          resetForm();
        }
      });

    return () => {
      isActive = false;
    };
  }, [resetForm]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEntries(search.trim(), activeTab);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeTab, loadEntries, search]);

  const categoryOptions = useMemo(
    () => (modalType === "Expense" ? EXPENSE_CATEGORY_OPTIONS : TIME_CATEGORY_OPTIONS),
    [modalType],
  );

  const estimatedTimeCost = useMemo(() => {
    const totalMinutes = selectedHours * 60 + selectedMinutes;
    return Math.round((totalMinutes * DEFAULT_HOURLY_RATE) / 60);
  }, [selectedHours, selectedMinutes]);

  const hasInvalidPeriod = Boolean(periodStart && periodEnd && periodStart > periodEnd);

  const isWithinPeriod = useCallback(
    (value: string) => {
      if (hasInvalidPeriod) {
        return false;
      }

      const dateKey = getDateKey(value);
      if (!dateKey) {
        return false;
      }

      if (periodStart && dateKey < periodStart) {
        return false;
      }

      if (periodEnd && dateKey > periodEnd) {
        return false;
      }

      return true;
    },
    [hasInvalidPeriod, periodEnd, periodStart],
  );

  const entriesForList = useMemo(
    () => entries.filter((item) => isWithinPeriod(item.entryDate)),
    [entries, isWithinPeriod],
  );

  const timesheetRows = useMemo<TimesheetSummaryRow[]>(() => {
    const rows = new Map<string, TimesheetSummaryRow>();

    for (const item of entriesForList) {
      if (item.entryType !== "TIME") continue;

      const dateKey = getDateKey(item.entryDate);
      if (!dateKey) continue;

      const groupKey = `${dateKey}:${item.matterId}`;
      const durationMinutes = Math.max(0, item.durationMinutes ?? 0);
      const current = rows.get(groupKey);

      if (current) {
        current.totalMinutes += durationMinutes;
        if (item.billingType === "BILLABLE") {
          current.billableMinutes += durationMinutes;
        } else {
          current.nonBillableMinutes += durationMinutes;
        }
        current.totalCost += item.totalCost;
      } else {
        rows.set(groupKey, {
          dateKey,
          matterId: item.matterId,
          matterLabel: getMatterLabel(item.matter),
          totalMinutes: durationMinutes,
          billableMinutes: item.billingType === "BILLABLE" ? durationMinutes : 0,
          nonBillableMinutes: item.billingType === "NON_BILLABLE" ? durationMinutes : 0,
          totalCost: item.totalCost,
        });
      }
    }

    return Array.from(rows.values()).sort((a, b) => {
      if (a.dateKey !== b.dateKey) return b.dateKey.localeCompare(a.dateKey);
      return a.matterLabel.localeCompare(b.matterLabel, "id");
    });
  }, [entriesForList]);

  const timesheetTotals = useMemo(() => {
    return timesheetRows.reduce(
      (acc, item) => {
        acc.totalMinutes += item.totalMinutes;
        acc.billableMinutes += item.billableMinutes;
        acc.nonBillableMinutes += item.nonBillableMinutes;
        acc.totalCost += item.totalCost;
        return acc;
      },
      { totalMinutes: 0, billableMinutes: 0, nonBillableMinutes: 0, totalCost: 0 },
    );
  }, [timesheetRows]);

  const hasVisibleData = activeTab === "TIMESHEET" ? timesheetRows.length > 0 : entriesForList.length > 0;

  const openCreateModal = (type: "Expense" | "Time") => {
    resetForm();
    setModalType(type);
    setIsDropdownOpen(false);
  };

  const openEditModal = (item: CostJournalItem) => {
    setEditingId(item.id);
    setModalType(item.entryType === "EXPENSE" ? "Expense" : "Time");
    setBillingType(item.billingType);
    setMatterId(item.matterId);
    setCategory(item.category ?? "");
    setEntryDate(getDateKey(item.entryDate));
    setDescription(item.description ?? "");

    if (item.entryType === "EXPENSE") {
      setQuantityInput(String(item.quantity ?? 1));
      setTotalCostInput(String(item.totalCost));
      setSelectedHours(0);
      setSelectedMinutes(0);
    } else {
      const minutes = Math.max(0, item.durationMinutes ?? 0);
      setSelectedHours(Math.floor(minutes / 60));
      setSelectedMinutes(minutes % 60);
      setTotalCostInput("");
      setQuantityInput("1");
    }
  };

  const handleSave = async () => {
    if (!modalType) return;

    if (!matterId) {
      setError("Matter wajib dipilih.");
      return;
    }

    if (!entryDate) {
      setError("Tanggal wajib diisi.");
      return;
    }

    const entryType: CostJournalEntryType = modalType === "Expense" ? "EXPENSE" : "TIME";

    setIsSaving(true);
    setError(null);

    try {
      if (entryType === "EXPENSE") {
        const totalCost = parsePositiveInteger(totalCostInput);
        if (totalCost === null || totalCost <= 0) {
          throw new Error("Total cost harus lebih dari 0.");
        }

        const quantity = parsePositiveInteger(quantityInput) ?? 1;
        const safeQuantity = quantity <= 0 ? 1 : quantity;
        const unitCost = Math.max(1, Math.round(totalCost / safeQuantity));

        const payload = {
          matterId,
          entryType,
          billingType,
          category: category || undefined,
          entryDate,
          description: description || undefined,
          quantity: safeQuantity,
          unitCost,
        };

        if (editingId) {
          await costJournalService.update(editingId, payload);
        } else {
          await costJournalService.create(payload);
        }
      } else {
        const durationMinutes = selectedHours * 60 + selectedMinutes;
        if (durationMinutes <= 0) {
          throw new Error("Durasi waktu harus lebih dari 0 menit.");
        }

        const payload = {
          matterId,
          entryType,
          billingType,
          category: category || undefined,
          entryDate,
          description: description || undefined,
          durationMinutes,
          hourlyRate: DEFAULT_HOURLY_RATE,
        };

        if (editingId) {
          await costJournalService.update(editingId, payload);
        } else {
          await costJournalService.create(payload);
        }
      }

      await loadEntries(search.trim(), activeTab);
      setModalType(null);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan entry.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Hapus entry cost journal ini?");
    if (!confirmed) return;

    setIsDeletingId(id);
    setError(null);
    try {
      await costJournalService.remove(id);
      await loadEntries(search.trim(), activeTab);
    } catch {
      setError("Gagal menghapus entry.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handlePeriodReset = () => {
    setPeriodStart("");
    setPeriodEnd("");
  };

  const handleExport = useCallback(() => {
    setError(null);

    let filenamePrefix = "entries";
    let headers: string[] = [];
    let rows: Array<Array<string | number>> = [];

    if (activeTab === "TIMESHEET") {
      if (!timesheetRows.length) {
        setError("Tidak ada data timesheet untuk diexport.");
        return;
      }

      filenamePrefix = "timesheet";
      headers = [
        "Tanggal",
        "Matter",
        "Durasi Total",
        "Durasi Billable",
        "Durasi Non-Billable",
        "Total Biaya (IDR)",
      ];
      rows = timesheetRows.map((item) => [
        formatDate(item.dateKey),
        item.matterLabel,
        formatDuration(item.totalMinutes),
        formatDuration(item.billableMinutes),
        formatDuration(item.nonBillableMinutes),
        item.totalCost,
      ]);
    } else {
      if (!entriesForList.length) {
        setError("Tidak ada data cost journal untuk diexport.");
        return;
      }

      headers = [
        "Tanggal",
        "Matter",
        "Entry Type",
        "Billing Type",
        "Category",
        "Durasi",
        "Quantity",
        "Unit Cost (IDR)",
        "Total Cost (IDR)",
        "Description",
      ];
      rows = entriesForList.map((item) => [
        formatDate(item.entryDate),
        getMatterLabel(item.matter),
        item.entryType,
        item.billingType,
        item.category ?? "-",
        item.entryType === "TIME" ? formatDuration(item.durationMinutes ?? 0) : "-",
        item.quantity ?? "-",
        item.unitCost ?? "-",
        item.totalCost,
        item.description ?? "-",
      ]);
    }

    const csvBody = [headers, ...rows]
      .map((row) => row.map((cell) => toCsvValue(cell)).join(","))
      .join("\n");

    const exportDate = getDateKey(new Date().toISOString()) || "today";
    const periodLabel =
      periodStart || periodEnd ? `_${periodStart || "start"}-${periodEnd || "end"}` : "";
    const filename = `cost-journal-${filenamePrefix}-${exportDate}${periodLabel}.csv`;

    const blob = new Blob([`\uFEFF${csvBody}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [activeTab, entriesForList, periodEnd, periodStart, timesheetRows]);

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-10 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#5A7ACD] rounded-2xl text-[#F5F2F2] shadow-lg shadow-[#5A7ACD]/20">
              <DollarSign size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Cost Journal</h1>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Pencatatan Biaya & Waktu Perkara</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] hover:text-[#2B2A2A] px-6 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-[#5A7ACD]/20 active:scale-95"
            >
              <Plus size={18} /> Add Entry <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => openCreateModal("Expense")}
                  className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest hover:bg-[#5A7ACD] hover:text-white transition-colors border-b border-[#2B2A2A]/5"
                >
                  Add Expense
                </button>
                <button
                  onClick={() => openCreateModal("Time")}
                  className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest hover:bg-[#5A7ACD] hover:text-white transition-colors"
                >
                  Add Time
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#333232] p-4 rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex bg-[#F5F2F2] dark:bg-[#2B2A2A] p-1.5 rounded-2xl border border-[#2B2A2A]/5 gap-1">
              <button
                onClick={() => setActiveTab("ENTRIES")}
                className={`${activeTab === "ENTRIES" ? "bg-[#5A7ACD] text-white shadow-lg shadow-[#5A7ACD]/10" : "opacity-40 hover:opacity-100"} px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all`}
              >
                <Clock size={14} /> Time Entries
              </button>
              <button
                onClick={() => setActiveTab("TIMESHEET")}
                className={`${activeTab === "TIMESHEET" ? "bg-[#5A7ACD] text-white shadow-lg shadow-[#5A7ACD]/10" : "opacity-40 hover:opacity-100"} px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all`}
              >
                <Calendar size={14} /> Timesheet
              </button>
            </div>

            <div className="relative flex-grow max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#5A7ACD] transition-colors" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === "TIMESHEET" ? "Cari timesheet..." : "Cari entri biaya..."}
                className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border border-transparent rounded-2xl w-full pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#5A7ACD]/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-6 ml-auto text-[10px] font-black uppercase tracking-widest opacity-40">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 hover:opacity-100 hover:text-[#5A7ACD] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                disabled={!hasVisibleData}
              >
                <Download size={16} /> Export
              </button>
              <button
                onClick={() => setIsPeriodOpen((prev) => !prev)}
                className={`${isPeriodOpen ? "opacity-100 text-[#5A7ACD]" : ""} flex items-center gap-2 hover:opacity-100 hover:text-[#5A7ACD] transition-all`}
              >
                <Calendar size={16} /> Period
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-50">
            <span>Tab: {activeTab === "TIMESHEET" ? "Timesheet" : "Time Entries"}</span>
            <span>
              Period: {periodStart || "-"} - {periodEnd || "-"}
            </span>
          </div>

          {isPeriodOpen && (
            <div className="mt-4 rounded-2xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A] p-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Start</label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#5A7ACD]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">End</label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#5A7ACD]"
                  />
                </div>
                <button
                  onClick={handlePeriodReset}
                  className="h-11 px-5 rounded-xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 text-[10px] font-black uppercase tracking-widest hover:border-[#5A7ACD] hover:text-[#5A7ACD] transition-all"
                >
                  Reset
                </button>
              </div>
              {hasInvalidPeriod && (
                <p className="mt-3 text-[11px] font-bold text-red-500">
                  Tanggal period tidak valid. Start date harus lebih kecil atau sama dengan end date.
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 text-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[3rem] p-24 text-center min-h-[300px] flex items-center justify-center">
            <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Loading...</p>
          </div>
        ) : !hasVisibleData ? (
          <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[3rem] p-24 text-center flex flex-col items-center justify-center min-h-[450px] shadow-xl shadow-[#2B2A2A]/5 dark:shadow-none">
            <div className="flex flex-col gap-3 mb-8 opacity-20">
              <div className="flex gap-3 items-center"><div className="w-12 h-6 bg-[#FEB05D] rounded-lg" /><div className="w-32 h-3 bg-[#2B2A2A] dark:bg-[#F5F2F2] rounded-full" /></div>
              <div className="flex gap-3 items-center"><div className="w-12 h-6 bg-[#5A7ACD] rounded-lg" /><div className="w-48 h-3 bg-[#2B2A2A] dark:bg-[#F5F2F2] rounded-full" /></div>
              <div className="flex gap-3 items-center"><div className="w-12 h-6 bg-[#5A7ACD] rounded-lg" /><div className="w-24 h-3 bg-[#2B2A2A] dark:bg-[#F5F2F2] rounded-full" /></div>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
              {activeTab === "TIMESHEET" ? "No timesheet found" : "No cost journal found"}
            </h3>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-8 italic">
              {hasInvalidPeriod
                ? "Perbaiki period filter agar data dapat ditampilkan."
                : activeTab === "TIMESHEET"
                  ? "Belum ada data timesheet pada filter yang dipilih."
                  : "Mulai catat pengeluaran atau waktu kerja perkara Anda di sini."}
            </p>
            {activeTab === "ENTRIES" && (
              <div className="flex gap-6">
                <button onClick={() => openCreateModal("Expense")} className="text-[#5A7ACD] font-black uppercase text-[10px] tracking-widest border-b-2 border-[#5A7ACD]/20 hover:border-[#5A7ACD] transition-all pb-1">+ Add Expense</button>
                <button onClick={() => openCreateModal("Time")} className="text-[#5A7ACD] font-black uppercase text-[10px] tracking-widest border-b-2 border-[#5A7ACD]/20 hover:border-[#5A7ACD] transition-all pb-1">+ Add Time</button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[3rem] p-6 md:p-8 shadow-xl shadow-[#2B2A2A]/5 dark:shadow-none">
            {activeTab === "TIMESHEET" ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-2xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Durasi</p>
                    <p className="text-lg font-black mt-1">{formatDuration(timesheetTotals.totalMinutes)}</p>
                  </div>
                  <div className="rounded-2xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Billable</p>
                    <p className="text-lg font-black mt-1">{formatDuration(timesheetTotals.billableMinutes)}</p>
                  </div>
                  <div className="rounded-2xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Non-Billable</p>
                    <p className="text-lg font-black mt-1">{formatDuration(timesheetTotals.nonBillableMinutes)}</p>
                  </div>
                  <div className="rounded-2xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Biaya</p>
                    <p className="text-lg font-black mt-1 text-[#5A7ACD]">{formatCurrency(timesheetTotals.totalCost)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {timesheetRows.map((item) => (
                    <div
                      key={`${item.dateKey}:${item.matterId}`}
                      className="rounded-3xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A] p-5 md:p-6"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest opacity-50">{formatDate(item.dateKey)}</p>
                          <p className="text-sm font-black tracking-wide">{item.matterLabel}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-right">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total</p>
                            <p className="text-sm font-black">{formatDuration(item.totalMinutes)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Billable</p>
                            <p className="text-sm font-black">{formatDuration(item.billableMinutes)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Non-Billable</p>
                            <p className="text-sm font-black">{formatDuration(item.nonBillableMinutes)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Biaya</p>
                            <p className="text-sm font-black text-[#5A7ACD]">{formatCurrency(item.totalCost)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {entriesForList.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A] p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.entryType === "TIME" ? "bg-[#5A7ACD] text-white" : "bg-[#FEB05D] text-[#2B2A2A]"}`}>
                            {item.entryType}
                          </span>
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10">
                            {item.billingType}
                          </span>
                          {item.category && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/80 dark:bg-[#333232] text-[#5A7ACD]">
                              {item.category}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-black tracking-wide">{getMatterLabel(item.matter)}</p>
                        <p className="text-xs font-bold opacity-50 uppercase tracking-widest">{formatDate(item.entryDate)}</p>

                        {item.description && (
                          <p className="text-sm font-semibold opacity-80">{item.description}</p>
                        )}

                        <div className="text-lg font-black tracking-tight text-[#5A7ACD]">
                          {formatCurrency(item.totalCost)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-start">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-4 py-2 rounded-xl border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 text-[10px] font-black uppercase tracking-widest hover:border-[#5A7ACD] hover:text-[#5A7ACD] transition-all"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Pencil size={14} /> Edit
                          </span>
                        </button>
                        <button
                          onClick={() => void handleDelete(item.id)}
                          disabled={isDeletingId === item.id}
                          className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-500/40 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-60"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Trash2 size={14} /> {isDeletingId === item.id ? "Deleting" : "Delete"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2B2A2A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#F5F2F2] dark:bg-[#2B2A2A] w-full max-w-xl rounded-[3rem] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in duration-300 text-[#2B2A2A] dark:text-[#F5F2F2]">
            <div className="p-8 border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 flex items-center justify-between bg-white dark:bg-[#333232]">
              <div className="flex items-center gap-4">
                <div className="bg-[#5A7ACD] p-3 rounded-2xl text-white shadow-lg shadow-[#5A7ACD]/20">
                  <Clock size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">
                    {editingId ? "Edit" : "Tambah"} {modalType === "Expense" ? "Pengeluaran" : "Aktivitas"}
                  </h2>
                </div>
              </div>
              {modalType === "Time" && (
                <button
                  onClick={() => setIsTimerRunning((prev) => !prev)}
                  className={`flex items-center gap-4 font-mono text-xl font-black px-5 py-2 rounded-2xl shadow-lg transition-all ${isTimerRunning ? "bg-[#FEB05D] text-[#2B2A2A]" : "bg-[#5A7ACD] text-white"}`}
                >
                  {selectedHours.toString().padStart(2, "0")}:{selectedMinutes
                    .toString()
                    .padStart(2, "0")}:00
                  {isTimerRunning ? <Square size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                </button>
              )}
            </div>

            <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
              {modalType === "Time" && (
                <div className="flex justify-center items-center gap-8 py-6 border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/5">
                  <div className="flex flex-col items-center gap-4">
                    <ScrollPicker label="Jam" value={selectedHours} onChange={setSelectedHours} range={hoursRange} />
                    <div className="text-[10px] font-black opacity-60">{selectedHours} Jam</div>
                  </div>
                  <div className="text-2xl font-black opacity-20 pt-6">:</div>
                  <div className="flex flex-col items-center gap-4">
                    <ScrollPicker
                      label="Menit"
                      value={selectedMinutes}
                      onChange={setSelectedMinutes}
                      range={minutesRange}
                    />
                    <div className="text-[10px] font-black opacity-60">{selectedMinutes} Menit</div>
                  </div>
                </div>
              )}

              <div className="flex bg-[#F5F2F2] dark:bg-[#2B2A2A] p-1.5 rounded-2xl border border-[#2B2A2A]/5 w-fit">
                <button
                  onClick={() => setBillingType("BILLABLE")}
                  className={`${billingType === "BILLABLE" ? "bg-[#5A7ACD] text-white shadow-lg" : "opacity-40"} px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest`}
                >
                  Berbayar
                </button>
                <button
                  onClick={() => setBillingType("NON_BILLABLE")}
                  className={`${billingType === "NON_BILLABLE" ? "bg-[#5A7ACD] text-white shadow-lg" : "opacity-40"} px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest`}
                >
                  Non Berbayar
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black opacity-40 ml-1 tracking-widest">Perkara</label>
                    <div className="relative">
                      <select
                        value={matterId}
                        onChange={(e) => setMatterId(e.target.value)}
                        className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                      >
                        <option value="">Pilih Perkara</option>
                        {matters.map((item) => (
                          <option key={item.id} value={item.id}>
                            {getMatterLabel(item)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black opacity-40 ml-1 tracking-widest">Kategori</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                      >
                        <option value="">Pilih Kategori</option>
                        {categoryOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black opacity-40 ml-1 tracking-widest">Tanggal</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#5A7ACD]"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={18} />
                  </div>
                </div>

                {modalType === "Expense" ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black opacity-40 ml-1 tracking-widest">Total Harga</label>
                      <input
                        type="number"
                        min={0}
                        value={totalCostInput}
                        onChange={(e) => setTotalCostInput(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#5A7ACD]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black opacity-40 ml-1 tracking-widest">Kuantitas</label>
                      <input
                        type="number"
                        min={1}
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        placeholder="1"
                        className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#5A7ACD]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black opacity-40 ml-1 tracking-widest">Anggota Perkara</label>
                      <div className="relative">
                        <select className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]">
                          <option value="">Pilih Anggota</option>
                          <option>Aufa Hajran</option>
                          <option>Rina Wijaya</option>
                          <option>Budi Santoso</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black opacity-40 ml-1 tracking-widest">Biaya Per Jam</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={totalCostInput}
                          onChange={(e) => setTotalCostInput(e.target.value)}
                          placeholder="0"
                          className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#5A7ACD] pr-20"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-40 uppercase tracking-widest">Per Jam</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#F5F2F2] dark:bg-[#2B2A2A]/50 rounded-2xl border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10">
                        <label className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Kustom Fee</label>
                        <input type="checkbox" className="w-5 h-5 rounded border-2 border-[#5A7ACD] cursor-pointer" />
                      </div>

                      <div className="p-4 bg-[#5A7ACD]/5 rounded-2xl border border-[#5A7ACD]/10">
                        <label className="text-[10px] text-[#5A7ACD] font-black uppercase tracking-widest block mb-2">Total Biaya</label>
                        <div className="text-2xl font-black tracking-tighter">Rp 0,00</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black opacity-40 ml-1 tracking-widest">Deskripsi</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tingkatkan akun kamu untuk unggu file"
                    rows={3}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-5 text-sm font-bold outline-none resize-none focus:border-[#5A7ACD] transition-all"
                  />
                </div>
              </div>

              {modalType === "Expense" && (
                <div className="pt-6 space-y-3 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/5">
                  <label className="text-[10px] uppercase font-black text-[#5A7ACD] tracking-widest ml-1">Unggah Bukti</label>
                  <label
                    htmlFor="cost-upload"
                    className="border-2 border-dashed border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-[2rem] p-12 flex flex-col items-center justify-center bg-white/50 dark:bg-black/10 hover:border-[#5A7ACD] hover:bg-[#5A7ACD]/5 transition-all cursor-pointer group text-center"
                  >
                    <div className="bg-[#5A7ACD]/10 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-[#5A7ACD]" size={32} />
                    </div>
                    <p className="text-sm font-black">Drag and drop file atau klik untuk memilih file</p>
                    <p className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-widest">(Batas ukuran 5GB)</p>
                    <input id="cost-upload" type="file" ref={fileInputRef} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            <div className="p-10 bg-white dark:bg-[#333232] flex justify-end items-center gap-6 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10">
              <button
                onClick={() => {
                  setModalType(null);
                  resetForm();
                }}
                className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="px-12 py-4 bg-[#5A7ACD] hover:bg-[#FEB05D] text-white hover:text-[#2B2A2A] font-black rounded-2xl transition-all text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#5A7ACD]/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "Menyimpan..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

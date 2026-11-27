"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { contactService, Contact, ContactFilter } from "@/services/contacts";
import AddContactModal from "./AddContactModal";

const FILTER_OPTIONS: Array<{ label: string; value: ContactFilter }> = [
  { label: "All", value: "All" },
  { label: "Client", value: "CLIENT" },
  { label: "Non Client", value: "NON_CLIENT" },
];

type SortKey = "name" | "contactType" | "createdAt";
type SortState = { key: SortKey; direction: "asc" | "desc" };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A7ACD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F2F2] dark:focus-visible:ring-offset-[#2B2A2A]";

const formatContactDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getClientLabel = (status: Contact["isClient"]) =>
  status === "CLIENT" ? "Client" : "Non Client";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const sortValue = (contact: Contact, key: SortKey) => {
  if (key === "createdAt") {
    return new Date(contact.createdAt).getTime() || 0;
  }
  return (contact[key] ?? "").toLowerCase();
};

function SortIcon({ state, column }: { state: SortState; column: SortKey }) {
  if (state.key !== column) {
    return <ArrowUpDown size={13} aria-hidden="true" className="opacity-40" />;
  }
  return state.direction === "asc" ? (
    <ArrowUp size={13} aria-hidden="true" />
  ) : (
    <ArrowDown size={13} aria-hidden="true" />
  );
}

function StatusBadge({ status }: { status: Contact["isClient"] }) {
  const isClient = status === "CLIENT";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        isClient
          ? "border-[#5A7ACD]/25 bg-[#5A7ACD]/10 text-[#334E9E] dark:border-[#5A7ACD]/30 dark:bg-[#5A7ACD]/15 dark:text-[#B8C8F5]"
          : "border-[#FEB05D]/40 bg-[#FEB05D]/15 text-[#8A4B00] dark:border-[#FEB05D]/30 dark:bg-[#FEB05D]/10 dark:text-[#FDD9AE]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          isClient ? "bg-[#5A7ACD] dark:bg-[#B8C8F5]" : "bg-[#FEB05D]"
        }`}
      />
      {getClientLabel(status)}
    </span>
  );
}

export default function ContactsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<ContactFilter>("All");
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({
    key: "createdAt",
    direction: "desc",
  });

  const refreshContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contactService.list({
        search: search.trim() || undefined,
        filter,
      });
      setContacts(data);
    } catch {
      setError("Gagal memuat kontak. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    const handle = setTimeout(async () => {
      try {
        const data = await contactService.list({
          search: search.trim() || undefined,
          filter,
        });

        if (isActive) {
          setContacts(data);
        }
      } catch {
        if (isActive) {
          setError("Gagal memuat kontak. Coba lagi.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(handle);
    };
  }, [search, filter]);

  const sortedContacts = useMemo(() => {
    const factor = sort.direction === "asc" ? 1 : -1;

    return [...contacts].sort((leftContact, rightContact) => {
      const left = sortValue(leftContact, sort.key);
      const right = sortValue(rightContact, sort.key);

      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * factor;
      }

      return (
        String(left).localeCompare(String(right), "id", {
          sensitivity: "base",
        }) * factor
      );
    });
  }, [contacts, sort]);

  const hasActiveFilters = search.trim().length > 0 || filter !== "All";

  const clearFilters = () => {
    setSearch("");
    setFilter("All");
  };

  const toggleSort = (key: SortKey) => {
    setSort((previous) => {
      if (previous.key === key) {
        return {
          key,
          direction: previous.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: key === "createdAt" ? "desc" : "asc" };
    });
  };

  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" => {
    if (sort.key !== key) return "none";
    return sort.direction === "asc" ? "ascending" : "descending";
  };

  return (
    <div className="bg-[#F5F2F2] text-[#2B2A2A] transition-colors duration-300 dark:bg-[#2B2A2A] dark:text-[#F5F2F2]">
      <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5A7ACD] text-white">
            <Users size={22} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase sm:text-2xl">
              Contacts
            </h1>
            <p className="text-xs text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70">
              {isLoading
                ? "Loading contacts..."
                : error
                  ? "Could not load contacts"
                  : `${contacts.length} contact${contacts.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4A69BC] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3F5CA8] hover:shadow-md active:bg-[#3A569F] active:shadow-none ${focusRing}`}
        >
          <Plus size={18} aria-hidden="true" />
          Add contact
        </button>
      </div>

      <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 rounded-2xl border border-[#2B2A2A]/10 bg-white p-4 shadow-sm dark:border-[#F5F2F2]/10 dark:bg-[#333232] lg:flex-row lg:items-end lg:justify-between">
        <label className="block w-full lg:max-w-md">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70">
            Search contacts
          </span>
          <div className="relative">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B2A2A]/70 dark:text-[#F5F2F2]/60"
            />
            <input
              type="search"
              placeholder="Search by name, email, or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#2B2A2A]/10 bg-[#F5F2F2] pl-10 pr-4 text-sm text-[#2B2A2A] outline-none transition-colors placeholder:text-[#2B2A2A]/70 focus:border-[#5A7ACD] focus:ring-2 focus:ring-[#5A7ACD]/20 dark:border-[#F5F2F2]/10 dark:bg-[#1F1E1E] dark:text-[#F5F2F2] dark:placeholder:text-[#F5F2F2]/60"
            />
          </div>
        </label>

        <div>
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70">
            Client status
          </span>
          <div
            role="group"
            aria-label="Filter by client status"
            className="flex w-full rounded-xl border border-[#2B2A2A]/10 bg-[#F5F2F2] p-1 dark:border-[#F5F2F2]/10 dark:bg-[#1F1E1E] sm:w-fit"
          >
            {FILTER_OPTIONS.map((option) => {
              const isActive = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  aria-pressed={isActive}
                  className={`h-11 flex-1 rounded-lg px-4 text-xs font-semibold transition-colors active:bg-[#3A569F] sm:flex-none ${focusRing} ${
                    isActive
                      ? "bg-[#4A69BC] text-white shadow-sm"
                      : "text-[#2B2A2A]/70 hover:bg-[#2B2A2A]/5 hover:text-[#2B2A2A] dark:text-[#F5F2F2]/70 dark:hover:bg-[#F5F2F2]/10 dark:hover:text-[#F5F2F2]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-w-full max-w-full overflow-hidden rounded-2xl border border-[#2B2A2A]/10 bg-white shadow-sm dark:border-[#F5F2F2]/10 dark:bg-[#333232]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Contacts list</caption>
            <thead className="border-b border-[#2B2A2A]/10 bg-[#F5F2F2] dark:border-[#F5F2F2]/10 dark:bg-[#2B2A2A]">
              <tr>
                <th
                  scope="col"
                  aria-sort={ariaSort("name")}
                  className="p-0"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className={`flex min-h-12 w-full items-center gap-1.5 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 transition-colors hover:bg-[#2B2A2A]/5 hover:text-[#2B2A2A] hover:underline underline-offset-2 active:opacity-70 dark:text-[#F5F2F2]/70 dark:hover:bg-[#F5F2F2]/10 dark:hover:text-[#F5F2F2] sm:px-6 ${focusRing}`}
                  >
                    Name
                    <SortIcon state={sort} column="name" />
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={ariaSort("contactType")}
                  className="hidden p-0 md:table-cell"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("contactType")}
                    className={`flex min-h-12 w-full items-center gap-1.5 px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 transition-colors hover:bg-[#2B2A2A]/5 hover:text-[#2B2A2A] hover:underline underline-offset-2 active:opacity-70 dark:text-[#F5F2F2]/70 dark:hover:bg-[#F5F2F2]/10 dark:hover:text-[#F5F2F2] ${focusRing}`}
                  >
                    Type
                    <SortIcon state={sort} column="contactType" />
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70 sm:px-6"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="hidden px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70 lg:table-cell"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="hidden px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70 xl:table-cell"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="hidden px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70 2xl:table-cell"
                >
                  Address
                </th>
                <th
                  scope="col"
                  aria-sort={ariaSort("createdAt")}
                  className="hidden p-0 text-right sm:table-cell"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("createdAt")}
                    className={`flex min-h-12 w-full items-center justify-end gap-1.5 px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#2B2A2A]/70 transition-colors hover:bg-[#2B2A2A]/5 hover:text-[#2B2A2A] hover:underline underline-offset-2 active:opacity-70 dark:text-[#F5F2F2]/70 dark:hover:bg-[#F5F2F2]/10 dark:hover:text-[#F5F2F2] ${focusRing}`}
                  >
                    Added
                    <SortIcon state={sort} column="createdAt" />
                  </button>
                </th>
                <th scope="col" className="px-3 py-4 sm:px-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2A2A]/5 dark:divide-[#F5F2F2]/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <span
                      role="status"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70"
                    >
                      <Loader2
                        size={16}
                        aria-hidden="true"
                        className="animate-spin motion-reduce:animate-none"
                      />
                      Loading contacts...
                    </span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <AlertCircle
                        size={24}
                        aria-hidden="true"
                        className="text-red-600 dark:text-red-400"
                      />
                      <p
                        role="alert"
                        className="text-sm font-semibold text-red-700 dark:text-red-300"
                      >
                        {error}
                      </p>
                      <button
                        type="button"
                        onClick={() => void refreshContacts()}
                        className={`inline-flex h-11 items-center gap-2 rounded-xl border border-[#2B2A2A]/15 px-4 text-xs font-semibold text-[#2B2A2A] transition-colors hover:bg-[#2B2A2A]/5 dark:border-[#F5F2F2]/15 dark:text-[#F5F2F2] dark:hover:bg-[#F5F2F2]/10 ${focusRing}`}
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5A7ACD]/10 text-[#5A7ACD] dark:bg-[#5A7ACD]/15 dark:text-[#B8C8F5]">
                        <UserPlus size={22} aria-hidden="true" />
                      </span>
                      <p className="text-sm font-semibold">
                        {hasActiveFilters
                          ? "No contacts match your filters"
                          : "No contacts yet"}
                      </p>
                      <p className="text-xs text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70">
                        {hasActiveFilters
                          ? "Try a different search or clear the filter."
                          : "Add your first contact to get started."}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className={`inline-flex h-11 items-center gap-2 rounded-xl border border-[#2B2A2A]/15 px-4 text-xs font-semibold text-[#2B2A2A] transition-colors hover:bg-[#2B2A2A]/5 dark:border-[#F5F2F2]/15 dark:text-[#F5F2F2] dark:hover:bg-[#F5F2F2]/10 ${focusRing}`}
                        >
                          Clear filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsOpen(true)}
                          className={`inline-flex h-11 items-center gap-2 rounded-xl bg-[#5A7ACD] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#4A69BC] ${focusRing}`}
                        >
                          <Plus size={14} aria-hidden="true" />
                          Add contact
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="group transition-colors hover:bg-[#5A7ACD]/5 dark:hover:bg-[#5A7ACD]/10"
                  >
                    <td className="px-3 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5A7ACD]/10 text-xs font-bold text-[#334E9E] dark:bg-[#5A7ACD]/20 dark:text-[#B8C8F5] sm:flex"
                        >
                          {getInitials(contact.name)}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/contacts/${contact.id}`}
                            className={`block max-w-[120px] truncate font-semibold text-[#2B2A2A] transition-colors hover:text-[#334E9E] hover:underline underline-offset-2 dark:text-[#F5F2F2] dark:hover:text-[#B8C8F5] sm:max-w-[280px] ${focusRing}`}
                          >
                            {contact.name}
                          </Link>
                          <span className="block truncate text-xs text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70 md:hidden">
                            {contact.contactType}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-6 py-4 md:table-cell">
                      <span
                        title={contact.contactType}
                        className="inline-block max-w-[170px] truncate rounded-md bg-[#2B2A2A]/5 px-2 py-1 text-xs font-medium text-[#2B2A2A]/70 dark:bg-[#F5F2F2]/5 dark:text-[#F5F2F2]/70"
                      >
                        {contact.contactType || "-"}
                      </span>
                    </td>

                    <td className="px-3 py-4 sm:px-6">
                      <StatusBadge status={contact.isClient} />
                    </td>

                    <td className="hidden px-6 py-4 lg:table-cell">
                      {contact.phoneNumber ? (
                        <a
                          href={`tel:${contact.phoneNumber.replace(/\s+/g, "")}`}
                          className={`whitespace-nowrap text-[#2B2A2A]/70 transition-colors hover:text-[#334E9E] dark:text-[#F5F2F2]/70 dark:hover:text-[#B8C8F5] ${focusRing}`}
                        >
                          {contact.phoneNumber}
                        </a>
                      ) : (
                        <span className="text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70">
                          -
                        </span>
                      )}
                    </td>

                    <td className="hidden px-6 py-4 xl:table-cell">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          title={contact.email}
                          className={`block max-w-[200px] truncate text-[#2B2A2A]/70 transition-colors hover:text-[#334E9E] dark:text-[#F5F2F2]/70 dark:hover:text-[#B8C8F5] ${focusRing}`}
                        >
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70">
                          -
                        </span>
                      )}
                    </td>

                    <td className="hidden px-6 py-4 2xl:table-cell">
                      <span
                        title={contact.address ?? undefined}
                        className="block max-w-[200px] truncate text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70"
                      >
                        {contact.address || "-"}
                      </span>
                    </td>

                    <td className="hidden whitespace-nowrap px-6 py-4 text-right text-xs text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70 sm:table-cell">
                      {formatContactDate(contact.createdAt)}
                    </td>

                    <td className="px-4 py-4 text-right sm:px-6">
                      <Link
                        href={`/contacts/${contact.id}`}
                        aria-label={`View ${contact.name}`}
                        className={`inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-[#2B2A2A]/10 px-2.5 text-xs font-semibold text-[#2B2A2A]/70 transition-colors hover:border-[#5A7ACD]/30 hover:bg-[#5A7ACD]/5 hover:text-[#334E9E] dark:border-[#F5F2F2]/10 dark:text-[#F5F2F2]/70 dark:hover:bg-[#5A7ACD]/10 dark:hover:text-[#B8C8F5] lg:px-3 ${focusRing}`}
                      >
                        <Eye size={14} aria-hidden="true" />
                        <span className="hidden lg:inline">View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <AddContactModal
          onClose={() => setIsOpen(false)}
          onCreated={refreshContacts}
        />
      )}
    </div>
  );
}

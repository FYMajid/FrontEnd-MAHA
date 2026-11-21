import api from "./api";

const apiBaseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api";
const apiOrigin = apiBaseURL.replace(/\/api$/, "");

export type InvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "OVERDUE";
export type PaymentProofStatus = "PENDING" | "VERIFIED";
export type DepositActionType = "ADD" | "REFUND";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummary {
  id: string;
  name?: string | null;
  caseArea?: string | null;
  caseType?: string | null;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  clientId: string;
  client?: {
    id: string;
    name?: string | null;
  } | null;
  matterId: string;
  matter?: {
    id: string;
    caseArea?: string | null;
    caseType?: string | null;
    client?: {
      id: string;
      name?: string | null;
    } | null;
  } | null;
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string | null;
  description?: string | null;
  notes?: string | null;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  paymentProofs?: PaymentProofRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProofRecord {
  id: string;
  invoiceId: string;
  invoice?: {
    id: string;
    invoiceNo: string;
    totalAmount: number;
    status: InvoiceStatus;
    client?: {
      id: string;
      name?: string | null;
    } | null;
    matter?: {
      id: string;
      caseArea?: string | null;
      caseType?: string | null;
    } | null;
  } | null;
  paymentDate: string;
  amountPaid: number;
  paymentMethod?: string | null;
  referenceNo?: string | null;
  notes?: string | null;
  fileUrl?: string | null;
  status: PaymentProofStatus;
  verifiedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRecord {
  id: string;
  clientId: string;
  client?: {
    id: string;
    name?: string | null;
  } | null;
  matterId?: string | null;
  matter?: {
    id: string;
    caseArea?: string | null;
    caseType?: string | null;
    client?: {
      id: string;
      name?: string | null;
    } | null;
  } | null;
  amount: number;
  refundedAmount: number;
  utilizedAmount: number;
  availableAmount: number;
  utilizationPercent: number;
  lastTransactionDate: string;
  paymentMethod?: string | null;
  referenceNo?: string | null;
  description?: string | null;
  lastActionType: DepositActionType;
  createdAt: string;
  updatedAt: string;
}

type ApiResponse<T> = T | { status?: string; data?: T };

const normalizeList = <T>(payload: ApiResponse<T[]>): T[] => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
};

const normalizeDetail = <T extends { id: string }>(payload: ApiResponse<T>): T => {
  if ("id" in payload) return payload;
  if (payload.data) return payload.data;
  throw new Error("Invalid transactions response");
};

const appendTextField = (
  formData: FormData,
  key: string,
  value: string | number | null | undefined,
) => {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
};

export const resolveTransactionFileUrl = (fileUrl?: string | null) => {
  if (!fileUrl) return null;

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const normalizedPath = fileUrl.startsWith("/")
    ? fileUrl
    : `/${fileUrl.replace(/^\/+/, "")}`;

  return `${apiOrigin}${normalizedPath}`;
};

export const transactionService = {
  async listInvoices(params?: {
    search?: string;
    status?: InvoiceStatus | "UNPAID";
    clientId?: string;
    matterId?: string;
  }) {
    const response = await api.get<ApiResponse<InvoiceRecord[]>>(
      "/transactions/invoices",
      { params },
    );
    return normalizeList(response.data);
  },

  async getInvoiceById(id: string) {
    const response = await api.get<ApiResponse<InvoiceRecord>>(
      `/transactions/invoices/${id}`,
    );
    return normalizeDetail(response.data);
  },

  async createInvoice(payload: {
    invoiceNo?: string;
    clientId: string;
    matterId: string;
    invoiceDate: string;
    dueDate: string;
    paymentTerms?: string;
    description?: string;
    notes?: string;
    taxPercent?: number;
    items: Array<{
      description: string;
      quantity: number;
      rate: number;
    }>;
  }) {
    const response = await api.post<ApiResponse<InvoiceRecord>>(
      "/transactions/invoices",
      payload,
    );
    return normalizeDetail(response.data);
  },

  async updateInvoice(
    id: string,
    payload: Partial<{
      invoiceNo: string;
      clientId: string;
      matterId: string;
      invoiceDate: string;
      dueDate: string;
      paymentTerms: string;
      description: string;
      notes: string;
      taxPercent: number;
      items: Array<{
        description: string;
        quantity: number;
        rate: number;
      }>;
    }>,
  ) {
    const response = await api.put<ApiResponse<InvoiceRecord>>(
      `/transactions/invoices/${id}`,
      payload,
    );
    return normalizeDetail(response.data);
  },

  async removeInvoice(id: string) {
    await api.delete(`/transactions/invoices/${id}`);
  },

  async listPaymentProofs(params?: {
    search?: string;
    status?: PaymentProofStatus;
    invoiceId?: string;
  }) {
    const response = await api.get<ApiResponse<PaymentProofRecord[]>>(
      "/transactions/payment-proofs",
      { params },
    );
    return normalizeList(response.data);
  },

  async getPaymentProofById(id: string) {
    const response = await api.get<ApiResponse<PaymentProofRecord>>(
      `/transactions/payment-proofs/${id}`,
    );
    return normalizeDetail(response.data);
  },

  async createPaymentProof(payload: {
    invoiceId: string;
    paymentDate: string;
    amountPaid: number;
    paymentMethod?: string;
    referenceNo?: string;
    notes?: string;
    file?: File | null;
  }) {
    const formData = new FormData();
    appendTextField(formData, "invoiceId", payload.invoiceId);
    appendTextField(formData, "paymentDate", payload.paymentDate);
    appendTextField(formData, "amountPaid", payload.amountPaid);
    appendTextField(formData, "paymentMethod", payload.paymentMethod);
    appendTextField(formData, "referenceNo", payload.referenceNo);
    appendTextField(formData, "notes", payload.notes);
    if (payload.file) {
      formData.append("file", payload.file);
    }

    const response = await api.post<ApiResponse<PaymentProofRecord>>(
      "/transactions/payment-proofs",
      formData,
    );
    return normalizeDetail(response.data);
  },

  async updatePaymentProof(
    id: string,
    payload: Partial<{
      invoiceId: string;
      paymentDate: string;
      amountPaid: number;
      paymentMethod: string;
      referenceNo: string;
      notes: string;
      file: File | null;
    }>,
  ) {
    const formData = new FormData();
    appendTextField(formData, "invoiceId", payload.invoiceId);
    appendTextField(formData, "paymentDate", payload.paymentDate);
    appendTextField(formData, "amountPaid", payload.amountPaid);
    appendTextField(formData, "paymentMethod", payload.paymentMethod);
    appendTextField(formData, "referenceNo", payload.referenceNo);
    appendTextField(formData, "notes", payload.notes);
    if (payload.file) {
      formData.append("file", payload.file);
    }

    const response = await api.put<ApiResponse<PaymentProofRecord>>(
      `/transactions/payment-proofs/${id}`,
      formData,
    );
    return normalizeDetail(response.data);
  },

  async removePaymentProof(id: string) {
    await api.delete(`/transactions/payment-proofs/${id}`);
  },

  async listDeposits(params?: {
    search?: string;
    clientId?: string;
    matterId?: string;
  }) {
    const response = await api.get<ApiResponse<DepositRecord[]>>(
      "/transactions/deposits",
      { params },
    );
    return normalizeList(response.data);
  },

  async getDepositById(id: string) {
    const response = await api.get<ApiResponse<DepositRecord>>(
      `/transactions/deposits/${id}`,
    );
    return normalizeDetail(response.data);
  },

  async createDeposit(payload: {
    action: DepositActionType;
    clientId: string;
    matterId?: string | null;
    transactionDate: string;
    amount: number;
    paymentMethod?: string;
    referenceNo?: string;
    description?: string;
  }) {
    const response = await api.post<ApiResponse<DepositRecord>>(
      "/transactions/deposits",
      payload,
    );
    return normalizeDetail(response.data);
  },

  async updateDeposit(
    id: string,
    payload: Partial<{
      clientId: string;
      matterId: string | null;
      transactionDate: string;
      amount: number;
      paymentMethod: string;
      referenceNo: string;
      description: string;
    }>,
  ) {
    const response = await api.put<ApiResponse<DepositRecord>>(
      `/transactions/deposits/${id}`,
      payload,
    );
    return normalizeDetail(response.data);
  },

  async removeDeposit(id: string) {
    await api.delete(`/transactions/deposits/${id}`);
  },
};

import api from "./api";

export type DocumentType = "FILE" | "FOLDER";

const apiBaseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api";
const apiOrigin = apiBaseURL.replace(/\/api$/, "");

export interface DocumentItem {
  id: string;
  type: DocumentType;
  name: string;
  parentId?: string | null;
  contactId?: string | null;
  contact?: { id: string; name?: string | null } | null;
  matterId?: string | null;
  matter?: { id: string; caseArea?: string | null } | null;
  physicalLocation?: string | null;
  hyperlink?: string | null;
  description?: string | null;
  createdAt?: string;
  uploadDate: string;
  lastEdit: string;
  fileUrl?: string | null;
  fileSize?: number | null;
  isDeleted: boolean;
}

type DocumentApiItem = Omit<DocumentItem, "uploadDate"> & {
  parentId?: string | null;
  uploadDate?: string;
  createdAt?: string;
  isDeleted?: boolean;
};

type DocumentListResponse =
  | DocumentApiItem[]
  | { status?: string; data?: DocumentApiItem[] };

type DocumentDetailResponse =
  | DocumentApiItem
  | { status?: string; data?: DocumentApiItem };

export interface DocumentBreadcrumbItem {
  id: string;
  name: string;
  type: DocumentType;
  parentId?: string | null;
}

type DocumentBreadcrumbResponse =
  | DocumentBreadcrumbItem[]
  | { status?: string; data?: DocumentBreadcrumbItem[] };

export interface DocumentListParams {
  all?: boolean;
  trash?: boolean;
  parentId?: string | null;
  contactId?: string | null;
  matterId?: string | null;
}

export interface CreateDocumentPayload {
  type: DocumentType;
  name: string;
  parentId?: string | null;
  contactId?: string;
  matterId?: string;
  physicalLocation?: string;
  hyperlink?: string;
  description?: string;
  file?: File | null;
}

export interface UpdateDocumentPayload {
  name?: string;
  parentId?: string | null;
  physicalLocation?: string;
  hyperlink?: string;
  description?: string;
  contactId?: string;
  matterId?: string;
}

const normalizeDocument = (item: DocumentApiItem): DocumentItem => ({
  ...item,
  parentId: item.parentId ?? null,
  isDeleted: Boolean(item.isDeleted),
  uploadDate: item.uploadDate ?? item.createdAt ?? "",
});

const normalizeList = (payload: DocumentListResponse): DocumentItem[] => {
  if (Array.isArray(payload)) return payload.map(normalizeDocument);
  return (payload.data ?? []).map(normalizeDocument);
};

const normalizeDetail = (payload: DocumentDetailResponse): DocumentItem => {
  if ("id" in payload) return normalizeDocument(payload);
  if (payload.data) return normalizeDocument(payload.data);
  throw new Error("Invalid document response");
};

const normalizeBreadcrumbList = (
  payload: DocumentBreadcrumbResponse,
): DocumentBreadcrumbItem[] => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
};

const appendTextField = (
  formData: FormData,
  key: string,
  value: string | null | undefined,
) => {
  if (value === undefined || value === null) return;
  formData.append(key, value);
};

const buildQueryParams = (params?: DocumentListParams) => {
  if (!params) return undefined;

  const query: Record<string, string> = {};

  if (params.all) {
    query.all = "true";
  }

  if (params.trash) {
    query.trash = "true";
  }

  if (params.parentId !== undefined) {
    query.parentId = params.parentId ?? "null";
  }

  if (params.contactId !== undefined) {
    const contactId = params.contactId?.trim();
    if (contactId) {
      query.contactId = contactId;
    } else {
      query.contactId = "null";
    }
  }

  if (params.matterId !== undefined) {
    const matterId = params.matterId?.trim();
    if (matterId) {
      query.matterId = matterId;
    } else {
      query.matterId = "null";
    }
  }

  return query;
};

export const documentService = {
  async list(params?: DocumentListParams) {
    const response = await api.get<DocumentListResponse>("/document", {
      params: buildQueryParams(params),
    });
    return normalizeList(response.data);
  },

  async listByParent(
    parentId: string | null,
    filters?: { contactId?: string | null; matterId?: string | null },
  ) {
    return this.list({
      parentId,
      contactId: filters?.contactId,
      matterId: filters?.matterId,
    });
  },

  async listAll() {
    return this.list({ all: true });
  },

  async listTrash() {
    return this.list({ trash: true });
  },

  async getById(id: string) {
    const response = await api.get<DocumentDetailResponse>(`/document/${id}`);
    return normalizeDetail(response.data);
  },

  async getBreadcrumb(id: string) {
    const response = await api.get<DocumentBreadcrumbResponse>(
      `/document/${id}/breadcrumb`,
    );
    return normalizeBreadcrumbList(response.data);
  },

  async create(payload: CreateDocumentPayload) {
    const { file, ...payloadData } = payload;

    if (file) {
      const formData = new FormData();
      formData.append("type", payloadData.type);
      formData.append("name", payloadData.name);
      appendTextField(formData, "parentId", payloadData.parentId ?? undefined);
      appendTextField(formData, "contactId", payloadData.contactId);
      appendTextField(formData, "matterId", payloadData.matterId);
      appendTextField(formData, "physicalLocation", payloadData.physicalLocation);
      appendTextField(formData, "hyperlink", payloadData.hyperlink);
      appendTextField(formData, "description", payloadData.description);
      formData.append("file", file);

      const response = await api.post<DocumentDetailResponse>("/document", formData);

      return normalizeDetail(response.data);
    }

    const response = await api.post<DocumentDetailResponse>(
      "/document",
      payloadData,
    );
    return normalizeDetail(response.data);
  },

  async update(id: string, payload: UpdateDocumentPayload) {
    const response = await api.put<DocumentDetailResponse>(`/document/${id}`, payload);
    return normalizeDetail(response.data);
  },

  async remove(id: string) {
    await api.delete(`/document/${id}`);
  },
};

export const resolveDocumentFileUrl = (fileUrl?: string | null) => {
  if (!fileUrl) return null;

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const normalizedPath = fileUrl.startsWith("/")
    ? fileUrl
    : `/${fileUrl.replace(/^\/+/, "")}`;

  return `${apiOrigin}${normalizedPath}`;
};

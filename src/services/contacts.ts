import api from "./api";

export type ClientStatus = "CLIENT" | "NON_CLIENT";
export type ContactFilter = "All" | ClientStatus;

export interface PersonalDetail {
  citizenship?: string | null;
  identificationNo?: string | null;
  office_position?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  religion?: string | null;
}

export interface BusinessDetail {
  businessType?: string | null;
  taxCode?: string | null;
  commissioners?: string | null;
  directors?: string | null;
  shareholders?: string | null;
  lawyers?: string | null;
}

export interface OrganizationDetail {
  structureType?: string | null;
  taxCode?: string | null;
  maintainers?: string | null;
  mentors?: string | null;
  supervisors?: string | null;
  members?: string | null;
  lawyers?: string | null;
}

export interface Contact {
  id: string;
  isClient: ClientStatus;
  contactType: string;
  name: string;
  image?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  additionalInfo?: string | null;
  creator: string;
  createdAt: string;
  personalDetail?: PersonalDetail | null;
  businessDetail?: BusinessDetail | null;
  organizationDetail?: OrganizationDetail | null;
}

export const contactService = {
  async list(params?: { search?: string; filter?: ContactFilter }) {
    const response = await api.get<Contact[]>("/contact", { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Contact>(`/contact/${id}`);
    return response.data;
  },

  async create(payload: {
    isClient: ClientStatus;
    contactType: string;
    name: string;
    image?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    additionalInfo?: string;
    creator: string;
    personalData?: {
      citizenship?: string;
      identificationNo?: string;
      position?: string;
      office_position?: string;
      gender?: string;
      birthDate?: string;
      religion?: string;
    };
    businessData?: {
      businessType?: string;
      taxCode?: string;
      commissioners?: string;
      directors?: string;
      shareholders?: string;
      lawyers?: string;
    };
    organizationData?: {
      structureType?: string;
      taxCode?: string;
      maintainers?: string;
      mentors?: string;
      supervisors?: string;
      members?: string;
      lawyers?: string;
    };
  }) {
    const response = await api.post<Contact>("/contact", payload);
    return response.data;
  },

  async remove(id: string) {
    await api.delete(`/contact/${id}`);
  },
};

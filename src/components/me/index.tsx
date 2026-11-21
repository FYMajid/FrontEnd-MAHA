"use client";

import React, { useState } from "react";
import {
  User,
  Briefcase,
  MapPin,
  Edit2,
  Save,
  X,
  Camera,
  Settings,
  Building2,
  CheckCircle,
  Layers,
  BarChart3,
  CreditCard,
  Clock,
  LogOut,
} from "lucide-react";
import ProfileSidebar from "./ProfileSidebar";

interface ProfileData {
  firstName: string;
  lastName: string;
  initials: string;
  position: string;
  hourlyRate: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
}

const initialProfileData: ProfileData = {
  firstName: "Aufa",
  lastName: "Hajran",
  initials: "A.H",
  position: "Senior Associate",
  hourlyRate: "Rp 100.000,00",
  email: "aufa.hajran@legal.com",
  phone: "+62 812-3456-7890",
  address: "Jl. Sudirman No. 123",
  city: "Jakarta",
  province: "DKI Jakarta",
};

// Constants
const COLORS = {
  bg: "bg-[#F5F2F2] dark:bg-[#2B2A2A]",
  text: "text-[#2B2A2A] dark:text-[#F5F2F2]",
  secondary: "text-slate-500 dark:text-white/60",
  primary: "bg-[#5A7ACD]",
  secondary_btn: "bg-[#FEB05D]",
  card: "bg-white dark:bg-[#333232]",
  border: "border-[#2B2A2A]/5 dark:border-[#F5F2F2]/5",
  input: "bg-[#F5F2F2] dark:bg-[#2B2A2A]",
};

// Component untuk Row Info yang Editable
interface InfoRowProps {
  label: string;
  value: string;
  editable?: boolean;
  field?: keyof ProfileData;
  isEditing?: boolean;
  editData?: ProfileData;
  onInputChange?: (field: keyof ProfileData, value: string) => void;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  editable = false,
  field,
  isEditing,
  editData,
  onInputChange,
}) => (
  <div className="mb-6 last:mb-0">
    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/50 block mb-2">
      {label}
    </label>
    {isEditing && editable && field && editData && onInputChange ? (
      <input
        type="text"
        value={editData[field]}
        onChange={(e) => onInputChange(field, e.target.value)}
        className={`w-full ${COLORS.input} border border-[#5A7ACD]/30 rounded-lg px-4 py-2.5 text-sm font-semibold ${COLORS.text} focus:ring-2 focus:ring-[#5A7ACD] outline-none transition-all`}
      />
    ) : (
      <div className={`${COLORS.text} font-semibold px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-lg`}>
        {value}
      </div>
    )}
  </div>
);

// Component untuk Section Card
interface SectionCardProps {
  title: string;
  icon: React.ElementType;
  description: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon: Icon,
  description,
  children,
}) => (
  <div className={`${COLORS.card} rounded-2xl p-6 md:p-8 border ${COLORS.border} shadow-lg shadow-[#2B2A2A]/5 dark:shadow-none`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2.5 bg-[#5A7ACD]/10 rounded-lg text-[#5A7ACD]">
        <Icon size={20} />
      </div>
      <h2 className={`text-base md:text-lg font-black uppercase tracking-tight ${COLORS.text}`}>
        {title}
      </h2>
    </div>
    <p className={`text-sm ${COLORS.secondary} mb-6`}>{description}</p>
    {children}
  </div>
);

// Component untuk Button
interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "success" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const variants = {
    primary: `${COLORS.primary} hover:${COLORS.secondary_btn} text-[#F5F2F2] hover:text-[#2B2A2A]`,
    success: "bg-emerald-500 hover:bg-emerald-600 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-slate-400 hover:bg-slate-500 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      onClick={onClick}
      className={`${variants[variant]} ${sizes[size]} font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 rounded-lg ${className}`}
    >
      {children}
    </button>
  );
};

// Component untuk Toggle Setting
interface ToggleSettingProps {
  label: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  defaultChecked = false,
  onChange,
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    onChange?.(newState);
  };

  return (
    <div
      className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white/70 dark:hover:bg-black/30 transition-colors cursor-pointer"
      onClick={handleToggle}
    >
      <span className="text-sm font-semibold text-[#2B2A2A] dark:text-[#F5F2F2]">
        {label}
      </span>
      <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${isChecked ? "bg-[#5A7ACD]" : "bg-slate-300 dark:bg-slate-600"}`}>
        <div className={`w-5 h-5 bg-white rounded-full transition-all ${isChecked ? "ml-auto" : ""}`} />
      </div>
    </div>
  );
};

// Component utama
export default function MePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [editData, setEditData] = useState<ProfileData>(profileData);

  const handleEditClick = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={`min-h-screen ${COLORS.bg} ${COLORS.text} p-6 md:p-10 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[288px_1fr] gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <ProfileSidebar
              userName={profileData.firstName + " " + profileData.lastName}
              initials={profileData.initials}
              onLogout={() => alert("Logout clicked")}
            />
          </div>

          {/* Main Content */}
          <div className="md:col-span-1 space-y-8">
            {/* Header dengan Profile Picture */}
            <div className={`${COLORS.card} rounded-2xl p-6 md:p-8 border ${COLORS.border} shadow-lg shadow-[#2B2A2A]/5 dark:shadow-none`}>
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-32 h-32 ${COLORS.primary} rounded-2xl flex items-center justify-center text-[#F5F2F2] font-black text-5xl shadow-lg shadow-[#5A7ACD]/30`}>
                    {profileData.initials}
                  </div>
                  <button className={`absolute bottom-2 right-2 ${COLORS.secondary_btn} hover:${COLORS.primary} p-2 rounded-lg text-white transition-all shadow-md hover:shadow-lg`}>
                    <Camera size={16} />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className={`text-2xl lg:text-3xl font-black tracking-tight mb-2 ${COLORS.text}`}>
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                    <Briefcase size={18} className="text-[#5A7ACD]" />
                    <span className="text-base lg:text-lg font-bold text-[#5A7ACD]">
                      {profileData.position}
                    </span>
                  </div>
                  <p className={`text-sm ${COLORS.secondary}`}>
                    Profil informasi profesional Anda untuk Legal Plus
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap justify-center lg:justify-end">
                  {!isEditing ? (
                    <Button onClick={handleEditClick} variant="primary" size="md">
                      <Edit2 size={18} /> Edit
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} variant="success" size="md">
                        <Save size={18} /> Save
                      </Button>
                      <Button onClick={handleCancel} variant="secondary" size="md">
                        <X size={18} /> Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic & Personal Info */}
              <div className="space-y-8">
                {/* Informasi Dasar */}
                <SectionCard
                  title="Informasi Dasar"
                  icon={User}
                  description="Masukkan data identitas Anda seperti nama lengkap dan inisial yang akan digunakan pada Legal Plus"
                >
                  <InfoRow
                    label="Nama Depan"
                    value={profileData.firstName}
                    editable
                    field="firstName"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                  <InfoRow
                    label="Nama Belakang"
                    value={profileData.lastName}
                    editable
                    field="lastName"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                  <InfoRow
                    label="Inisial"
                    value={profileData.initials}
                    editable
                    field="initials"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                </SectionCard>

                {/* Informasi Personal */}
                <SectionCard
                  title="Informasi Personal"
                  icon={MapPin}
                  description="Tambahkan detail kontak dan alamat pribadi agar klien dan tim dapat menghubungi Anda dengan mudah."
                >
                  <InfoRow
                    label="Email"
                    value={profileData.email}
                    editable
                    field="email"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                  <InfoRow
                    label="Nomor Telepon"
                    value={profileData.phone}
                    editable
                    field="phone"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                  <InfoRow
                    label="Alamat"
                    value={profileData.address}
                    editable
                    field="address"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                  <InfoRow
                    label="Kota"
                    value={profileData.city}
                    editable
                    field="city"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                  <InfoRow
                    label="Provinsi"
                    value={profileData.province}
                    editable
                    field="province"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                </SectionCard>
              </div>

              {/* Right Column - Practice & Settings */}
              <div className="space-y-8">
                {/* Detail Praktek */}
                <SectionCard
                  title="Detail Praktek"
                  icon={Briefcase}
                  description="Kelola informasi praktik profesional Anda, termasuk jabatan dan struktur tarif yang berlaku."
                >
                  <InfoRow
                    label="Jabatan"
                    value={profileData.position}
                    editable
                    field="position"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                  <InfoRow
                    label="Biaya Per Jam"
                    value={profileData.hourlyRate}
                    editable
                    field="hourlyRate"
                    isEditing={isEditing}
                    editData={editData}
                    onInputChange={handleInputChange}
                  />
                </SectionCard>

                {/* Preferensi Akun */}
                <div className={`${COLORS.card} rounded-2xl p-6 md:p-8 border ${COLORS.border} shadow-lg shadow-[#2B2A2A]/5 dark:shadow-none bg-gradient-to-br from-[#5A7ACD]/5 dark:from-[#5A7ACD]/15 to-[#FEB05D]/5 dark:to-[#FEB05D]/15`}>
                  <h3 className={`font-black text-lg mb-4 ${COLORS.text} uppercase tracking-tight`}>
                    Preferensi Akun
                  </h3>
                  <div className="space-y-3">
                    <ToggleSetting label="Two-Factor Authentication" defaultChecked />
                    <ToggleSetting label="Notifikasi Email" defaultChecked={false} />
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 md:p-8 border border-red-200 dark:border-red-800/30 shadow-md">
                  <h3 className="font-black text-lg mb-4 text-red-600 dark:text-red-400 uppercase tracking-tight">
                    Zona Berbahaya
                  </h3>
                  <Button variant="danger" size="md" className="w-full">
                    Logout dari Semua Perangkat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

interface FileUploadProps {
    onUploadSuccess: (url: string) => void;
    folder?: string;
    defaultValue?: string;
    aspectRatio?: string;
    label?: string;
    required?: boolean;
}

export default function FileUpload({
    onUploadSuccess,
    defaultValue = "",
    folder = "general",
    label,
    aspectRatio = "aspect-video",
    required
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(defaultValue);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper to get full URL
    const getFullImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
        return `${baseUrl}${path}`;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post(`/Upload?folder=${folder}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status === 200) {
                const url = res.data.url;
                setPreview(url);
                onUploadSuccess(url);
                toast.success("File uploaded successfully");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    const handleRemove = () => {
        setPreview("");
        onUploadSuccess("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full space-y-2 text-left">
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`relative group ${aspectRatio} dark:bg-[#0B1223] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden transition-all hover:border-[#FF3131] ${uploading ? 'opacity-50' : ''}`}
            >
                {preview ? (
                    <>
                        <img
                            src={getFullImageUrl(preview)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <Upload size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 dark:text-white flex flex-col items-center gap-2 w-full h-full justify-center p-4 text-center"
                    >
                        {uploading ? (
                            <Loader2 className="animate-spin" size={32} />
                        ) : (
                            <>
                                <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-full">
                                    <Upload size={24} className="text-[#FF3131]" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-widest">Select Image</p>
                                    <p className="text-[10px] text-gray-400 italic">Drag and drop or click to browse</p>
                                </div>
                            </>
                        )}
                    </button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>
        </div>
    );
}

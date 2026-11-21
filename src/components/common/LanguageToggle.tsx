"use client";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="relative w-14 h-8 bg-black/50 backdrop-blur-sm rounded-full p-1 border border-white/20 shadow-inner flex items-center transition-colors hover:border-white/40"
            aria-label="Toggle Language"
        >
            <motion.div
                className="w-6 h-6 bg-[#FF3131] rounded-full shadow-md flex items-center justify-center text-[10px] font-black text-white"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                style={{
                    marginLeft: language === "EN" ? "0px" : "24px" // Simple manual positioning fallback
                }}
            // Using layout prop from framer motion for smooth toggle
            >
                {language}
            </motion.div>
        </button>
    );
};

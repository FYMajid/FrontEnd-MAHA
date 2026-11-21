"use client";

import GridShape from "@/components/common/GridShape";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] transition-colors duration-500 overflow-hidden">
        <div className="relative flex flex-col lg:flex-row w-full min-h-screen">
          
          {/* SISI KIRI: Form Area */}
          <div className="lg:w-1/2 w-full flex items-center justify-center p-6 sm:p-12 z-10">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>

          {/* SISI KANAN: Visual Branding */}
          <div className="lg:w-1/2 w-full hidden lg:flex relative items-center justify-center overflow-hidden bg-[#5A7ACD]">
            {/* Dekorasi Abstrak */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FEB05D] rounded-full blur-[120px] opacity-20 -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black rounded-full blur-[100px] opacity-10 -ml-20 -mb-20"></div>

            <div className="relative z-10 flex flex-col items-center text-center px-12">
              {/* Floating Grid */}
              <div className="absolute inset-0 z-[-1] opacity-40 scale-150">
                <GridShape />
              </div>

                <div className="mb-8 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl">
                  <Image
                    width={180}
                    height={40}
                    src="/images/logo/auth-logo.svg"
                    alt="Logo"
                    className="brightness-0 invert"
                  />
                </div>
            
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                Grow Your Business <br /> <span className="text-[#FEB05D]">With Precision.</span>
              </h2>
              <p className="text-white/80 max-w-sm leading-relaxed">
                Kelola data dan analitik Anda dalam satu platform terintegrasi dengan desain yang memanjakan mata.
              </p>
              
              {/* Badge Dekoratif */}
              <div className="mt-10 flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#FEB05D]"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
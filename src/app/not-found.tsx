"use client";
import GridShape from "@/components/common/GridShape";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-[#F5F2F2] dark:bg-[#2B2A2A] transition-colors duration-300">
      {/* Memastikan scroll horizontal layar mati */}
      <style jsx global>{`
        html, body {
          max-width: 100%;
          overflow-x: hidden !important;
        }
      `}</style>

      <GridShape />
      
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px] z-10">
        <h1 className="mb-8 font-black text-[#5A7ACD] text-title-md dark:text-[#5A7ACD] xl:text-title-2xl tracking-tighter">
          ERROR
        </h1>

        <div className="relative group">
          <Image
            src="/images/error/404.svg"
            alt="404"
            className="dark:hidden transition-transform duration-500 group-hover:scale-105"
            width={472}
            height={152}
          />
          <Image
            src="/images/error/404-dark.svg"
            alt="404"
            className="hidden dark:block transition-transform duration-500 group-hover:scale-105"
            width={472}
            height={152}
          />
        </div>

        <p className="mt-10 mb-8 text-base font-medium text-[#2B2A2A] dark:text-[#F5F2F2] sm:text-lg opacity-80">
          Oops! Kami tidak dapat menemukan halaman yang Anda cari.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-[#5A7ACD] px-8 py-4 text-sm font-black uppercase tracking-widest text-[#F5F2F2] shadow-lg shadow-[#5A7ACD]/20 hover:bg-[#FEB05D] hover:text-[#2B2A2A] transition-all duration-300 active:scale-95"
        >
          Back to Home Page
        </Link>
      </div>

      {/* */}
      <p className="absolute text-xs font-bold tracking-widest text-center text-[#2B2A2A]/40 dark:text-[#F5F2F2]/40 -translate-x-1/2 bottom-6 left-1/2 uppercase">
        &copy; {new Date().getFullYear()} - MAHA Legal Tech System
      </p>
    </div>
  );
}
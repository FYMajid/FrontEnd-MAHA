"use client";

import React from "react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="space-y-8">
      {/* Header Form */}
      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-[#2B2A2A] dark:text-[#F5F2F2] tracking-tight">
          Masuk <span className="text-[#5A7ACD]">.</span>
        </h1>
        {/* <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
          Belum punya akun? {" "}
            <Link href="/signup" className="text-[#5A7ACD] hover:text-[#FEB05D] transition-colors font-bold">
              Buat akun baru
            </Link>
        </p> */}
      </div>

      <form className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="contoh@email.com"
            className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#363535] border-2 border-transparent focus:border-[#5A7ACD] dark:text-white outline-none transition-all shadow-sm focus:shadow-md"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Password
            </label>
            <Link href="#" className="text-xs font-bold text-[#5A7ACD] hover:underline">
              Lupa Password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#363535] border-2 border-transparent focus:border-[#5A7ACD] dark:text-white outline-none transition-all shadow-sm focus:shadow-md"
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2 px-1">
          <input type="checkbox" className="w-4 h-4 accent-[#5A7ACD] rounded" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Ingat perangkat ini</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#5A7ACD] hover:bg-[#FEB05D] text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-[#5A7ACD]/30 hover:shadow-[#FEB05D]/40"
        >
          Masuk ke Dashboard
        </button>

        {/* Social Login Divider */}
          {/* <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#F5F2F2] dark:bg-[#2B2A2A] px-2 text-gray-500">Atau masuk dengan</span></div>
          </div> */}

        {/* Google Login (Contoh Assets) */}
        {/* <button className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#363535] border border-gray-200 dark:border-gray-600 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#403f3f] transition-all font-semibold dark:text-white">
          <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
          Google
        </button> */}
      </form>
    </div>
  );
}
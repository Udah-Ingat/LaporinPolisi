"use client";

import { FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Halaman tidak ditemukan
        </h1>
        
        <p className="text-gray-600 mb-6">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
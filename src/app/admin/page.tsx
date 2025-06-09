/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function AdminPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"pending" | "reviewed">("pending");

  const { data: stats } = api.admin.getStats.useQuery();
  const { data: violations, refetch } = api.admin.getViolations.useQuery({
    status: selectedTab === "pending" ? "pending" : "reviewed",
  });

  const reviewViolation = api.admin.reviewViolation.useMutation({
    onSuccess: async () => {
      toast.success("Pelanggaran berhasil ditinjau");
      await refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal meninjau pelanggaran");
    },
  });

  const handleReview = (violationId: number, action: "delete_post" | "dismiss") => {
    reviewViolation.mutate({ violationId, action });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Panel Admin</h1>
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Laporan</p>
            <p className="text-2xl font-bold">{stats.totalReports}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Laporan Aktif</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeReports}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Pengguna</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Pelanggaran Pending</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pendingViolations}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab("pending")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              selectedTab === "pending"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-500"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedTab("reviewed")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              selectedTab === "reviewed"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500"
            }`}
          >
            Ditinjau
          </button>
        </div>
      </div>

      {/* Violations List */}
      <div className="p-4 space-y-4">
        {!violations ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : violations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada pelanggaran {selectedTab === "pending" ? "pending" : "yang ditinjau"}
          </div>
        ) : (
          violations.map((violation) => (
            <div key={violation.id} className="bg-white rounded-lg p-4 space-y-3">
              {/* Report Info */}
              <div>
                <h3 className="font-semibold">{violation.report?.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {violation.report?.description}
                </p>
              </div>

              {/* Violation Info */}
              <div className="bg-red-50 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Alasan Pelaporan:</p>
                    <p className="text-sm text-red-700">{violation.reason}</p>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Dilaporkan oleh: {violation.reportedBy?.name ?? "Anonymous"}</span>
                <span>
                  {formatDistanceToNow(new Date(violation.createdAt), {
                    addSuffix: true,
                    locale: idLocale,
                  })}
                </span>
              </div>

              {/* Actions */}
              {selectedTab === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(violation.id, "dismiss")}
                    disabled={reviewViolation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Abaikan</span>
                  </button>
                  <button
                    onClick={() => handleReview(violation.id, "delete_post")}
                    disabled={reviewViolation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Hapus Post</span>
                  </button>
                </div>
              )}

              {/* Review Status */}
              {selectedTab === "reviewed" && violation.reviewedAt && (
                <div className="text-sm text-gray-500">
                  Ditinjau {formatDistanceToNow(new Date(violation.reviewedAt), {
                    addSuffix: true,
                    locale: idLocale,
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { formatDate } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ReportCard } from "@/components/report/report-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = params.userId as string;
  const [activeTab, setActiveTab] = useState<"laporan" | "tentang">("laporan");

  const { data: profile, isLoading: profileLoading } = api.user.getProfile.useQuery({
    userId,
  });

  const { data: reports, isLoading: reportsLoading } = api.report.getUserReports.useQuery({
    userId,
  });

  const isOwnProfile = session?.user?.id === userId;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-gray-500">Pengguna tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-pink-50 border-b border-pink-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {isOwnProfile && (
            <button
              onClick={() => router.push("/settings")}
              className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name ?? "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl">
                {profile.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{profile.name ?? "Anonymous"}</h1>
            <p className="text-gray-600">@{profile.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-pink-200 mb-4">
          <button
            onClick={() => setActiveTab("laporan")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "laporan"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500"
            }`}
          >
            Laporan
          </button>
          <button
            onClick={() => setActiveTab("tentang")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "tentang"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500"
            }`}
          >
            Tentang
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "laporan" ? (
          <div className="space-y-4">
            {reportsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : reports && reports.length > 0 ? (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={{
                    ...report,
                    user: profile,
                    likedByUser: false,
                  }}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Belum ada laporan
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* About Section */}
            <div className="bg-green-100 rounded-2xl p-4">
              <h2 className="font-semibold text-lg mb-3">Tentang Saya</h2>
              <p className="text-gray-700">
                {profile.bio ?? "Belum ada bio"}
              </p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Anggota sejak</span>
                  <span className="text-gray-600">
                    {formatDate(new Date(profile.joinedAt), "dd MMMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Lokasi</span>
                    <span className="text-gray-600">{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total Laporan</span>
                  <span className="text-gray-600">{profile.reportCount}</span>
                </div>
              </div>
            </div>

            {/* Communities */}
            {profile.profile?.communities && profile.profile.communities.length > 0 && (
              <div className="bg-green-100 rounded-2xl p-4">
                <h2 className="font-semibold text-lg mb-3">Komunitas</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.communities.map((community, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm"
                    >
                      {community}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {profile.profile?.notes && (
              <div className="bg-green-100 rounded-2xl p-4">
                <h2 className="font-semibold text-lg mb-3">Note</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {profile.profile.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
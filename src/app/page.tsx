"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { api } from "@/trpc/react";
import { ReportCard } from "@/components/report/report-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  const { data: reports, isLoading } = api.report.getAll.useQuery({
    search: searchQuery || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    location: selectedLocation || undefined,
    sortBy,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="p-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-green-100 rounded-full text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("latest")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    sortBy === "latest"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Terbaru
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    sortBy === "popular"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Populer
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Filter lokasi..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : reports && reports.length > 0 ? (
          reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada laporan
          </div>
        )}
      </main>
    </div>
  );
}
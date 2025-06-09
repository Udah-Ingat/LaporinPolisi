/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, Flag, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ReportCardProps {
  report: {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    location: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
    likesCount: number;
    commentsCount: number;
    likedByUser: boolean;
    tags?: Array<{ id: number; name: string }>;
  };
}

export function ReportCard({ report }: ReportCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [liked, setLiked] = useState(report.likedByUser);
  const [likesCount, setLikesCount] = useState(report.likesCount);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const utils = api.useUtils();
  const toggleLike = api.report.toggleLike.useMutation({
    onMutate: async () => {
      // Optimistic update
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    },
    onError: () => {
      // Revert on error
      setLiked(liked);
      setLikesCount(likesCount);
      toast.error("Gagal menyukai laporan");
    },
    onSuccess: async () => {
      await utils.report.getAll.invalidate();
    },
  });

  const reportViolation = api.report.reportViolation.useMutation({
    onSuccess: () => {
      toast.success("Laporan berhasil dikirim");
      setShowReportDialog(false);
      setReportReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Gagal melaporkan");
    },
  });

  const handleLike = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    toggleLike.mutate({ reportId: report.id });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.description,
          url: `${window.location.origin}/report/${report.id}`,
        });
      } catch (error) {
        console.log("Share cancelled:", error);
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/report/${report.id}`);
      toast.success("Link disalin ke clipboard");
    }
  };

  const handleReport = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setShowReportDialog(true);
  };

  const submitReport = () => {
    if (!reportReason.trim()) {
      toast.error("Alasan harus diisi");
      return;
    }
    reportViolation.mutate({ reportId: report.id, reason: reportReason });
  };

  return (
    <>
      <article className="bg-yellow-50 rounded-2xl p-4 shadow-sm">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
            {report.user?.image ? (
              <img
                src={report.user.image}
                alt={report.user.name ?? "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                {report.user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">
              {report.user?.name ?? "Anonymous"}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{report.location}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(report.createdAt), {
                  addSuffix: true,
                  locale: idLocale,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          onClick={() => router.push(`/report/${report.id}`)}
          className="cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2">{report.title}</h3>
          <p className="text-gray-700 text-sm line-clamp-3 mb-3">
            {report.description}
          </p>
          
          {/* Image */}
          {report.imageUrl && (
            <div className="rounded-lg overflow-hidden mb-3 bg-black">
              <img
                src={report.imageUrl}
                alt={report.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Tags */}
          {report.tags && report.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {report.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              liked
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <button
            onClick={() => router.push(`/report/${report.id}#comments`)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{report.commentsCount}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          <button
            onClick={handleReport}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </article>

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Laporkan Konten</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Jelaskan alasan pelaporan..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowReportDialog(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitReport}
                disabled={reportViolation.isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {reportViolation.isPending ? "Mengirim..." : "Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
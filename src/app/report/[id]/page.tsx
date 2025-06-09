/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Share2, Flag, MapPin, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const reportId = Number(params.id);
  const [comment, setComment] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const { data: report, isLoading } = api.report.getById.useQuery({ id: reportId });
  const { data: comments, refetch: refetchComments } = api.report.getComments.useQuery({
    reportId,
  });

  const utils = api.useUtils();
  const toggleLike = api.report.toggleLike.useMutation({
    onSuccess: async () => {
      await utils.report.getById.invalidate({ id: reportId });
    },
  });

  const shareReport = api.report.share.useMutation();

  const addComment = api.report.addComment.useMutation({
    onSuccess: async () => {
      setComment("");
      await refetchComments();
      await utils.report.getById.invalidate({ id: reportId });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menambahkan komentar");
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

  // Scroll to comments if hash is present
  useEffect(() => {
    if (window.location.hash === "#comments") {
      setTimeout(() => {
        document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Laporan tidak ditemukan</p>
      </div>
    );
  }

  const handleLike = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    toggleLike.mutate({ reportId });
  };

  const handleShare = async () => {
    if (session) {
      shareReport.mutate({ reportId });
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
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
    reportViolation.mutate({ reportId, reason: reportReason });
  };

  const submitComment = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!comment.trim()) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }
    addComment.mutate({ reportId, content: comment });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold flex-1">{report.title}</h1>
          </div>
        </header>

        {/* Content */}
        <div className="bg-white">
          {/* Image */}
          {report.imageUrl && (
            <div className="w-full h-64 bg-black">
              <img
                src={report.imageUrl}
                alt={report.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Report Info */}
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.push(`/profile/${report.user?.id}`)}
                className="flex items-center gap-3"
              >
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
                <div>
                  <p className="font-medium text-sm">
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
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-700 whitespace-pre-wrap mb-4">
              {report.description}
            </p>

            {/* Tags */}
            {report.tags && report.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
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

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-gray-200 pt-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  report.likedByUser
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                <Heart className={`w-5 h-5 ${report.likedByUser ? "fill-current" : ""}`} />
                <span className="font-medium">{report.likesCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">{report.sharesCount || 0} rb</span>
              </button>

              <div className="flex-1" />

              <button
                onClick={handleReport}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments" className="mt-2 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold">
              Komentar ({report.commentsCount})
            </h2>
          </div>

          {/* Comments List */}
          <div className="divide-y divide-gray-200">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                      {comment.user?.image ? (
                        <img
                          src={comment.user.image}
                          alt={comment.user.name ?? "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                          {comment.user?.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">
                          {comment.user?.name ?? "Anonymous"}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Belum ada komentar
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && submitComment()}
              placeholder={session ? "Tulis komentar..." : "Login untuk berkomentar"}
              disabled={!session}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
            <button
              onClick={submitComment}
              disabled={!session || !comment.trim() || addComment.isPending}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

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
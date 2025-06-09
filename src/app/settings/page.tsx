"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const profileSchema = z.object({
  name: z.string().min(1, "Nama harus diisi").max(255),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
  location: z.string().max(255).optional(),
  communities: z.string().optional(),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: currentUser, isLoading } = api.user.getCurrentUser.useQuery(
    undefined,
    { enabled: !!session }
  );

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui");
      router.push(`/profile/${session?.user.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui profil");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name ?? "",
      bio: currentUser?.bio ?? "",
      location: currentUser?.location ?? "",
      communities: currentUser?.profile?.communities?.join(", ") ?? "",
      notes: currentUser?.profile?.notes ?? "",
    },
  });

  // Redirect if not authenticated
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const onSubmit = async (data: ProfileFormData) => {
    const communities = data.communities
      ? data.communities.split(",").map((c) => c.trim()).filter(Boolean)
      : undefined;

    await updateProfile.mutateAsync({
      name: data.name,
      bio: data.bio ?? undefined,
      location: data.location ?? undefined,
      communities,
      notes: data.notes ?? undefined,
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
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
          <h1 className="text-lg font-semibold">Pengaturan</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama
          </label>
          <input
            {...register("name")}
            type="text"
            defaultValue={currentUser?.name ?? ""}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            {...register("bio")}
            rows={3}
            defaultValue={currentUser?.bio ?? ""}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ceritakan tentang diri Anda..."
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokasi
          </label>
          <input
            {...register("location")}
            type="text"
            defaultValue={currentUser?.location ?? ""}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Kota atau daerah Anda..."
          />
        </div>

        {/* Communities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Komunitas (pisahkan dengan koma)
          </label>
          <input
            {...register("communities")}
            type="text"
            defaultValue={currentUser?.profile?.communities?.join(", ") ?? ""}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="my little pony ranger, phineas n ferb club..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catatan
          </label>
          <textarea
            {...register("notes")}
            rows={4}
            defaultValue={currentUser?.profile?.notes ?? ""}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Catatan pribadi..."
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {updateProfile.isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      {/* Additional Options */}
      <div className="p-4 space-y-2">
        {/* Admin Panel */}
        {session?.user.isAdmin && (
          <button
            onClick={() => router.push("/admin")}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Panel Admin</span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">
            {isLoggingOut ? "Keluar..." : "Keluar"}
          </span>
        </button>
      </div>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

const createSchema = z.object({
  title: z.string().min(1, "Judul harus diisi").max(256),
  description: z.string().min(1, "Deskripsi harus diisi"),
  location: z.string().min(1, "Lokasi harus diisi").max(256),
  tags: z.string(),
});

type CreateFormData = z.infer<typeof createSchema>;

// Initialize Supabase client only if env vars are available
const supabase = env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : null;

export default function CreatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  });

  const createReport = api.report.create.useMutation({
    onSuccess: (data) => {
      toast.success("Laporan berhasil dibuat!");
      router.push(`/report/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal membuat laporan");
    },
  });

  // Redirect if not authenticated
  if (status === "loading") return null;
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!supabase) {
      console.warn("Supabase not configured, skipping image upload");
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${session!.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      throw new Error("Gagal upload gambar");
    }

    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: CreateFormData) => {
    try {
      setIsUploading(true);
      
      let imageUrl: string | undefined;
      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (url) imageUrl = url;
      }

      const tags = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await createReport.mutateAsync({
        title: data.title,
        description: data.description,
        location: data.location,
        imageUrl,
        tags: tags.length > 0 ? tags : undefined,
      });
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-pink-50 border-b border-pink-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Buat Laporan</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            JUDUL
          </label>
          <input
            {...register("title")}
            type="text"
            className="w-full px-4 py-3 bg-yellow-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Judul laporan..."
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DESKRIPSI
          </label>
          <textarea
            {...register("description")}
            rows={6}
            className="w-full px-4 py-3 bg-yellow-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Jelaskan detail laporan..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            KOTA
          </label>
          <input
            {...register("location")}
            type="text"
            className="w-full px-4 py-3 bg-yellow-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Lokasi kejadian..."
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TAGS (pisahkan dengan koma)
          </label>
          <input
            {...register("tags")}
            type="text"
            className="w-full px-4 py-3 bg-yellow-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="korupsi, penipuan, dll..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UPLOAD BUKTI
          </label>
          <div className="bg-gray-100 rounded-lg p-8">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">UPLOAD FOTO</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            DRAFT
          </button>
          <button
            type="submit"
            disabled={createReport.isPending || isUploading}
            className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {createReport.isPending || isUploading ? "POSTING..." : "POST"}
          </button>
        </div>
      </form>
    </div>
  );
}
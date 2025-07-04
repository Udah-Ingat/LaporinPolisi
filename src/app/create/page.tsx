"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toBase64 } from "@/lib/fileHelper";

const Page = () => {
  const { mutate: createPost } = api.post.create.useMutation({
    onSuccess: () => {
      alert("Successfully created a post");
      router.push("/");
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<
    | ""
    | "belum dilaporkan"
    | "sudah dilaporkan"
    | "sudah diselesaikan"
    | "laporan ditolak"
  >("");
  const [city, setCity] = useState("");
  const [prove, setProve] = useState<File | undefined>(undefined);

  const router = useRouter();

  const { data: session, status: statusSession } = useSession();
  useEffect(() => {
    if (statusSession == "unauthenticated") {
      router.push("/login");
    }
  }, [router, statusSession]);

  const onProveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      setProve(file);
    }
  };

  const handleSubmit = async () => {
    if (!title || !status) {
      return;
    }
    let base64 = undefined;
    if (prove) {
      base64 = await toBase64(prove);
    }

    createPost({ title, content: description, status, city, imgBase64: base64 });
  };

  return (
    <div className="min-h-screen w-full bg-white pb-20">
      <div className="bg-lapor-pink-light h-28 w-full"></div>
      <Image
        src={session?.user.image ?? "profile_icon.svg"}
        alt="Profile picture"
        width={50}
        height={50}
        className="translate-x-5 -translate-y-5 rounded-full"
      ></Image>

      <div className="mx-5 -translate-y-4 text-lg">Username</div>

      <hr />

      <div className="mt-10 flex w-full flex-col gap-3">
        {/* Title */}
        <div className="flex w-full items-center justify-center">
          <label
            className="flex w-1/3 items-center justify-between"
            htmlFor="title"
          >
            <div className="ml-5">Judul</div>
            <div>:</div>
          </label>
          <input
            className="bg-lapor-yellow mx-2 w-2/3 rounded-md px-2 py-1"
            type="text"
            placeholder="Masukkan judul..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="flex w-full items-start justify-center">
          <label
            className="flex w-1/3 items-center justify-between"
            htmlFor="description"
          >
            <div className="ml-5">Deskripsi</div>
            <div>:</div>
          </label>
          <textarea
            className="bg-lapor-yellow mx-2 h-40 w-2/3 rounded-md px-2 py-1"
            placeholder="Masukkan deskripsi..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="flex w-full items-center justify-center">
          <label
            className="flex w-1/3 items-center justify-between"
            htmlFor="status"
          >
            <div className="ml-5">Status</div>
            <div>:</div>
          </label>
          <select
            id="status"
            className="bg-lapor-yellow mx-2 w-2/3 rounded-md px-2 py-1"
            value={status}
            onChange={(e) => {
              const value = e.target.value as
                | ""
                | "belum dilaporkan"
                | "sudah dilaporkan"
                | "sudah diselesaikan"
                | "laporan ditolak";

              setStatus(value);
            }}
          >
            <option value="" disabled>
              Pilih status laporan...
            </option>
            <option value="belum dilaporkan">belum dilaporkan</option>
            <option value="sudah dilaporkan">sudah dilaporkan</option>
            <option value="sudah diselesaikan">sudah diselesaikan</option>
            <option value="laporan ditolak">laporan ditolak</option>
          </select>
        </div>

        {/* City */}
        <div className="flex w-full items-center justify-center">
          <label
            className="flex w-1/3 items-center justify-between"
            htmlFor="kota"
          >
            <div className="ml-5">Kota</div>
            <div>:</div>
          </label>
          <input
            className="bg-lapor-yellow mx-2 w-2/3 rounded-md px-2 py-1"
            type="text"
            placeholder="Masukkan kota..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        {/* Prove */}
        <div className="flex w-full items-center justify-center">
          <label
            className="flex w-1/3 items-center justify-between"
            htmlFor="prove"
          >
            <div className="ml-5">Bukti</div>
            <div>:</div>
          </label>
          <input
            className="bg-lapor-yellow file:bg-lapor-green mx-2 w-2/3 rounded-md px-2 py-1 text-sm transition file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1 file:text-white hover:file:bg-green-800"
            type="file"
            accept="image/*"
            onChange={onProveChange}
          />
        </div>

        <div className="flex w-full items-center justify-end px-2 pt-2">
          <button
            onClick={handleSubmit}
            className="bg-lapor-black text-lapor-white w-20 rounded-md px-2 py-1"
          >
            Submit
          </button>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default Page;

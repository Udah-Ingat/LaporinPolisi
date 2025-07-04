"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Image from "next/image";
import Navbar from "../_components/Navbar";

const Page = () => {
  const { data: session, status: statusSession } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (statusSession === "unauthenticated") {
      router.push("/login");
    }
  }, [statusSession, router]);

  if (statusSession === "loading") return <div>Loading...</div>;

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

      <div className="mx-5 -translate-y-4 text-lg">
        {session?.user.name ?? "username"}
      </div>
      <div className="flex w-full items-center justify-center bg-white">
        <button className="p-2 bg-lapor-pink rounded-xl" onClick={() => signOut()}>
          Log Out
        </button>
      </div>
      <Navbar />
    </div>
  );
};

export default Page;

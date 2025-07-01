"use client";

import React from "react";
import { signIn } from "next-auth/react";

const page = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-white">
      <div className="text-center text-2xl font-bold">LW</div>
      <div className="bg-lapor-brown flex h-32 w-3/4 items-center justify-center rounded-xl p-5 shadow-md/40">
        <div className="bg-lapor-green flex items-center justify-center gap-5 rounded-xl px-6 py-3 shadow-md/40">
          <button
            className="bg-lapor-white text-lapor-black rounded-md px-2 transition-colors duration-200 ease-in-out hover:bg-white hover:text-black"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Masuk
          </button>
          <button
            className="bg-lapor-black text-lapor-white rounded-md px-2 transition-colors duration-200 ease-in-out hover:bg-black hover:text-white"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Daftar
          </button>
        </div>
      </div>
    </main>
  );
};

export default page;

"use client";

import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { api } from "@/trpc/react";
import Navbar from "@/app/_components/Navbar";

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = api.post.getPostById.useQuery(id);

  if (!data) {
    return (
      <div className="flex min-h-screen w-full flex-col gap-2 bg-white pb-20">
        No post with id: {id}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white pt-10 pb-20">
      <div className="flex w-full flex-col gap-3 bg-white px-5">
        <div className="text-center text-3xl font-bold">{data.title}</div>
        <div className="flex items-center justify-center gap-2 pr-2">
          <Image
            src={data.profileImgUrl ?? "/home_icon.svg"}
            alt="profile pic"
            width="20"
            height="20"
            className="h-8 w-8 rounded-full object-cover"
          ></Image>
          <div className="bg-lapor-green max-w-3/4 truncate rounded-lg px-2 py-[1px] text-white">
            {data.username}
          </div>
        </div>
        <div className="flex items-center justify-center mb-3">
          {data.imgUrl && (
            <Image
              src={data.imgUrl}
              alt="Content Image"
              width="800"
              height="800"
              className="w-full"
            ></Image>
          )}
        </div>
        <div className="text-justify">{data.content}</div>
      </div>
      <Navbar />
    </div>
  );
};

export default Page;

"use client";

import { api } from "@/trpc/react";
import Image from "next/image";
import React, { useState } from "react";

export type PostCardProps = {
  id: string;
  profileImgUrl: string;
  username: string;
  title: string;
  city: string | null;
  updatedAt: string;
  imgUrl: string | null;
  upVoteCount: number;
  isVerified: boolean;
};

const PostCard: React.FC<PostCardProps> = ({
  id,
  profileImgUrl,
  username,
  title,
  city,
  updatedAt,
  imgUrl,
  upVoteCount,
  isVerified,
}) => {
  const { mutate } = api.post.addPostVote.useMutation();
  const [voteCount, setVoteCount] = useState(upVoteCount);

  const onUpVoteClicked = () => {
    setVoteCount((prev) => prev + 1);
    mutate({ postId: id, isUpVote: true });
  };

  const onDownVoteClicked = () => {
    setVoteCount((prev) => prev - 1);
    mutate({ postId: id, isUpVote: false });
  };

  return (
    <div
      onClick={() => alert("Clicked post: " + id)}
      className="bg-lapor-yellow mx-4 flex items-center justify-center gap-2 rounded-2xl p-3 text-xs shadow-md/30"
    >
      <div className="flex w-2/3 flex-col items-center justify-center gap-2">
        <div className="flex w-full items-center justify-center gap-1">
          <div className="w-3/12">
            <Image
              src={profileImgUrl}
              alt="test image"
              width="20"
              height="20"
              className="h-8 w-8 rounded-full object-cover"
            ></Image>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-1">
            <div className="bg-lapor-green w-full rounded-lg px-2 py-[1px] text-white">
              {username}
            </div>
            <div className="text-lapor-gray flex w-full items-center justify-between text-[9px]">
              <div>{city}</div>
              <div>{updatedAt}</div>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-start">
          <div>{title}</div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div>
            {isVerified ? (
              <Image
                src="verified_icon.svg"
                alt="verified icon"
                width="20"
                height="20"
              ></Image>
            ) : null}
          </div>
          <div>
            <Image
              src="report_icon.svg"
              alt="report icon"
              width="20"
              height="20"
            ></Image>
          </div>
          <div className="bg-lapor-brown flex items-center justify-center gap-2 rounded-lg px-2 py-1 text-[10px] text-white">
            <div>
              <Image
                src="up_arrow_icon.svg"
                alt="up_arrow icon"
                width="10"
                height="10"
                onClick={onUpVoteClicked}
              ></Image>
            </div>
            <div>{voteCount}</div>
            <div>
              <Image
                src="down_arrow_icon.svg"
                alt="down_arrow icon"
                width="10"
                height="10"
                onClick={onDownVoteClicked}
              ></Image>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-1/3 items-center justify-center">
        <Image
          src={
            (imgUrl ?? "") == "" ? "home_icon.svg" : (imgUrl ?? "home_icon.svg")
          }
          alt="test image"
          width="100"
          height="100"
        ></Image>
      </div>
    </div>
  );
};

export default PostCard;

"use client";

import { api } from "@/trpc/react";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export type PostCardProps = {
  id: string;
  profileImgUrl: string;
  username: string;
  title: string;
  content: string | null;
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
  content,
  city,
  updatedAt,
  imgUrl,
  upVoteCount,
  isVerified,
}) => {
  const router = useRouter();

  const { mutate } = api.post.addPostVote.useMutation();
  const [voteCount, setVoteCount] = useState<number>(upVoteCount);

  const onUpVoteClicked = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setVoteCount((prev) => (prev) + 1);
    mutate({ postId: id, isUpVote: true });
  };

  const onDownVoteClicked = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setVoteCount((prev) => prev - 1);
    mutate({ postId: id, isUpVote: false });
  };

  const handleCardClicked = () => {
    router.push("/post/" + id);
  };

  return (
    <div className="w-full">
      <div
        onClick={handleCardClicked}
        className="bg-lapor-yellow mx-4 flex items-center justify-center gap-2 rounded-2xl p-3 text-xs shadow-md/30"
      >
        <div className="flex w-2/3 flex-col items-center justify-center gap-2">
          <div className="flex w-full items-center justify-start">
            <div className="flex -translate-y-1 items-center justify-end pr-2">
              <Image
                src={profileImgUrl}
                alt="test image"
                width="20"
                height="20"
                className="h-8 w-8 rounded-full object-cover"
              ></Image>
            </div>
            <div className="flex w-9/12 flex-col items-center justify-center gap-1">
              <div className="bg-lapor-green w-full truncate rounded-lg px-2 py-[1px] text-white">
                {username}
              </div>
              <div className="text-lapor-gray flex w-full items-center justify-between text-[9px]">
                <div>{city}</div>
                <div>{updatedAt}</div>
              </div>
            </div>
          </div>
          <div className="flex max-h-30 min-h-10 w-full flex-col items-start justify-start">
            <div className="text-[14px] font-semibold text-gray-800">
              {title}
            </div>
            <div className="line-clamp-3 w-full font-light text-ellipsis text-gray-800">
              {content}
            </div>
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
                className="cursor-pointer"
              ></Image>
            </div>
            <div className="bg-lapor-brown flex items-center justify-center gap-2 rounded-lg px-2 py-1 text-[10px] text-white">
              <div>
                <Image
                  src="up_arrow_icon.svg"
                  alt="up_arrow icon"
                  width="10"
                  height="10"
                  onClick={(e) => onUpVoteClicked(e)}
                  className="z-10 cursor-pointer"
                ></Image>
              </div>
              <div>{voteCount}</div>
              <div>
                <Image
                  src="down_arrow_icon.svg"
                  alt="down_arrow icon"
                  width="10"
                  height="10"
                  onClick={(e) => onDownVoteClicked(e)}
                  className="z-10 cursor-pointer"
                ></Image>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-1/3 items-center justify-center">
          <Image
            src={
              (imgUrl ?? "") == ""
                ? "home_icon.svg"
                : (imgUrl ?? "home_icon.svg")
            }
            alt="test image"
            width="100"
            height="100"
          ></Image>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

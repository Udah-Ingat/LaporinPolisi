"use client";

import React from "react";
import PostCard from "./PostCard";
import { usePostStore } from "../_store/postStore";

const PostList = () => {
  const posts = usePostStore((state) => state.posts);
  const page = usePostStore((state) => state.page);
  const setPage = usePostStore((state) => state.setPage);

  return (
    <div className="flex h-full flex-col items-center justify-start gap-3">
      {posts?.items.length ? (
        posts.items.map((post, i) => <PostCard key={i} {...post} />)
      ) : (
        <p>No posts</p>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          className="font-100 cursor-pointer text-3xl"
        >
          {"<"}
        </button>
        <div>{page + "/" + (posts?.totalPages ?? 1)}</div>
        <button
          onClick={() =>
            setPage(
              page < (posts?.totalPages ?? 1)
                ? page + 1
                : (posts?.totalPages ?? 1),
            )
          }
          className="font-100 cursor-pointer text-3xl"
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default PostList;

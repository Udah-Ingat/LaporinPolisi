"use client";

import React from "react";
import PostCard from "./PostCard";
import { usePostStore } from "../_store/postStore";

const PostList = () => {
  //   const [page, setPage] = useState(1);
  //   const limit = 10;

  const posts = usePostStore((state) => state.posts);

  return (
    <div className="flex h-full flex-col items-center justify-start gap-3">
      {posts?.items.length ? (
        posts.items.map((post, i) => <PostCard key={i} {...post} />)
      ) : (
        <p>No posts</p>
      )}
    </div>
  );
};

export default PostList;

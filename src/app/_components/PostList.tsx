"use client";

import React, { useState } from "react";
import PostCard from "./PostCard";
import { api } from "@/trpc/react";

const PostList = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = api.post.getAllPaginated.useQuery({
    page,
    limit,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading posts.</p>;

  return (
    <div className="flex h-full flex-col items-center justify-start gap-3">
      {data?.items.map((post, index) => (
        <PostCard {...post} key={index} />
      ))}
    </div>
  );
};

export default PostList;

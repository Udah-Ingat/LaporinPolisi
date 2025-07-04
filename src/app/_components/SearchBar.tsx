"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/trpc/react";
import { usePostStore } from "../_store/postStore";

const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const setPosts = usePostStore((state) => state.setPosts);

  const { isLoading, isError, refetch } =
    api.post.getFilteredPaginated.useQuery(
      { page: 1, limit: 10, filter: searchInput },
      { enabled: false },
    );

  const handleSearch = async () => {
    const res = await refetch();
    if (res.data) {
      setPosts(res.data);
    }
  };

  useEffect(() => {
    const fetchAndStore = async () => {
      const result = await refetch();
      if (result.data) {
        setPosts(result.data);
      }
    };

    void fetchAndStore();
  }, [refetch, setPosts]);

  return (
    <div className="flex min-h-min w-full flex-col px-5 py-5">
      <div className="bg-lapor-green flex w-full items-center justify-center gap-2 rounded-md py-2">
        <input
          placeholder="Cari laporan..."
          className="w-10/12 rounded-md bg-transparent px-2 py-1 text-sm text-white placeholder-white transition focus:ring-2 focus:ring-white focus:outline-none"
          type="text"
          onChange={(e) => setSearchInput(e.target.value)}
          value={searchInput}
        />
        <Image
          src="search_icon.svg"
          alt="search icon"
          width={20}
          height={20}
          onClick={handleSearch}
        ></Image>
      </div>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error searching posts</div>}
    </div>
  );
};

export default SearchBar;

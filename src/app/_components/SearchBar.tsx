"use client";

import React, { useState } from "react";
import Image from "next/image";

const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");

  return (
    <div className="w-full px-5 py-5 min-h-min">
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
          onClick={() => alert("search input: " + searchInput)}
        ></Image>
      </div>
    </div>
  );
};

export default SearchBar;

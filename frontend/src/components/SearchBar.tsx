"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch?.(query);
  };

  return (
    <div className="flex gap-3 w-full">
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        className="flex-1 border rounded-xl px-4 py-3 outline-none focus:border-primary"
      />

      <button
        onClick={handleSearch}
        className="btn-primary"
      >
        Search
      </button>
    </div>
  );
}
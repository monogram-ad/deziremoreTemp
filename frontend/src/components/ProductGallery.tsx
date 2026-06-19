"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({
  images,
}: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (!images?.length) {
    return (
      <div className="luxury-card p-10 text-center">
        No Images Available
      </div>
    );
  }

  return (
    <div>
      <div className="luxury-card overflow-hidden">
        <img
          src={images[selected]}
          alt="Product"
          className="w-full h-[600px] object-cover"
        />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setSelected(index)}
            className={`overflow-hidden rounded-xl border-2 ${
              selected === index
                ? "border-primary"
                : "border-transparent"
            }`}
          >
            <img
              src={image}
              alt={`Preview ${index + 1}`}
              className="w-full h-24 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
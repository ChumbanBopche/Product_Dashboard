"use client";

import Image from "next/image";
import { Product } from "@/types/product";

interface ProductCardsProps {
  products: Product[];
}

export default function ProductCards({
  products,
}: ProductCardsProps) {
  return (
    <div className="grid gap-4 md:hidden">
      {products.map((product) => (
        <article
          key={product.id}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >
          <div className="flex gap-4">
            <Image
              src={product.thumbnail}
              alt={product.title}
              width={90}
              height={90}
              className="h-20 w-20 rounded-lg object-cover"
            />

            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold text-gray-900">
                {product.title}
              </h2>

              <p className="mt-1 text-sm capitalize text-gray-500">
                {product.category}
              </p>

              <p className="mt-2 font-semibold">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-between border-t pt-3 text-sm">
            <span>
              ⭐ {product.rating.toFixed(2)}
            </span>

            <span>
              Stock: {product.stock}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
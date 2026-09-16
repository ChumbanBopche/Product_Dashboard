"use client";

import Image from "next/image";
import Link from "next/link";

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

          {/* Product information */}
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

              <p className="mt-2 font-semibold text-gray-900">
                ${product.price.toFixed(2)}
              </p>

            </div>

          </div>

          {/* Rating / Stock */}
          <div className="mt-4 flex justify-between border-t pt-3 text-sm text-gray-600">

            <span>
              ⭐ {product.rating.toFixed(2)}
            </span>

            <span>
              Stock: {product.stock}
            </span>

          </div>

          {/* View Details */}
          <div className="mt-4 flex gap-2 border-t pt-3">

            <Link
              href={`/products/${product.id}`}
              className="flex-1 rounded-lg bg-black px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-gray-800">
              View
            </Link>

            <Link
              href={`/products/${product.id}/edit`}
              className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              Edit
            </Link>
          </div>

        </article>
      ))}

    </div>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";

import { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({
  products,
}: ProductTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">

          {/* Table Header */}
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 font-semibold">
                Product
              </th>

              <th className="px-6 py-4 font-semibold">
                Category
              </th>

              <th className="px-6 py-4 font-semibold">
                Price
              </th>

              <th className="px-6 py-4 font-semibold">
                Rating
              </th>

              <th className="px-6 py-4 font-semibold">
                Stock
              </th>

              <th className="px-6 py-4 font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50"
              >
                {/* Product */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">

                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-lg object-cover"
                    />

                    <div>
                      <p className="font-medium text-gray-900">
                        {product.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        #{product.id}
                      </p>
                    </div>

                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 capitalize">
                  {product.category}
                </td>

                {/* Price */}
                <td className="px-6 py-4 font-medium">
                  ${product.price.toFixed(2)}
                </td>

                {/* Rating */}
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1">
                    <span>⭐</span>
                    {product.rating.toFixed(2)}
                  </span>
                </td>

                {/* Stock */}
                <td className="px-6 py-4">
                  <span
                    className={
                      product.stock > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {product.stock}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <Link
                    href={`/products/${product.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
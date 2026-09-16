"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { saveDeletedProduct } from "@/lib/productStorage";
import { deleteProduct } from "@/services/product.service";
import { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  onDeleted?: (id: number) => void;
}

export default function ProductTable({
  products,
  onDeleted,
}: ProductTableProps) {
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const handleDelete = async (
    product: Product
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`
    );

    if (!confirmed) {
      return;
    }

    // Prevent duplicate delete requests
    if (deletingId !== null) {
      return;
    }

    try {
      setDeletingId(product.id);

      await deleteProduct(product.id);

      // DummyJSON does not permanently delete
      // the product, so save the deletion locally.
      saveDeletedProduct(product.id);

      // Update the dashboard immediately.
      onDeleted?.(product.id);
    } catch (error) {
      console.error(error);

      window.alert(
        "Failed to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">

          {/* Header */}
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

          {/* Products */}
          <tbody className="divide-y">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50"
              >

                {/* Product */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">

                    {product.thumbnail ? (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                        No image
                      </div>
                    )}

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
                  ${(product.price ?? 0).toFixed(2)}
                </td>

                {/* Rating */}
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1">
                    <span>⭐</span>

                    <span>
                      {(product.rating ?? 0).toFixed(2)}
                    </span>
                  </span>
                </td>

                {/* Stock */}
                <td className="px-6 py-4">
                  <span
                    className={
                      (product.stock ?? 0) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {product.stock ?? 0}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">

                    <Link
                      href={`/products/${product.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View
                    </Link>

                    <Link
                      href={`/products/${product.id}/edit`}
                      className="text-sm font-medium text-gray-700 hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(product)
                      }
                      disabled={
                        deletingId !== null
                      }
                      className="text-sm font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId ===
                      product.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
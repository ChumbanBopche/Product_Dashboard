"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { saveDeletedProduct } from "@/lib/productStorage";
import { deleteProduct } from "@/services/product.service";
import { Product } from "@/types/product";

interface ProductCardsProps {
  products: Product[];
  onDeleted?: (id: number) => void;
}

export default function ProductCards({
  products,
  onDeleted,
}: ProductCardsProps) {
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

      // Save the deletion locally because
      // DummyJSON does not persist DELETE.
      saveDeletedProduct(product.id);

      // Immediately update the dashboard.
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
    <div className="grid gap-4 md:hidden">

      {products.map((product) => (
        <article
          key={product.id}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >

          {/* Product information */}
          <div className="flex gap-4">

            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={90}
                height={90}
                className="h-20 w-20 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                No image
              </div>
            )}

            <div className="min-w-0 flex-1">

              <h2 className="truncate font-semibold text-gray-900">
                {product.title}
              </h2>

              <p className="mt-1 text-sm capitalize text-gray-500">
                {product.category}
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                ${(product.price ?? 0).toFixed(2)}
              </p>

            </div>

          </div>

          {/* Rating / Stock */}
          <div className="mt-4 flex justify-between border-t pt-3 text-sm text-gray-600">

            <span>
              ⭐{" "}
              {(product.rating ?? 0).toFixed(2)}
            </span>

            <span>
              Stock: {product.stock ?? 0}
            </span>

          </div>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3">

            <Link
              href={`/products/${product.id}`}
              className="rounded-lg bg-black px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-gray-800"
            >
              View
            </Link>

            <Link
              href={`/products/${product.id}/edit`}
              className="rounded-lg border px-3 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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
              className="rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingId === product.id
                ? "Deleting..."
                : "Delete"}
            </button>

          </div>

        </article>
      ))}

    </div>
  );
}
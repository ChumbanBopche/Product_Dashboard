"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts({
          limit: 10,
          skip: 0,
        });

        setProducts(data.products);
      } catch (error) {
        console.error(error);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold">
          Product Dashboard
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-xl bg-white p-4 shadow-sm"
            >
              <img
                src={product.thumbnail}
                alt={product.title}
                className="mb-4 h-48 w-full rounded-lg object-cover"
              />

              <h2 className="font-semibold">
                {product.title}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {product.category}
              </p>

              <div className="mt-3 flex justify-between">
                <span className="font-semibold">
                  ${product.price}
                </span>

                <span className="text-sm">
                  ⭐ {product.rating}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Stock: {product.stock}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
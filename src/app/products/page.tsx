"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";

import ProductTable from "@/components/products/ProductTable";
import ProductCards from "@/components/products/ProductCards";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

export default function ProductsPage() {
  const { isAuthenticated, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, fetchProducts]);

  if (isAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Product Admin
            </h1>

            <p className="text-sm text-gray-500">
              Manage your products
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Products
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Browse and manage your product inventory.
          </p>
        </div>

        {/* Search/filter area - coming next */}
        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Search, filters and sorting will be added next.
          </p>
        </div>

        {/* Product content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={fetchProducts}
          />
        ) : products.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <p className="text-gray-500">
              No products found.
            </p>
          </div>
        ) : (
          <>
            <ProductTable products={products} />

            <ProductCards products={products} />
          </>
        )}
      </section>
    </main>
  );
}
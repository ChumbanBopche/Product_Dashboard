"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";

import ProductTable from "@/components/products/ProductTable";
import ProductCards from "@/components/products/ProductCards";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

const PAGE_SIZES = [10, 20, 50];

function parsePositiveInteger(
  value: string | null,
  fallback: number
) {
  if (!value) return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function ProductDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isAuthenticated, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Read pagination values from the URL.
   *
   * Examples:
   * /products
   * /products?page=2
   * /products?page=2&pageSize=20
   */
  const requestedPage = parsePositiveInteger(
    searchParams.get("page"),
    1
  );

  const requestedPageSize = parsePositiveInteger(
    searchParams.get("pageSize"),
    10
  );

  const pageSize = PAGE_SIZES.includes(requestedPageSize)
    ? requestedPageSize
    : 10;

  const page = requestedPage;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const skip = (page - 1) * pageSize;

      const data = await getProducts({
        limit: pageSize,
        skip,
      });

      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, fetchProducts]);

  /*
   * If the requested page is larger than the available
   * number of pages, move the user to the last valid page.
   */
  useEffect(() => {
    if (total === 0) return;

    const totalPages = Math.ceil(total / pageSize);

    if (page > totalPages) {
      const params = new URLSearchParams(searchParams.toString());

      params.set("page", String(totalPages));
      params.set("pageSize", String(pageSize));

      router.replace(`/products?${params.toString()}`);
    }
  }, [
    page,
    pageSize,
    total,
    router,
    searchParams,
  ]);

  const updateUrl = (
    updates: Record<string, string>
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    Object.entries(updates).forEach(
      ([key, value]) => {
        params.set(key, value);
      }
    );

    router.push(`/products?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;

    const totalPages = Math.ceil(total / pageSize);

    if (newPage > totalPages) return;

    updateUrl({
      page: String(newPage),
      pageSize: String(pageSize),
    });
  };

  const handlePageSizeChange = (
    newPageSize: number
  ) => {
    updateUrl({
      page: "1",
      pageSize: String(newPageSize),
    });
  };

  if (isAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  const totalPages =
    total > 0 ? Math.ceil(total / pageSize) : 1;

  const startItem =
    total === 0 ? 0 : (page - 1) * pageSize + 1;

  const endItem =
    total === 0
      ? 0
      : Math.min(page * pageSize, total);

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

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Products
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Browse and manage your product inventory.
          </p>
        </div>

        {/* Search/filter area */}
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

            {/* Pagination */}
            <div className="mt-6 flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {startItem}
                </span>{" "}
                –{" "}
                <span className="font-medium">
                  {endItem}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {total}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    handlePageChange(page - 1)
                  }
                  disabled={page === 1}
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() =>
                      handlePageChange(pageNumber)
                    }
                    className={`h-9 min-w-9 rounded-lg px-3 text-sm ${
                      pageNumber === page
                        ? "bg-black text-white"
                        : "border bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() =>
                    handlePageChange(page + 1)
                  }
                  disabled={page === totalPages}
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

                <select
                  value={pageSize}
                  onChange={(event) =>
                    handlePageSizeChange(
                      Number(event.target.value)
                    )
                  }
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function ProductDashboard() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">
            Loading dashboard...
          </p>
        </main>
      }
    >
      <ProductDashboardContent />
    </Suspense>
  );
}
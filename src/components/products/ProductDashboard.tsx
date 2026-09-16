"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";

import {
  getCategories,
  getProducts,
} from "@/services/product.service";

import {
  Category,
  Product,
} from "@/types/product";

import ProductTable from "@/components/products/ProductTable";
import ProductCards from "@/components/products/ProductCards";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

const PAGE_SIZES = [10, 20, 50];

function parsePositiveInteger(
  value: string | null,
  fallback: number
) {
  if (!value) {
    return fallback;
  }

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

  // -----------------------------
  // Product state
  // -----------------------------

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------
  // Search state
  // -----------------------------

  const urlSearch =
    searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] =
    useState(urlSearch);

  const debouncedSearch = useDebounce(
    searchInput,
    500
  );

  // Keep search input synchronized
  // with URL
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // -----------------------------
  // Category state
  // -----------------------------

  const urlCategory =
    searchParams.get("category") ?? "";

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [category, setCategory] =
    useState(urlCategory);

  // -----------------------------
  // Sorting state
  // -----------------------------

  const urlSortBy =
    searchParams.get("sortBy") ?? "";

  const urlOrder =
    searchParams.get("order") ?? "";

  const [sortBy, setSortBy] =
    useState(urlSortBy);

  const [order, setOrder] =
    useState(urlOrder);

  // Keep category and sorting
  // synchronized with URL
  useEffect(() => {
    setCategory(urlCategory);
    setSortBy(urlSortBy);
    setOrder(urlOrder);
  }, [
    urlCategory,
    urlSortBy,
    urlOrder,
  ]);

  // -----------------------------
  // Pagination state
  // -----------------------------

  const requestedPage =
    parsePositiveInteger(
      searchParams.get("page"),
      1
    );

  const requestedPageSize =
    parsePositiveInteger(
      searchParams.get("pageSize"),
      10
    );

  const pageSize =
    PAGE_SIZES.includes(
      requestedPageSize
    )
      ? requestedPageSize
      : 10;

  const page = requestedPage;

  // -----------------------------
  // Fetch categories
  // -----------------------------

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const controller =
      new AbortController();

    const fetchCategories =
      async () => {
        try {
          const data =
            await getCategories(
              controller.signal
            );

          setCategories(data);
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            error.name === "CanceledError"
          ) {
            return;
          }

          if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "ERR_CANCELED"
          ) {
            return;
          }

          console.error(
            "Failed to load categories:",
            error
          );
        }
      };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated]);

  // -----------------------------
  // Fetch products
  // -----------------------------

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");

        const skip =
          (page - 1) * pageSize;

        const currentSearch =
          debouncedSearch.trim();

        const validSortBy =
          sortBy === "title" ||
          sortBy === "price" ||
          sortBy === "rating"
            ? sortBy
            : undefined;

        const validOrder =
          order === "asc" ||
          order === "desc"
            ? order
            : undefined;

        const data =
          await getProducts(
            {
              limit: pageSize,
              skip,

              // Search has priority over
              // category filtering.
              search:
                currentSearch ||
                undefined,

              category:
                !currentSearch && category
                  ? category
                  : undefined,

              sortBy: validSortBy,

              order: validOrder,
            },
            signal
          );

        setProducts(data.products);
        setTotal(data.total);
      } catch (error: unknown) {
        // Ignore cancelled requests
        if (
          error instanceof Error &&
          error.name === "CanceledError"
        ) {
          return;
        }

        // Axios cancellation error
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error(error);

        setError(
          "Failed to load products."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [
      page,
      pageSize,
      debouncedSearch,
      category,
      sortBy,
      order,
    ]
  );

  // -----------------------------
  // Fetch whenever filters change
  // -----------------------------

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const controller =
      new AbortController();

    fetchProducts(
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [
    isAuthenticated,
    fetchProducts,
  ]);

  // -----------------------------
  // Update URL when search changes
  // -----------------------------

  useEffect(() => {
    const currentSearch =
      searchParams.get("search") ?? "";

    const nextSearch =
      debouncedSearch.trim();

    if (nextSearch === currentSearch) {
      return;
    }

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (nextSearch) {
      params.set(
        "search",
        nextSearch
      );
    } else {
      params.delete("search");
    }

    // Search starts from page 1
    params.set("page", "1");

    router.push(
      `/products?${params.toString()}`
    );
  }, [
    debouncedSearch,
    searchParams,
    router,
  ]);

  // -----------------------------
  // Handle invalid page numbers
  // -----------------------------

  useEffect(() => {
    if (total === 0) {
      return;
    }

    const totalPages =
      Math.ceil(
        total / pageSize
      );

    if (page > totalPages) {
      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      params.set(
        "page",
        String(totalPages)
      );

      params.set(
        "pageSize",
        String(pageSize)
      );

      router.replace(
        `/products?${params.toString()}`
      );
    }
  }, [
    page,
    pageSize,
    total,
    router,
    searchParams,
  ]);

  // -----------------------------
  // Update URL helper
  // -----------------------------

  const updateUrl = (
    updates: Record<string, string>
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    Object.entries(updates).forEach(
      ([key, value]) => {
        params.set(key, value);
      }
    );

    router.push(
      `/products?${params.toString()}`
    );
  };

  // -----------------------------
  // Category change
  // -----------------------------

  const handleCategoryChange = (
    newCategory: string
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (newCategory) {
      params.set(
        "category",
        newCategory
      );
    } else {
      params.delete("category");
    }

    // Reset pagination
    params.set("page", "1");

    router.push(
      `/products?${params.toString()}`
    );
  };

  // -----------------------------
  // Sort change
  // -----------------------------

  const handleSortChange = (
    newSortBy: string
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (!newSortBy) {
      params.delete("sortBy");
      params.delete("order");
    } else {
      params.set(
        "sortBy",
        newSortBy
      );

      // Default sorting direction
      params.set(
        "order",
        "asc"
      );
    }

    // Reset pagination
    params.set("page", "1");

    router.push(
      `/products?${params.toString()}`
    );
  };

  // -----------------------------
  // Sort order change
  // -----------------------------

  const handleOrderChange = (
    newOrder: string
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (
      newOrder === "asc" ||
      newOrder === "desc"
    ) {
      params.set(
        "order",
        newOrder
      );
    }

    // Reset pagination
    params.set("page", "1");

    router.push(
      `/products?${params.toString()}`
    );
  };

  // -----------------------------
  // Page change
  // -----------------------------

  const handlePageChange = (
    newPage: number
  ) => {
    if (newPage < 1) {
      return;
    }

    const totalPages =
      Math.ceil(
        total / pageSize
      );

    if (newPage > totalPages) {
      return;
    }

    updateUrl({
      page: String(newPage),
      pageSize: String(pageSize),
    });
  };

  // -----------------------------
  // Page size change
  // -----------------------------

  const handlePageSizeChange = (
    newPageSize: number
  ) => {
    updateUrl({
      page: "1",
      pageSize:
        String(newPageSize),
    });
  };

  // -----------------------------
  // Authentication loading
  // -----------------------------

  if (isAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  // -----------------------------
  // Pagination calculations
  // -----------------------------

  const totalPages =
    total > 0
      ? Math.ceil(
          total / pageSize
        )
      : 1;

  const startItem =
    total === 0
      ? 0
      : (page - 1) *
          pageSize +
        1;

  const endItem =
    total === 0
      ? 0
      : Math.min(
          page * pageSize,
          total
        );

  // Search is currently active
  const isSearchActive =
    searchInput.trim().length > 0;

  // -----------------------------
  // UI
  // -----------------------------

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
            Browse and manage your product
            inventory.
          </p>
        </div>

        {/* Search / Filters */}
        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            {/* Search */}
            <div>
              <label
                htmlFor="product-search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search products
              </label>

              <input
                id="product-search"
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Search by product name..."
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />

              {searchInput && (
                <p className="mt-2 text-xs text-gray-500">
                  Searching for:{" "}
                  <span className="font-medium">
                    {searchInput}
                  </span>
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category-filter"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Category
              </label>

              <select
                id="category-filter"
                value={category}
                disabled={isSearchActive}
                onChange={(event) =>
                  handleCategoryChange(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  All categories
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item.slug}
                      value={item.slug}
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>

              {isSearchActive && (
                <p className="mt-2 text-xs text-gray-500">
                  Category filter is disabled while
                  searching.
                </p>
              )}
            </div>

            {/* Sorting */}
            <div>
              <label
                htmlFor="sort-by"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Sort by
              </label>

              <div className="flex gap-2">

                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(event) =>
                    handleSortChange(
                      event.target.value
                    )
                  }
                  className="min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">
                    Default
                  </option>

                  <option value="title">
                    Title
                  </option>

                  <option value="price">
                    Price
                  </option>

                  <option value="rating">
                    Rating
                  </option>
                </select>

                <select
                  value={order}
                  disabled={!sortBy}
                  onChange={(event) =>
                    handleOrderChange(
                      event.target.value
                    )
                  }
                  className="w-32 rounded-lg border px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="asc">
                    Ascending
                  </option>

                  <option value="desc">
                    Descending
                  </option>
                </select>

              </div>
            </div>

          </div>

        </div>

        {/* Product content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() =>
              fetchProducts()
            }
          />
        ) : products.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">

            <p className="font-medium text-gray-900">
              No products found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try a different search term or
              filter.
            </p>

          </div>
        ) : (
          <>
            {/* Desktop table */}
            <ProductTable
              products={products}
            />

            {/* Mobile cards */}
            <ProductCards
              products={products}
            />

            {/* Pagination */}
            <div className="mt-6 flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Showing X - Y of Z */}
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

                {/* Previous */}
                <button
                  onClick={() =>
                    handlePageChange(
                      page - 1
                    )
                  }
                  disabled={page === 1}
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() =>
                        handlePageChange(
                          pageNumber
                        )
                      }
                      className={`h-9 min-w-9 rounded-lg px-3 text-sm ${
                        pageNumber === page
                          ? "bg-black text-white"
                          : "border bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() =>
                    handlePageChange(
                      page + 1
                    )
                  }
                  disabled={
                    page === totalPages
                  }
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

                {/* Page size */}
                <select
                  value={pageSize}
                  onChange={(event) =>
                    handlePageSizeChange(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  {PAGE_SIZES.map(
                    (size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size} / page
                      </option>
                    )
                  )}
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
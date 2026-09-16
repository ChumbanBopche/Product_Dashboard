"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { getProductById } from "@/services/product.service";
import { Product } from "@/types/product";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState("");

  useEffect(() => {
  if (!isAuthenticated) {
    return;
  }
  const id = Number(params.id);

    if (!Number.isInteger(id) || id < 1) {
      setError("Product not found.");
      setLoading(false);
      return;
    }

    const controller =
      new AbortController();

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProductById(
            id,
            controller.signal
          );

        setProduct(data);

        if (data.images?.length > 0) {
          setSelectedImage(
            data.images[0]
          );
        }
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

        console.error(error);

        setError(
          "Product not found."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [params.id, isAuthenticated]);

  // -----------------------------
  // Loading
  // -----------------------------
  if (isAuthenticated === null) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <p className="text-gray-500">
        Checking authentication...
      </p>
    </main>
  );
}
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Loading product...
        </p>
      </main>
    );
  }

  // -----------------------------
  // Error / Not Found
  // -----------------------------

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            The product you are looking for
            does not exist.
          </p>

          <button
            onClick={() =>
              router.push("/products")
            }
            className="mt-6 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Products
          </button>

        </div>
      </main>
    );
  }

  // -----------------------------
  // Product details
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
              Product details
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/products")
            }
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Back to Products
          </button>

        </div>
      </header>

      {/* Product */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">

        {/* Product information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="grid gap-8 lg:grid-cols-2">

            {/* Images */}
            <div>

              {/* Main image */}
              <div className="flex h-96 items-center justify-center overflow-hidden rounded-xl border bg-gray-50">

                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="h-full w-full object-contain p-6"
                  />
                ) : (
                  <p className="text-gray-400">
                    No image available
                  </p>
                )}

              </div>

              {/* Image thumbnails */}
              {product.images?.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto">

                  {product.images.map(
                    (image, index) => (
                      <button
                        key={image}
                        onClick={() =>
                          setSelectedImage(
                            image
                          )
                        }
                        className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-gray-50 ${
                          selectedImage === image
                            ? "border-black"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          className="h-full w-full object-contain p-1"
                        />
                      </button>
                    )
                  )}

                </div>
              )}

            </div>

            {/* Product information */}
            <div>

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {product.category}
                </span>

                {product.brand && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {product.brand}
                  </span>
                )}

              </div>

              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                {product.title}
              </h1>

              <p className="mt-4 leading-7 text-gray-600">
                {product.description}
              </p>

              {/* Price */}
              <div className="mt-6">

                <p className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>

                {product.discountPercentage && (
                  <p className="mt-1 text-sm text-green-600">
                    {product.discountPercentage.toFixed(
                      1
                    )}
                    % discount
                  </p>
                )}

              </div>

              {/* Rating / Stock */}
              <div className="mt-6 grid grid-cols-2 gap-4">

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Rating
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    ⭐{" "}
                    {product.rating}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Stock
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {product.stock}
                  </p>
                </div>

              </div>

              {/* Additional information */}
              <div className="mt-6 space-y-3 border-t pt-6">

                {product.sku && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      SKU
                    </span>

                    <span className="font-medium text-gray-900">
                      {product.sku}
                    </span>
                  </div>
                )}

                {product.warrantyInformation && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Warranty
                    </span>

                    <span className="text-right font-medium text-gray-900">
                      {product.warrantyInformation}
                    </span>
                  </div>
                )}

                {product.shippingInformation && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Shipping
                    </span>

                    <span className="text-right font-medium text-gray-900">
                      {product.shippingInformation}
                    </span>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* Reviews */}
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-gray-900">
            Reviews
          </h2>

          {!product.reviews ||
          product.reviews.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No reviews available.
            </p>
          ) : (
            <div className="mt-6 space-y-4">

              {product.reviews.map(
                (review, index) => (
                  <div
                    key={`${review.reviewerEmail}-${index}`}
                    className="rounded-lg border p-4"
                  >

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="font-medium text-gray-900">
                          {review.reviewerName}
                        </p>

                        <p className="text-xs text-gray-500">
                          {review.reviewerEmail}
                        </p>
                      </div>

                      <p className="text-sm">
                        {"⭐".repeat(
                          Math.max(
                            0,
                            Math.min(
                              5,
                              Math.round(
                                review.rating
                              )
                            )
                          )
                        )}
                      </p>

                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {review.comment}
                    </p>

                    <p className="mt-3 text-xs text-gray-400">
                      {new Date(
                        review.date
                      ).toLocaleDateString()}
                    </p>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </section>
    </main>
  );
}
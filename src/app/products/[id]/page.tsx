"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { getLocalProduct } from "@/lib/productStorage";
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

    // Validate product ID
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

        /*
         * ------------------------------------
         * Check local CRUD changes first
         * ------------------------------------
         */
        const localProduct =
          getLocalProduct(id);

        // Product was locally deleted
        if (localProduct === null) {
          setError("Product not found.");
          return;
        }

        // Product was locally added or edited
        if (localProduct) {
          setProduct(localProduct);

          if (
            localProduct.images &&
            localProduct.images.length > 0
          ) {
            setSelectedImage(
              localProduct.images[0]
            );
          } else if (
            localProduct.thumbnail
          ) {
            setSelectedImage(
              localProduct.thumbnail
            );
          }

          return;
        }

        /*
         * ------------------------------------
         * No local change
         *
         * Fetch original product from API
         * ------------------------------------
         */
        const data =
          await getProductById(
            id,
            controller.signal
          );

        setProduct(data);

        if (
          data.images &&
          data.images.length > 0
        ) {
          setSelectedImage(
            data.images[0]
          );
        } else if (
          data.thumbnail
        ) {
          setSelectedImage(
            data.thumbnail
          );
        }
      } catch (error: unknown) {
        // Ignore cancelled requests
        if (
          error instanceof Error &&
          error.name === "CanceledError"
        ) {
          return;
        }

        // Axios cancellation
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
  }, [
    params.id,
    isAuthenticated,
  ]);

  /*
   * ------------------------------------
   * Authentication loading
   * ------------------------------------
   */
  if (isAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  /*
   * ------------------------------------
   * Product loading
   * ------------------------------------
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Loading product...
        </p>
      </main>
    );
  }

  /*
   * ------------------------------------
   * Product not found
   * ------------------------------------
   */
  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">

          <h1 className="text-xl font-bold text-gray-900">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            The product you are looking for
            does not exist or has been deleted.
          </p>

          <button
            onClick={() =>
              router.push("/products")
            }
            className="mt-6 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Products
          </button>

        </div>
      </main>
    );
  }

  /*
   * ------------------------------------
   * Product details
   * ------------------------------------
   */

  const images =
    product.images &&
    product.images.length > 0
      ? product.images
      : product.thumbnail
        ? [product.thumbnail]
        : [];

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

          <button
            onClick={() =>
              router.push("/products")
            }
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Products
          </button>

        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Images */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-50">

              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="max-h-[400px] max-w-full object-contain"
                />
              ) : (
                <div className="text-sm text-gray-400">
                  No image available
                </div>
              )}

            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">

                {images.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      className={`shrink-0 rounded-lg border-2 p-1 ${
                        selectedImage ===
                        image
                          ? "border-black"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${
                          index + 1
                        }`}
                        className="h-16 w-16 rounded object-cover"
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* Product information */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">

            {/* Category */}
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              {product.category}
            </p>

            {/* Title */}
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {product.title}
            </h1>

            {/* Description */}
            <p className="mt-4 leading-7 text-gray-600">
              {product.description}
            </p>

            {/* Price / Rating */}
            <div className="mt-6 flex flex-wrap items-center gap-4">

              <p className="text-3xl font-bold text-gray-900">
                $
                {(product.price ?? 0).toFixed(
                  2
                )}
              </p>

              <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
                ⭐{" "}
                {(product.rating ?? 0).toFixed(
                  2
                )}
              </span>

            </div>

            {/* Stock */}
            <div className="mt-4">

              <span
                className={
                  (product.stock ?? 0) > 0
                    ? "font-medium text-green-600"
                    : "font-medium text-red-600"
                }
              >
                {product.stock ?? 0}{" "}
                in stock
              </span>

            </div>

            {/* Product information */}
            <div className="mt-8 border-t pt-6">

              <h2 className="font-semibold text-gray-900">
                Product Information
              </h2>

              <dl className="mt-4 space-y-3 text-sm">

                {product.brand && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">
                      Brand
                    </dt>

                    <dd className="font-medium text-gray-900">
                      {product.brand}
                    </dd>
                  </div>
                )}

                {product.sku && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">
                      SKU
                    </dt>

                    <dd className="font-medium text-gray-900">
                      {product.sku}
                    </dd>
                  </div>
                )}

                {product.warrantyInformation && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">
                      Warranty
                    </dt>

                    <dd className="text-right font-medium text-gray-900">
                      {product.warrantyInformation}
                    </dd>
                  </div>
                )}

                {product.shippingInformation && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">
                      Shipping
                    </dt>

                    <dd className="text-right font-medium text-gray-900">
                      {product.shippingInformation}
                    </dd>
                  </div>
                )}

                {product.availabilityStatus && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">
                      Availability
                    </dt>

                    <dd className="font-medium text-gray-900">
                      {product.availabilityStatus}
                    </dd>
                  </div>
                )}

              </dl>

            </div>

          </div>

        </div>

        {/* Reviews */}
        {product.reviews &&
          product.reviews.length > 0 && (
            <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-gray-900">
                Reviews
              </h2>

              <div className="mt-5 space-y-4">

                {product.reviews.map(
                  (review, index) => (
                    <article
                      key={`${review.reviewerEmail}-${index}`}
                      className="rounded-lg border p-4"
                    >

                      <div className="flex flex-wrap items-center justify-between gap-2">

                        <p className="font-medium text-gray-900">
                          {review.reviewerName}
                        </p>

                        <span className="text-sm text-yellow-600">
                          ⭐{" "}
                          {(
                            review.rating ?? 0
                          ).toFixed(1)}
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {review.comment}
                      </p>

                    </article>
                  )
                )}

              </div>

            </section>
          )}

      </section>
    </main>
  );
}
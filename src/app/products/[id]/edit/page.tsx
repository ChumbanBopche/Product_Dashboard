"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { getProductById } from "@/services/product.service";
import { Product } from "@/types/product";

import ProductForm from "@/components/products/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
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
          "Failed to load product."
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
  // Authentication loading
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

  // -----------------------------
  // Product loading
  // -----------------------------

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
  // Product error
  // -----------------------------

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            The product you are trying to
            edit could not be found.
          </p>

          <button
            onClick={() =>
              router.push("/products")
            }
            className="mt-6 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Products
          </button>

        </div>
      </main>
    );
  }

  // -----------------------------
  // Edit form
  // -----------------------------

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">

          <h1 className="text-xl font-bold text-gray-900">
            Edit Product
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update product information.
          </p>

        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6">

        <ProductForm
          product={product}
        />

      </section>

    </main>
  );
}
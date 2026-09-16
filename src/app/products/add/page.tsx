"use client";

import { useAuth } from "@/hooks/useAuth";
import ProductForm from "@/components/products/ProductForm";

export default function AddProductPage() {
  const { isAuthenticated } = useAuth();

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

      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">

          <h1 className="text-xl font-bold text-gray-900">
            Add Product
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a new product.
          </p>

        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <ProductForm />
      </section>

    </main>
  );
}
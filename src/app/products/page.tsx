"use client";

import { useAuth } from "@/hooks/useAuth";

export default function ProductsPage() {
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Product Dashboard
          </h1>

          <p className="text-sm text-gray-500">
            Manage your products
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <section className="p-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Products
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Product management will be added here.
          </p>
        </div>
      </section>
    </main>
  );
}
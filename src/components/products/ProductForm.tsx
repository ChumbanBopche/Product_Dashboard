"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  addProduct,
  updateProduct,
} from "@/services/product.service";

import { Product } from "@/types/product";

interface ProductFormProps {
  product?: Product;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  category: string;
  stock: string;
}

export default function ProductForm({
  product,
}: ProductFormProps) {
  const router = useRouter();

  const isEditMode = Boolean(product);

  const [formData, setFormData] =
    useState<FormData>({
      title: product?.title ?? "",
      description:
        product?.description ?? "",
      price:
        product?.price !== undefined
          ? String(product.price)
          : "",
      category:
        product?.category ?? "",
      stock:
        product?.stock !== undefined
          ? String(product.stock)
          : "",
    });

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [saving, setSaving] =
    useState(false);

  const [apiError, setApiError] =
    useState("");

  // -----------------------------
  // Handle input changes
  // -----------------------------

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Clear field error when user
    // starts correcting it
    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  // -----------------------------
  // Validate form
  // -----------------------------

  const validate = () => {
    const newErrors: Record<
      string,
      string
    > = {};

    if (!formData.title.trim()) {
      newErrors.title =
        "Title is required.";
    }

    if (!formData.description.trim()) {
      newErrors.description =
        "Description is required.";
    }

    if (!formData.category.trim()) {
      newErrors.category =
        "Category is required.";
    }

    const price =
      Number(formData.price);

    if (
      !formData.price.trim() ||
      Number.isNaN(price) ||
      price < 0
    ) {
      newErrors.price =
        "Enter a valid price.";
    }

    const stock =
      Number(formData.stock);

    if (
      !formData.stock.trim() ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      newErrors.stock =
        "Enter a valid stock quantity.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // -----------------------------
  // Submit
  // -----------------------------

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Prevent duplicate requests
    if (saving) {
      return;
    }

    setApiError("");

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description:
          formData.description.trim(),
        price: Number(formData.price),
        category:
          formData.category.trim(),
        stock: Number(formData.stock),
      };

      if (isEditMode && product) {
        await updateProduct(
          product.id,
          payload
        );
      } else {
        await addProduct(payload);
      }

      router.push("/products");
    } catch (error) {
      console.error(error);

      setApiError(
        isEditMode
          ? "Failed to update product."
          : "Failed to add product."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Product Title
        </label>

        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(event) =>
            handleChange(
              "title",
              event.target.value
            )
          }
          placeholder="Enter product title"
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
        />

        {errors.title && (
          <p className="mt-1 text-sm text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="mt-5">
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="description"
          value={formData.description}
          onChange={(event) =>
            handleChange(
              "description",
              event.target.value
            )
          }
          placeholder="Enter product description"
          rows={5}
          className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      {/* Price + Stock */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Price
          </label>

          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(event) =>
              handleChange(
                "price",
                event.target.value
              )
            }
            placeholder="0.00"
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />

          {errors.price && (
            <p className="mt-1 text-sm text-red-600">
              {errors.price}
            </p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label
            htmlFor="stock"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Stock
          </label>

          <input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={(event) =>
              handleChange(
                "stock",
                event.target.value
              )
            }
            placeholder="0"
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />

          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">
              {errors.stock}
            </p>
          )}
        </div>

      </div>

      {/* Category */}
      <div className="mt-5">
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Category
        </label>

        <input
          id="category"
          type="text"
          value={formData.category}
          onChange={(event) =>
            handleChange(
              "category",
              event.target.value
            )
          }
          placeholder="e.g. smartphones"
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
        />

        {errors.category && (
          <p className="mt-1 text-sm text-red-600">
            {errors.category}
          </p>
        )}
      </div>

      {/* API error */}
      {apiError && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={() =>
            router.push("/products")
          }
          disabled={saving}
          className="rounded-lg border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? isEditMode
              ? "Updating..."
              : "Adding..."
            : isEditMode
              ? "Update Product"
              : "Add Product"}
        </button>

      </div>

    </form>
  );
}
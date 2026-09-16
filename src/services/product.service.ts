import api from "@/lib/axios";
import {
  Category,
  Product,
  ProductListResponse,
  ProductQueryParams,
} from "@/types/product";

export const getProducts = async (
  params: ProductQueryParams,
  signal?: AbortSignal
): Promise<ProductListResponse> => {
  const {
    limit,
    skip,
    search,
    category,
    sortBy,
    order,
  } = params;

  let endpoint = "/products";

  if (search) {
    endpoint = "/products/search";
  } else if (category) {
    endpoint = `/products/category/${category}`;
  }

  const response = await api.get<ProductListResponse>(
    endpoint,
    {
      params: {
        limit,
        skip,
        ...(search ? { q: search } : {}),
        ...(sortBy ? { sortBy } : {}),
        ...(order ? { order } : {}),
      },
      signal,
    }
  );

  return response.data;
};

export const getProductById = async (
  id: number,
  signal?: AbortSignal
): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`, {
    signal,
  });

  return response.data;
};

export const getCategories = async (
  signal?: AbortSignal
): Promise<Category[]> => {
  const response = await api.get<Category[]>("/products/categories", {
    signal,
  });

  return response.data;
};

export const deleteProduct = async (
  id: number
): Promise<Product> => {
  const response = await api.delete<Product>(`/products/${id}`);

  return response.data;
};

export const addProduct = async (
  product: Partial<Product>
): Promise<Product> => {
  const response = await api.post<Product>("/products/add", product);

  return response.data;
};

export const updateProduct = async (
  id: number,
  product: Partial<Product>
): Promise<Product> => {
  const response = await api.put<Product>(
    `/products/${id}`,
    product
  );

  return response.data;
};
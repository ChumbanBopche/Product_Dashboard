import { Product } from "@/types/product";

interface ProductFilterOptions {
  search?: string;
  category?: string;
  sortBy?: "title" | "price" | "rating";
  order?: "asc" | "desc";
}

export const filterAndSortProducts = (
  products: Product[],
  options: ProductFilterOptions
): Product[] => {
  let result = [...products];

  const search = options.search?.trim().toLowerCase();

  if (search) {
    result = result.filter((product) => {
      return (
        product.title.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      );
    });
  }

  if (options.category) {
    result = result.filter(
      (product) => product.category === options.category
    );
  }

  if (options.sortBy) {
    result.sort((a, b) => {
      let comparison = 0;

      if (options.sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      }

      if (options.sortBy === "price") {
        comparison = a.price - b.price;
      }

      if (options.sortBy === "rating") {
        comparison = a.rating - b.rating;
      }

      return options.order === "desc"
        ? -comparison
        : comparison;
    });
  }

  return result;
};
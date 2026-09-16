import { Product } from "@/types/product";

const STORAGE_KEY = "productDashboardChanges";

interface ProductChanges {
  added: Product[];
  updated: Product[];
  deletedIds: number[];
}

const EMPTY_CHANGES: ProductChanges = {
  added: [],
  updated: [],
  deletedIds: [],
};

const getChanges = (): ProductChanges => {
  if (typeof window === "undefined") {
    return EMPTY_CHANGES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return EMPTY_CHANGES;
    }

    return JSON.parse(stored);
  } catch {
    return EMPTY_CHANGES;
  }
};

const saveChanges = (changes: ProductChanges) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
};

/**
 * Save a newly added product.
 */
export const saveAddedProduct = (product: Product) => {
  const normalizedProduct: Product = {
    ...product,

    rating: product.rating ?? 0,
    discountPercentage: product.discountPercentage ?? 0,
    tags: product.tags ?? [],
    images:
      product.images?.length > 0
        ? product.images
        : product.thumbnail
          ? [product.thumbnail]
          : [],
    thumbnail: product.thumbnail ?? "",
    reviews: product.reviews ?? [],
  };

  const changes = getChanges();

  changes.added = [
    normalizedProduct,
    ...changes.added.filter(
      (item) => item.id !== normalizedProduct.id
    ),
  ];

  changes.deletedIds =
    changes.deletedIds.filter(
      (id) => id !== normalizedProduct.id
    );

  saveChanges(changes);
};

/**
 * Save an edited product.
 */
export const saveUpdatedProduct = (product: Product) => {
  const normalizedProduct: Product = {
    ...product,

    rating: product.rating ?? 0,
    discountPercentage:
      product.discountPercentage ?? 0,
    tags: product.tags ?? [],
    images:
      product.images?.length > 0
        ? product.images
        : product.thumbnail
          ? [product.thumbnail]
          : [],
    thumbnail: product.thumbnail ?? "",
    reviews: product.reviews ?? [],
  };

  const changes = getChanges();

  const updatedIndex =
    changes.updated.findIndex(
      (item) =>
        item.id === normalizedProduct.id
    );

  if (updatedIndex >= 0) {
    changes.updated[updatedIndex] =
      normalizedProduct;
  } else {
    changes.updated.push(
      normalizedProduct
    );
  }

  const addedIndex =
    changes.added.findIndex(
      (item) =>
        item.id === normalizedProduct.id
    );

  if (addedIndex >= 0) {
    changes.added[addedIndex] =
      normalizedProduct;
  }

  saveChanges(changes);
};

/**
 * Save a deleted product ID.
 */
export const saveDeletedProduct = (id: number) => {
  const changes = getChanges();

  // Check whether this product was created locally.
  const wasLocallyAdded = changes.added.some(
    (product) => product.id === id
  );

  // Remove it from locally added products.
  changes.added = changes.added.filter(
    (product) => product.id !== id
  );

  // Remove any locally updated version.
  changes.updated = changes.updated.filter(
    (product) => product.id !== id
  );

  /*
   * If the product came from DummyJSON,
   * remember its ID as deleted.
   *
   * If it was a locally added product,
   * we don't need deletedIds because it
   * never existed on the API in the first place.
   */
  if (!wasLocallyAdded) {
    if (!changes.deletedIds.includes(id)) {
      changes.deletedIds.push(id);
    }
  } else {
    changes.deletedIds =
      changes.deletedIds.filter(
        (deletedId) => deletedId !== id
      );
  }

  saveChanges(changes);
};

/**
 * Get a locally modified product.
 *
 * Returns:
 * - Product → locally added/updated product
 * - null → product was locally deleted
 * - undefined → no local change
 */
export const getLocalProduct = (
  id: number
): Product | null | undefined => {
  const changes = getChanges();

  const addedProduct = changes.added.find(
    (product) => product.id === id
  );

  if (addedProduct) {
    return addedProduct;
  }

  const updatedProduct = changes.updated.find(
    (product) => product.id === id
  );

  if (updatedProduct) {
    return updatedProduct;
  }

  if (changes.deletedIds.includes(id)) {
    return null;
  }

  return undefined;
};

/**
 * Get all local changes.
 */
export const getLocalChanges = (): ProductChanges => {
  return getChanges();
};

export const getAllLocalProducts = (): Product[] => {
  const changes = getChanges();

  return [
    ...changes.added,
    ...changes.updated,
  ];
};
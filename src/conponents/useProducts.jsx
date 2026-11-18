import { useEffect, useState } from "react";

let cachedProducts = null;
let productsPromise = null;

function loadProducts() {
  if (cachedProducts !== null) return Promise.resolve(cachedProducts);
  if (productsPromise !== null) return productsPromise;

  const request = fetch("https://dummyjson.com/products?limit=0")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data?.products)) {
        throw new Error("Invalid products response: expected a products array");
      }

      cachedProducts = data.products;
      productsPromise = null;
      return cachedProducts;
    })
    .catch((err) => {
      productsPromise = null;
      throw err;
    });

  productsPromise = request;
  return request;
}

export function useProducts() {
  const [products, setProducts] = useState(() => cachedProducts ?? []);
  const [loading, setLoading] = useState(() => cachedProducts === null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    loadProducts()
      .then((loadedProducts) => {
        if (!cancelled) setProducts(loadedProducts);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}

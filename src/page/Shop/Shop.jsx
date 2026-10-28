import { useState } from "react";
import Product from "../../conponents/slideProducts/Product";
import { useProducts } from "../../conponents/useProducts";

function Shop() {
  const { products, loading, error } = useProducts();

  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const categories = [
    "all",
    ...new Set(products.map((product) => product.category)),
    // بتمر على كل منتج، وبتاخد منه الكاتيجوري بس
  ];
  // console.log(categories);

  const visibleProducts = [...products]
    .filter((product) => category === "all" || product.category === category)
    .sort((a, b) => {
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }

      if (sortBy === "price-desc") {
        return b.price - a.price;
      }

      if (sortBy === "rating") {
        return b.rating - a.rating;
      }

      if (sortBy === "discount") {
        return b.discountPercentage - a.discountPercentage;
      }

      return 0;
    });
  // console.log(visibleProducts.length);
  console.log(visibleProducts);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32!">
        <div className="size-10 rounded-full border-4 border-border border-t-main animate-spin" />
        <p className="text-secondary!">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32">
        <p className="text-danger! font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          // retryيتنفد من جديد. دي طريقه بسيطة لل fetchازرار عند الضغط عليه بيعيد تحميل الصفحه كلها, فال
          className="px-5! py-2! bg-main text-white! rounded-lg cursor-pointer hover:opacity-90 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  const selectStyle =
    "h-11 border border-border rounded-xl px-4! bg-white text-sm font-medium cursor-pointer outline-none transition focus:border-main focus:ring-2 focus:ring-main/20 hover:border-main";

  return (
    <section className="container w-[90%] mx-auto! max-w-337.5 px-4! py-8!">
      {/* Header */}
      <div className="mb-6!">
        <h1 className="text-2xl sm:text-3xl font-bold text-main!">Shop</h1>
        <p className="text-sm text-secondary! mt-1!">
          Browse our full collection
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-border rounded-2xl p-4! mb-6! shadow-xs">
        <p className="text-sm text-secondary! order-2 sm:order-1">
          <span className="font-bold text-heading!">
            {visibleProducts.length}
          </span>{" "}
          products
        </p>

        <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${selectStyle} capitalize`}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat.replace("-", " ")}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={selectStyle}
          >
            <option value="default">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            {/* الأرخص الأول */}
            <option value="price-desc">Price: High to Low</option>
            {/* الأغلى الأول */}
            <option value="rating">Top Rated</option>
            {/* الأعلى تقييماً الأول */}
            <option value="discount">Biggest Discount</option>
            {/* الأكبر خصماً الأول */}
          </select>
        </div>
      </div>

      {/* Products */}
      {visibleProducts.length === 0 ? (
        <div className="text-center py-20 text-secondary!">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {visibleProducts.map((item) => (
            <Product key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Shop;

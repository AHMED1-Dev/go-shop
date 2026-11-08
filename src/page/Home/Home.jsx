import { useEffect, useState } from "react";
import HeroSlider from "../../conponents/HeroSlider";
import SlideProduct from "../../conponents/slideProducts/SlideProduct";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import PageTransition from "../../conponents/PageTransition";

const categories = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches",
];

function Home() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const results = await Promise.all(
          categories.map(async (category) => {
            try {
              const res = await fetch(
                `https://dummyjson.com/products/category/${category}`,
              );

              if (!res.ok) {
                throw new Error(`فشل تحميل تصنيف ${category}`);
              }

              const data = await res.json();

              return [
                category,
                {
                  items: Array.isArray(data.products) ? data.products : [],
                  error: "",
                },
              ];
            } catch {
              return [
                category,
                {
                  items: [],
                  error: "تعذر تحميل منتجات هذا التصنيف.",
                },
              ];
            }
          }),
        );

        setProducts(Object.fromEntries(results));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <PageTransition>
      <div>
        <HeroSlider />

        {loading
          ? categories.map((category) => <SlideProductLoading key={category} />)
          : // لو الموقع واقف دي اللي هيظهر
            // اللي هتظهر Loading لو البيانات حملت الكود اللي تحت هيظهر ولو البيانات محملتش الكلمه دي
            categories.map((category) => (
              <SlideProduct
                key={category}
                data={products[category]?.items ?? []}
                // دي يعني اسامي المنتجات category .دي يعني كل المنتجات اللي اضافت بتفاصيل products
                // يعني كل منتج هيكون موجود اسم المنتج هيكون موجود فوق
                error={products[category]?.error}
                title={category.replace("-", " ")}
                // دا بيجيب كل الاسم بتاع كل منتج
              />
            ))}
      </div>
    </PageTransition>
  );
}

export default Home;

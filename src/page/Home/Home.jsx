import { useEffect, useState } from "react";
import HeroSlider from "../../conponents/HeroSlider";
import SlideProduct from "../../conponents/slideProducts/SlideProduct";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import PageTransition from "../../conponents/PageTransition";

function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      try {
        const categoriesRes = await fetch(
          "https://dummyjson.com/products/categories",
          { signal },
        );

        if (!categoriesRes.ok) {
          throw new Error("Failed to load categories");
        }

        const list = await categoriesRes.json();

        if (!Array.isArray(list)) {
          throw new Error("Invalid categories data");
        }

        setCategories(list);

        const results = await Promise.all(
          list.map(async ({ slug }) => {
            try {
              const res = await fetch(
                `https://dummyjson.com/products/category/${encodeURIComponent(slug)}`,
                { signal },
              );

              if (!res.ok) {
                throw new Error("Failed to load products");
              }

              const data = await res.json();

              return [
                slug,
                {
                  items: Array.isArray(data.products) ? data.products : [],
                  error: "",
                },
              ];
            } catch (requestError) {
              if (requestError.name === "AbortError") {
                throw requestError;
              }

              return [
                slug,
                {
                  items: [],
                  error: "تعذر تحميل منتجات هذا التصنيف.",
                },
              ];
            }
          }),
        );

        setProducts(Object.fromEntries(results));
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError("تعذر تحميل التصنيفات. تحقق من اتصال الإنترنت.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, []);

  return (
    <PageTransition>
      <div>
        <HeroSlider />

        {loading ? (
          categories.map((category) => (
            <SlideProductLoading key={category.slug} />
            // لو الموقع واقف دي اللي هيظهر
            // اللي هتظهر Loading لو البيانات حملت الكود اللي تحت هيظهر ولو البيانات محملتش الكلمه دي
          ))
        ) : error ? (
          <p className="py-10! text-center text-red-500!">{error}</p>
        ) : (
          categories.map(({ slug, name }) => (
            <SlideProduct
              key={slug}
              data={products[slug]?.items ?? []}
              // دي يعني اسامي المنتجات category .دي يعني كل المنتجات اللي اضافت بتفاصيل products
              //يعني كل منتج هيكون موجود اسم المنتج هيكون موجود فوق
              error={products[slug]?.error}
              title={name}
              // دا بيجيب كل الاسم بتاع كل منتج
            />
          ))
        )}
      </div>
    </PageTransition>
  );
}

export default Home;

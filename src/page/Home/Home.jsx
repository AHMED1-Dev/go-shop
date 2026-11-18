import { useEffect, useState } from "react";
import HeroSlider from "../../conponents/HeroSlider";
import SlideProduct from "../../conponents/slideProducts/SlideProduct";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import PageTransition from "../../conponents/PageTransition";

function Home() {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadCategories() {
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

        list.forEach(({ slug }) => {
          setCategoryProducts((current) => ({
            ...current,
            [slug]: {
              items: [],
              loading: true,
              error: "",
            },
          }));

          loadCategoryProducts(slug);
        });
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setCategoriesError("تعذر تحميل التصنيفات. تحقق من اتصال الإنترنت.");
        }
      } finally {
        if (!signal.aborted) {
          setLoadingCategories(false);
        }
      }
    }

    async function loadCategoryProducts(slug) {
      try {
        const res = await fetch(
          `https://dummyjson.com/products/category/${encodeURIComponent(slug)}`,
          { signal },
        );

        if (!res.ok) {
          throw new Error("Failed to load products");
        }

        const data = await res.json();

        if (!signal.aborted) {
          setCategoryProducts((current) => ({
            ...current,
            [slug]: {
              items: Array.isArray(data.products) ? data.products : [],
              loading: false,
              error: "",
            },
          }));
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        setCategoryProducts((current) => ({
          ...current,
          [slug]: {
            items: [],
            loading: false,
            error: "تعذر تحميل منتجات هذا التصنيف.",
          },
        }));
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  return (
    <PageTransition>
      <div>
        <HeroSlider />

        {loadingCategories ? null : categoriesError ? (
          <p className="py-10! text-center text-red-500!">{categoriesError}</p>
        ) : (
          categories.map(({ slug, name }) => {
            const categoryData = categoryProducts[slug];

            return categoryData?.loading ? (
              // لو الموقع واقف دي اللي هيظهر
              // اللي هتظهر Loading لو البيانات حملت الكود اللي تحت هيظهر ولو البيانات محملتش الكلمه دي
              <SlideProductLoading key={slug} />
            ) : (
              <SlideProduct
                key={slug}
                data={categoryData?.items ?? []}
                // دي يعني اسامي المنتجات category .دي يعني كل المنتجات اللي اضافت بتفاصيل products
                //يعني كل منتج هيكون موجود اسم المنتج هيكون موجود فوق
                error={categoryData?.error}
                title={name}
              />
            );
          })
        )}
      </div>
    </PageTransition>
  );
}

export default Home;

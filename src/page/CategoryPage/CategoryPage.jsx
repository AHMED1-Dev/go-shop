import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Product from "../../conponents/slideProducts/Product";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import PageTransition from "../../conponents/PageTransition";

function CategoryPage() {
  const { category } = useParams();
  // console.log(category);

  const [categoryData, setCategoryData] = useState({
    category: "",
    products: [],
    total: 0,
    error: "",
  });
  const loading = categoryData.category !== category;

  useEffect(() => {
    const controller = new AbortController();

    fetch(`https://dummyjson.com/products/category/${category}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("تعذر تحميل منتجات هذا التصنيف.");
        }

        return res.json();
      })
      .then((data) => {
        setCategoryData({
          category,
          products: data.products ?? [],
          total: data.total ?? 0,
          error: "",
        });
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setCategoryData({
            category,
            products: [],
            total: 0,
            error: err.message,
          });
        }
      });

    return () => controller.abort();
  }, [category]);
  const error = categoryData.category === category ? categoryData.error : "";

  return (
    <PageTransition key={category}>
      {/*  categoryProducts */}
      <div className="">
        {loading ? (
          <SlideProductLoading key={category} />
        ) : error ? (
          <div className="w-[90%] mx-auto! max-w-337.5">
            <p className="text-red-500 text-center py-10">{error}</p>
          </div>
        ) : (
          // container
          <div className="w-[90%] mx-auto! max-w-337.5">
            <div className="top_slide relative pt-2.5! pr-5! pl-0">
              <h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
                {category} : {categoryData.total}
              </h2>
            </div>
            {/* Products */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-7!">
              {categoryData.products.map((item, index) => {
                return <Product item={item} key={index} />;
              })}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default CategoryPage;

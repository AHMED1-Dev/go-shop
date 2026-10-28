// import React from "react";
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
  const [products, setproducts] = useState({});
  // دي يعني كل المنتجات اللي انا تفضطها

  const [loading, setLoading] = useState(true);
  // لو الموقع واقف اي اللي هيحصل ممكن يظهر حاجه

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const results = await Promise.all(
          categories.map(async (categort) => {
            const res = await fetch(
              `https://dummyjson.com/products/category/${categort}`,
            );
            const data = await res.json();
            return { [categort]: data.products };
          }),
        );

        const productsData = Object.assign({}, ...results);
        // هنا انا بخزن البيانات في متغير
        setproducts(productsData);
        // علشام اقدر استخدمها برحتي setproducts هنا انااستخدمت
      } catch (error) {
        console.log("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
      // يعني لما البيانات تحمل finally
    };

    fetchProducts();
  }, []);
  // انا هنا بجيب كل المنتجات بكل التفاصيل

  // console.log(products);

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
                data={products[category]}
                // دي يعني اسامي المنتجات category .دي يعني كل المنتجات اللي اضافت بتفاصيل products
                // يعني كل منتج هيكون موجود اسم المنتج هيكون موجود فوق
                title={category.replace("-", " ")}
                // دا بيجيب كل الاسم بتاع كل منتج
              />
            ))}
      </div>
    </PageTransition>
  );
}

export default Home;

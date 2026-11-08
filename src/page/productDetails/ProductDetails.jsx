import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SlideProduct from "../../conponents/slideProducts/SlideProduct";
import ProductDetailsLoading from "./ProductDetailsLoading";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import ProductImages from "./productImages";
import ProductInfo from "./ProductInfo";
import PageTransition from "../../conponents/PageTransition";

function ProductDetails() {
  const { id } = useParams();
  const [productData, setProductData] = useState({
    id: null,
    product: null,
    error: "",
  });

  const loading = productData.id !== id;
  // هنا بعمل check لو ال id اللي جايه من ال params مش نفس ال id اللي موجود في ال state يبقي لسه محملش المنتج الجديد
  const product = loading ? null : productData.product;
  const error = loading ? "" : productData.error;
  const category = product?.category;

  const [relatedData, setRelatedData] = useState({
    category: null,
    products: [],
  });
  const loadingRelatedProducts =
    Boolean(product) && relatedData.category !== category;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      try {
        const res = await fetch(`https://dummyjson.com/products/${id}`, {
          signal: controller.signal,
        });

        if (res.status === 404) {
          setProductData({ id, product: null, error: "" });
          return;
        }

        if (!res.ok) {
          throw new Error("تعذر تحميل بيانات المنتج.");
        }

        const data = await res.json();

        setProductData({ id, product: data, error: "" });
      } catch (err) {
        if (err.name !== "AbortError") {
          setProductData({
            id,
            product: null,
            error: "حصلت مشكلة أثناء تحميل المنتج. جرّب تاني.",
          });
        }
      }
    }

    fetchProduct();

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!category) return;

    const controller = new AbortController();

    async function fetchRelatedProducts() {
      try {
        const res = await fetch(
          `https://dummyjson.com/products/category/${category}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error("تعذر تحميل المنتجات المرتبطة.");
        }

        const data = await res.json();

        setRelatedData({
          category,
          products: Array.isArray(data.products) ? data.products : [],
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setRelatedData({ category, products: [] });
        }
      }
    }

    fetchRelatedProducts();

    return () => controller.abort();
  }, [category]);

  return (
    <PageTransition key={id}>
      <div>
        {loading ? (
          <ProductDetailsLoading />
        ) : error ? (
          <p className="w-[90%] mx-auto! max-w-337.5 text-red-500 py-10 text-center">
            {error}
          </p>
        ) : !product ? (
          <p className="w-[90%] mx-auto! max-w-337.5">Product not found</p>
        ) : (
          <section className="py-12.5!">
            <div className="w-[90%] mx-auto! max-w-337.5 flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-0">
              {/* IMAGES */}
              <ProductImages product={product} />

              {/* PRODUCT DETAILS */}
              <ProductInfo product={product} />
            </div>
          </section>
        )}

        {product &&
          (loadingRelatedProducts ? (
            <SlideProductLoading />
          ) : (
            <SlideProduct
              key={category}
              data={relatedData.products}
              title={category.replace("-", " ")}
            />
          ))}
      </div>
    </PageTransition>
  );
}

export default ProductDetails;

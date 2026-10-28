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
  // id دي بتجيب  useParams
  // console.log(id);
  // console.log اول ما ادوس علي اي منتج بيظهر التفاصيل بتاع المنتج في

  const [product, setProduct] = useState(null);
  // product انا اقدر استخدمها براحتي وانا هنا استخدم setProduct هنا انا بستخدم
  // يعني مش موجوده useState(null) والقيمه انا عملتها
  const [loading, setLoading] = useState(true);
  // loading انا هنا بستخدم دي علشان لو الصفحه وقفت او الصفحه بتحمل يحصل اللي انا هكتبو بستخدام setLoading
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loadingRelatedProducts, setloadingRelatedProducts] = useState(true);

  useEffect(() => {
    // هنا بتقدر استخدم useEffect يعني اي
    const felchProduct = async () => {
      try {
        const res = await fetch(`https://dummyjson.com/products/${id}`);
        const data = await res.json();
        setProduct(data);
        // product بتساوي علشان اقدر استخدمها براحتي واستخدم setProduct
        setLoading(false);
      } catch (error) {
        // هنا علشام لو حصل خطأ
        console.log(error);
      }
    };
    felchProduct();
    // function هنا علشان نشغل
  }, [id]); // يتغير [id] هنا انا مش عاوز تحديث غير لما

  useEffect(() => {
    if (!product) return;
    fetch(`https://dummyjson.com/products/category/${product.category}`)
      .then((res) => res.json())
      .then((data) => {
        setRelatedProducts(data.products);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setloadingRelatedProducts(false);
      });
  }, [product?.category]);

  if (!product) {
    return <p className="w-[90%] mx-auto! max-w-337.5">Product not found</p>;
  }
  return (
    <PageTransition key={id}>
      <div>
        {loading ? (
          <ProductDetailsLoading />
        ) : (
          <section className="py-12.5!">
            <div className="w-[90%] mx-auto! max-w-337.5 flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-0">
              {/* IMAGES  */}
              <ProductImages product={product} />

              {/* PRODUCT DETAILS */}
              <ProductInfo product={product} />
            </div>
          </section>
        )}

        {loadingRelatedProducts ? (
          <SlideProductLoading />
        ) : (
          <SlideProduct
            key={product.category}
            data={relatedProducts}
            title={product.category.replace("-", " ")}
          />
        )}
      </div>
    </PageTransition>
  );
}

export default ProductDetails;

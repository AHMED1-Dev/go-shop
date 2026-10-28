import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Product from "../../conponents/slideProducts/Product";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import PageTransition from "../../conponents/PageTransition";

function CategoryPage() {
  const { category } = useParams();
  //   console.log(category);

  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://dummyjson.com/products/category/${category}`)
      .then((res) => res.json())
      .then((data) => {
        setCategoryProducts(data);
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  });
  // تتغير category بتشتغل لما useEffect
  // console.log(categoryProducts);

  return (
    <PageTransition key={category}>
      {/*  categoryProducts */}
      <div className="">
        {loading ? (
          <SlideProductLoading key={category} />
        ) : (
          // container
          <div className="w-[90%] mx-auto! max-w-337.5">
            <div className="top_slide relative pt-2.5! pr-5! pl-0">
              <h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
                {category} : {categoryProducts.total}
              </h2>
            </div>
            {/* Products */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-7!">
              {categoryProducts.products.map((item, index) => {
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

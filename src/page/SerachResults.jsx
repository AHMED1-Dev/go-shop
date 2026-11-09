// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import PageTransition from "../conponents/PageTransition";
// import SlideProductLoading from "../conponents/slideProducts/SlideProductLoading";
// import Product from "../conponents/slideProducts/Product";

// function SerachResults() {
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const query = new URLSearchParams(useLocation().search).get("query");
//   // هنا بجيب الكويري من اليو ار ال و بحطه في متغير عشان اقدر استخدمه بعدين
//   // console.log(results);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(
//           `https://dummyjson.com/products/search?q=${query}`,
//         );
//         const data = await res.json();
//         setResults(data.products || []);
//         // فاضيه Array انا هنا بقوله لو حصل اي مشكله رجع
//       } catch (error) {
//         console.log("Search Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (query) fetchData();
//   }, [query]);
//   return (
//     <PageTransition key={query}>
//       <div className="">
//         {loading ? (
//           <SlideProductLoading key={query} />
//         ) : results.length > 0 ? (
//           <div className="w-[90%] mx-auto! max-w-337.5">
//             <div className="top_slide relative pt-2.5! pr-5! pl-0">
//               <h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
//                 Results for : {query}
//               </h2>
//             </div>
//             {/* Products */}
//             <div className="flex items-center justify-between flex-wrap gap-4 py-7!">
//               {results.map((item, index) => {
//                 return <Product item={item} key={index} />;
//               })}
//             </div>
//           </div>
//         ) : (
//           <p>No Results found</p>
//         )}
//       </div>
//     </PageTransition>
//   );
// }

// export default SerachResults;

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageTransition from "../conponents/PageTransition";
import SlideProductLoading from "../conponents/slideProducts/SlideProductLoading";
import Product from "../conponents/slideProducts/Product";

function SerachResults() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query")?.trim() ?? "";

  const [searchData, setSearchData] = useState({
    query: null,
    results: [],
    error: "",
  });

  const loading = Boolean(query) && searchData.query !== query;
  const error = searchData.query === query ? searchData.error : "";
  const results = searchData.query === query ? searchData.results : [];

  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();
    let ignoreResult = false;

    async function fetchData() {
      try {
        const encodedQuery = encodeURIComponent(query);
        const res = await fetch(
          `https://dummyjson.com/products/search?q=${encodedQuery}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error("تعذر تحميل نتائج البحث. حاول مرة أخرى.");
        }

        const data = await res.json();

        if (!Array.isArray(data.products)) {
          throw new Error("استجابة البحث غير صالحة. حاول مرة أخرى.");
        }

        if (!ignoreResult) {
          setSearchData({
            query,
            results: data.products,
            error: "",
          });
        }
      } catch (err) {
        if (err.name === "AbortError" || ignoreResult) return;

        setSearchData({
          query,
          results: [],
          error: "حصلت مشكلة أثناء البحث. حاول مرة أخرى.",
        });
      }
    }

    fetchData();

    return () => {
      ignoreResult = true;
      controller.abort();
    };
  }, [query]);

  return (
    <PageTransition key={query}>
      <div>
        {!query ? (
          <p>اكتب كلمة للبحث عن المنتجات.</p>
        ) : loading ? (
          <SlideProductLoading key={query} />
        ) : error ? (
          <p role="alert">{error}</p>
        ) : results.length > 0 ? (
          <div className="w-[90%] mx-auto! max-w-337.5">
            <div className="top_slide relative pt-2.5! pr-5! pl-0">
              <h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
                Results for : {query}
              </h2>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4 py-7!">
              {results.map((item) => (
                <Product item={item} key={item.id} />
              ))}
            </div>
          </div>
        ) : (
          <p>No Results found</p>
        )}
      </div>
    </PageTransition>
  );
}

export default SerachResults;

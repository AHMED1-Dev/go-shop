// function productImages({ product }) {
//   return (
//     /* IMAGES */
//     <div className="w-full lg:w-[48%] flex gap-2 sm:gap-3">
//       {" "}
//       {/* Small Images */}{" "}
//       <div className="w-14 sm:w-16 md:w-20 shrink-0 flex flex-col gap-2 sm:gap-3">
//         {" "}
//         {product.images.map((img, index) => (
//           <button
//             key={index}
//             className="
//             w-14 h-14
//             sm:w-16 sm:h-16
//             md:w-20 md:h-20
//             p-1! sm:p-2!
//           bg-white
//             cursor-pointer
//             rounded-lg sm:rounded-xl
//             border!
//             transition-all duration-300
//             shrink-0"
//           >
//             {" "}
//             <img
//               className="w-full h-full object-contain"
//               src={img}
//               alt={product.title}
//               onClick={() => (document.getElementById("big_img").src = img)}
//             />{" "}
//           </button>
//         ))}{" "}
//       </div>{" "}
//       {/* Big Image */}{" "}
//       <div className="flex-1 h-80 sm:h-96 md:h-105 lg:h-120 border border-border rounded-xl sm:rounded-2xl flex items-center justify-center p-3! sm:p-5! md:p-8! overflow-hidden bg-white">
//         {" "}
//         <img
//           id="big_img"
//           className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
//           src={product.images[0]}
//           alt={product.title}
//         />{" "}
//       </div>{" "}
//     </div>
//   );
// }
// export default productImages;

import { useEffect, useState } from "react";

function ProductImages({ product }) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  // لما المنتج نفسه يتغير، ارجع للصورة الأولى للمنتج الجديد
  useEffect(() => {
    setSelectedImage(product.images[0]);
  }, [product.id]);

  return (
    <div className="w-full lg:w-[48%] flex gap-2 sm:gap-3">
      {/* Small Images */}
      <div className="w-14 sm:w-16 md:w-20 shrink-0 flex flex-col gap-2 sm:gap-3">
        {product.images.map((img, index) => {
          const isActive = selectedImage === img;

          return (
            <button
              type="button"
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`
                w-14 h-14
                sm:w-16 sm:h-16
                md:w-20 md:h-20
                p-1! sm:p-2!
                bg-white
                cursor-pointer
                rounded-lg sm:rounded-xl
                border-2!
                transition-all duration-300
                shrink-0
                ${
                  isActive
                    ? "border-main!"
                    : "border-border! hover:border-main!"
                }
              `}
            >
              <img
                className="w-full h-full object-contain"
                src={img}
                alt={`${product.title} ${index + 1}`}
              />
            </button>
          );
        })}
      </div>

      {/* Big Image */}
      <div className="flex-1 h-80 sm:h-96 md:h-105 lg:h-120 border border-border rounded-xl sm:rounded-2xl flex items-center justify-center p-3! sm:p-5! md:p-8! overflow-hidden bg-white">
        <img
          src={selectedImage}
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>
    </div>
  );
}

export default ProductImages;
// import { useContext } from "react";
// import {
//   FaStar,
//   FaRegStarHalfStroke,
//   FaRegStar,
//   FaHeart,
//   FaTruckFast,
//   FaCheck,
//   FaArrowRotateLeft,
// } from "react-icons/fa6";
// import { FaCartArrowDown, FaRegHeart } from "react-icons/fa";
// import { CartContext } from "../../conponents/context/CartContext";
// import toast from "react-hot-toast";
// import { Link } from "react-router-dom";

// function ProductInfo({ product }) {
//   const { cartItems, addItems, addTofavorites, favorites, removeFavorites } =
//     useContext(CartContext);

//   // Cart
//   const isItemInCart = cartItems.some((i) => i.id === product.id);

//   //toast
//   const handleAddToCart = () => {
//     addItems(product);
//     toast.success(
//       <div className="flex items-center gap-3 max-w-75 min-w-75">
//         <img
//           src={product.images[0]}
//           alt={product.title}
//           className="w-auto max-w-15 h-12.5 object-cover rounded-lg shrink-0"
//         />
//         <div className="flex flex-col gap-1 text-sm min-w-0">
//           <strong className="overflow-hidden text-ellipsis line-clamp-1 text-sm">
//             {product.title}
//           </strong>
//           <p className="text-xs text-secondary!">Added to cart</p>
//           <div className="mt-1.5!">
//             <Link
//               to="/cart"
//               className="inline-block rounded-lg py-1.5! px-3! bg-main text-white! text-xs"
//             >
//               View Cart
//             </Link>
//           </div>
//         </div>
//       </div>,
//       {
//         position: "bottom-right",
//         autoClose: 3500,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//       },
//     );
//   };

//   // favorites
//   const isItemInFav = favorites.some((i) => i.id === product.id);

//   const handleAddToFav = () => {
//     if (isItemInFav) {
//       removeFavorites(product.id);
//       toast.error(`${product.title} Removed from favorites`);
//     } else {
//       addTofavorites(product);
//       toast.success(`${product.title} added to favorites`);
//     }
//   };

//   const getAvailabilityInfo = () => {
//     if (product.availabilityStatus === "In Stock") {
//       return { text: "✓ In Stock", color: "text-success!" };
//     } else if (product.availabilityStatus === "Low Stock") {
//       return { text: "✓ Low Stock", color: "text-success!" };
//     } else {
//       return { text: "✗ Out of Stock", color: "text-danger!" };
//     }
//   };

//   const renderStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating); // عدد النجوم الكاملة
//     const hasHalfStar = rating % 1 >= 0.5; // لو في نص نجمه

//     for (let i = 1; i <= 5; i++) {
//       if (i <= fullStars) {
//         // لو اصغر من النجوم الكاملة
//         stars.push(<FaStar key={i} />); // نجمة كاملة
//       } else if (i === fullStars + 1 && hasHalfStar) {
//         // لو اصغر من النجوم الكاملة + 1 و لو في نص نجمه
//         stars.push(<FaRegStarHalfStroke key={i} />); // نص نجمة
//       } else {
//         stars.push(<FaRegStar key={i} />); // نجمة فاضية
//       }
//     }
//     return stars;
//   };
//   const availability = getAvailabilityInfo();
//   return (
//     // {/* PRODUCT DETAILS */}
//     <div className="details_item w-full lg:w-[48%]">
//       {/* Title */}
//       <h1
//         className="
//         text-2xl
//         sm:text-2xl
//         md:text-3xl
//         font-bold
//         text-main!
//         mb-3! sm:mb-4!
//         leading-tight
//         wrap-break-word
//         "
//       >
//         {product.title}
//       </h1>

//       {/* Rating */}
//       <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4! sm:mb-5!">
//         <div className="flex items-center gap-0.5 text-gold text-base sm:text-[18px]">
//           {renderStars(product.rating)}
//         </div>
//         <span className="text-xs sm:text-sm text-secondary!">
//           ({product.rating})
//         </span>
//         <span className="text-xs sm:text-sm text-secondary!">
//           ({product.reviews.length} reviews)
//         </span>
//       </div>

//       {/* Price */}
//       <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4! sm:mb-5!">
//         <p className="text-2xl sm:text-3xl text-heading! font-bold">
//           ${product.price}
//         </p>
//         <span className="text-[10px] sm:text-[11px] text-secondary! line-through">
//           ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
//         </span>

//         <span className="text-[10px] sm:text-xs font-semibold bg-danger text-white! px-2! py-1! rounded-md">
//           -{product.discountPercentage}%
//         </span>
//       </div>

//       {/* Availability */}
//       <h5
//         className={`text-xs sm:text-sm! mb-2! sm:mb-3! font-semibold  ${availability.color}`}
//       >
//         Availability: {availability.text}
//       </h5>

//       {/* Stock */}
//       <h5 className="mb-4! sm:mb-5! text-secondary! text-xs sm:text-sm!">
//         Only <span className="font-semibold text-main!"> {product.stock} </span>{" "}
//         products left in stock
//       </h5>

//       {/* Brand */}
//       <div className="text-xs sm:text-sm mb-4! sm:mb-5!">
//         <span className="text-secondary!">Brand:</span>{" "}
//         <span className="font-semibold text-main">
//           {product.brand || "N/A"}
//         </span>
//       </div>

//       {/* Description */}
//       <p className="text-sm sm:text-base! leading-6 sm:leading-7 text-secondary! mb-5! sm:mb-6! ">
//         {product.description}
//       </p>

//       {/* Shipping / Warranty / Return */}
//       <div className="bg-bg rounded-xl p-4! sm:p-5! mb-4! sm:mb-5! space-y-4!">
//         {/* Shipping */}
//         <div className="flex items-start gap-3">
//           <FaTruckFast className="shrink-0 text-lg sm:text-xl text-main!" />
//           <span className="text-sm sm:text-base text-secondary!">
//             {product.shippingInformation}
//           </span>
//         </div>

//         {/* Warranty */}
//         <div className="flex items-start gap-3">
//           <FaCheck className="shrink-0 text-lg sm:text-xl text-main!" />
//           <span className="text-sm sm:text-base text-secondary!">
//             {product.warrantyInformation}
//           </span>
//         </div>

//         {/* Return */}
//         <div className="flex items-start gap-3">
//           <FaArrowRotateLeft className="shrink-0 text-lg sm:text-xl text-main!" />
//           <span className="text-sm sm:text-base text-secondary!">
//             {product.returnPolicy}
//           </span>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex items-center gap-2 sm:gap-3 w-full">
//         {/* Add To Cart */}

//         <button
//           onClick={() => !isItemInCart && handleAddToCart()}
//           className={`flex-1 min-w-0 h-11 sm:h-12 flex items-center justify-center gap-1.5 sm:gap-2 px-2! sm:px-4! bg-main text-white! rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-transform duration-300  ${
//             isItemInCart
//               ? "pointer-events-none opacity-70"
//               : "hover:scale-[1.02]"
//           }`}
//         >
//           <FaCartArrowDown className="text-base sm:text-xl shrink-0" />
//           {isItemInCart ? "item in Cart" : "Add to Cart"}
//         </button>

//         {/* Wishlist */}
//         <button
//           type="button"
//           onClick={handleAddToFav}
//           aria-label={
//             isItemInFav ? "Remove from favorites" : "Add to favorites"
//           }
//           className={`
//             w-11 h-11
//             sm:w-12 sm:h-12
//             shrink-0
//             rounded-lg sm:rounded-xl
//             border
//             flex items-center justify-center
//             text-lg sm:text-xl
//             transition-all duration-300
//             cursor-pointer ${
//               isItemInFav
//                 ? "bg-main border-main text-white!"
//                 : "bg-white border-border text-slate-500! hover:text-main! hover:border-main"
//             }`}
//         >
//           {isItemInFav ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ProductInfo;

import { useContext } from "react";
import {
  FaStar,
  FaRegStarHalfStroke,
  FaRegStar,
  FaHeart,
  FaTruckFast,
  FaCheck,
  FaArrowRotateLeft,
} from "react-icons/fa6";
import { FaCartArrowDown, FaRegHeart } from "react-icons/fa";
import { CartContext } from "../../conponents/context/CartContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

// Availability
import { getAvailabilityInfo } from "../../conponents/slideProducts/availability";

function ProductInfo({ product }) {
  const { cartItems, addItems, addTofavorites, favorites, removeFavorites } =
    useContext(CartContext);

  // Cart
  const isItemInCart = cartItems.some((i) => i.id === product.id);

  // Add To Cart
  const handleAddToCart = () => {
    addItems(product);

    toast.success(
      <div className="flex items-center gap-3 max-w-75 min-w-75">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-auto max-w-15 h-12.5 object-cover rounded-lg shrink-0"
        />

        <div className="flex flex-col gap-1 text-sm min-w-0">
          <strong className="overflow-hidden text-ellipsis line-clamp-1 text-sm">
            {product.title}
          </strong>

          <p className="text-xs text-secondary!">Added to cart</p>

          <div className="mt-1.5!">
            <Link
              to="/cart"
              className="inline-block rounded-lg py-1.5! px-3! bg-main text-white! text-xs"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>,
      {
        position: "bottom-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      },
    );
  };

  // Favorites
  const isItemInFav = favorites.some((i) => i.id === product.id);

  const handleAddToFav = () => {
    if (isItemInFav) {
      removeFavorites(product.id);
      toast.error(`${product.title} Removed from favorites`);
    } else {
      addTofavorites(product);
      toast.success(`${product.title} added to favorites`);
    }
  };

  // Stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaRegStarHalfStroke key={i} />);
      } else {
        stars.push(<FaRegStar key={i} />);
      }
    }

    return stars;
  };

  // Availability
  const availability = getAvailabilityInfo(product.stock);

  return (
    <div className="details_item w-full lg:w-[48%]">
      {/* Title */}
      <h1
        className="
          text-2xl
          sm:text-2xl
          md:text-3xl
          font-bold
          text-main!
          mb-3! sm:mb-4!
          leading-tight
          wrap-break-word
        "
      >
        {product.title}
      </h1>

      {/* Rating */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4! sm:mb-5!">
        <div className="flex items-center gap-0.5 text-gold text-base sm:text-[18px]">
          {renderStars(product.rating)}
        </div>

        <span className="text-xs sm:text-sm text-secondary!">
          ({product.rating})
        </span>

        <span className="text-xs sm:text-sm text-secondary!">
          ({product.reviews.length} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4! sm:mb-5!">
        <p className="text-2xl sm:text-3xl text-heading! font-bold">
          ${product.price}
        </p>

        <span className="text-[10px] sm:text-[11px] text-secondary! line-through">
          ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
        </span>

        <span className="text-[10px] sm:text-xs font-semibold bg-danger text-white! px-2! py-1! rounded-md">
          -{product.discountPercentage}%
        </span>
      </div>

      {/* Availability */}
      <p
        className={`${availability.color} text-xs sm:text-sm! mb-2! sm:mb-3! font-semibold`}
      >
        {availability.text}
      </p>

      {/* Stock */}
      <h5 className="mb-4! sm:mb-5! text-secondary! text-xs sm:text-sm!">
        Only <span className="font-semibold text-main!">{product.stock}</span>{" "}
        products left in stock
      </h5>

      {/* Brand */}
      <div className="text-xs sm:text-sm mb-4! sm:mb-5!">
        <span className="text-secondary!">Brand:</span>{" "}
        <span className="font-semibold text-main">
          {product.brand || "N/A"}
        </span>
      </div>

      {/* Description */}
      <p
        className="
          text-sm
          sm:text-base!
          leading-6
          sm:leading-7
          text-secondary!
          mb-5! sm:mb-6!
        "
      >
        {product.description}
      </p>

      {/* Shipping / Warranty / Return */}
      <div
        className="
          bg-bg
          rounded-xl
          p-3! sm:p-4!
          mb-4! sm:mb-5!
          space-y-2! sm:space-y-3!
        "
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <FaTruckFast className="shrink-0 text-lg sm:text-xl text-main!" />

          <span className="text-xs sm:text-sm text-secondary! leading-5">
            {product.shippingInformation}
          </span>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <FaCheck className="shrink-0 text-lg sm:text-xl text-main!" />
          <span className="text-xs sm:text-sm text-secondary! leading-5">
            {product.warrantyInformation}
          </span>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <FaArrowRotateLeft className="shrink-0 text-lg sm:text-xl text-main!" />
          <span className="text-xs sm:text-sm text-secondary! leading-5">
            {product.returnPolicy}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        {/* Add To Cart */}
        <button
          onClick={() => !isItemInCart && handleAddToCart()}
          className={`
            flex-1
            min-w-0
            h-11 sm:h-12
            flex items-center justify-center
            gap-1.5 sm:gap-2
            px-2! sm:px-4!
            bg-main
            text-white!
            rounded-lg sm:rounded-xl
            text-xs sm:text-sm
            font-semibold
            transition-all duration-300
            ${
              isItemInCart
                ? "pointer-events-none opacity-70"
                : "hover:scale-[1.02]"
            }
          `}
        >
          <FaCartArrowDown className="text-base sm:text-xl shrink-0 " />

          <span className="truncate text-white!">
            {isItemInCart ? "Item in Cart" : "Add to Cart"}
          </span>
        </button>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleAddToFav}
          aria-label={
            isItemInFav ? "Remove from favorites" : "Add to favorites"
          }
          className={`
            w-11 h-11
            sm:w-12 sm:h-12
            shrink-0
            rounded-lg sm:rounded-xl
            border
            flex items-center justify-center
            text-lg sm:text-xl
            transition-all duration-300
            cursor-pointer
            ${
              isItemInFav
                ? "bg-main border-main text-white!"
                : "bg-white border-border text-slate-500! hover:text-main! hover:border-main"
            }
          `}
        >
          {isItemInFav ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;

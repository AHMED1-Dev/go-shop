// import { useContext } from "react";

// import { Link } from "react-router-dom";
// import { CartContext } from "../../conponents/context/CartContext";

// import { FaRegHeart } from "react-icons/fa";
// import { FaCartArrowDown } from "react-icons/fa6";
// import SerachBox from "./SerachBox";

// function TopHeader() {
//   const { cartItems, favorites } = useContext(CartContext);
//   return (
//     <div className="top_header bg-navy">
//       <div className="w-[90%] mx-auto! max-w-337.5 flex items-center justify-between py-3.75! px-0">
//         <Link to="/" className="flex items-center">
//           {/* <img src={Logo} alt="Go Shop" className="w-38.5 h-auto object-contain" /> */}
//           <span className="text-main text-4xl font-bold ">Go</span>

//           <span className="text-white! text-4xl font-bold">Shop</span>
//         </Link>

//         <SerachBox />

//         {/* Header Icons */}
//         <div className="header_icons flex gap-7">
//           {/* Wishlist */}
//           <div className="icon relative cursor-pointer">
//             <Link to="/favorites">
//               <FaRegHeart className="text-[30px] text-white hover:text-main transition-all duration-300" />
//               <span className="absolute w-5 h-5 -top-2 -right-2 flex items-center justify-center rounded-full bg-main text-white! text-[11px]">
//                 {favorites.length}
//               </span>
//             </Link>
//           </div>
//           {/* Cart */}
//           <div className="icon relative cursor-pointer">
//             <Link to="/cart">
//               <FaCartArrowDown className="text-[30px] text-white hover:text-main transition-all duration-300" />
//               <span className="absolute w-5 h-5 -top-2 -right-2 flex items-center justify-center rounded-full bg-main text-white! text-[11px]">
//                 {cartItems.length}
//               </span>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// //
// export default TopHeader;

import { useContext } from "react";

import { Link } from "react-router-dom";
import { CartContext } from "../../conponents/context/CartContext";

import { FaRegHeart } from "react-icons/fa";
import { FaCartArrowDown } from "react-icons/fa6";
import SerachBox from "./SerachBox";

function TopHeader() {
  const { cartItems, favorites } = useContext(CartContext);

  return (
    <div className="top_header bg-navy">
      <div
        className="
          w-[90%] mx-auto! max-w-337.5
          flex flex-wrap items-center justify-between
          gap-3
          py-3.75!
          px-0
        "
      >
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <span className="text-main text-3xl sm:text-4xl font-bold">Go</span>

          <span className="text-white! text-3xl sm:text-4xl font-bold">
            Shop
          </span>
        </Link>

        {/* Search */}
        <div
          className="
            order-3
            w-full
            lg:order-0
            lg:flex-1
            lg:w-auto
            lg:max-w-175
            lg:mx-5
          "
        >
          <SerachBox />
        </div>

        {/* Header Icons */}
        <div className="header_icons flex items-center gap-5 sm:gap-7">
          {/* Wishlist */}
          <div className="icon relative cursor-pointer">
            <Link to="/favorites">
              <FaRegHeart
                className="
                  text-[27px] sm:text-[30px]
                  text-white
                  hover:text-main
                  transition-all duration-300
                "
              />

              <span
                className="
                  absolute
                  w-5 h-5
                  -top-2 -right-2
                  flex items-center justify-center
                  rounded-full
                  bg-main
                  text-white!
                  text-[11px]
                "
              >
                {favorites.length}
              </span>
            </Link>
          </div>

          {/* Cart */}
          <div className="icon relative cursor-pointer">
            <Link to="/cart">
              <FaCartArrowDown
                className="
                  text-[27px] sm:text-[30px]
                  text-white
                  hover:text-main
                  transition-all duration-300
                "
              />

              <span
                className="
                  absolute
                  w-5 h-5
                  -top-2 -right-2
                  flex items-center justify-center
                  rounded-full
                  bg-main
                  text-white!
                  text-[11px]
                "
              >
                {cartItems.length}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopHeader;

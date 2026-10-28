// import { useEffect, useState } from "react";

// import { IoMdMenu } from "react-icons/io";
// import { MdOutlineKeyboardArrowDown } from "react-icons/md";
// import { Link, useLocation } from "react-router-dom";

// import { PiSignInBold } from "react-icons/pi";
// import { FaUserPlus } from "react-icons/fa6";

// function BtmHeader() {
//   const location = useLocation();
//   const [categories, setCategories] = useState([]);
//   const [isCategoryOpen, setIsCategoryOpen] = useState(false);

//   // console.log(isCategoryOpen);

// const NavLinks = [
//   { title: "Home", link: "/" },
//   { title: "About", link: "/about" },
//   { title: "Accessories", link: "/accessories" },
//   { title: "Blog", link: "/blog" },
//   { title: "Contact", link: "/contact" },
// ];

//   useEffect(() => {
//     setIsCategoryOpen(false);
//   }, [location.pathname]);
//   // بتغير location بتشتغل امتا لما useEffect ولكن
//   // location الـ object لأن انا فعليًا مهتم بتغيير المسار وليس كل

//   useEffect(() => {
//     fetch("https://dummyjson.com/products/categories")
//       .then((res) => res.json())
//       .then((data) => {
//         setCategories(data);
//       });
//   }, []);

//   return (
//     <div className="btn_header bg-heading">
//       <div className="w-[90%] mx-auto! max-w-337.5 flex items-center justify-between">
//         <nav className="flex items-center gap-12.5 h-12.5">
//           <div className="category_nav w-55 h-full relative">
//             {/* Category Button */}
//             <div
//               className="category_btn w-full h-full flex items-center justify-between bg-main py-0 px-3.5! text-white"
//               onClick={() => setIsCategoryOpen(!isCategoryOpen)}
//             >
//               <IoMdMenu />
//               <p className="text-white! text-sm font-semibold">
//                 All Categories
//               </p>
//               <MdOutlineKeyboardArrowDown />
//             </div>

//             {/* Categories */}
//             <div
//               className={`category_nav_list absolute top-full left-0 w-full bg-white border border-#999 border-t-0 flex flex-col max-h-100 overflow-y-scroll transition-all duration-300 ease-in-out z-50!
//                 ${isCategoryOpen ? "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" : "[clip-path:polygon(0_0,100%_0,100%_0,0_0)]"}`}
//             >
//               {categories.map((category) => {
//                 return (
//                   <Link
//                     className="py-3.75! px-2.5! border border-border border-b-0 hover:bg-main hover:text-white transition-all duration-300"
//                     key={category.slug}
//                     to={`/category/${category.slug}`}
//                   >
//                     {category.name}
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Navigation Links */}
//           <div className="nav_links flex h-full">
//             {NavLinks.map((item) => {
//               return (
//                 <li
//                   key={item.title}
//                   className={`h-full flex items-center py-0 px-6.25! ${location.pathname === item.link ? "active" : ""}`}
//                 >
//                   <Link
//                     className=" text-white! hover:text-main! transition-all duration-300"
//                     to={item.link}
//                   >
//                     {item.title}
//                   </Link>
//                 </li>
//               );
//             })}
//           </div>
//         </nav>

//         {/* Sign / Register */}
//         <div className="sign_regs_icon flex gap-5">
//           <Link to="/" className="flex items-center">
//             <PiSignInBold className="text-xl text-white hover:text-main transition-all duration-300" />
//             <p className="px-2! text-white! hover:text-main! transition-all duration-300">
//               Sign In
//             </p>
//           </Link>

//           <Link to="/" className="flex items-center">
//             <FaUserPlus className="text-xl text-white hover:text-main transition-all duration-300" />
//             <p className="px-2! text-white! hover:text-main! transition-all duration-300">
//               Register
//             </p>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default BtmHeader;

import { useEffect, useState } from "react";

import { IoMdMenu } from "react-icons/io";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

import { PiSignInBold } from "react-icons/pi";
import { FaUserPlus } from "react-icons/fa6";

function BtmHeader() {
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLinks = [
    { title: "Home", link: "/" },
    { title: "Shop", link: "/shop" },
    { title: "Deals", link: "/deals" },
    { title: "New Arrivals", link: "/new-arrivals" },
    { title: "Blog", link: "/blog" },
    { title: "Contact", link: "/contact" },
  ];

  useEffect(() => {
    setIsCategoryOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetch("https://dummyjson.com/products/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      });
  }, []);

  return (
    <div className="btn_header bg-heading">
      <div className="w-[90%] mx-auto! max-w-337.5">
        {/* ================= DESKTOP ======================= */}

        <div className="hidden lg:flex items-center justify-between h-12.5">
          {/* Left Side */}
          <nav className="flex items-center gap-5 xl:gap-12.5 h-full">
            {/* Categories */}
            <div className="category_nav w-55 h-full relative">
              {/* Category Button */}
              <div
                className="
                  category_btn
                  w-full h-full
                  flex items-center justify-between
                  bg-main
                  py-0 px-3.5!
                  text-white
                  cursor-pointer
                "
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <IoMdMenu />

                <p className="text-white! text-sm font-semibold">
                  All Categories
                </p>

                <MdOutlineKeyboardArrowDown />
              </div>

              {/* Categories */}
              <div
                className={`
                  category_nav_list
                  absolute top-full left-0
                  w-full
                  bg-white
                  border border-#999 border-t-0
                  flex flex-col
                  max-h-100
                  overflow-y-scroll
                  transition-all duration-300
                  ease-in-out
                  z-50!

                  ${
                    isCategoryOpen
                      ? "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]"
                      : "[clip-path:polygon(0_0,100%_0,100%_0,0_0)]"
                  }
                `}
              >
                {categories.map((category) => {
                  return (
                    <Link
                      className="
                        py-3.75! px-2.5!
                        border border-border border-b-0
                        hover:bg-main
                        hover:text-white
                        transition-all duration-300
                      "
                      key={category.slug}
                      to={`/category/${category.slug}`}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="nav_links flex h-full">
              {NavLinks.map((item) => {
                return (
                  <li
                    key={item.title}
                    className={`
                      h-full
                      flex items-center
                      py-0 px-4! xl:px-6.25!
                      ${location.pathname === item.link ? "active" : ""}
                    `}
                  >
                    <Link
                      className="
                        text-white!
                        hover:text-main!
                        transition-all duration-300
                        whitespace-nowrap
                      "
                      to={item.link}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </div>
          </nav>

          {/* Sign / Register */}
          <div
            className="
              sign_regs_icon
              flex items-center
              gap-3 xl:gap-5
              shrink-0
            "
          >
            <Link to="/signin" className="flex items-center whitespace-nowrap">
              <PiSignInBold
                className="
                  text-xl
                  text-white
                  hover:text-main
                  transition-all duration-300
                "
              />
              <p
                className="
                  px-2!
                  text-white!
                  hover:text-main!
                  transition-all duration-300
                "
              >
                Sign In
              </p>
            </Link>

            <Link
              to="/register"
              className="flex items-center whitespace-nowrap"
            >
              <FaUserPlus
                className="
                  text-xl
                  text-white
                  hover:text-main
                  transition-all duration-300
                "
              />

              <p
                className="
                  px-2!
                  text-white!
                  hover:text-main!
                  transition-all duration-300
                "
              >
                Register
              </p>
            </Link>
          </div>
        </div>

        {/* ================================================= */}
        {/* ================= MOBILE / TABLET =============== */}
        {/* ================================================= */}

        <div className="lg:hidden">
          {/* Mobile / Tablet Bar */}
          <div
            className="
              h-12.5
              flex items-center justify-between
              gap-3
            "
          >
            {/* Categories */}
            <div
              className="
                category_nav
                relative
                w-[65%]
                sm:w-55
                h-full
              "
            >
              {/* Category Button */}
              <div
                className="
                  category_btn
                  w-full h-full
                  flex items-center justify-between
                  bg-main
                  py-0 px-3!
                  text-white
                  cursor-pointer
                "
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <IoMdMenu className="text-lg" />

                <p className="text-white! text-xs sm:text-sm font-semibold">
                  All Categories
                </p>

                <MdOutlineKeyboardArrowDown
                  className={`
                    transition-transform duration-300
                    ${isCategoryOpen ? "rotate-180" : ""}
                  `}
                />
              </div>

              {/* Categories List */}
              <div
                className={`
                  category_nav_list
                  absolute top-full left-0
                  w-full
                  bg-white
                  border border-#999 border-t-0
                  flex flex-col
                  max-h-75
                  overflow-y-auto
                  transition-all duration-300
                  ease-in-out
                  z-50!

                  ${
                    isCategoryOpen
                      ? "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]"
                      : "[clip-path:polygon(0_0,100%_0,100%_0,0_0)]"
                  }
                `}
              >
                {categories.map((category) => {
                  return (
                    <Link
                      className="
                        py-3! px-2.5!
                        border border-border border-b-0
                        hover:bg-main
                        hover:text-white
                        transition-all duration-300
                      "
                      key={category.slug}
                      to={`/category/${category.slug}`}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="
                flex items-center
                gap-1.5
                text-white
                hover:text-main
                transition-all duration-300
                cursor-pointer
                shrink-0
              "
            >
              <IoMdMenu className="text-xl" />

              <span className="text-sm font-semibold">Menu</span>
            </button>
          </div>

          {/* Mobile / Tablet Menu */}
          <div
            className={`
              overflow-hidden
              transition-all duration-300
              ${isMobileMenuOpen ? "max-h-125 py-2!" : "max-h-0"}
            `}
          >
            {/* Navigation */}
            <div className="flex flex-col">
              {NavLinks.map((item) => {
                return (
                  <Link
                    key={item.title}
                    to={item.link}
                    className={`
                      py-3! px-3!
                      text-white!
                      border-b border-white/10
                      hover:text-main!
                      transition-all duration-300

                      ${location.pathname === item.link ? "text-main!" : ""}
                    `}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>

            {/* Sign / Register */}
            <div
              className="
                flex
                flex-col
                gap-3
                py-3!
                px-3!
              "
            >
              <Link
                to="/signin"
                className="
                  flex items-center
                  gap-2
                  text-white!
                  hover:text-main
                  transition-all duration-300
                "
              >
                <PiSignInBold className="text-xl" />

                <span>Sign In</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-2
                  text-white!
                  hover:text-main
                  transition-all duration-300
                "
              >
                <FaUserPlus className="text-xl" />

                <span>Register</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BtmHeader;

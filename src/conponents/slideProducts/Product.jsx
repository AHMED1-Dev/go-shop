import { useContext } from "react";
import {
  FaStar,
  FaRegStarHalfStroke,
  FaRegStar,
  FaCheck,
  FaHeart,
} from "react-icons/fa6";
import { FaCartArrowDown, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CartContext } from "../../conponents/context/CartContext";

import { toast } from "react-hot-toast";

import { getAvailabilityInfo } from "../slideProducts/availability";

function Product({ item }) {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating); // عدد النجوم الكاملة
    const hasHalfStar = rating % 1 >= 0.5; // لو في نص نجمه

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        // لو اصغر من النجوم الكاملة
        stars.push(<FaStar key={i} />); // نجمة كاملة
      } else if (i === fullStars + 1 && hasHalfStar) {
        // لو اصغر من النجوم الكاملة + 1 و لو في نص نجمه
        stars.push(<FaRegStarHalfStroke key={i} />); // نص نجمة
      } else {
        stars.push(<FaRegStar key={i} />); // نجمة فاضية
      }
    }
    return stars;
  };

  const { cartItems, addItems, addTofavorites, favorites, removeFavorites } =
    useContext(CartContext);
  // CartContext بعد كده الحاجات دي استدعيه منين من الملف useContext وبعد كده انا اعملت  { cartItems, addItems } اول حاجه بستدعي الاثنين دول

  // Cart
  const isItemInCart = cartItems.some((i) => i.id === item.id);
  // اللي هنا item.id بتاعه لو بيساوي نفس ال idتشوف ال item هتخش لي علي كل  (i) => i.id  هنا

  //toast
  const handleAddToCart = () => {
    addItems(item);
    toast.success(
      <div className="flex items-center gap-3 max-w-75 min-w-75">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-auto max-w-15 h-12.5 object-cover rounded-lg shrink-0"
        />
        <div className="flex flex-col gap-1 text-sm">
          <strong className="overflow-hidden text-ellipsis line-clamp-1 text-sm">
            {item.title}
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
        progress: undefined,
        theme: "light",
      },
    );
  };

  // favorites
  const isItemInFav = favorites.some((i) => i.id === item.id);

  const handleAddToFav = () => {
    if (isItemInFav) {
      removeFavorites(item.id);
      toast.error(`${item.title} Removed from favorites`);
    } else {
      addTofavorites(item);
      toast.success(`${item.title} added to favorites`);
    }
  };

  const availability = getAvailabilityInfo(item.stock);

  return (
    <section
      className={`group relative w-full max-w-61.25 bg-white border border-border rounded-2xl overflow-hidden shadow-xs p-4! cursor-pointer hover:border-main hover:shadow-md transition-shadow `}
    >
      <span
        className={`absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 text-[13px] bg-white px-2! py-1! rounded-full shadow-sm transition-all duration-300 ${
          isItemInCart ? "top-2.5!" : "-top-7.5!"
        }`}
      >
        <FaCheck className="text-green-500!" /> in cart
      </span>
      {/* الكود دا علشان لما ادوس علي المنتج يتحول علي صفحه تفاصيل المنتج */}
      <div className="flex items-center justify-between mb-1!">
        <span className="text-[15px] tracking-wider! block bg-danger text-white! px-1.5! rounded-[5px]">
          %{item.discountPercentage}
        </span>

        {/* <span
          onClick={handleAddToFav}
          className={` top-3 right-3 text-2xl p-1.5! backdrop-blur-xs rounded-full  text-main! ${isItemInFav ? "bg-main  text-white!" : ""}`}
        >
          <FaRegHeart />
        </span> */}
        <button
          type="button"
          onClick={handleAddToFav}
          aria-label={
            isItemInFav ? "Remove from favorites" : "Add to favorites"
          }
          className={`grid place-items-center size-9 rounded-full border transition-all duration-200 cursor-pointer ${
            isItemInFav
              ? "bg-main border-main text-white!"
              : "bg-white border-border text-slate-500! hover:text-main! hover:border-main"
          }`}
        >
          {isItemInFav ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
        </button>
      </div>
      <Link to={`/products/${item.id}`}>
        <div className="relative w-full h-56 bg-bg rounded-xl overflow-hidden flex items-center justify-center mb-3!">
          <img
            src={item.images[0]}
            alt={item.category}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          ></img>
        </div>
        <h2 className="text-2xl font-bold line-clamp-1 group-hover:text-main!">
          {item.title}
        </h2>
        <div className="stars flex items-center text-[18px] text-gold py-3.5! px-0">
          {renderStars(item.rating)}
          <span className="text-[13px] text-secondary! ml-1.5!">
            ({item.rating})
          </span>
        </div>
        <span className="text-[20px] text-heading! font-bold">
          ${item.price}
        </span>
        <span className="text-[11px] text-secondary! line-through ml-1.25!">
          ${(item.price / (1 - item.discountPercentage / 100)).toFixed(2)}
        </span>

        <p className={`${availability.color} text-[12px] font-medium`}>
          {availability.text}
        </p>
      </Link>

      <div
        onClick={() => !isItemInCart && handleAddToCart()}
        className={`flex items-center justify-center gap-2.5 p-2.5! mt-1.5! bg-main rounded-2xl transition-transform duration-300 ${
          isItemInCart ? "pointer-events-none opacity-70" : "hover:scale-105"
        }`}
      >
        <span className="text-2xl text-white!">
          <FaCartArrowDown />
        </span>
        <button className="text-1xl text-white!"> Add to Cart</button>
      </div>
    </section>
  );
}

export default Product;

import { useContext } from "react";
import { FaTrashAlt } from "react-icons/fa";

import { CartContext } from "../../conponents/context/CartContext";

import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../../conponents/PageTransition";

function Cart() {
  const { cartItems, increaseQuantity, decreaseQuantity, removeItem } =
    useContext(CartContext);

  console.log(cartItems);

  const totle = cartItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);

    const navigate = useNavigate();

  return (
    <PageTransition>
      {/* Checkout */}
      <section className="my-12! mx-0!">
        {/* ordersummary */}
        <div className=" w-[45%] mx-auto! py-0! px-5! border border-border shadow-xs shadow-secondary rounded-md">
          {/* <h2 className="text-xl font-black text-slate-900">Shopping Cart</h2> */}
          <h1 className=" text-2xl font-bold text-main! border-b border-border py-5! px-0! mb-5!">
            {" "}
            Order Summary
          </h1>

          {/* items */}
          <div className="h-87.5 overflow-y-scroll">
            {cartItems.length == 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12! text-center max-w-xl mx-auto! shadow-xs">
                <h2 className="text-lg font-bold text-heading! mb-1!">
                  Your Shopping Cart is Empty
                </h2>
                <p className="text-xs text-secondary! mb-6!">
                  Looks like you haven't added anything to your cart yet.
                  Explore our top products and exclusive deals.
                </p>
                <Link
                  to="/"
                  className="inline-block bg-main hover:opacity-90 text-white! font-bold text-xs py-2.5! px-6! rounded-lg transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              cartItems.map((item, index) => {
                return (
                  // item_cart
                  <div
                    className="item_cart flex items-center justify-between gap-5 h-31.25 border-b border-border pr-5! last:border-b-0"
                    key={index}
                  >
                    {/* image Name */}
                    <div className=" flex items-center gap-5">
                      <img
                        className="w-20! h-20! object-contain flex items-center justify-center"
                        src={item.images[0]}
                        alt={item.title}
                      />

                      <div className="content">
                        <h4 className="text-sm font-bold mb-2.5! overflow-auto line-clamp-1">
                          {item.title}
                        </h4>
                        <p>$ {item.price}</p>
                        {/* quantity_control */}
                        <div className="flex items-center justify-center mt-1! gap-1 border border-slate-300 w-fit rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="w-6.75 h-6.75 flex items-center justify-center cursor-pointer text-2xl hover:bg-slate-200 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-lg min-w-10 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="w-6.75 h-6.75 flex items-center justify-center cursor-pointer text-2xl hover:bg-slate-200 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => removeItem(item.id)}
                      className="outline-none border-none bg-transparent text-2xl text-red-600 cursor-pointer transition-transform duration-300 hover:scale-105"
                    >
                      <FaTrashAlt />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="button_summary border-t border-border pt-6!">
            <div className="shop_table flex items-center justify-between mb-5!">
              <p className="text-xl font-bold text-main!">Total:</p>
              <span className="total_checkout text-xl font-bold">{totle}</span>
            </div>
            <div className="button_div border-t border-border py-7.5! px-0!">
              <button
                type="submit"
                disabled={cartItems.length === 0}
                onClick={() => navigate("/checkout")}
                className="w-full bg-main text-white border-2! border-main py-4! px-0 text-xl font-bold cursor-pointer outline-none rounded-lg transition-transform duration-300 hover:scale-105 hover:bg-transparent hover:text-main disabled:opacity-50 disabled:pointer-events-none"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
//
export default Cart;

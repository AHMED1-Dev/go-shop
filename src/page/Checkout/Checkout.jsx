import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../conponents/context/CartContext";
import FormField from "../../conponents/FormField";
import { useForm } from "../../conponents/useForm";
import { required, phone, minLength } from "../../conponents/validators";

const rules = {
  fullName: [required("Full name")],
  phone: [required("Phone"), phone],
  city: [required("City")],
  address: [required("Address"), minLength("Address", 10)],
};

function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const [orderNumber, setOrderNumber] = useState(null);

  const { values, errors, handleChange, handleSubmit } = useForm(
    { fullName: "", phone: "", city: "", address: "" },
    rules,
  );

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 5 : 0;
  const total = (subtotal + shipping).toFixed(2);

  const onPlaceOrder = (data) => {
    const number = `GS-${Date.now().toString().slice(-8)}`;
    console.log("Order (no backend yet):", {
      number,
      customer: data,
      items: cartItems,
      total,
    });
    setOrderNumber(number);
    clearCart();
  };

  // صفحة التأكيد
  if (orderNumber) {
    return (
      <section className="w-[90%] max-w-lg mx-auto! py-16! text-center">
        <div className="bg-white border border-border rounded-2xl p-8!">
          <div className="size-16 mx-auto! mb-4! grid place-items-center rounded-full bg-success text-white! text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-main! mb-2!">
            Order Confirmed!
          </h1>
          <p className="text-secondary! mb-1!">Thank you for your order.</p>
          <p className="text-sm mb-6!">
            Order number: <span className="font-bold">{orderNumber}</span>
          </p>
          <Link
            to="/shop"
            className="inline-block px-8! py-3! bg-main text-white! rounded-xl font-semibold hover:opacity-90 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  // الكارت فاضي
  if (cartItems.length === 0) {
    return (
      <section className="w-[90%] max-w-lg mx-auto! py-16! text-center">
        <h1 className="text-xl font-bold mb-3!">Your cart is empty</h1>
        <Link to="/shop" className="text-main! font-semibold">
          Go to Shop
        </Link>
      </section>
    );
  }

  return (
    <section className="container w-[90%] mx-auto! max-w-337.5 px-4! py-8!">
      <h1 className="text-2xl sm:text-3xl font-bold text-main! mb-8!">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping form */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit(onPlaceOrder)}
          noValidate
          className="lg:col-span-2 bg-white border border-border rounded-2xl p-6!"
        >
          <h2 className="text-lg font-bold mb-4!">Shipping details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4!">
            <FormField
              label="Full name"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="Your name"
            />
            <FormField
              label="Phone"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="01001234567"
            />
          </div>

          <FormField
            label="City"
            name="city"
            value={values.city}
            onChange={handleChange}
            error={errors.city}
            placeholder="Mansoura"
          />
          <FormField
            label="Address"
            name="address"
            textarea
            value={values.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Street, building, apartment..."
          />

          <h2 className="text-lg font-bold mt-6! mb-3!">Payment method</h2>
          <label className="flex items-center gap-3 border border-main bg-bg rounded-xl p-4! cursor-pointer">
            <input type="radio" checked readOnly className="accent-main" />
            <span className="text-sm font-semibold">Cash on Delivery</span>
          </label>
        </form>

        {/* Order summary */}
        <aside className="bg-white border border-border rounded-2xl p-6! h-fit">
          <h2 className="text-lg font-bold mb-4!">Order summary</h2>

          <div className="space-y-3! max-h-64 overflow-y-auto mb-4!">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="size-14 object-contain bg-bg rounded-lg"
                />
                <div className="grow min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-secondary!">
                    {item.quantity} × ${item.price}
                  </p>
                </div>
                <p className="text-sm font-bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4! space-y-2! text-sm">
            <div className="flex justify-between">
              <span className="text-secondary!">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary!">Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2! border-t border-border">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            className="w-full mt-5! py-3! bg-main text-white! rounded-xl font-semibold cursor-pointer hover:opacity-90 transition"
          >
            Place Order
          </button>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;

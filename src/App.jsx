import { Routes, Route } from "react-router-dom";
import TopHeader from "./conponents/header/TopHeader";
import BtmHeader from "./conponents/header/BtmHeader";
import Home from "./page/Home/Home";
import ProductDetails from "./page/productDetails/ProductDetails";
import Cart from "./page/cart/Cart";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./conponents/ScrollToTop";
import { AnimatePresence } from "framer-motion";
import CategoryPage from "./page/CategoryPage/CategoryPage";
import SerachResults from "./page/SerachResults";
import Favorites from "./page/favorites/favorites";
import Shop from "./page/Shop/Shop";
import Deals from "./page/Deals/Deals";
import NewArrivals from "./page/NewArrivals/NewArrivals";
import Blog from "./page/Blog/Blog";
import Contact from "./page/Contact/Contact";
import SignIn from "./page/Auth/SignIn";
import Register from "./page/Auth/Register";
import Checkout from "./page/Checkout/Checkout";

function App() {
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
        <TopHeader />
        <BtmHeader />
      </header>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#e9e9e9",
            borderRadius: "5px",
            padding: "16px",
          },
        }}
      />
      <ScrollToTop />
      <main className="pt-43.5! lg:pt-[126.6px]!">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/Search" element={<SerachResults />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </AnimatePresence>
      </main>
    </>
  );
}

export default App;

import { Routes, Route, Link } from "react-router-dom";
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
import { useLayoutEffect, useRef } from "react";

function NotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-main">الصفحة مش موجودة</h1>
      <p>العنوان اللي فتحته مش تابع لأي صفحة في المتجر.</p>
      <Link to="/" className="rounded bg-main px-5! py-2! text-white!">
        ارجع للصفحة الرئيسية
      </Link>
    </section>
  );
}

function App() {

  const headerRef = useRef(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height}px`,
      );
    });

    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm"
      >
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
      <main style={{ paddingTop: "var(--site-header-height, 0px)" }}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
    </>
  );
}

export default App;

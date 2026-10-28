import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import CartProvider from "./conponents/context/CartContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/">
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
);

/*
import CartProvider from "./conponents/context/CartContext.jsx";
 يعني انا بعمل دي علشان عاوز الملف كله بعد كده
<CartProvider>
        <App />
      </CartProvider>
  يشتغل في كل الصفح عادي من غير مشاكل CartContext.jsx صح كده وعلشان الكود دا بتاع ملف {children} عمل  <CartContext.Provider value={{ cartItems, addItems }}> {children} </CartContext.Provider> CartContext.jsx  ليه علشان انا عمل في ملف  <App />  بعمل دي وبحط جواها

*/

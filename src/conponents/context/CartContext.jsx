import { useState, useEffect } from "react";
import { CartContext } from "../../conponents/context/CartContextValue";



const isValidFavorite = (item) =>
  item !== null &&
  typeof item === "object" &&
  item.id !== undefined &&
  item.id !== null &&
  typeof item.title === "string" &&
  Array.isArray(item.images) &&
  typeof item.images[0] === "string" &&
  Number.isFinite(item.price) &&
  Number.isFinite(item.rating) &&
  Number.isFinite(item.discountPercentage);

const isValidCartItem = (item) =>
  isValidFavorite(item) && Number.isFinite(item.quantity) && item.quantity >= 1;

const readSavedList = (key, isValidItem) => {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.every(isValidItem) ? parsed : [];
  } catch {
    return [];
  }
};

function CartProvider({ children }) {
  const [favorites, setFavorites] = useState(() =>
    readSavedList("favoritesItems", isValidFavorite),
  );

  const addTofavorites = (item) => {
    setFavorites((prevItems) => {
      if (prevItems.some((favItem) => favItem.id === item.id)) {
        //favorite لو الاثنين يساوي بعض يبقا المنتج موجود في function اللي جايه من ال item.id بتساوي نفس  favItem.id لو
        return prevItems;
        // بتاعها القديم  prevItemsبعد كده لو كل حاجه تمام رجعلي ال
      }

      return [...prevItems, item];
      // function اللي جايه من item بتاعها القديم وال prevItems طب لو الشرط اللي فوق متحققش ابقا رجع
    });
  };

  useEffect(() => {
    localStorage.setItem("favoritesItems", JSON.stringify(favorites));
  }, [favorites]);
  // تتغير favorites بتشتغل لما useEffect

  // removeFavorites

  const removeFavorites = (id) => {
    setFavorites((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // cart
  // const [cartItems, setCartItems] = useState(() => {
    //   const savedCart = localStorage.getItem("cartItems");
    //   return savedCart ? JSON.parse(savedCart) : [];
    //   // لو موجوده برجع لك  localStorage بتاعها او موجوده تجيب لي الحاجات اللي في localStorage
    //   // localStorage دي في getItem("cartItems") يعني لو لقيت true بس بشرط لو
    // });
    // فاضيه Array ولو مش موجوده برجع لك  localStorage بتاعها او موجوده تجيب لي الحاجات اللي في localStorage انا مش عاوزه فاضيه انا عاوزه تعمل اتشك تشوف  useState([]) في
    
    // cart
  const [cartItems, setCartItems] = useState(() =>
    readSavedList("cartItems", isValidCartItem),
  );

  // increaseQuantity
  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        return item.id === id ? { ...item, quantity: item.quantity + 1 } : item;
      }),
    );
  };

  // decreaseQuantity
  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        return item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item;
      }),
    );
  };

  // removeItem
  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // clearCart
  const clearCart = () => {
    setCartItems([]);
  };

  // const addItems = (itme) => {
  //   setCartItems((prevItems) => [...prevItems, { ...itme, quantity: 1 }]);
  //   // جديد array وتفكّها/تنشرها جوه (prevItems) القديم array بتاخد كل عناصر الـ (Spread Operator) ... علامة
  //   // كعنصر جديد في الآخر itme بعد كده بنضيف
  // };

  const addItems = (item) => {
    setCartItems((prevItems) => {
      if (prevItems.some((cartItem) => cartItem.id === item.id)) {
        return prevItems;
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);
  // addItems بتاع function دي بتتغير امتا كل ما بنشتغل cartItems تتغير وال cartItems دي هتتحدث امتا كل ما useEffect و addItems عباره عن ان هي بتضيف المنتجات في ال cartItems
  // بناء علي التغير اللي هيحصل localStorage علشان تحدث كل شويه useEffect هنا انا هعمل

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItems,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
        addTofavorites,
        favorites,
        removeFavorites,
      }}
    >
      {/* من اي مكان cartItems من اي مكان او اي حد يقدر ياخد القيمه بتاعه  addItems انا لما اعمل دي كده ليه علشان اي حد يقدر يشغل  { cartItems, addItems } */}
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;

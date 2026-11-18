# شرح CartContext وCartContextValue

الشرح ده ماشي بنفس ترتيب الكود الحالي في CartContext.jsx، وبعده الملف الصغير CartContextValue.jsx. الهدف نفهم إزاي السلة والمفضلة بيتشاركوا بين المكونات وبيتخزنوا في localStorage.

## ملف src/conponents/context/CartContext.jsx

### الاستيرادات والتعليقات في أول الملف

```jsx
import { useState, useEffect } from "react";
import { CartContext } from "../../conponents/context/CartContextValue";
```

- useState من React بتخلينا نحتفظ بقيمة متغيرة داخل المكوّن. هنا هنستخدمها للاحتفاظ بعناصر السلة والمفضلة.
- useEffect من React بتشغّل كود بعد ما React يحدّث الواجهة. هنا استخدامها لحفظ تغييرات السلة والمفضلة في localStorage.
- CartContext هو الصندوق المشترك اللي اتعمل في CartContextValue.jsx. الـProvider هيحط فيه القيم والدوال، والمكونات هتقرأه باستخدام useContext.
- مسار الاستيراد مكتوب بالنسبة لمكان الملف الحالي، وبيشير لملف CartContextValue.jsx.

بعد الاستيرادات فيه تعليقان عربيان قديمان بيتكلموا عن createContext وإنشاء الصندوق. التعليقات لا تُنفّذ، وcreateContext مش مستورد في الملف ده حاليًا؛ إنشاؤه موجود في CartContextValue.jsx.

### التحقق من عنصر مفضلة: isValidFavorite

```jsx
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
```

دي دالة بتستقبل عنصر واحد اسمه item، وترجع true لو كل الشروط متحققة، وfalse لو شرط واحد على الأقل فشل. علامة && معناها إن كل الشروط لازم تكون صحيحة.

- العنصر ما يكونش null، ولازم يكون نوعه object؛ لأن بيانات المنتج متوقعة تكون object فيها خصائص.
- id لازم يكون موجود، وما يكونش null؛ عشان نقدر نميّز المنتج ونقارنه بمنتجات تانية.
- title لازم يكون نصًا (string).
- images لازم تكون مصفوفة، وأول عنصر فيها images[0] لازم يكون نصًا؛ لأن عرض المنتج بيستخدم الصورة الأولى.
- price وrating وdiscountPercentage لازم تكون أرقامًا صالحة، وNumber.isFinite يرفض القيم غير الرقمية مثل NaN وInfinity.

مثال مبسط: لو العنصر مش فيه images كمصفوفة، الدالة ترجع false بدل ما تعتبره عنصر مفضلة صالحًا.

### التحقق من عنصر سلة: isValidCartItem

```jsx
const isValidCartItem = (item) =>
  isValidFavorite(item) && Number.isFinite(item.quantity) && item.quantity >= 1;
```

عنصر السلة لازم ينجح أولًا في كل فحوص isValidFavorite؛ وبعدها quantity لازم تكون رقمًا صالحًا وأكبر من أو تساوي 1. استخدام isValidFavorite هنا بيعيد استخدام التحقق المشترك بدل تكراره.

مثال: منتج بياناته الأساسية سليمة لكن كميته 0 أو NaN، مش هيُعتبر عنصر سلة صالحًا.

### القراءة الآمنة: readSavedList

```jsx
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
```

الدالة بتقرأ قائمة محفوظة. بتاخد وسيطين: key هو اسم المفتاح في localStorage، وisValidItem هي دالة فحص كل عنصر.

1. يبدأ try الجزء اللي ممكن يحصل فيه خطأ.
2. localStorage.getItem(key) يقرأ القيمة المخزنة. لو مفيش قيمة، يرجع null، وشرط if (!saved) يرجّع مصفوفة فاضية [].
3. JSON.parse(saved) يحوّل النص المخزن إلى قيمة JavaScript. لو النص مش JSON صالح، يحصل خطأ وينتقل التنفيذ إلى catch.
4. Array.isArray(parsed) يتأكد إن القيمة مصفوفة. مثلًا {} أو نص JSON عادي مش هيعدّوا الفحص.
5. parsed.every(isValidItem) يشغّل دالة التحقق على كل عنصر. لو كل العناصر صالحة، يرجع نفس المصفوفة؛ لو أي عنصر غير صالح، يرجع [] للقائمة كلها، مش بيحذف العنصر الغلط لوحده.
6. catch يمسك أي خطأ حصل داخل try ويرجع [] بدل ما يسيب خطأ القراءة يوقف التطبيق.

الدالة نفسها ما تعرفش هل بتقرأ السلة أو المفضلة؛ ده بيتحدد بالمفتاح ودالة التحقق اللي بيتبعتوا لها.

### بداية الـProvider وقراءة المفضلة

```jsx
function CartProvider({ children }) {
  const [favorites, setFavorites] = useState(() =>
    readSavedList("favoritesItems", isValidFavorite),
  );
```

- CartProvider هو مكوّن React مسؤول عن توفير بيانات السلة والمفضلة لمكوناته الداخلية.
- { children } هي المكونات اللي بتتحط جوه <CartProvider> ... </CartProvider> في المكان اللي بيستخدمه.
- useState بينشئ حالة اسمها favorites ودالة تحديث اسمها setFavorites.
- القيمة الأولية مكتوبة كدالة: () => ...، فده بيخلّي React يقرأ بيانات المفضلة وقت التهيئة الأولية للحالة.
- المفتاح "favoritesItems" يحدد بيانات المفضلة، وisValidFavorite يفحص كل عنصر مقروء.

لو القراءة أو الفحص فشل، readSavedList ترجع []، فالمفضلة تبدأ فاضية.

### إضافة المفضلة: addTofavorites

```jsx
const addTofavorites = (item) => {
  setFavorites((prevItems) => {
    if (prevItems.some((favItem) => favItem.id === item.id)) {
      return prevItems;
    }

    return [...prevItems, item];
  });
};
```

- الدالة تستقبل المنتج item، وتطلب تحديث favorites.
- prevItems هي قيمة المفضلة السابقة. استخدام الدالة دي داخل setFavorites بيبني التحديث على أحدث قيمة للحالة.
- some بيدوّر على منتج له نفس id. لو موجود، ترجع الدالة القائمة السابقة كما هي، وبالتالي ما تضيفش نسخة مكررة.
- لو المنتج مش موجود، [...prevItems, item] تنشئ مصفوفة جديدة فيها العناصر القديمة والمنتج الجديد في الآخر.

التعليقات العربية جوه الدالة بتشرح الفكرة، لكنها لا تؤثر على التنفيذ.

### حفظ المفضلة باستخدام useEffect

```jsx
useEffect(() => {
  localStorage.setItem("favoritesItems", JSON.stringify(favorites));
}, [favorites]);
```

بعد ما تتغير favorites، الـEffect يحوّلها لنص باستخدام JSON.stringify ويحفظ النص في localStorage تحت المفتاح "favoritesItems". المصفوفة في JavaScript ما بتتخزنش مباشرة كقيمة في localStorage، لذلك تتحول لنص JSON.

المصفوفة [favorites] في آخر useEffect اسمها dependency array؛ معناها إن الـEffect يعيد الحفظ لما تتغير قيمة favorites.

### حذف المفضلة: removeFavorites

```jsx
const removeFavorites = (id) => {
  setFavorites((prevItems) => prevItems.filter((item) => item.id !== id));
};
```

الدالة تستقبل id، وتستخدم filter لإنشاء قائمة جديدة بكل العناصر اللي معرّفها مختلف عن id. النتيجة إن المنتج المطابق يتشال من المفضلة.

### التعليقات القديمة الخاصة بالسلة

بعد تعليق // cart فيه كود قديم لقراءة السلة، لكنه كله مسبوق بـ//، لذلك لا يُنفّذ. وتحته تعليق أطول يشرح الفكرة القديمة. الكود الفعلي لتهيئة السلة موجود بعدهم.

### قراءة السلة وتهيئة حالتها

```jsx
const [cartItems, setCartItems] = useState(() =>
  readSavedList("cartItems", isValidCartItem),
);
```

cartItems هي حالة عناصر السلة، وsetCartItems دالة تحديثها. عند تهيئة الحالة، يقرأ الكود المفتاح "cartItems" من localStorage باستخدام readSavedList، ويفحص العناصر بواسطة isValidCartItem؛ يعني لازم بيانات المنتج تكون صالحة والكمية رقمًا صالحًا لا يقل عن 1.

لو المفتاح مش موجود، أو JSON تالف، أو البيانات مش مصفوفة، أو فيها عنصر غير صالح، تبدأ السلة بمصفوفة فاضية.

### زيادة الكمية: increaseQuantity

```jsx
const increaseQuantity = (id) => {
  setCartItems((prevItems) =>
    prevItems.map((item) => {
      return item.id === id ? { ...item, quantity: item.quantity + 1 } : item;
    }),
  );
};
```

الدالة تستقبل معرّف المنتج. map تنشئ مصفوفة جديدة: لو id مطابق، تنشئ object جديدًا بنسخ خصائص المنتج باستخدام ...item ثم تضع quantity الجديدة، وهي القديمة زائد 1. المنتجات الأخرى ترجع كما هي.

### تقليل الكمية: decreaseQuantity

```jsx
const decreaseQuantity = (id) => {
  setCartItems((prevItems) =>
    prevItems.map((item) => {
      return item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item;
    }),
  );
};
```

تبحث الدالة عن المنتج بالـid. لو الكمية أكبر من 1، تنشئ نسخة منه بكمية أقل بواحد. لو المنتج مختلف أو كميته 1، تتركه كما هو؛ يعني الكمية ما بتنزلش عن 1 من خلال هذه الدالة.

### حذف منتج من السلة: removeItem

```jsx
const removeItem = (id) => {
  setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
};
```

تستقبل id وتحذف المنتج المطابق باستخدام filter، مع إبقاء باقي المنتجات.

### تفريغ السلة: clearCart

```jsx
const clearCart = () => {
  setCartItems([]);
};
```

تستبدل محتوى حالة السلة بمصفوفة فاضية. وبعد تحديث الحالة، useEffect الخاص بالسلة يحفظ المصفوفة الفاضية في localStorage.

### تعليق دالة الإضافة القديمة

```jsx
// const addItems = (itme) => {
//   setCartItems((prevItems) => [...prevItems, { ...itme, quantity: 1 }]);
// };
```

ده مثال قديم معلّق، فلا يُنفّذ. دالة الإضافة الفعلية موجودة بعده. الكلمة itme هنا جزء من الكود المعلّق فقط.

### إضافة منتج للسلة: addItems

```jsx
const addItems = (item) => {
  setCartItems((prevItems) => {
    if (prevItems.some((cartItem) => cartItem.id === item.id)) {
      return prevItems;
    }
    return [...prevItems, { ...item, quantity: 1 }];
  });
};
```

تستقبل الدالة المنتج item وتفحص السلة السابقة. لو فيه منتج بنفس id، ترجع القائمة كما هي؛ الإضافة المتكررة لا تزود الكمية تلقائيًا. لو المنتج مش موجود، تضيف نسخة منه إلى مصفوفة جديدة، وتحدد quantity على 1. زيادة الكمية تتم بالدالة المنفصلة increaseQuantity.

### حفظ السلة باستخدام useEffect

```jsx
useEffect(() => {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}, [cartItems]);
```

كل ما تتغير حالة cartItems، يحولها JSON.stringify إلى نص JSON ويحفظها تحت المفتاح "cartItems". تعليق الكود بعد الـEffect يشرح فكرة التحديث، لكنه لا يضيف سلوكًا آخر.

### توفير البيانات للمكونات وإغلاق CartProvider

```jsx
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
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
```

- CartContext.Provider هو الجزء اللي يوفّر قيمة الـContext للمكونات الموجودة داخله.
- الخاصية value تحتوي على حالتي السلة والمفضلة، ومعهما الدوال اللي تعدّلهما. المكونات تقدر تستقبل القيم دي باستيراد CartContext واستعمال useContext(CartContext).
- cartItems: عناصر السلة.
- addItems: إضافة منتج للسلة إن لم يكن موجودًا بالفعل.
- increaseQuantity وdecreaseQuantity: تعديل كمية منتج.
- removeItem وclearCart: حذف منتج أو تفريغ السلة.
- favorites: عناصر المفضلة.
- addTofavorites وremoveFavorites: إضافة منتج للمفضلة أو حذفه منها.
- {children} هو المكان اللي تظهر فيه المكونات الموضوعة داخل الـProvider، مثل التطبيق وصفحاته.
- export default CartProvider يصدّر مكوّن الـProvider كـdefault export، مثل ما يستورده main.jsx.

## ملف src/conponents/context/CartContextValue.jsx

```jsx
import { createContext } from "react";

export const CartContext = createContext();
```

- createContext من React تنشئ Context، يعني قناة مشتركة لتوصيل قيمة من Provider لمكونات أعمق من غير تمريرها يدويًا عبر كل مستوى.
- createContext() ينشئ الـContext نفسه، وexport const CartContext يخلّيه متاحًا للاستيراد في CartContext.jsx وفي المكونات التي تقرأه.
- اتفصل في الملف ده عشان يبقى ملف الـContext مستقلًا عن ملف الـProvider. ده يعالج قاعدة ESLint المسماة react-refresh/only-export-components التي ظهرت لما كان ملف الـProvider يصدّر الـContext ومكوّن React معًا.
- قيمة createContext() هنا ما فيهاش قيمة افتراضية محددة؛ الـProvider هو اللي يوفّر value الفعلية للمكونات الموجودة داخله.

## مثال عملي: إضافة منتج واسترجاعه بعد Refresh

1. مكوّن منتج يستدعي addItems(item) من قيمة CartContext.
2. addItems تفحص cartItems السابقة. لو المنتج جديد، تضيف نسخة فيها quantity: 1 وتحدّث حالة cartItems.
3. بعد تحديث الحالة، useEffect الخاص بالسلة يعمل JSON.stringify(cartItems) ويحفظ النص تحت المفتاح cartItems في localStorage.
4. عند عمل Refresh، يبدأ CartProvider من جديد، وتستدعي دالة التهيئة readSavedList("cartItems", isValidCartItem).
5. الدالة تقرأ النص، تحوّله بـJSON.parse، وتتأكد إنه مصفوفة وكل عنصر ينجح في isValidCartItem. لو البيانات سليمة، ترجع القائمة للحالة فتظهر المنتجات والكميات المحفوظة. لو فشل التحليل أو التحقق، ترجع [].

ملاحظة: التحقق يقتصر على الشروط المكتوبة داخل isValidFavorite وisValidCartItem؛ لم يُتحقق هنا من صلاحية أي حقول أخرى غير المذكورة في الكود.

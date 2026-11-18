# شرح تعليمي لملف `useProducts.jsx` والصفحات التي تستخدمه

الشرح ده مبني على الكود الموجود حاليًا في المشروع. الفكرة إن أربع صفحات بتستخدم Hook واحد لتحميل قائمة المنتجات، والـ Hook بيشارك نتيجة التحميل والطلب الجاري بينهم. الشرح للتعلّم، ومش معناه إن الصفحات نفسها اتعدلت.

## الفكرة العامة

`useProducts` بيطلب قائمة المنتجات من DummyJSON مرة، ويحتفظ بالنتيجة الناجحة في متغير على مستوى الملف. لو أكتر من صفحة احتاجت البيانات والطلب لسه شغال، كلهم بياخدوا نفس الـ Promise. كل صفحة بتستخدم القيم `products` و`loading` و`error` لعرض التحميل أو الخطأ أو المنتجات.

## أولًا: شرح `src/conponents/useProducts.jsx`

### استيراد React Hooks

```jsx
import { useEffect, useState } from "react";
```

- `useState` بيحفظ حالة خاصة بكل نسخة من المكوّن اللي استدعى الـ Hook.
- `useEffect` بيشغّل كود الطلب بعد ما المكوّن يظهر على الشاشة، وبينفّذ دالة التنظيف لما المكوّن يتشال.

### المتغيرات المشتركة على مستوى الملف

```jsx
let cachedProducts = null;
let productsPromise = null;
```

المتغيرين دول مكتوبين **برا** `useProducts`، فهما مش بيتعملوا من جديد مع كل استدعاء للـ Hook. كل الصفحات اللي بتستورد نفس الملف بتشارك نفس النسختين في ذاكرة التطبيق.

- `cachedProducts`: النتيجة الناجحة، وهي مصفوفة المنتجات. قيمته تبدأ `null` بمعنى إن مفيش نتيجة ناجحة محفوظة لسه. حتى المصفوفة الفاضية `[]` تعتبر نتيجة مخزنة؛ لأنها مختلفة عن `null`.
- `productsPromise`: الـ Promise بتاع الطلب اللي لسه شغال. بيكون `null` لما مفيش طلب حالي.

دول مختلفين عن `useState`: متغيرات الملف مشتركة بين كل مستهلكي الـ Hook وبتفضل موجودة طول ما صفحة التطبيق مفتوحة. أما حالات `useState` فلكل مكوّن استدعى `useProducts` نسخته الخاصة من `products` و`loading` و`error`.

### دالة `loadProducts`

```jsx
function loadProducts() {
  if (cachedProducts !== null) return Promise.resolve(cachedProducts);
  if (productsPromise !== null) return productsPromise;
```

أول شرط بيسأل: هل عندنا نتيجة ناجحة؟ لو آه، يرجع Promise مكتمل بالنتيجة المحفوظة من غير طلب شبكة جديد.

الشرط التاني بيسأل: هل فيه طلب لسه شغال؟ لو آه، يرجع نفس `productsPromise` بدل ما يبدأ طلب تاني. كده كل صفحة تنتظر نفس العملية.

```jsx
  const request = fetch("https://dummyjson.com/products?limit=0")
```

لو مفيش نتيجة مخزنة ولا طلب شغال، يبدأ طلب `fetch` جديد. `limit=0` في الرابط الحالي بيطلب القائمة الكاملة من المنتجات.

```jsx
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    })
```

بعد وصول رد HTTP، `res.ok` بيتأكد إن الرد ناجح. لو الرد فشل، يرمي خطأ برسالة `Failed to load products`. لو نجح، يحوّل جسم الرد إلى JSON.

```jsx
    .then((data) => {
      if (!Array.isArray(data?.products)) {
        throw new Error("Invalid products response: expected a products array");
      }
```

هنا بيتأكد إن `data.products` مصفوفة فعلًا. `data?.products` بتمنع خطأ الوصول للخاصية لو `data` نفسها `null` أو `undefined`. لو شكل الاستجابة مش المتوقع، يرمي خطأ واضح بدل ما يخزن بيانات غير صالحة.

```jsx
      cachedProducts = data.products;
      productsPromise = null;
      return cachedProducts;
    })
```

بعد نجاح الفحص، يخزن مصفوفة المنتجات في Cache الملف، ويمسح مرجع الطلب الجاري لأنه انتهى، ثم يرجع المنتجات للمستهلكين المنتظرين.

```jsx
    .catch((err) => {
      productsPromise = null;
      throw err;
    });
```

لو حصل فشل شبكة أو HTTP أو JSON أو فشل فحص شكل البيانات، يمسح `productsPromise` ويرمي الخطأ تاني عشان يوصل إلى الـ Hook. الخطأ نفسه لا يُخزّن في Cache. مسح الـ Promise مهم لأن الاحتفاظ بـ Promise مرفوضة كان هيخلي المحاولات التالية ترجع نفس الفشل بدل بدء طلب جديد.

```jsx
  productsPromise = request;
  return request;
}
```

يحفظ الطلب الجديد فور إنشائه في `productsPromise` ويرجعه. أي استدعاء تاني لـ`loadProducts` قبل انتهاء الطلب هيرجع نفس Promise.

### حالات الـ Hook وتهيئتها

```jsx
export function useProducts() {
  const [products, setProducts] = useState(() => cachedProducts ?? []);
  const [loading, setLoading] = useState(() => cachedProducts === null);
  const [error, setError] = useState(null);
```

- `products`: المنتجات اللي هتستخدمها الصفحة. لو الـ Cache جاهز، البداية تكون منه. لو مش جاهز، تبدأ بمصفوفة فاضية.
- `loading`: تبدأ `false` لو الـ Cache موجود، وتبدأ `true` لو مفيش نتيجة ناجحة.
- `error`: تبدأ من غير رسالة خطأ.

الدوال المكتوبة داخل `useState` اسمها **lazy initializers**. React بينادي دالة البداية عند إنشاء حالة المكوّن بدل ما نكتب قيمة ثابتة. ده بيخلي قراءة الـ Cache هي اللي تحدد الحالة الأولية. وبما إن الحالة تبدأ من المنتجات المخزنة، الصفحة اللي تفتح بعد نجاح الطلب ما تحتاجش تعرض تحميل لحظي قبل المنتجات.

دي حالات محلية لكل مستهلك؛ مثلًا `Shop` و`Deals` لكل واحدة `products` state خاص بيها، لكن الاتنين بياخدوا بياناتهم من نفس Cache/Promise المشتركة.

### الـ Effect وعلامة `cancelled`

```jsx
  useEffect(() => {
    let cancelled = false;
```

عند تركيب المكوّن، يبدأ الأثر بعلامة `cancelled` قيمتها `false`. العلامة محلية للأثر ده، مش مشتركة مع الصفحات الأخرى.

```jsx
    loadProducts()
      .then((loadedProducts) => {
        if (!cancelled) setProducts(loadedProducts);
      })
```

يطلب النتيجة من `loadProducts`. عند النجاح، يحدّث حالة المنتجات فقط لو المكوّن ما زال موجودًا.

```jsx
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
```

عند الفشل، يحفظ رسالة الخطأ في حالة هذا المكوّن فقط لو لسه نشطًا.

```jsx
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
```

`finally` بتشتغل بعد النجاح أو الفشل. شرط `!cancelled` مهم: لو الأثر اتنظف، ما نغيّرش `loading` لمكوّن اتشال. لو عملنا `setLoading(false)` بعد إزالة الصفحة أو تجاهل نتيجة الطلب، ممكن يحصل عرض وسيط غير مناسب؛ مثلًا صفحة Shop تخرج من التحميل وتعرض رسالة «No products found» قبل ما بيانات صالحة تكون متاحة.

```jsx
    return () => {
      cancelled = true;
    };
  }, []);
```

الدالة الراجعة هي cleanup. عند إزالة المكوّن، تغيّر العلامة إلى `true`، فتتجاهل معالجات Promise تحديث الحالات. المصفوفة الفاضية `[]` معناها إن الأثر يبدأ عند تركيب المكوّن، مش عند كل render.

#### ليه بنستخدم `cancelled` بدل `AbortController`؟

الطلب هنا مش ملك مكوّن واحد؛ ممكن يكون فيه صفحات أو مستهلكون منتظرين نفس `productsPromise`. لو أول مكوّن أزال نفسه وألغى الطلب بـ`AbortController`، كان ممكن يوقف الطلب المشترك عن باقي المستهلكين. علامة `cancelled` تمنع تحديث حالة المكوّن اللي اتشال، لكنها تسيب الطلب يكمل عشان يتخزن عند نجاحه ويستفيد منه باقي المستهلكين. عشان كده عدم إلغاء طلب الشبكة قرار مقصود في التصميم الحالي.

#### إزاي طلبا `StrictMode` بيتشاركوا؟

التطبيق ملفوف بـ`<StrictMode>` في `src/main.jsx`. في التطوير، React ممكن يعمل دورة تركيب وتنظيف ثم تركيب تاني لاختبار الآثار. في الدورة الأولى، `loadProducts` ينشئ الطلب ويضعه في `productsPromise`. التنظيف يعلّم أثر النسخة الأولى كـ`cancelled` لكنه لا يلغي الطلب. عند تشغيل الأثر مرة تانية، يلاقي `productsPromise` موجودة ويرجعها. النتيجة: الأثران ينتظران نفس الطلب بدل طلبين منفصلين. لو نجح الطلب، يتجاهل الأثر الأول تحديث حالته ويحدّث الأثر النشط حالته.

### قيمة الإرجاع

```jsx
  return { products, loading, error };
}
```

الـ Hook يرجع نفس الواجهة اللي الصفحات كانت تستخدمها قبل التعديل: المنتجات، وحالة التحميل، ورسالة الخطأ. عشان الشكل ما اتغيرش، ما احتجناش نعدل استدعاءات الصفحات.

### Cache التطبيق وCache المتصفح

`cachedProducts` هو Cache JavaScript داخل ذاكرة التطبيق الحالية؛ يحتفظ بمصفوفة المنتجات بعد نجاح الرد، ويخدم الصفحات من غير `fetch` جديد. عادةً يختفي عند Refresh كامل لأن صفحة JavaScript تبدأ من جديد.

أما Cache المتصفح فهو آلية HTTP منفصلة. المتصفح قد يعيد استخدام استجابة HTTP مخزنة أو يتحقق منها مع الخادم؛ ظهور الحالة `304` في Network معناه أن المتصفح استخدم نسخة HTTP مخزنة بعد التحقق. الحالة دي مش هي `cachedProducts`، ومش هي اللي تجعل الصفحات تشارك Promise داخل React. في الاختبار اليدوي ظهر `304` لطلب المنتجات، بينما مشاركة الصفحات وعدم إنشاء طلب جديد جاية من Cache الملف.

## ثانيًا: صفحة Shop

الملف: `src/page/Shop/Shop.jsx`.

### استيراد المنتجات واستدعاء الـ Hook

```jsx
import { useState } from "react";
import Product from "../../conponents/slideProducts/Product";
import { useProducts } from "../../conponents/useProducts";

function Shop() {
  const { products, loading, error } = useProducts();
```

الصفحة تستورد بطاقة المنتج والـ Hook. الاستدعاء يفك الكائن الراجع إلى `products` و`loading` و`error`.

```jsx
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
```

دول اختياران خاصان بالواجهة: التصنيف يبدأ بـ`all`، وطريقة الترتيب تبدأ بـ`default`.

### بناء التصنيفات والمنتجات الظاهرة

```jsx
  const categories = [
    "all",
    ...new Set(products.map((product) => product.category)),
  ];
```

يمر `map` على المنتجات ويأخذ اسم تصنيف كل منتج. `Set` يزيل التكرارات، وبعدين spread يحوّله لقيم داخل مصفوفة الاختيارات. يضاف `all` في البداية.

```jsx
  const visibleProducts = [...products]
    .filter((product) => category === "all" || product.category === category)
    .sort((a, b) => { ... });
```

يعمل نسخة من مصفوفة المنتجات قبل الفرز، عشان ما يغيّرش ترتيب `products` الأصلية. `filter` يختار كل المنتجات أو منتجات التصنيف المحدد. `sort` يغيّر الترتيب حسب الاختيار: سعر تصاعدي، سعر تنازلي، تقييم أعلى، أو خصم أكبر. لو `default` يرجع صفر للمقارنة، فيسيب الترتيب كما هو قدر الإمكان.

في الكود الحالي يوجد `console.log(visibleProducts)`، فيطبع القائمة في Console عند render. ده موجود فعلًا ولم يتغير ضمن Issue 7.

### حالات العرض

- لو `loading` صحيحة، تعرض الصفحة مؤشر تحميل ونص `Loading products...`.
- لو `error` فيها رسالة، تعرض الخطأ وزر `Try again`. الزر يعمل `window.location.reload()`، يعني يعيد تحميل الصفحة كلها.
- غير كده تعرض عنوان Shop وعدد المنتجات الظاهرة، واختياري التصنيف والفرز.
- لو `visibleProducts` فاضية تعرض `No products found in this category.`، وإلا تنشئ بطاقة `Product` لكل عنصر باستخدام `item.id` كـ`key`.

## ثالثًا: صفحة Deals

الملف: `src/page/Deals/Deals.jsx`.

### استخدام الـ Hook وتجهيز العروض

```jsx
const MIN_DISCOUNT = 10;
const { products, loading, error } = useProducts();

const deals = products
  .filter((product) => product.discountPercentage >= MIN_DISCOUNT)
  .sort((a, b) => b.discountPercentage - a.discountPercentage);
```

تستخدم الصفحة نفس القيم الثلاث من الـ Hook. تحتفظ `filter` بالمنتجات التي خصمها 10% أو أكثر، ثم ترتبها تنازليًا بحيث يظهر الخصم الأكبر أولًا.

### حالات العرض

- أثناء التحميل تعرض مؤشرًا ونص `Loading deals...`.
- عند الخطأ تعرض الرسالة وزر `Try again` الذي يعيد تحميل الصفحة كلها.
- عند النجاح تعرض عدد المنتجات المطابقة للخصم، ثم بطاقات المنتجات.
- لو مفيش عروض مطابقة تعرض `No deals available right now.`.

## رابعًا: صفحة New Arrivals

الملف: `src/page/NewArrivals/NewArrivals.jsx`.

### استخدام الـ Hook وترتيب المنتجات

```jsx
const ARRIVALS_COUNT = 20;
const { products, loading, error } = useProducts();

const newArrivals = [...products]
  .sort((a, b) => {
    const dateDiff = new Date(b.meta?.createdAt) - new Date(a.meta?.createdAt);
    return dateDiff || b.id - a.id;
  })
  .slice(0, ARRIVALS_COUNT);
```

الصفحة تستقبل نفس القيم من الـ Hook. تنسخ القائمة قبل الفرز، وتحاول ترتيب الأحدث حسب `meta.createdAt`. الوصول إلى التاريخ يستخدم `?.` لأن `meta` ممكن تكون غير موجودة. لو فرق التاريخ صفر أو غير صالح (`NaN`)، تستخدم `id` تنازليًا كترتيب بديل. `slice(0, 20)` يحتفظ بأول 20 منتجًا فقط.

### حالات العرض

- أثناء التحميل تعرض مؤشرًا ونص `Loading new arrivals...`.
- عند الخطأ تعرض الرسالة وزر إعادة تحميل الصفحة.
- عند النجاح تعرض عدد المنتجات الموجودة في `newArrivals` وبطاقاتها.
- لو القائمة الناتجة فاضية تعرض `No new arrivals right now.`.

## خامسًا: صفحة Blog

الملف: `src/page/Blog/Blog.jsx`.

### البيانات الثابتة واستخدام الـ Hook

```jsx
const TOP_COUNT = 5;
const GUIDES = [ ... ];

function Blog() {
  const { products, loading, error } = useProducts();
```

`GUIDES` قائمة ثابتة في الملف، فيها تصنيف وعنوان ونصائح شراء لكل دليل. الصفحة تستخدم نفس Hook ونفس القيم الثلاث مثل باقي الصفحات.

### حالات التحميل والخطأ

- أثناء التحميل تعرض مؤشرًا ونص `Loading guides...`.
- عند الخطأ تعرض رسالة الخطأ وزر `Try again` الذي يعيد تحميل الصفحة كاملة.
- بعد نجاح الطلب تبدأ بعرض عنوان المدونة، ثم تمر على أدلة `GUIDES`.

### اختيار أفضل منتجات كل دليل

```jsx
{GUIDES.map((guide) => {
  const topProducts = products
    .filter((product) => product.category === guide.category)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, TOP_COUNT);

  if (topProducts.length === 0) return null;
```

لكل دليل، تختار `filter` المنتجات التي تصنيفها يطابق التصنيف الموجود في الدليل، وترتبها حسب التقييم من الأعلى للأقل، ثم تأخذ أول خمسة بـ`slice`. لو مفيش منتجات للتصنيف، ترجع `null` وما تعرضش المقالة الخاصة به.

لو فيه منتجات، تنشئ `article` فيه عنوان الدليل ونصائح الاختيار وبطاقات أفضل المنتجات. `guide.tips.map` ينشئ عنصر قائمة لكل نصيحة. `topProducts.map` ينشئ رابطًا لتفاصيل كل منتج، ويعرض صورته وعنوانه وتقييمه وسعره. ترتيب المنتج داخل الخمسة يظهر كرقم باستخدام `index + 1`.

### ملاحظات حقيقية من الكود

- الصور تستخدم `product.images[0]` مباشرة؛ الكود الحالي يفترض وجود `images` وعنصر أول فيها.
- الأدلة التي لا تجد منتجات لا تعرض مقالًا ولا رسالة مستقلة.
- عنوان التعليق `Top ...` متروك داخل تعليق JSX، والنص الظاهر يبدأ `Best ...`.

## ليه الصفحات ما احتاجتش تعديل؟

الصفحات الأربع كانت بالفعل تستدعي `useProducts()` وتقرأ `{ products, loading, error }`. التعديل حصل داخل تنفيذ الـ Hook فقط: أضفنا مشاركة الطلب والنتيجة مع الحفاظ على نفس أسماء القيم ونفس شكل الكائن الراجع. لذلك طريقة عرض كل صفحة وفرزها وتصفيتها ظلت كما هي.

## المثال الأخير: فتح Shop ثم Deals ثم Blog

1. **فتح Shop أول مرة:** لو لا توجد نتيجة محفوظة ولا طلب جارٍ، `loadProducts` يبدأ طلبًا واحدًا ويحفظ Promise. Shop تعرض التحميل حتى تنتهي الاستجابة.
2. **نجاح الطلب:** تُحفظ المصفوفة في `cachedProducts`، وتُمسح `productsPromise`. Shop تعرض المنتجات.
3. **الانتقال إلى Deals:** الصفحة الجديدة تبدأ حالتها من `cachedProducts`، فتبدأ بلا تحميل، و`loadProducts` يرجع النتيجة المخزنة؛ لا يبدأ طلب شبكة جديد.
4. **الانتقال إلى Blog:** يحدث الشيء نفسه؛ تستخدم Blog القائمة المحفوظة، ثم تختار منها منتجات أدلتها، من غير طلب شبكة جديد.

لو انتقلنا إلى صفحة ثانية **قبل** نجاح الطلب الأول، الصفحة الثانية تأخذ `productsPromise` الجاري وتنتظره بدل ما تبدأ طلبًا آخر. أما لو فشل الطلب، فيُمسح الـ Promise ولا تُخزن النتيجة أو الخطأ؛ المحاولة التالية تبدأ طلبًا جديدًا. الاختبار اليدوي المسجل في التوثيق أكد أيضًا إن التنقل بين الصفحات بعد نجاح التحميل لم يضف طلب منتجات جديدًا.

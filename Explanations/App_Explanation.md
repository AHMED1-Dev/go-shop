# شرح تعليمي مفصل لملف `src/App.jsx`

الشرح ده ماشي مع نسخة `src/App.jsx` الموجودة حاليًا في المشروع، من أول سطر لآخر سطر. هنفهم إزاي التطبيق بيجهّز المكونات، ويراقب ارتفاع الهيدر الثابت، ويوجّه المستخدم للصفحات. الشرح مناسب لحد لسه بيتعلم React، ومش بيغيّر أي كود.

## الكود الحالي كاملًا

```jsx
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
```

## 1. الاستيرادات Imports

كل سطر `import` بيجيب قيمة أو مكوّن من ملف أو مكتبة علشان نستخدمه هنا. لو حذفنا استيرادًا ما زال مستخدمًا، هيظهر خطأ إن الاسم غير معروف. ولو استوردنا شيئًا غير مستخدم، ممكن ESLint ينبهنا.

### التوجيه والمكونات

- `Routes` و`Route` من `react-router-dom`: بيحددوا خريطة الصفحات حسب عنوان URL. `Route` يربط مسارًا بمكوّن، و`Routes` يختار المسار المطابق ويعرض عنصره.
- `Link`: رابط داخلي للتنقل بين صفحات React Router من غير إعادة تحميل كاملة للصفحة. في هذا الملف يستخدمه `NotFound` للعودة إلى `/`.
- `TopHeader` و`BtmHeader`: جزآ الهيدر العلوي والسفلي، مثل البحث والروابط والقوائم.
- `Home` و`ProductDetails` و`Cart` و`CategoryPage` و`SerachResults` و`Favorites` و`Shop` و`Deals` و`NewArrivals` و`Blog` و`Contact` و`SignIn` و`Register` و`Checkout`: مكونات الصفحات التي تظهر حسب المسار. أسماء الملفات ومساراتها هي كما في المشروع، بما فيها كتابة `SerachResults` بهذا الشكل.
- `ScrollToTop`: مكوّن مساعد يعيد موضع التمرير للأعلى عند التنقل، وفق تنفيذه في ملفه.
- `Toaster`: المكان الذي تعرض فيه مكتبة `react-hot-toast` إشعاراتها.
- `AnimatePresence`: من Framer Motion؛ يسمح بتشغيل انتقالات الخروج/الدخول للعناصر المتغيرة عند التنقل، إذا كانت الصفحات تستخدم إعدادات الحركة المناسبة.
- `useLayoutEffect` و`useRef`: خطافان من React. الأول يجهز مراقبة قياس الهيدر بعد تحديث DOM وقبل الرسم المرئي المعتاد، والثاني يحتفظ بمرجع عنصر DOM بين عمليات الرسم.

## 2. مكوّن `NotFound`

```jsx
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
```

ده مكوّن React عادي بيرجع واجهة صفحة غير موجودة. `section` حاوية دلالية، وكلاسات Tailwind ترتب محتواها في عمود، وتوسّطه، وتضيف مسافات وحواف. `min-h-[50vh]` يجعل الحد الأدنى للارتفاع نصف ارتفاع نافذة العرض، وليس ارتفاعًا ثابتًا؛ `text-center` يوسّط النص.

العنوان والفقرة يشرحان الحالة للمستخدم. `Link to="/"` ينقله للرئيسية عبر React Router. لو اتحذف هذا المسار من `Link` أو استُخدم عنصر رابط عادي، قد يتغير سلوك التنقل أو تحدث إعادة تحميل كاملة. المكوّن لا يُعرض لكل الصفحات؛ يُعرض فقط عندما يطابق مسار `*` في نهاية قائمة `Route`.

## 3. مكوّن `App` ومرجع الهيدر

```jsx
function App() {
  const headerRef = useRef(null);
```

`App` هو المكوّن الجذر الذي يجمع الهيدر والإشعارات وأداة التمرير ومحتوى المسارات. `useRef(null)` ينشئ كائنًا ثابتًا بين عمليات إعادة الرسم، وله خاصية اسمها `current`. البداية `null` لأن عنصر `header` لم يُربط بعد.

`headerRef` سيُربط لاحقًا بـ`ref={headerRef}`. بعد إنشاء عنصر DOM، React يضع العنصر الفعلي في `headerRef.current`. نحتاج هذا المرجع حتى نقرأ أبعاد الهيدر نفسه ونراقبها. لو حذفنا المرجع، لن يكون لدينا عنصر DOM محدد نمرره إلى `ResizeObserver`.

على عكس `useState`، تغيير `ref.current` لا يطلب إعادة رسم المكوّن. هذا مناسب هنا لأن قيمة المرجع وسيلة للوصول إلى DOM، وليست معلومة نريد رسمها مباشرةً.

## 4. `useLayoutEffect` ومراقبة أبعاد الهيدر

```jsx
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
```

### توقيت `useLayoutEffect` مقارنةً بـ`useEffect`

كلاهما يشغّل أثرًا جانبيًا بعد أن يحدّث React عناصر DOM. الفرق العملي أن `useLayoutEffect` يعمل بعد تحديث DOM وقبل أن يكمل المتصفح الرسم المرئي، أما `useEffect` فعادةً يعمل بعد الرسم. لذلك يناسب `useLayoutEffect` قراءة الأبعاد أو تجهيزها عندما نريد تقليل فرصة ظهور إطار مرئي بإزاحة قديمة.

استخدام `useLayoutEffect` قد يؤخر الرسم إذا كان العمل داخله ثقيلًا. هنا العمل قصير: قراءة المرجع، إنشاء مراقب وربطه. `ResizeObserver` ينفذ رد النداء عند ملاحظة تغيير الأبعاد. في تطبيقات تُعرض على الخادم قد يحتاج `useLayoutEffect` إلى معالجة خاصة؛ هذا التطبيق يعمل كواجهة Vite في المتصفح.

### قراءة العنصر وحالة عدم وجوده

```jsx
const header = headerRef.current;
if (!header) return;
```

نحتفظ بالعنصر في متغير محلي لسهولة القراءة. شرط `if` يحمي من محاولة مراقبة قيمة فارغة. عادةً يكون المرجع مرتبطًا عند تشغيل الأثر، لكن التحقق يجعل الكود آمنًا لو لم يوجد العنصر لأي سبب.

### ما هو `ResizeObserver`؟

`ResizeObserver` واجهة من المتصفح لمراقبة تغيّر حجم عنصر بعينه. هنا العنصر هو الهيدر. عندما يختلف ارتفاعه، مثلًا عند التفاف البحث على صف جديد أو فتح قائمة الموبايل، يستدعي المتصفح الدالة الممررة إليه.

```jsx
([entry]) => { ... }
```

المراقب يمرر قائمة من سجلات التغيير. صيغة `[entry]` هي تفكيك للمصفوفة (array destructuring): نأخذ أول سجل مباشرةً باسم `entry`. السجل يحتوي بيانات العنصر الذي تغير، ومنها قياسات أبعاده.

### `borderBoxSize` و`blockSize` والاختيار الاحتياطي

```jsx
entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
```

- `borderBoxSize` يقدم قياس صندوق العنصر مع المحتوى والحشو والحدود. هو مصفوفة/قائمة من قياسات الصندوق، لأن العنصر قد يمتد عبر أكثر من جزء في بعض أوضاع الكتابة.
- `[0]` يختار أول قياس.
- `blockSize` هو حجم العنصر على محور الكتابة؛ في التخطيط المعتاد من اليسار لليمين أو اليمين لليسار يكون هذا هو الارتفاع.
- `?.` هو **Optional Chaining**. مثلًا `entry.borderBoxSize?.[0]` لا يحاول الوصول إلى `[0]` إذا كانت `borderBoxSize` غير موجودة، بل يعيد `undefined`. و`?.blockSize` يحمي الوصول التالي إذا لم يوجد العنصر الأول. من دونه قد يحدث خطأ وقت التشغيل في متصفح لا يوفر هذه القيمة بالشكل المتوقع.
- `??` هو **Nullish Coalescing**. يستخدم القيمة على يساره إلا إذا كانت `null` أو `undefined`، وعندها ينتقل إلى القيمة على يمينه. بخلاف `||`، لا يعتبر الصفر أو السلسلة الفارغة قيمًا مفقودة.
- `entry.contentRect.height` هو ارتفاع مستطيل المحتوى الذي يوفره سجل المراقبة. يستخدم كخطة بديلة إذا لم تتوفر قيمة `borderBoxSize` أو قياسها الأول.

إذًا التعبير يفضّل قياس `borderBoxSize`، ويرجع إلى `contentRect.height` عند غيابه. ثم يضيف `px` لأن CSS يتوقع وحدة طول عند تعيين قيمة الارتفاع.

### إنشاء CSS Custom Property

```jsx
document.documentElement.style.setProperty(
  "--site-header-height",
  `${...}px`,
);
```

`document.documentElement` هو عنصر `<html>` في الصفحة. `style.setProperty(name, value)` يضبط خاصية CSS مباشرةً على هذا العنصر. الاسم الذي يبدأ بـ`--` هو **CSS Custom Property**، أي متغير CSS يمكن قراءته في مواضع أخرى.

مثلًا لو كان ارتفاع الهيدر `178.6px`، تصبح قيمة `--site-header-height` على `<html>` هي `178.6px`. استخدام الجذر يجعل المتغير متاحًا لعناصر الصفحة التابعة له. إذا حذفنا هذا السطر، لن تصل قيمة القياس إلى تنسيق `main`، وبالتالي لن تواكب الحشوة أبعاد الهيدر.

### بدء المراقبة والتنظيف

```jsx
observer.observe(header);
return () => observer.disconnect();
```

`observe(header)` يطلب من المراقب متابعة تغيّر أبعاد عنصر الهيدر. إنشاء المراقب وحده لا يكفي؛ من دون هذا السطر لن يبدأ الرصد.

الدالة التي يعيدها الأثر هي **Cleanup Function**. React يستدعيها عند إزالة `App` من الصفحة، وكذلك قبل إعادة تشغيل الأثر إذا تغيرت اعتماداته. `observer.disconnect()` يفصل المراقب عن كل العناصر التي يتابعها، فيمنع استمرار الرصد بعد انتهاء الحاجة إليه ويحرر الموارد. من دون التنظيف قد يبقى مراقب غير مطلوب.

### مصفوفة الاعتماد `[]`

```jsx
}, []);
```

المصفوفة الفارغة تعني أن إعداد المراقبة لا يعتمد على قيم متغيرة من props أو state؛ لذلك يُجهز الأثر عند تركيب المكوّن مرةً، ويُنظف عند إزالته. لو حذفنا المصفوفة، سيُعاد تشغيل الأثر بعد كل رسم للمكوّن، مع تنظيف المراقب السابق وإنشاء آخر؛ وهذا عمل غير لازم. لو أضفنا اعتمادًا متغيرًا، سيعاد الأثر عند تغيره.

## 5. تركيب الهيدر وربط `headerRef`

```jsx
<header
  ref={headerRef}
  className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm"
>
  <TopHeader />
  <BtmHeader />
</header>
```

عنصر `header` الدلالي يجمع شريطي الهيدر. `ref={headerRef}` هو الوصلة التي تجعل React يضع عنصر DOM الحقيقي في `headerRef.current`؛ ومنه يأخذ `ResizeObserver` القياس.

كلاسات Tailwind تجعل الهيدر ثابتًا أعلى الشاشة (`fixed top-0`)، بعرض كامل، فوق المحتوى عبر `z-50`، مع خلفية وظل. لأن `fixed` يخرجه من التدفق العادي للصفحة، لا يحجز مكانه تلقائيًا للمحتوى؛ لهذا يحتاج `main` إلى حشوة علوية تعادل ارتفاعه. لو أزيل `ref` ستتوقف المراقبة عن الوصول للعنصر. ولو تغير `fixed` إلى تدفق عادي، ستتغير علاقة الهيدر بالمحتوى ويجب إعادة تقييم الحاجة إلى هذه الحشوة.

`<TopHeader />` و`<BtmHeader />` يستدعيان مكوّني الهيدر ويعرضان واجهتيهما داخل العنصر الأب.

## 6. الإشعارات والتمرير

```jsx
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
```

`Toaster` يهيئ موضع عرض إشعارات `react-hot-toast` في أسفل اليمين. `toastOptions` يمرر إعدادات الشكل الافتراضية: لون الخلفية، تدوير الزوايا، والحشو. إزالة `Toaster` قد تمنع ظهور الإشعارات التي تطلبها أجزاء التطبيق.

`ScrollToTop` مكوّن مستقل موضوع مرةً في جذر التطبيق، حتى يستطيع متابعة التنقل وإرجاع موضع الصفحة للأعلى وفق الكود الموجود في ملفه. تفاصيل تنفيذه موجودة في ذلك الملف، وليست معرفة داخل `App.jsx`.

## 7. `main` والحشوة المرتبطة بارتفاع الهيدر

```jsx
<main style={{ paddingTop: "var(--site-header-height, 0px)" }}>
```

`main` هو العنصر الدلالي للمحتوى الرئيسي، وتوجد داخله الصفحات. الخاصية `style` هنا كائن JavaScript بصيغة JSX. قيمة `paddingTop` تقرأ CSS Custom Property:

```css
var(--site-header-height, 0px)
```

`var(...)` تطلب قيمة المتغير `--site-header-height`. القيمة `0px` بعد الفاصلة هي قيمة احتياطية تستخدم إذا لم يكن المتغير معرّفًا بعد. بمجرد أن يضبط `ResizeObserver` المتغير على `<html>`، تصبح الحشوة مساوية للقياس الفعلي للهيدر.

الحشوة تجعل بداية محتوى الصفحة أسفل الهيدر الثابت بدل أن تبدأ خلفه. حُذفت هنا قيم الارتفاع الثابتة حسب نقاط التوقف، وصارت المساحة تتبع القياس عند تغير ارتفاع الهيدر. قد تتغير إزاحة المحتوى عند فتح قائمة الموبايل لأن ارتفاع الهيدر نفسه يتغير؛ هذا متوقع من ربط القياسين.

## 8. الانتقالات والمسارات

```jsx
<AnimatePresence mode="wait">
  <Routes>
    <Route path="/" element={<Home />} />
    ...
    <Route path="*" element={<NotFound />} />
  </Routes>
</AnimatePresence>
```

`AnimatePresence` يحيط بمحتوى المسارات ليسمح لـFramer Motion بالتعامل مع خروج الصفحة الحالية ودخول التالية. `mode="wait"` يجعل دخول العنصر التالي ينتظر انتهاء خروج السابق في أنماط الحركة المدعومة. إذا أزيل الغلاف، قد تختفي انتقالات الخروج المرتبطة به، لكن التوجيه يظل قائمًا.

`Routes` يفحص المسارات ويختار المسار المطابق لعنوان المتصفح. كل `Route` يربط `path` بمكوّن عبر `element`:

- `/` يعرض `Home`.
- `/cart` يعرض السلة.
- `/products/:id` يعرض تفاصيل منتج؛ `:id` جزء متغير من المسار.
- `/category/:category` يعرض صفحة التصنيف؛ `:category` قيمة التصنيف.
- `/Search` يعرض نتائج البحث. مطابقة حالة الأحرف تعتمد على إعداد الراوتر، لذا المسار المكتوب هنا هو المرجع.
- بقية المسارات تربط `/favorites` و`/shop` و`/deals` و`/new-arrivals` و`/blog` و`/contact` و`/signin` و`/register` و`/checkout` بصفحاتها.
- `path="*"` يلتقط أي مسار لم يطابق المسارات السابقة، لذلك يوضع أخيرًا ويعرض `NotFound`.

لو حُذف `Routes` أو لم يوجد `Route` لمسار، فلن تُعرض الصفحة المقصودة. ولو حُذف المسار العام `*` فسيختفي تصميم 404 الخاص بالتطبيق عند فتح عنوان غير معروف.

## 9. إغلاق المكوّن والتصدير

```jsx
    </Routes>
  </AnimatePresence>
</main>
</>
);
}

export default App;
```

`</Routes>` و`</AnimatePresence>` و`</main>` و`</>` تغلق العناصر التي بدأت في JSX. `<>...</>` هي React Fragment: تجمع أكثر من عنصر من غير إضافة عنصر HTML زائد حولهما. إغلاق الأقواس ينهي قيمة `return` ثم جسم الدالة.

`export default App` يجعل `App` التصدير الافتراضي للملف، فيقدر ملف الدخول مثل `main.jsx` على استيراده وتشغيل التطبيق. لو حُذف التصدير مع بقاء الاستيراد، سيفشل ربط مكوّن التطبيق.

## 10. كيف تعمل الأجزاء معًا؟

1. React يشغّل `App`، وينشئ `headerRef`.
2. يرسم عنصر الهيدر ويربطه بالمرجع. يحتوي الهيدر على `TopHeader` و`BtmHeader`.
3. بعد تحديث DOM، يقرأ `useLayoutEffect` عنصر الهيدر ويبدأ `ResizeObserver` بمراقبته.
4. عند أول قياس أو أي تغير لاحق، يختار المراقب ارتفاع صندوق الهيدر، أو ارتفاع `contentRect` كبديل، ثم يكتب القيمة بوحدة `px` في `--site-header-height` على عنصر `<html>`.
5. `main` يقرأ المتغير ويضع محتواه بعد الهيدر الثابت. لو زاد ارتفاع الهيدر عند فتح قائمة الموبايل، يحدّث المراقب المتغير وتلحق به الحشوة.
6. داخل `main` يختار React Router الصفحة الموافقة للمسار، ويتيح `AnimatePresence` انتقالها. إشعارات التطبيق تظهر في `Toaster`، ومكوّن `ScrollToTop` يتابع التنقل.
7. عند إزالة التطبيق، يستدعي React دالة التنظيف ويفصل `ResizeObserver`.

بهذا، يحل قياس الهيدر محل قيم الحشوة الثابتة، مع بقاء خريطة الصفحات والهيدر وبقية وظائف الجذر في أماكنها.

# خريطة الملفات
- `ProductDetails.jsx` يجلب المنتج والمنتجات المرتبطة، ثم يمرر المنتج إلى مكوّني الصور والمعلومات.
- `ProductDetailsLoading.jsx` يعرض skeleton تفاصيل المنتج أثناء تحميله.
- `productImages.jsx` يعرض صور المنتج ويبدّل الصورة الكبيرة عند الاختيار.
- `ProductInfo.jsx` يعرض بيانات المنتج ويتعامل مع السلة والمفضلة باستخدام `CartContext`.
- `availability.jsx` يحسب نص حالة المخزون، و`CartContext.jsx` يشارك بيانات السلة والمفضلة ويحفظها.

# 1. `src/page/productDetails/ProductDetails.jsx`
## Imports والمكوّن
```jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SlideProduct from "../../conponents/slideProducts/SlideProduct";
import ProductDetailsLoading from "./ProductDetailsLoading";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import ProductImages from "./productImages";
import ProductInfo from "./ProductInfo";
import PageTransition from "../../conponents/PageTransition";
```
- `useState` و`useEffect` من React لإدارة state وتشغيل طلبات API بعد render.
- `useParams` يقرأ `id` من route. `SlideProduct` يعرض المنتجات المرتبطة، و`SlideProductLoading` skeleton لها.
- `ProductDetailsLoading` skeleton تفاصيل المنتج؛ `ProductImages` يعرض الصور؛ `ProductInfo` يعرض باقي التفاصيل والأزرار.
- `PageTransition` يلف محتوى الصفحة بحركة. `productImages.jsx` هو الملف الذي يطابق import `./productImages`.
```jsx
function ProductDetails() {
  const { id } = useParams();
  const [productData, setProductData] = useState({
    id: null,
    product: null,
    error: "",
  });
```
- `ProductDetails` هو مكوّن الصفحة، و`id` نص يقرأه `useParams` من عنوان المسار.
- `productData` state تحفظ معًا معرّف النتيجة والمنتج ورسالة الخطأ حتى نعرف لأي `id` تخص النتيجة.
- `setProductData` هي الدالة التي تحدث هذه الحالة؛ تبدأ الحقول بـ`null` أو نص فارغ لأن الطلب لم يكتمل.
```jsx
  const loading = productData.id !== id;
  const product = loading ? null : productData.product;
  const error = loading ? "" : productData.error;
  const category = product?.category;

  const [relatedData, setRelatedData] = useState({
    category: null,
    products: [],
  });
```
- `loading` قيمة مشتقة؛ تصبح true إذا كانت نتيجة الحالة لا تخص `id` الحالي، من غير `setState` داخل effect.
- `product` و`error` لا يكشفان نتيجة سابقة أثناء تحميل المعرّف الجديد. `?.` تمنع قراءة `category` عندما لا يوجد منتج.
- `relatedData` state تحفظ تصنيف قائمة المنتجات المرتبطة ومصفوفتها؛ يبدأ التصنيف `null` والقائمة فارغة.
```jsx
  const loadingRelatedProducts =
    Boolean(product) && relatedData.category !== category;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      try {
        const res = await fetch(`https://dummyjson.com/products/${id}`, {
          signal: controller.signal,
        });
```
- `loadingRelatedProducts` تكون true لما يوجد منتج، لكن نتيجة related لا تخص تصنيفه الحالي.
- `useEffect` يبدأ طلب تفاصيل المنتج بعد render؛ `AbortController` يسمح بإلغاء الطلب السابق.
- `fetchProduct` دالة `async` حتى تستخدم `await`. `fetch` يطلب المنتج حسب `id`، و`signal` يربط الطلب بالـcontroller.
```jsx
        if (res.status === 404) {
          setProductData({ id, product: null, error: "" });
          return;
        }

        if (!res.ok) {
          throw new Error("تعذر تحميل بيانات المنتج.");
        }

        const data = await res.json();
```
- شرط `404` يسجل أن المنتج غير موجود ويوقف الدالة بـ`return`.
- `res.ok` يفحص نجاح HTTP؛ `fetch` لا يرمي تلقائيًا لكل status فاشل، لذلك `throw` ينقل الفشل إلى `catch`.
- `res.json()` يقرأ جسم الاستجابة ويحوّله إلى كائن JavaScript في `data`.
```jsx
        setProductData({ id, product: data, error: "" });
      } catch (err) {
        if (err.name !== "AbortError") {
          setProductData({
            id,
            product: null,
            error: "حصلت مشكلة أثناء تحميل المنتج. جرّب تاني.",
          });
```
- عند النجاح تحفظ state المعرّف والبيانات وتمسح الخطأ.
- `catch` تمسك خطأ الشبكة أو HTTP أو JSON. شرط `err.name !== "AbortError"` يتجاهل الإلغاء المتوقع؛ غيره يسجل خطأ للمستخدم.
```jsx
        }
      }
    }

    fetchProduct();
```
- استدعاء `fetchProduct()` يبدأ الطلب؛ تعريف الدالة وحده لا يشغّله.
```jsx
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!category) return;

    const controller = new AbortController();
```
- دالة التنظيف تلغي طلب المنتج، و`[id]` هي dependency التي تعيد effect عند تغير معرّف المنتج.
- effect الثانية تجلب قائمة التصنيف. الشرط ينهيها مبكرًا إذا لم توجد `category`، ثم ينشئ controller للطلب.
```jsx
    async function fetchRelatedProducts() {
      try {
        const res = await fetch(
          `https://dummyjson.com/products/category/${category}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error("تعذر تحميل المنتجات المرتبطة.");
        }
```
- `fetchRelatedProducts` دالة `async` تجلب منتجات التصنيف الحالي، و`signal` يجعل الطلب قابلًا للإلغاء.
- `res.ok` يفحص نجاح HTTP؛ `throw` ينقل الاستجابة الفاشلة إلى `catch`.
```jsx
        const data = await res.json();

        setRelatedData({
          category,
          products: Array.isArray(data.products) ? data.products : [],
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setRelatedData({ category, products: [] });
        }
      }
```
- يحول `res.json()` الاستجابة لكائن. `setRelatedData` تحفظ التصنيف وقائمته.
- `Array.isArray` تضمن أن `products` مصفوفة، وإلا تستخدم `[]` آمنة.
- `catch` تتجاهل الإلغاء، وأي فشل آخر يحفظ قائمة فارغة للتصنيف الحالي.
```jsx
    }

    fetchRelatedProducts();

    return () => controller.abort();
  }, [category]);
```
- استدعاء الدالة يبدأ طلب related. cleanup تلغيه عند تغير التصنيف أو إزالة المكوّن.
- `[category]` هي dependency الوحيدة؛ لذلك طلب القائمة يعاد عندما يتغير التصنيف.
## JSX وحالات العرض
```jsx
  return (
    <PageTransition key={id}>
      <div>
        {loading ? (
          <ProductDetailsLoading />
        ) : error ? (
```
- `return` يرسل JSX للشاشة. `PageTransition` يستقبل العناصر الداخلية كـ`children`، و`key={id}` يميز الصفحة بحسب المنتج.
- الشرط الثلاثي يعرض `ProductDetailsLoading` أثناء جلب المنتج؛ إذا انتهى التحميل يفحص بعدها وجود `error`.
```jsx
          <p className="w-[90%] mx-auto! max-w-337.5 text-red-500 py-10 text-center">
            {error}
          </p>
        ) : !product ? (
          <p className="w-[90%] mx-auto! max-w-337.5">Product not found</p>
```
- فقرة الخطأ تعرض `error`؛ `w-[90%]` عرض 90%، `mx-auto!` توسيط أفقي، `max-w-337.5` حد أقصى للعرض، `text-red-500` لون أحمر، `py-10` padding رأسي، و`text-center` يوسّط النص.
- `!product` شرط عدم وجود منتج بعد انتهاء الطلب؛ الرسالة التالية تستخدم العرض والتوسيط والحد الأقصى نفسهم.
```jsx
        ) : (
          <section className="py-12.5!">
            <div className="w-[90%] mx-auto! max-w-337.5 flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-0">
              <ProductImages product={product} />
              <ProductInfo product={product} />
            </div>
          </section>
        )}
```
- الفرع الأخير يعرض المنتج. `py-12.5!` يضيف padding رأسيًا للقسم.
- الحاوية تستخدم `w-[90%]` و`mx-auto!` و`max-w-337.5` للعرض والتوسيط. `flex flex-col` ترتيب عمودي، و`lg:flex-row` أفقي على الشاشات الكبيرة، و`items-stretch` تمديد العناصر، و`justify-between` توزيعها، و`gap-8 lg:gap-0` فجوة عادية تُلغى عند `lg`.
- كل من `ProductImages` و`ProductInfo` يستقبل كائن المنتج من خلال prop اسمها `product`.
```jsx
        {product &&
          (loadingRelatedProducts ? (
            <SlideProductLoading />
          ) : (
            <SlideProduct
              key={category}
```
- `product &&` يمنع الشريط عند غياب المنتج، والشرط يختار skeleton وقت تحميل related.
- `key={category}` يميز الشريط للتصنيف الحالي.
```jsx
              data={relatedData.products}
              title={category.replace("-", " ")}
            />
          ))}
      </div>
    </PageTransition>
  );
}
export default ProductDetails;
```
- `data` تمرر مصفوفة المنتجات، و`title` يستبدل أول شرطة في اسم التصنيف بمسافة.
- الأسطر تقفل JSX والـ`return` والمكوّن.

# 2. `src/page/productDetails/ProductDetailsLoading.jsx`
## مكوّن الـskeleton
```jsx
function ProductDetailsLoading() {
  return (
    <div className="loading_Item">
      <section className="py-12.5!">
        <div className="w-[90%] mx-auto! max-w-337.5 flex items-center justify-between">
```
- `ProductDetailsLoading` مكوّن يرجع شكلًا مؤقتًا. `loading_Item` class موجود على الحاوية الخارجية.
- `py-12.5!` يضيف padding رأسيًا. الحاوية الداخلية عرضها 90%، متوسّطة، لها أقصى عرض، وتستخدم Flexbox لمحاذاة وتوزيع العمودين.
```jsx
          <div className="w-[48%] flex gap-3 h-125 bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></div>
          <div className="w-[48%] h-125 pt-25!">
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
```
- العنصر الأول placeholder للصورة: عرضه 48% وارتفاعه `h-125`، و`flex gap-3` يهيئ محتوى داخليًا بمسافة. classes التدرج تحدد ألوان وحجم الخلفية، و`animate-shimmer` يحرك اللمعان.
- العمود الثاني عرضه 48% وارتفاعه `h-125` مع padding علوي `pt-25!`.
- كل `h5` يمثل شريطًا: `h-7.5` ارتفاع، `mb-12.5!` مسافة أسفل، `rounded` حواف مدورة، وبقية classes تدرج متحرك كما في placeholder الصورة.
```jsx
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
          </div>
        </div>
      </section>{" "}
    </div>
  );
}
export default ProductDetailsLoading;
```
- السطران `h5` يكرران شكل شرائط المعلومات المؤقتة.
- بقية الأسطر تقفل الأعمدة والقسم والحاوية، و`{" "}` تضيف مسافة نصية كما هو موجود في JSX.

# 3. `src/page/productDetails/productImages.jsx`
## الاستيراد والحالة
```jsx
import { useEffect, useState } from "react";

function ProductImages({ product }) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
```
- `useState` تحفظ الصورة المختارة، و`useEffect` تشغّل مزامنة عند تغير المنتج.
- `ProductImages` يستقبل `product` كـprop؛ `selectedImage` تبدأ بأول صورة، و`setSelectedImage` تحدثها عند الضغط.
```jsx
  useEffect(() => {
    setSelectedImage(product.images[0]);
  }, [product.id]);
```
- الـEffect تعيد اختيار أول صورة عندما يتغير `product.id`؛ dependency هي `product.id`.
- هذا السطر ظهر في تشغيل `npm run lint` تحت قاعدة `react-hooks/set-state-in-effect` كـ**error**، رغم وصفه أحيانًا بأنه warning؛ السبب استدعاء setter مباشرة داخل Effect.
- غالبًا الـEffect زيادة في الصفحة دي: الأب يلف المحتوى بـ`<PageTransition key={id}>`، فتغيير `id` يعيد تركيب الشجرة الداخلية، ومنها `ProductImages`. وقتها `useState(product.images[0])` تبدأ تلقائيًا بصورة المنتج الجديد، فلا تحتاج إعادة ضبطها بالـEffect.
## الصور المصغرة
```jsx
  return (
    <div className="w-full lg:w-[48%] flex gap-2 sm:gap-3">
      <div className="w-14 sm:w-16 md:w-20 shrink-0 flex flex-col gap-2 sm:gap-3">
        {product.images.map((img, index) => {
          const isActive = selectedImage === img;
```
- `return` يبدأ JSX. الحاوية الأولى بعرض كامل و48% عند `lg`، و`flex` يرص العناصر مع فجوات تتغير حسب المقاس.
- العمود المصغر بعرض 14/16/20 حسب breakpoint، و`shrink-0` يمنع انكماشه، و`flex-col` يرتب الصور رأسيًا.
- `map` ينشئ عنصرًا لكل صورة؛ `img` هي رابط الصورة و`index` رقمها. `isActive` يفحص هل هي المختارة.
```jsx
          return (
            <button
              type="button"
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`
                w-14 h-14
                sm:w-16 sm:h-16
                md:w-20 md:h-20
```
- كل صورة داخل `button` عادي وليس submit؛ `key` يعرّف عنصر القائمة لـReact، و`onClick` يختار الصورة.
- الأصناف تحدد حجم الزر 14 ثم 16 ثم 20 حسب الشاشة؛ بقية `className` تكمل التنسيق الشرطي في الجزء التالي.
```jsx
                p-1! sm:p-2!
                bg-white
                cursor-pointer
                rounded-lg sm:rounded-xl
                border-2!
                transition-all duration-300
                shrink-0
                ${
```
- `p-1! sm:p-2!` padding، و`bg-white` خلفية بيضاء، و`cursor-pointer` مؤشر اليد.
- `rounded-lg sm:rounded-xl` تدوير الحواف حسب الشاشة؛ `border-2!` حد بسُمك 2، و`transition-all duration-300` انتقال ناعم 300ms، و`shrink-0` يمنع الانكماش.
```jsx
                  isActive
                    ? "border-main!"
                    : "border-border! hover:border-main!"
                }
              `}
            >
              <img
                className="w-full h-full object-contain"
                src={img}
```
- الشرط يلون حد الصورة المختارة بـ`border-main!`، وغير المختارة بـ`border-border!` ويتغير عند hover.
- صورة الزر تملأه، و`object-contain` يحافظ على أبعادها؛ `src={img}` يحدد مصدرها الحالي.
```jsx
                alt={`${product.title} ${index + 1}`}
              />
            </button>
          );
        })}
      </div>
```
- `alt` وصف بديل من عنوان المنتج ورقم الصورة. بقية الأسطر تقفل الصورة والزر، وترجع العنصر من `map`، وتقفل التكرار والعمود.
## الصورة الكبيرة والتصدير
```jsx
      <div className="flex-1 h-80 sm:h-96 md:h-105 lg:h-120 border border-border rounded-xl sm:rounded-2xl flex items-center justify-center p-3! sm:p-5! md:p-8! overflow-hidden bg-white">
        <img
          src={selectedImage}
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
        />
```
- الصورة الكبيرة تعرض `selectedImage`؛ `alt` عنوان المنتج.
- `w-full h-full` يملآن الحاوية، و`object-contain` يحافظ على الصورة كاملة؛ `transition-transform duration-300` يضيف انتقالًا ناعمًا، و`hover:scale-105` يكبرها عند المرور.
```jsx
      </div>
    </div>
  );
}
export default ProductImages;
```
- الحاوية تتمدد (`flex-1`) وارتفاعها يتدرج حسب breakpoint؛ `border` و`rounded` يضيفان إطارًا وحواف مستديرة، و`flex ... justify-center` يوسّط الصورة.
- `p-3! sm:p-5! md:p-8!` يزيد المسافة الداخلية حسب الشاشة، و`overflow-hidden` يقص الخارج، و`bg-white` خلفية بيضاء.
- بقية الأسطر تقفل الحاويات والـ`return` والمكوّن.

# 4. `src/page/productDetails/ProductInfo.jsx`
## Imports والبيانات
```jsx
import { useContext } from "react";
import {
  FaStar,
  FaRegStarHalfStroke,
  FaRegStar,
  FaHeart,
  FaTruckFast,
  FaCheck,
  FaArrowRotateLeft,
} from "react-icons/fa6";
```
- `useContext` تقرأ بيانات من React Context. الأيقونات المستوردة من `react-icons/fa6` تمثل النجوم والقلب والشحن والضمان والإرجاع.
```jsx
import { FaCartArrowDown, FaRegHeart } from "react-icons/fa";
import { CartContext } from "../../conponents/context/CartContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
```
- أيقونتا السلة والقلب تأتيان من مجموعة أخرى في `react-icons`.
- `CartContext.jsx` يشارك حالة السلة والمفضلة والدوال؛ `toast` يعرض إشعارات من `react-hot-toast`، و`Link` ينقل المستخدم داخل التطبيق إلى `/cart`.
```jsx
import { getAvailabilityInfo } from "../../conponents/slideProducts/availability";

function ProductInfo({ product }) {
  const { cartItems, addItems, addTofavorites, favorites, removeFavorites } =
    useContext(CartContext);
```
- `getAvailabilityInfo` من `availability.jsx` يحول كمية المخزون إلى نص ولون.
- المكوّن يستقبل كائن `product` عبر props. `useContext(CartContext)` يقرأ حالة السلة والمفضلة والدوال التي يعرضها `CartProvider`.
```jsx
  const isItemInCart = cartItems.some((i) => i.id === product.id);

  const handleAddToCart = () => {
    addItems(product);

    toast.success(
      <div className="flex items-center gap-3 max-w-75 min-w-75">
        <img
          src={product.images[0]}
          alt={product.title}
```
- `some` تفحص وجود منتج له نفس `id` في السلة؛ نتيجتها `true` أو `false`.
- `handleAddToCart` تضيف المنتج عبر `addItems` ثم تعرض toast نجاح بمحتوى JSX.
- حاوية toast تستخدم `flex` ومحاذاة وسطية وفجوة، مع حد أدنى وأقصى للعرض؛ الصورة مأخوذة من أول صورة للمنتج و`alt` عنوانه.
```jsx
          className="w-auto max-w-15 h-12.5 object-cover rounded-lg shrink-0"
        />
        <div className="flex flex-col gap-1 text-sm min-w-0">
          <strong className="overflow-hidden text-ellipsis line-clamp-1 text-sm">
            {product.title}
          </strong>
          <p className="text-xs text-secondary!">Added to cart</p>
```
- صورة الإشعار تحافظ على العرض التلقائي، لها حد أقصى وارتفاع، وتستخدم `object-cover` مع حواف مدورة ومنع الانكماش.
- النصوص ترتب عموديًا؛ العنوان يُقص لسطر واحد، ورسالة الإضافة أصغر ولونها ثانوي.
```jsx
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
```
- `Link` يفتح صفحة السلة. `inline-block` يسمح بأبعاد ومسافات، و`rounded-lg` تدوير، و`py-1.5!` و`px-3!` مسافات داخلية، و`bg-main` خلفية أساسية، و`text-white!` نص أبيض، و`text-xs` خط صغير.
```jsx
      {
        position: "bottom-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
```
- `position` هو خيار موضع الإشعار؛ الخيارات الأخرى ظاهرة في الكود لكن غير مدعومة بهذا الاسم من `react-hot-toast`.
```jsx
        draggable: true,
        theme: "light",
      },
    );
  };
```
- `package.json` يثبت `react-hot-toast` فقط، وليس `react-toastify`. في API المكتبة، `position` هو الخيار المفهوم هنا؛ `autoClose` و`hideProgressBar` و`closeOnClick` و`pauseOnHover` و`draggable` و`theme` ليست خيارات موثقة لـ`react-hot-toast` وغالبًا يتم تجاهلها. الموثق يستخدم `duration` بدل `autoClose`، وله إعدادات `Toaster` منفصلة. راجع [خيارات toast الرسمية](https://react-hot-toast.com/docs/toast) و[خيارات Toaster الرسمية](https://react-hot-toast.com/docs/toaster).
## المفضلة والنجوم
```jsx
  const isItemInFav = favorites.some((i) => i.id === product.id);

  const handleAddToFav = () => {
    if (isItemInFav) {
      removeFavorites(product.id);
      toast.error(`${product.title} Removed from favorites`);
    } else {
      addTofavorites(product);
      toast.success(`${product.title} added to favorites`);
    }
  };
```
- `some` تفحص هل المنتج موجود بالمفضلة. الشرط يزيله ويعرض toast خطأ إن كان موجودًا، وإلا يضيفه ويعرض toast نجاح.
- `removeFavorites` تستقبل المعرّف، و`addTofavorites` تستقبل كائن المنتج كاملًا.
```jsx
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} />);
```
- `renderStars` دالة تبني مصفوفة نجوم؛ `Math.floor` تحسب النجوم الكاملة، وباقي القسمة يحدد وجود نصف نجمة.
- الحلقة تمر على خمس خانات، والشرط يضيف نجمة كاملة لكل خانة ضمن التقييم؛ `key` يميز عناصر React المتكررة.
```jsx
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaRegStarHalfStroke key={i} />);
      } else {
        stars.push(<FaRegStar key={i} />);
      }
    }

    return stars;
  };
```
- `else if` يضيف نصف نجمة للخانة التالية عند وجود جزء كسري لا يقل عن 0.5؛ `else` يضيف نجمة فارغة.
- ترجع الدالة مصفوفة الأيقونات لعرضها في JSX.
```jsx
  const availability = getAvailabilityInfo(product.stock);

  return (
    <div className="details_item w-full lg:w-[48%]">
      <h1
        className="
          text-2xl
          sm:text-2xl
          md:text-3xl
```
- `getAvailabilityInfo` تستقبل `product.stock` وترجع نص المخزون ولونه.
- الحاوية بعرض كامل وتصبح 48% عند `lg`. عنوان المنتج يكبر حسب breakpoint، و`font-bold` يجعله عريضًا، و`text-main!` يحدد لونه.
```jsx
          font-bold
          text-main!
          mb-3! sm:mb-4!
          leading-tight
          wrap-break-word
        "
      >
        {product.title}
      </h1>
```
- `mb-3! sm:mb-4!` يحدد المسافة أسفل العنوان، و`leading-tight` يقلل ارتفاع السطر، و`wrap-break-word` يسمح بكسر الكلمات الطويلة.
- `{product.title}` يطبع عنوان المنتج.
## التقييم والسعر
```jsx
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4! sm:mb-5!">
        <div className="flex items-center gap-0.5 text-gold text-base sm:text-[18px]">
          {renderStars(product.rating)}
        </div>
        <span className="text-xs sm:text-sm text-secondary!">
          ({product.rating})
        </span>
```
- الحاوية ترتب المحتوى باستخدام `flex` وتسمح بالالتفاف، وتضبط الفجوات والمسافة السفلية.
- صندوق النجوم يصف الأيقونات، يضيف فجوة صغيرة، لون ذهبي وحجمًا يتغير على `sm`؛ `renderStars` ترسمها من التقييم.
- أول `span` يعرض رقم التقييم بحجم صغير ولون ثانوي.
```jsx
        <span className="text-xs sm:text-sm text-secondary!">
          ({product.reviews.length} reviews)
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4! sm:mb-5!">
        <p className="text-2xl sm:text-3xl text-heading! font-bold">
          ${product.price}
        </p>
```
- `span` يعرض عدد المراجعات؛ الحاوية تقفل التقييم.
- حاوية السعر تسمح بالالتفاف وتضبط الفجوات والمسافة السفلية.
- السعر الحالي بخط كبير وعريض ولون `text-heading!`.
```jsx
        <span className="text-[10px] sm:text-[11px] text-secondary! line-through">
          ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
        </span>
        <span className="text-[10px] sm:text-xs font-semibold bg-danger text-white! px-2! py-1! rounded-md">
          -{product.discountPercentage}%
        </span>
      </div>
```
- السعر القديم محسوب من السعر والخصم، و`toFixed(2)` يجعله بمنزلتين عشريتين؛ `line-through` يشطبه، والنص صغير وثانوي.
- شارة الخصم تعرض النسبة. classes تجعل الخط صغيرًا وعريضًا، والخلفية حمراء والنص أبيض، مع padding وحواف مدورة.
## المخزون والعلامة والوصف
```jsx
      <p
        className={`${availability.color} text-xs sm:text-sm! mb-2! sm:mb-3! font-semibold`}
      >
        {availability.text}
      </p>
      <h5 className="mb-4! sm:mb-5! text-secondary! text-xs sm:text-sm!">
```
- فقرة المخزون تستخدم اللون والنص اللذين أعادتهما `availability`; بقية classes تحدد حجم الخط والوزن والمسافة أسفلها.
- عنوان المخزون يستخدم مسافة سفلية وخطًا صغيرًا ولونًا ثانويًا.
```jsx
        Only <span className="font-semibold text-main!">{product.stock}</span>{" "}
        products left in stock
      </h5>
      <div className="text-xs sm:text-sm mb-4! sm:mb-5!">
        <span className="text-secondary!">Brand:</span>{" "}
        <span className="font-semibold text-main">
          {product.brand || "N/A"}
```
- جملة المخزون تعرض الكمية؛ الرقم عريض وبلون أساسي، و`{" "}` تضيف مسافة JSX.
- حاوية العلامة تضبط حجم الخط والمسافة؛ label بلون ثانوي، والعلامة التجارية عريضة وبلون أساسي.
- `product.brand || "N/A"` تعرض قيمة العلامة أو النص البديل عند غيابها.
```jsx
        </span>
      </div>
      <p
        className="
```
- تقفل الأسطر السابقة عنصر العلامة وحاويته، ثم تبدأ فقرة الوصف و`className` الخاص بها.
```jsx
          text-sm
          sm:text-base!
          leading-6
          sm:leading-7
          text-secondary!
          mb-5! sm:mb-6!
        "
      >
        {product.description}
      </p>
```
- الوصف نص صغير يكبر على `sm`، وارتفاع السطر يتغير من `leading-6` إلى `sm:leading-7`، ولونه ثانوي وله مسافة أسفله.
- `{product.description}` يطبع وصف المنتج.
## الشحن والضمان والإرجاع
```jsx
      <div
        className="
          bg-bg
          rounded-xl
          p-3! sm:p-4!
          mb-4! sm:mb-5!
          space-y-2! sm:space-y-3!
        "
      >
        <div className="flex items-start gap-2 sm:gap-3">
```
- الحاوية لها خلفية `bg-bg` وحواف مدورة، padding ومسافة أسفلها، ومسافات رأسية بين الصفوف تتغير على `sm`.
- الصف يبدأ بـ`flex` ومحاذاة للأعلى وفجوة تتغير حسب حجم الشاشة.
```jsx
          <FaTruckFast className="shrink-0 text-lg sm:text-xl text-main!" />
          <span className="text-xs sm:text-sm text-secondary! leading-5">
            {product.shippingInformation}
          </span>
        </div>
        <div className="flex items-start gap-2 sm:gap-3">
          <FaCheck className="shrink-0 text-lg sm:text-xl text-main!" />
```
- أيقونة الشحن لا تنكمش، حجمها يتدرج، ولونها أساسي؛ النص صغير ويتدرج للـ`sm` ولونه ثانوي وارتفاع سطره ثابت.
- الصف التالي يعرض الضمان بنفس محاذاة وفجوة الصف الأول، وأيقونة `FaCheck` بنفس أسلوب الحجم واللون.
```jsx
          <span className="text-xs sm:text-sm text-secondary! leading-5">
            {product.warrantyInformation}
          </span>
        </div>
        <div className="flex items-start gap-2 sm:gap-3">
          <FaArrowRotateLeft className="shrink-0 text-lg sm:text-xl text-main!" />
```
- النص يعرض `warrantyInformation` بنفس أحجام وألوان النص السابق.
- الصف الأخير يعرض سياسة الإرجاع، وأيقونته لا تنكمش وحجمها ولونها يتبعان نفس النمط.
```jsx
          <span className="text-xs sm:text-sm text-secondary! leading-5">
            {product.returnPolicy}
          </span>
        </div>
      </div>
```
- النص يعرض `returnPolicy`، ثم تقفل السطور صف الإرجاع وحاوية المعلومات.
## أزرار السلة والمفضلة
```jsx
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        <button
          onClick={() => !isItemInCart && handleAddToCart()}
          className={`
            flex-1
            min-w-0
            h-11 sm:h-12
            flex items-center justify-center
```
- الحاوية تصف الزرين أفقيًا بعرض كامل وفجوة متجاوبة.
- زر السلة يستدعي `handleAddToCart` فقط عندما المنتج غير موجود. `flex-1` يمدده، و`min-w-0` يسمح بانكماش المحتوى، والارتفاع يتغير حسب الشاشة، و`flex ... justify-center` يوسّط المحتوى.
```jsx
            gap-1.5 sm:gap-2
            px-2! sm:px-4!
            bg-main
            text-white!
            rounded-lg sm:rounded-xl
            text-xs sm:text-sm
            font-semibold
            transition-all duration-300
```
- `gap` يضبط المسافة بين الأيقونة والنص، و`px` يضبط الحشو الأفقي المتجاوب.
- الخلفية أساسية والنص أبيض، والحواف مدورة، وحجم الخط يتغير عند `sm`، والوزن عريض.
- `transition-all duration-300` يجعل تغير التنسيق تدريجيًا خلال 300ms.
```jsx
            ${
              isItemInCart
                ? "pointer-events-none opacity-70"
                : "hover:scale-[1.02]"
            }
          `}
        >
          <FaCartArrowDown className="text-base sm:text-xl shrink-0 " />
```
- شرط class يوقف أحداث المؤشر ويقلل الشفافية لو المنتج في السلة، وإلا يكبره قليلًا عند hover.
- أيقونة السلة يتدرج حجمها ولا تنكمش.
```jsx
          <span className="truncate text-white!">
            {isItemInCart ? "Item in Cart" : "Add to Cart"}
          </span>
        </button>
```
- `truncate` يقص النص الزائد بعلامة حذف، والنص أبيض؛ التعبير الشرطي يبدل العبارة حسب وجود المنتج في السلة.
```jsx
        <button
          type="button"
          onClick={handleAddToFav}
          aria-label={
            isItemInFav ? "Remove from favorites" : "Add to favorites"
          }
```
- `type="button"` يمنع السلوك الافتراضي للإرسال، و`onClick` يشغل دالة المفضلة؛ `aria-label` يشرح الزر لقارئ الشاشة.
```jsx
          className={`
            w-11 h-11
            sm:w-12 sm:h-12
            shrink-0
            rounded-lg sm:rounded-xl
            border
```
- هذه classes تضبط الحجم حسب الشاشة، تمنع انكماش الزر، وتضيف الحواف المدورة والحد.
```jsx
            flex items-center justify-center
            text-lg sm:text-xl
            transition-all duration-300
            cursor-pointer
            ${
              isItemInFav
                ? "bg-main border-main text-white!"
                : "bg-white border-border text-slate-500! hover:text-main! hover:border-main"
            }
          `}
```
- `flex items-center justify-center` يوسّط الأيقونة، وحجم النص يتدرج، والانتقال 300ms، والمؤشر يدل على إمكانية النقر.
- الشرط يختار خلفية وحدًا ونصًا أبيض عند الإضافة، أو خلفية بيضاء وحدًا رماديًا يتغير عند hover.
```jsx
        >
          {isItemInFav ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;
```
- يعرض قلبًا ممتلئًا أو بإطار حسب وجود المنتج. `size={16}` يحدد حجم الأيقونة.
- بقية الأسطر تقفل الزر والحاويات والـreturn والمكوّن، ثم تصدر `ProductInfo` لصفحة التفاصيل.

# 5. `src/conponents/slideProducts/availability.jsx`
## دالة حساب المخزون
```jsx
export const getAvailabilityInfo = (stock) => {
  if (stock <= 0) {
    return { text: "✗ Out of Stock", color: "text-danger!" };
  }
```
- يصدر دالة `getAvailabilityInfo` تستقبل `stock` وتفحص هل الكمية صفر أو أقل.
- عند تحقق الشرط ترجع object فيه نص نفاد المخزون وclass لون الخطر.
```jsx
  if (stock <= 10) {
    return { text: `⚠ Only ${stock} left`, color: "text-danger!" };
  }

  return { text: "✓ In Stock", color: "text-success!" };
};
export default getAvailabilityInfo;
```
- الشرط الثاني يغطي المخزون حتى 10؛ غير ذلك ترجع الدالة حالة `In Stock` ولون النجاح. التصدير المسمى والافتراضي يتيحان استيراد الدالة بالطريقتين.

# 6. `src/conponents/context/CartContext.jsx`
## إنشاء السياق وقراءة المفضلة
```jsx
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

function CartProvider({ children }) {
```
- `createContext` ينشئ قناة مشاركة بيانات، و`useState` للحالة، و`useEffect` لمزامنتها مع التخزين.
- `CartContext` هو السياق الذي يقرأه `ProductInfo`; `CartProvider` يستقبل التطبيق داخل prop اسمها `children`.
```jsx
  const [favorites, setFavorites] = useState(() => {
    const savedFav = localStorage.getItem("favoritesItems");
    return savedFav ? JSON.parse(savedFav) : [];
  });
```
- `favorites` تحفظ قائمة المفضلة، و`setFavorites` تحدثها. دالة البداية تقرأ الحالة المحفوظة عند إنشاء الـstate.
- `getItem` يقرأ النص؛ لو موجود يحوله `JSON.parse`، وإلا يبدأ بمصفوفة فارغة.
- `JSON.parse` هنا من غير `try/catch`؛ البيانات التالفة في التخزين قد ترمي خطأ وتوقف تهيئة المكوّن (ملاحظة البند 10 في `CODEX_CONTEXT.md`).
## إضافة المفضلة وحفظها
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
- `addTofavorites` تستقبل المنتج، وتستخدم أحدث `prevItems` لتحديث القائمة.
- `some` تفحص التكرار حسب `id`؛ إن كان موجودًا ترجع القائمة نفسها، وإلا تنشئ Array جديدة وتضيفه.
```jsx
  useEffect(() => {
    localStorage.setItem("favoritesItems", JSON.stringify(favorites));
  }, [favorites]);

  const removeFavorites = (id) => {
    setFavorites((prevItems) => prevItems.filter((item) => item.id !== id));
  };
```
- الـEffect تحفظ المفضلة كنص JSON بعد تغير `favorites`؛ هذه هي الـdependency.
- `removeFavorites` تنشئ قائمة بكل العناصر التي لا يطابق `id` الخاص بها المعرّف المطلوب.
## حالة السلة وتعديل الكمية
```jsx
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const increaseQuantity = (id) => {
```
- `cartItems` state السلة، تقرأ التخزين أو تبدأ فارغة؛ `JSON.parse` هنا أيضًا من غير `try/catch`.
- `increaseQuantity` تستقبل `id` للمنتج الذي سنغير كميته.
```jsx
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        return item.id === id ? { ...item, quantity: item.quantity + 1 } : item;
      }),
    );
  };
```
- `map` تنتج قائمة جديدة؛ للعنصر المطابق تنسخ خصائصه وتزيد الكمية واحدًا، وباقي العناصر لا تتغير.
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
- `decreaseQuantity` تمر على القائمة؛ تنقص العنصر المطابق بشرط أن تكون كميته أكبر من 1، وإلا تتركه كما هو.
```jsx
  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };
```
- `removeItem` تحذف العنصر المطابق للمعرّف باستخدام `filter`.
- `clearCart` تفرغ السلة بوضع Array فارغة.
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
- `addItems` تمنع تكرار المنتج بالـ`id`؛ لو جديد تضيف نسخة منه مع `quantity: 1`.
```jsx
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);
```
الـEffect تحفظ السلة في `localStorage` بعد كل تغيير في `cartItems`؛ المصفوفة هي dependency.
## إتاحة القيم للمكونات
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
```
- `Provider` يضع القيم في السياق لتكون متاحة للمكونات التي تحته. `value` هو object القيم والدوال المشتركة.
```jsx
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
- يكمل `value` بدوال وحالة المفضلة؛ `ProductInfo` يستخدم `cartItems` و`addItems` و`favorites` ودالتي المفضلة.
- `{children}` يعرض محتوى التطبيق داخل Provider، ثم تقفل الأسطر الأخيرة المكوّن ويصدر `CartProvider`.

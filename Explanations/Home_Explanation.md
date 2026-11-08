# شرح الصفحة الرئيسية ومكوّناتها في GoShop

هذا الشرح مبني على قراءة الكود الحالي في الملفات:

1. src/page/Home/Home.jsx
2. src/conponents/HeroSlider.jsx
3. src/conponents/slideProducts/SlideProduct.jsx
4. src/conponents/slideProducts/SlideProductLoading.jsx
5. src/conponents/PageTransition.jsx

لم يتم تعديل ملفات المصدر أثناء إعداد هذا الشرح.

## خريطة المكونات

~~~text
Home
└── PageTransition
    └── محتوى الصفحة
        ├── HeroSlider
        └── أقسام التصنيفات
            ├── SlideProductLoading أثناء التحميل
            └── SlideProduct بعد اكتمال البيانات
                └── Product لكل منتج
~~~

Home هي المكوّن الأب: تجلب المنتجات وتدير حالة التحميل وتختار ما يظهر. HeroSlider يعرض محتوى ترويجيًا. SlideProductLoading يعرض شكل تحميل مؤقتًا. SlideProduct يعرض تصنيفًا واحدًا ومنتجاته أو رسالة خطئه. PageTransition يلف الصفحة ويضيف الحركة.

# 1. Home.jsx

المسار: src/page/Home/Home.jsx.

## الاستيرادات

~~~jsx
import { useEffect, useState } from "react";
import HeroSlider from "../../conponents/HeroSlider";
import SlideProduct from "../../conponents/slideProducts/SlideProduct";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import PageTransition from "../../conponents/PageTransition";
~~~

- useState وuseEffect دالتان من React، وهما Hooks. الـHook دالة توفر للمكوّن الدالي وظيفة من React.
- useState تحفظ حالة قد تتغير؛ هنا تحفظ بيانات المنتجات وحالة التحميل.
- useEffect تشغّل أثرًا جانبيًا بعد العرض؛ طلب الشبكة مثال على أثر جانبي.
- بقية الأسطر تستورد المكونات التي تستخدمها Home.
- ../.. تعني الرجوع من مجلد Home إلى src ثم الدخول إلى conponents. اسم المجلد مكتوب conponents في المشروع، لذلك يجب أن يطابقه المسار.

## قائمة التصنيفات

~~~jsx
const categories = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches",
];
~~~

const تعرّف متغيرًا لا نعيد إسناد قيمة جديدة له. categories مصفوفة من 24 اسم تصنيف، بصيغة slug التي يستخدمها API. مثال: beauty يقابل الرابط https://dummyjson.com/products/category/beauty.

القائمة نفسها تغذي ثلاث عمليات: بدء طلب لكل تصنيف، عرض Skeleton لكل تصنيف، وإنشاء قسم منتجات لكل تصنيف. استخدام map على القائمة يجنّب تكرار JSX والمنطق 24 مرة.

## تعريف Home والحالة

~~~jsx
function Home() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
~~~

function Home يعرّف مكوّن React. المكوّن دالة ترجع JSX وReact تحولها إلى واجهة.

useState({}) تنشئ حالة ابتدائية فارغة:

- products القيمة الحالية التي يقرأها العرض.
- setProducts دالة تحديثها. استعمال الدالة يخبر React بإعادة render.
- لا نعدل products مباشرة؛ فالتغيير المباشر قد لا يجعل React تعرف أن الواجهة تحتاج تحديثًا.
- بعد التحميل يكون الكائن قريبًا من:

~~~js
{
  beauty: {
    items: [{ id: 1, title: "..." }],
    error: ""
  },
  fragrances: {
    items: [],
    error: "تعذر تحميل منتجات هذا التصنيف."
  }
}
~~~

لكل تصنيف مفتاح، وداخله items للمنتجات وerror للرسالة.

useState(true) تنشئ حالة التحميل. loading تبدأ true، وsetLoading ستغيرها إلى false عندما تنتهي مجموعة الطلبات. تعرض Home شكل التحميل أو أقسام المنتجات بناءً على هذه القيمة.

## useEffect وجلب المنتجات

~~~jsx
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const results = await Promise.all(
        categories.map(async (category) => {
          try {
            const res = await fetch(
              "https://dummyjson.com/products/category/" + category,
            );

            if (!res.ok) {
              throw new Error("فشل تحميل تصنيف " + category);
            }

            const data = await res.json();

            return [
              category,
              {
                items: Array.isArray(data.products) ? data.products : [],
                error: "",
              },
            ];
          } catch {
            return [
              category,
              {
                items: [],
                error: "تعذر تحميل منتجات هذا التصنيف.",
              },
            ];
          }
        }),
      );

      setProducts(Object.fromEntries(results));
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);
~~~

useEffect تشغّل callback بعد render. جلب الشبكة عمل خارج رسم الواجهة، لذلك يوضع في effect.

fetchProducts دالة async معرفة داخل effect. async تسمح باستخدام await. لا نجعل callback الخاصة بـuseEffect نفسها async؛ React تتوقع منها لا شيء أو دالة تنظيف، أما async فترجع Promise.

### تكرار الطلبات وجمعها

categories.map تمر على كل قيمة. category هي اسم التصنيف في الدورة الحالية. لأن callback async، كل مرة تنتج Promise. بالتالي map تنتج قائمة من الوعود، واحد لكل تصنيف.

Promise.all تنتظر اكتمال كل الوعود ثم تعيد مصفوفة النتائج بترتيب القائمة. تبدأ الطلبات بالتوازي، وهذا غالبًا أسرع من إرسال طلب ثم انتظار نتيجته قبل إرسال التالي. await توقف تنفيذ fetchProducts عند هذا السطر إلى أن تنتهي المجموعة، لكنها لا تجمد المتصفح.

هناك حد مهم: Home لا تعرض النتائج فور انتهاء كل تصنيف على حدة؛ تنتظر Promise.all أبطأ طلب، فتبقى هياكل التحميل لكل الأقسام حتى تنتهي المجموعة.

### طلب HTTP وفحص الاستجابة

~~~jsx
const res = await fetch(
  "https://dummyjson.com/products/category/" + category,
);
~~~

fetch ترسل طلب HTTP. هنا نكوّن الرابط بإلحاق اسم التصنيف. res تمثل استجابة HTTP ولا تحتوي بعد على كائن المنتجات بصيغة JavaScript. await ينتظر وصولها.

~~~jsx
if (!res.ok) {
  throw new Error("فشل تحميل تصنيف " + category);
}
~~~

res.ok تشير إلى نجاح حالة HTTP. ! تعني نفي القيمة، فيدخل الشرط عند فشل الاستجابة. fetch لا ترفض تلقائيًا لكل ردود HTTP الفاشلة مثل 404 أو 500، لذلك نفحص ok بأنفسنا.

throw يرمي خطأ فينتقل التنفيذ إلى catch الداخلية الخاصة بهذا التصنيف. الرسالة فيها اسم التصنيف، لكن catch الحالية تعرض رسالة عامة للمستخدم ولا تستخدم نص الخطأ.

~~~jsx
const data = await res.json();
~~~

res.json تقرأ جسم الاستجابة بصيغة JSON وتحوله إلى كائن JavaScript. العملية غير متزامنة، لذا نستخدم await. شكل الاستجابة يتضمن عادةً products كمصفوفة، وربما حقولًا أخرى مثل total.

~~~jsx
return [
  category,
  {
    items: Array.isArray(data.products) ? data.products : [],
    error: "",
  },
];
~~~

عند النجاح نرجع زوجًا: اسم التصنيف ثم بياناته. هذا الشكل يقبله Object.fromEntries.

- Array.isArray تتحقق أن products مصفوفة.
- العامل ? : يختار القيمة الأولى لو الشرط صحيح، وإلا القيمة الثانية.
- items تستخدم المنتجات إذا كانت مصفوفة؛ وإلا [] حتى لا يفشل map في المكوّن اللاحق.
- error فارغة لأن الطلب نجح.

### معالجة فشل تصنيف منفرد

~~~jsx
} catch {
  return [
    category,
    {
      items: [],
      error: "تعذر تحميل منتجات هذا التصنيف.",
    },
  ];
}
~~~

catch تلتقط خطأ الشبكة، أو الخطأ الذي رميناه بسبب res.ok، أو خطأ قراءة JSON. لا نكتب متغيرًا لسبب الخطأ لأننا لا نستخدم تفاصيله.

الفشل يرجع نتيجة عادية بدل Promise مرفوضة: التصنيف نفسه، مصفوفة فارغة، ورسالة للمستخدم. بذلك فشل fragrances لا يمنع جمع بيانات beauty أو furniture.

### حفظ النتائج وإنهاء التحميل

~~~jsx
setProducts(Object.fromEntries(results));
~~~

قبل هذا السطر results مصفوفة أزواج، مثل:

~~~js
[
  ["beauty", { items: [/* منتجات */], error: "" }],
  ["fragrances", { items: [], error: "تعذر تحميل منتجات هذا التصنيف." }]
]
~~~

Object.fromEntries تحول كل زوج [key, value] إلى خاصية في كائن. setProducts تحفظ الكائن في state وتطلب render جديدًا.

finally تعمل بعد try سواء اكتملت بنجاح أو وقع خطأ. setLoading(false) تعلن انتهاء التحميل.

fetchProducts() تستدعي الدالة وتبدأها؛ تعريفها وحده لا يرسل الطلبات.

[] قائمة الاعتماديات الفارغة تعني أن effect لا تعتمد على قيم متغيرة في Home؛ تعمل عند تركيب المكوّن ولا يعاد جلب البيانات بسبب كل تحديث state.

ملاحظات على السلوك الحالي:

- catches الداخلية تعالج الأخطاء المعتادة لكل طلب. لا توجد catch خارجية بعد try/finally، لذلك خطأ غير متوقع في التجميع قد يسبب رفض Promise الخارجية من دون رسالة واجهة، مع أن finally تنهي loading.
- لو نجح HTTP وقراءة JSON لكن products ليست مصفوفة، items تصبح [] وerror تبقى فارغة؛ قد يظهر القسم فارغًا بدل رسالة.
- Promise.all لا تعرض التصنيفات بالتدريج؛ تنتظر كل الطلبات، ومنها الأبطأ.

## JSX في Home وProps

~~~jsx
return (
  <PageTransition>
    <div>
      <HeroSlider />

      {loading
        ? categories.map((category) => <SlideProductLoading key={category} />)
        : categories.map((category) => (
            <SlideProduct
              key={category}
              data={products[category]?.items ?? []}
              error={products[category]?.error}
              title={category.replace("-", " ")}
            />
          ))}
    </div>
  </PageTransition>
);
~~~

PageTransition يلف محتوى الصفحة. كل ما بين وسمَيه يصل إليه تلقائيًا في prop اسمها children.

HeroSlider يظهر أعلى الصفحة ولا يستقبل Props في الاستخدام الحالي.

loading ? ... : ... شرط ثلاثي:

- إذا loading صحيحة، map تنشئ SlideProductLoading لكل تصنيف.
- إذا انتهى التحميل، map تنشئ SlideProduct لكل تصنيف.
- key={category} مفتاح ثابت يساعد React على مطابقة عناصر القائمة في عمليات render اللاحقة.

Props إلى SlideProduct:

- data={products[category]?.items ?? []}: يقرأ items للتصنيف. ?. تسمى optional chaining؛ إذا لم يوجد كائن التصنيف، لا يرمي الكود خطأ عند قراءة items. ?? تستخدم [] إذا القيمة null أو undefined.
- error={products[category]?.error}: تمرر رسالة الفشل أو undefined.
- title={category.replace("-", " ")}: replace تستبدل أول شرطة بمسافة. مثل home-decoration تصبح home decoration.

تعليقات JSX أو التعليق متعدد الأسطر في نهاية الملف توضيحات للمطور ولا تنفذ. export default Home يصدر المكوّن لنظام التوجيه أو لمكوّن آخر.

# 2. HeroSlider.jsx

المسار: src/conponents/HeroSlider.jsx. يعرض شرائح ترويجية محلية ولا يجلب منتجات API.

~~~jsx
// import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Link } from "react-router-dom";
import HeroImage from "../assets/images/Hero.jpeg";
import HeroImage1 from "../assets/images/Hero1.jpeg";
import HeroImage2 from "../assets/images/Hero2.jpeg";
~~~

السطر الأول تعليق قديم، لذلك لا يستورد React أو hooks. Swiper حاوية الشريط وSwiperSlide عنصر الشريحة. CSS ينظم الشريط والترقيم. Autoplay وPagination وحدتان مستوردتان. Link للتنقل داخل التطبيق. الصور مستوردة من assets كي تستخدم في src.

~~~jsx
function HeroSlider() {
  const slides = [
    {
      image: HeroImage,
      subtitle: "New Arrivals",
      title: "Next-Gen Tech is Here",
      description:
        "Discover the latest innovations designed to elevate your everyday life.",
      button: "Explore Tech",
    },
    {
      image: HeroImage1,
      subtitle: "Best Products",
      title: "Discover Our Latest Products",
      description: "Find everything you need with our latest collection.",
      button: "Shop Now",
    },
    {
      image: HeroImage2,
      subtitle: "Smart Choices",
      title: "Everything You Need, All in One Place",
      description:
        "Discover quality products, great prices, and everything you need for your everyday life.",
      button: "Start Shopping",
    },
  ];
~~~

slides مصفوفة من كائنات لها البنية نفسها: image وsubtitle وtitle وdescription وbutton. بدلاً من تكرار JSX ثلاث مرات، يستخدم الكود map ليعرضها بقالب واحد.

~~~jsx
<Swiper
  pagination={true}
  modules={[Pagination, Autoplay]}
  className="mySwiper w-full h-100"
  loop={true}
  autoplay={{
    delay: 2500,
    disableOnInteraction: false,
  }}
>
~~~

pagination تفعّل مؤشر الشرائح. modules تمرر وحدات Swiper المستخدمة. className يضيف اسمًا مخصصًا وعرضًا كاملًا وارتفاعًا. loop يجعل الشريط دائريًا. autoplay.delay=2500 أي 2.5 ثانية، وdisableOnInteraction=false يبقي التشغيل التلقائي بعد تفاعل المستخدم.

~~~jsx
{slides.map((slide) => (
  <SwiperSlide key={slide.title}>
~~~

map تنشئ شريحة لكل كائن. slide تمثل بيانات الشريحة الحالية. key={slide.title} مفتاح React؛ العناوين فريدة في هذه القائمة.

داخل الشريحة:

- حاوية المحتوى absolute لتظهر فوق الصورة. top-1/2 يضعها قرب المنتصف الرأسي، و-translate-y-1/2 يرجعها نصف ارتفاعها لتتمركز حول نقطة المنتصف. left-[5%] يترك هامشًا يساريًا.
- span يعرض subtitle.
- h1 يعرض title كعنوان رئيسي.
- p تعرض description وmax-w-100 يحد عرض الفقرة.
- Link يعرض button بشكل زر. to="/" يجعل الأزرار الثلاثة تذهب حاليًا للمسار الرئيسي، رغم اختلاف النص.
- img تستخدم image. alt={slide.title} وصف بديل، وobject-cover يملأ المساحة ويحافظ على نسبة الصورة وقد يقص الحواف.

<>...</> هو Fragment يجمع العناصر دون إضافة DOM wrapper. في الكود الحالي يوجد عنصر رئيسي واحد، لذا Fragment غير ضروري لكنه لا يضر. export default HeroSlider يتيح استيراده في Home.

# 3. SlideProduct.jsx

المسار: src/conponents/slideProducts/SlideProduct.jsx. كل نسخة من المكوّن تعرض تصنيفًا واحدًا؛ Home تنشئ نسخة لكل تصنيف.

~~~jsx
import Product from "./Product";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

function SlideProduct({ data = [], title, error }) {
~~~

Product مكوّن البطاقة الفردية. Swiper وSwiperSlide يبنيان الشريط. ملفات CSS تنسق Swiper. الوحدات الثلاث تتيح التشغيل التلقائي والترقيم والتنقل.

المكوّن يفك Props إلى:

- data مصفوفة المنتجات، وقيمتها الافتراضية [] لتجنب undefined.
- title عنوان التصنيف.
- error رسالة الخطأ أو قيمة فارغة.

التعليقات الخاصة بـHome أو console.log داخل الملف لا تنفذ؛ console.log معلّق.

## عنوان التصنيف ومعالجة الخطأ

~~~jsx
<div className="slide_products slide my-5!">
  <div className="w-[90%] mx-auto! max-w-337.5">
    <div className="top_slide relative pt-2.5! pr-5! pl-0">
      <h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
        {title}
      </h2>
    </div>
    {error ? (
      <p className="py-6 text-center text-red-500">{error}</p>
    ) : (
      <Swiper>...</Swiper>
    )}
  </div>
</div>
~~~

الأصناف تحدد عرض القسم وتوسيطه والمسافات. h2 تعرض title القادم من Home.

الشرط error ? ... : ... يفحص رسالة الخطأ:

- إن كانت غير فارغة، يظهر نص الخطأ بالأحمر بدل Swiper.
- إن كانت فارغة أو undefined، يظهر Swiper.
- العنوان خارج الشرط، فيبقى ظاهرًا حتى عند الخطأ.
- كل قسم مكوّن مستقل؛ فشل fragrances لا يمنع شريط beauty.

## إعداد Swiper للمنتجات

~~~jsx
<Swiper
  loop={true}
  autoplay={{
    delay: 2500,
    disableOnInteraction: false,
  }}
  pagination={{
    type: "progressbar",
  }}
  navigation={true}
  modules={[Pagination, Navigation, Autoplay]}
  className="mySwiper"
  breakpoints={{
    0: { slidesPerView: 2, spaceBetween: 12 },
    480: { slidesPerView: 2, spaceBetween: 15 },
    768: { slidesPerView: 3, spaceBetween: 20 },
    1024: { slidesPerView: 4, spaceBetween: 24 },
    1280: { slidesPerView: 5, spaceBetween: 25 },
    1536: { slidesPerView: 5, spaceBetween: 30 },
  }}
>
~~~

- loop تتيح الانتقال الدائري.
- autoplay تنقل تلقائيًا بعد 2.5 ثانية ولا تتوقف نهائيًا بعد التفاعل.
- pagination بنوع progressbar تعرض شريط تقدم.
- navigation=true تعرض أزرار السابق والتالي.
- modules تفعّل الوحدات المستوردة.
- breakpoints تغير العدد والمسافة حسب عرض الشاشة.

| العرض من | الشرائح الظاهرة | المسافة |
|---:|---:|---:|
| 0px | 2 | 12 |
| 480px | 2 | 15 |
| 768px | 3 | 20 |
| 1024px | 4 | 24 |
| 1280px | 5 | 25 |
| 1536px | 5 | 30 |

مثال: شاشة عرضها 900px تستخدم إعداد 768، فتعرض 3 منتجات ومسافة 20px. التعليقات Mobile وTablet وDesktop وصفية، لكن الإعداد الفعلي يعتمد على الأرقام.

## تكرار المنتجات

~~~jsx
{data.map((item) => {
  return (
    <SwiperSlide key={item.id} className="mt-5!">
      <Product item={item} />
    </SwiperSlide>
  );
})}
~~~

map تمر على data. item منتج واحد في كل دورة. SwiperSlide تنشئ له شريحة. key={item.id} معرف ثابت يساعد React على متابعة القوائم. Product يستقبل كائن المنتج كاملًا في prop اسمها item، ويمكنه قراءة item.title أو item.price.

إذًا: Home تمرر مصفوفة، SlideProduct تكررها، وProduct يستقبل عنصرًا واحدًا لكل بطاقة. export default يصدر SlideProduct لـHome.

# 4. SlideProductLoading.jsx

هذا المكوّن يرسم Skeleton مؤقتًا؛ لا يجلب بيانات ولا يرسل طلب API.

~~~jsx
// import React from "react";
function SlideProductLoading() {
  return (
    <div>
      <div className="slide_products slide my-5!">
        <div className="w-[90%] mx-auto! max-w-337.5">
~~~

استيراد React تعليق قديم. المكوّن لا يستقبل Props. الحاويات تحدد عرض منطقة التحميل وتوسيطها، مع أصناف تشبه قسم المنتج.

~~~jsx
<div className="top_slide ... bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer">
  <h2 ...></h2>
  <p></p>
</div>
~~~

مساحة فارغة للعنوان والوصف. العناصر فارغة عمدًا، لكن الأبعاد والتدرج المتحرك يوحيان بتحميل المحتوى. bg-linear-to-r وfrom/via/to تصنع التدرج، وanimate-shimmer يشغّل حركة اللمعان المعرفة في تنسيقات المشروع.

~~~jsx
<div className="prodcuts_losding mt-5! flex gap-2">
  <div className="prodcut">
    <section className="group w-61.25 ...">
~~~

حاوية Skeleton وبطاقة مؤقتة واحدة. flex يفعّل Flexbox وgap يحدد المسافة. اسما prodcuts_losding وprodcut مكتوبان هكذا في المصدر؛ اسم class لا يكسر JSX، لكنه يجب أن يطابق CSS كي تنطبق قاعدة مرتبطة به.

بقية عناصر البطاقة الفارغة تمثل مساحات الشارة والأيقونة والصورة والعنوان والتقييم والسعر ومعلومة نصية والأزرار. h-56 مثلًا يحجز ارتفاع مكان الصورة. هذه العناصر شكلية فقط وليست منتجًا أو أزرارًا وظيفية.

export default SlideProductLoading يصدر المكوّن. Home تنشئ نسخة لكل تصنيف أثناء loading: 24 نسخة، وكل نسخة فيها بطاقة Skeleton واحدة.

# 5. PageTransition.jsx

~~~jsx
// import React from "react";
import { motion } from "framer-motion";

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
~~~

استيراد React تعليق. motion من Framer Motion يعطي عنصر div قدرات الحركة. children هي العناصر الموجودة بين وسمَي PageTransition في Home.

- initial: يبدأ العنصر شفافًا ومزاحًا 20 وحدة إلى أسفل.
- animate: يصل إلى opacity=1 وy=0، فيظهر في موضعه.
- exit: يحدد اختفاء وتحرك 20 وحدة لأعلى. تشغيل حركة الخروج عند إزالة العنصر يحتاج أن يدير الأب إزالة الصفحات بطريقة تدعم Framer Motion، وغالبًا يحتاج AnimatePresence.
- transition duration=0.5 تجعل الحركة نصف ثانية.
- export default يتيح استخدام المكوّن.

# Props ومسار البيانات

Props قيم يمررها المكوّن الأب إلى الابن.

| المرسل | المستقبل | Prop | معناها |
|---|---|---|---|
| Home | PageTransition | children تلقائيًا | محتوى الصفحة |
| Home | HeroSlider | لا يوجد هنا | بيانات الشرائح داخله |
| Home | SlideProductLoading | لا يوجد | هيكل تحميل ثابت |
| Home | SlideProduct | data | مصفوفة منتجات تصنيف |
| Home | SlideProduct | title | عنوان القسم |
| Home | SlideProduct | error | رسالة الفشل أو قيمة فارغة |
| SlideProduct | Product | item | كائن منتج منفرد |

~~~text
DummyJSON
  ↓ طلب لكل تصنيف
Home state: البيانات ورسالة التصنيف
  ↓ Props: data, title, error
SlideProduct
  ↓ map لكل منتج
Product: item واحد
~~~

# رحلة التحميل من فتح الصفحة حتى ظهور المنتجات

1. React تستدعي Home. products كائن فارغ وloading=true.
2. يظهر HeroSlider، وتظهر 24 نسخة SlideProductLoading.
3. بعد render، useEffect تشغل fetchProducts.
4. يبدأ طلب لكل تصنيف بالتوازي.
5. عند النجاح: يفحص الكود res.ok، يقرأ JSON، ويتأكد أن products مصفوفة، ثم يخزنها في items ويجعل error فارغة.
6. عند فشل طلب: catch الخاصة بهذا التصنيف تعيد items فارغة ورسالة الخطأ.
7. Promise.all تنتظر جميع النتائج، وObject.fromEntries تحولها إلى كائن مفهرس باسم التصنيف.
8. setProducts تخزن النتيجة وfinally تجعل loading=false.
9. React تعيد العرض: تختفي هياكل التحميل وتظهر أقسام SlideProduct.
10. التصنيف الناجح يعرض Swiper، والتصنيف الفاشل يعرض عنوانه ورسالة الخطأ بدل Swiper.

مثال نتيجة furniture الناجحة:

~~~js
products.furniture = {
  items: [{ id: 10, title: "Chair" }],
  error: ""
};
~~~

Home تمرر items إلى data، وSlideProduct تحول كل منتج إلى شريحة ثم تمرره إلى Product.

مثال fragrances عند الفشل:

~~~js
products.fragrances = {
  items: [],
  error: "تعذر تحميل منتجات هذا التصنيف."
};
~~~

قسم fragrances يعرض الرسالة، بينما تبقى الأقسام الناجحة تعرض بياناتها.

# دور Swiper وLoading وPageTransition

- Swiper في HeroSlider يعرض شرائح صور دعائية مع مؤشر وتشغيل تلقائي.
- Swiper في SlideProduct يعرض المنتجات كشريط، مع التنقل والتقدم والتشغيل التلقائي ونقاط توقف للشاشات.
- Loading واجهة مؤقتة تحافظ على شكل الصفحة أثناء الانتظار؛ ليست بيانات فعلية.
- PageTransition يضيف حركة دخول ويحدد شكل خروج الصفحة.

# قاموس المصطلحات

- Component / مكوّن: جزء واجهة مستقل قابل لإعادة الاستخدام.
- JSX: صياغة شبيهة بـHTML داخل JavaScript لوصف واجهة React.
- Hook: دالة React مثل useState وuseEffect.
- State / حالة: قيمة يتابعها React؛ تحديثها عبر setter يسبب render جديدًا.
- Effect: عمل جانبي بعد render، مثل جلب البيانات.
- API: واجهة يطلب منها التطبيق بيانات؛ هنا DummyJSON.
- Promise: تمثيل لنتيجة عملية غير متزامنة ستكتمل لاحقًا.
- async/await: صياغة لتسهيل كتابة العمليات غير المتزامنة.
- HTTP response: استجابة الخادم؛ res.ok تشير إلى نجاح الحالة.
- JSON: تنسيق نصي تحوله res.json إلى كائن JavaScript.
- map: المرور على مصفوفة وإنتاج قيمة لكل عنصر.
- Props: بيانات تنتقل من الأب إلى الابن.
- key: معرف يساعد React على تتبع عناصر القوائم.
- Optional chaining (?.): قراءة خاصية بأمان إذا كان الكائن قد يكون غائبًا.
- Nullish coalescing (??): استخدام بديل عند null أو undefined.
- Swiper: مكتبة للشرائح والتنقل.
- Skeleton/Placeholder: شكل مؤقت لمكان محتوى لم يصل بعد.
- Breakpoint: حد عرض تتغير عنده إعدادات العرض.

## الخلاصة

Home تدير بيانات API وحالة التحميل وتنسق المكونات. HeroSlider يعرض محتوى دعائيًا. SlideProductLoading يظهر أثناء الانتظار. SlideProduct يعرض تصنيفًا ورسالة خطئه أو منتجاته. Product يعرض عنصرًا منفردًا. PageTransition يضيف الحركة حول الصفحة. تبدأ رحلة البيانات من API، تمر إلى state في Home، تنتقل عبر Props إلى SlideProduct، ثم يصل كل منتج إلى Product.

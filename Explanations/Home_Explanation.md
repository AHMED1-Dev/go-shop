# شرح الصفحة الرئيسية ومكوّناتها في GoShop

هذا الشرح مبني على قراءة الكود الحالي في الملفات:

1. src/page/Home/Home.jsx
2. src/conponents/HeroSlider.jsx
3. src/conponents/slideProducts/SlideProduct.jsx
4. src/conponents/slideProducts/SlideProductLoading.jsx
5. src/conponents/PageTransition.jsx

لم يتم تعديل ملفات المصدر أثناء إعداد هذا الشرح.

## سجل البند 9: مصادر التصنيفات — Resolved

كانت Home تستخدم قائمة ثابتة من 24 slug، بينما BtmHeader يجلب التصنيفات من https://dummyjson.com/products/categories. أصبحت Home تجلب القائمة من نقطة API نفسها، ثم تطلب منتجات كل تصنيف باستخدام slug وتعرض العنوان من name. BtmHeader لم يتغير ضمن هذا البند.

أكد المستخدم نجاح ESLint، وتحميل الأقسام بترتيب API على Slow 3G، وظهور رسالة فشل التصنيفات أثناء Offline ثم عودة الأقسام بعد استعادة الاتصال، وعزل فشل طلب Beauty عن بقية الأقسام، وعدم ظهور أخطاء من المشروع في Console بعد مغادرة الصفحة سريعًا على Slow 3G. لم يتأكد بصريًا من ظهور skeletons. طلب قائمة التصنيفات أصبح طلبًا إضافيًا مستقلًا، والأقسام ما زالت تنتظر أبطأ طلب منتجات بسبب Promise.all (البند 14). مظهر رسالة خطأ القسم وتحذير Swiper Loop Warning لم يتضح سببهما أو تاريخهما، ورسالة A listener indicated an asynchronous response... يُرجّح أنها من إضافة متصفح لكن المصدر غير مؤكد.
قواعد Request Blocking التي استُخدمت أثناء الاختبار أُزيلت، وأُعيد إعداد Throttling إلى No throttling بعد انتهاء الاختبار.

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

Home هي المكوّن الأب: تجلب قائمة التصنيفات أولًا، ثم منتجاتها، وتدير حالات التصنيفات والتحميل والخطأ والمنتجات. HeroSlider يعرض محتوى ترويجيًا. بعد وصول قائمة التصنيفات، يعرض SlideProductLoading هيكلًا لكل تصنيف أثناء طلب المنتجات. بعد اكتمال الطلبات، يعرض SlideProduct كل تصنيف ومنتجاته أو رسالة خطئه. PageTransition يلف الصفحة ويضيف الحركة.

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
- useState تحفظ حالة قد تتغير؛ Home تستخدمها لقائمة التصنيفات والمنتجات وحالة التحميل وخطأ تحميل القائمة.
- useEffect تشغّل أثرًا جانبيًا بعد العرض؛ طلبات الشبكة مثال على أثر جانبي.
- بقية الأسطر تستورد المكونات المستخدمة في الصفحة.
- ../.. تعني الرجوع من مجلد Home إلى src ثم الدخول إلى conponents. اسم المجلد مكتوب conponents في المشروع، لذلك يجب أن يطابقه المسار.

## تعريف Home والحالات

~~~
function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
~~~

- function Home يعرّف مكوّن React. المكوّن دالة ترجع JSX وReact تحولها إلى واجهة.
- categories تبدأ بمصفوفة فارغة، ثم تحفظ فيها قائمة التصنيفات القادمة من API. كل عنصر يتضمن slug وname.
- products تبدأ بكائن فارغ. بعد اكتمال طلبات المنتجات، يحوي هذا الكائن نتيجة لكل slug.
- loading تبدأ true؛ وتحدد هل تعرض الصفحة هياكل التحميل أو محتوى الأقسام.
- error تبدأ نصًا فارغًا، وتستخدم لخطأ جلب قائمة التصنيفات كلها. خطأ تصنيف واحد يُحفظ منفصلًا داخل products.

شكل تقريبي لحالة المنتجات بعد اكتمال الطلبات:

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

كل مفتاح هنا هو slug تصنيف. داخله items للمنتجات وerror لرسالة فشل ذلك التصنيف إن وجدت.

## useEffect وتجهيز الإلغاء

~~~
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;
~~~

useEffect تشغّل callback بعد render. نضع جلب الشبكة فيها لأنه عمل جانبي. AbortController ينشئ أداة لإلغاء طلبات fetch، وsignal هي الإشارة التي نمررها لكل طلب حتى يعرف المتصفح أنه تابع لهذا المتحكم.

## جلب القائمة ثم المنتجات

~~~
  async function load() {
    try {
      const categoriesRes = await fetch(
        "https://dummyjson.com/products/categories",
        { signal },
      );

      if (!categoriesRes.ok) {
        throw new Error("Failed to load categories");
      }

      const list = await categoriesRes.json();

      if (!Array.isArray(list)) {
        throw new Error("Invalid categories data");
      }

      setCategories(list);

      const results = await Promise.all(
        list.map(async ({ slug }) => {
          // طلب منتجات كل تصنيف
        }),
      );

      setProducts(Object.fromEntries(results));
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setError("تعذر تحميل التصنيفات. تحقق من اتصال الإنترنت.");
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }
~~~

- async تسمح باستخدام await داخل load. لا نجعل callback الخاصة بـuseEffect نفسها async؛ لأن React تتوقع منها لا شيء أو دالة تنظيف، بينما async ترجع Promise.
- fetch الأولى تجلب قائمة التصنيفات من نقطة DummyJSON. تمرير signal يسمح بإلغائها.
- res.ok تفحص نجاح حالة HTTP. fetch لا تعتبر كل رد HTTP مثل 404 أو 500 خطأً مرفوضًا تلقائيًا، لذلك يفحص الكود هذه الخاصية ويرمي Error عند الفشل.
- res.json تقرأ جسم الاستجابة وتحوله إلى JavaScript.
- Array.isArray تتأكد أن القائمة مصفوفة قبل المرور عليها.
- setCategories(list) تحفظ القائمة فورًا قبل طلبات المنتجات. في render التالي تكون التصنيفات موجودة، وloading ما زالت true، فينشئ JSX هيكل تحميل لكل تصنيف أثناء انتظار المنتجات.
- Promise.all تنتظر مجموعة الطلبات التي تنتجها map. الطلبات تبدأ بالتوازي، لكن المنتجات لا تُحفظ للعرض النهائي إلا بعد اكتمال أبطأ طلب.
- Object.fromEntries تحول أزواج النتائج إلى كائن مفاتيحه slugs. setProducts تحفظ هذا الكائن في state وتطلب من React إعادة العرض.
- catch الخارجية تعالج فشل جلب القائمة أو أخطاء أخرى وصلت إلى هذا المستوى. عند فشل القائمة تحفظ error الرسالة «تعذر تحميل التصنيفات. تحقق من اتصال الإنترنت.».
- AbortError يُستثنى من رسالة الخطأ؛ الإلغاء عند مغادرة الصفحة ليس خطأً ينبغي عرضه للمستخدم.
- finally تعمل بعد النجاح أو الفشل. إذا لم يُلغَ الطلب، تجعل setLoading قيمة loading هي false حتى تنتقل الواجهة إلى فرع الخطأ أو الأقسام.

## طلب منتجات كل تصنيف وعزل الفشل

~~~jsx
list.map(async ({ slug }) => {
  try {
    const res = await fetch(
      `https://dummyjson.com/products/category/${encodeURIComponent(slug)}`,
      { signal },
    );

    if (!res.ok) {
      throw new Error("Failed to load products");
    }

    const data = await res.json();

    return [
      slug,
      {
        items: Array.isArray(data.products) ? data.products : [],
        error: "",
      },
    ];
  } catch (requestError) {
    if (requestError.name === "AbortError") {
      throw requestError;
    }

    return [
      slug,
      {
        items: [],
        error: "تعذر تحميل منتجات هذا التصنيف.",
      },
    ];
  }
})
~~~

- map تمر على كل عنصر في قائمة التصنيفات، وتفك slug من العنصر الحالي.
- encodeURIComponent ترمز قيمة slug لتناسب وضعها داخل عنوان URL.
- لكل تصنيف try/catch خاصة به. نجاح HTTP وقراءة JSON يرجعان زوجًا: slug ثم كائن فيه items وerror فارغة.
- Array.isArray تضمن أن items مصفوفة؛ وإذا لم تكن data.products مصفوفة، يستخدم الكود [] كقيمة آمنة.
- فشل HTTP أو الشبكة أو قراءة JSON يدخل catch الخاص بهذا التصنيف. تعيد catch نتيجة عادية فيها قائمة فارغة ورسالة الخطأ، لذلك لا يُسقط فشل تصنيف واحد نتائج بقية التصنيفات.
- إذا كان الخطأ AbortError، يعيد الكود رميه كي يصل إلى catch الخارجية وتتوقف المعالجة عند إلغاء الصفحة بدل تسجيله كفشل تصنيف.
- Promise.all تحافظ على ترتيب نتائج map. وبعدها يحولها Object.fromEntries إلى كائن يسهل الوصول إلى نتيجة كل تصنيف عبر slug.

## التنظيف عند مغادرة الصفحة

~~~
  load();

  return () => controller.abort();
}, []);
~~~

- load() يبدأ طلب القائمة ثم طلبات المنتجات.
- دالة التنظيف تستدعي controller.abort() عند إزالة Home. كل fetch مررنا لها signal نفسه؛ لذلك تُلغى طلبات القائمة والمنتجات التابعة له.
- [] هي قائمة الاعتماديات الفارغة؛ effect تعمل عند تركيب Home ولا يعاد تشغيلها بسبب تحديث الحالات داخل المكوّن.

## حالات العرض في JSX

~~~
{loading ? (
  categories.map((category) => (
    <SlideProductLoading key={category.slug} />
  ))
) : error ? (
  <p className="py-10! text-center text-red-500!">{error}</p>
) : (
  categories.map(({ slug, name }) => (
    <SlideProduct
      key={slug}
      data={products[slug]?.items ?? []}
      error={products[slug]?.error}
      title={name}
    />
  ))
)}
~~~

هذا تعبير شرطي متداخل يختار حالة واحدة:

1. **Loading:** إذا loading تساوي true، ينشئ SlideProductLoading لكل تصنيف جرى حفظه في categories. لذلك تُعرض الهياكل بعد وصول قائمة التصنيفات وأثناء جلب المنتجات. المستخدم لم يؤكد بصريًا ظهورها في الاختبار.
2. **خطأ القائمة:** إذا انتهى التحميل وكانت error غير فارغة، يعرض رسالة فشل القائمة. هذا الخطأ يختلف عن فشل طلب تصنيف واحد لأن Home لا تملك قائمة يمكنها بناء الأقسام منها.
3. **نجاح القائمة:** إذا لم يوجد تحميل أو خطأ عام، يمر على التصنيفات بالترتيب القادم من API، ويفك slug وname. يمرر slug كمفتاح React، والمنتجات ورسالة القسم إلى SlideProduct، ويعرض name كعنوان.

في data، التعبير products[slug]?.items يقرأ منتجات التصنيف بأمان. Optional chaining تمنع خطأ الوصول إذا كانت نتيجة التصنيف غير موجودة، و?? [] تستخدم مصفوفة فارغة إذا كانت القيمة null أو undefined. error={products[slug]?.error} يمرر رسالة هذا التصنيف فقط. أما title={name} فيستخدم الاسم الذي أعاده API بدل تكوين عنوان من slug.

## نقاط مهمة عن السلوك الحالي

- الصفحة تجلب قائمة التصنيفات أولًا، ثم تبدأ طلب منتجات لكل تصنيف.
- setCategories تسبق Promise.all، وهذا يتيح للواجهة إنشاء هيكل تحميل لكل تصنيف أثناء طلب المنتجات؛ لم يتأكد المستخدم من شكلها بصريًا.
- فشل القائمة يعرض رسالة عامة للصفحة. فشل منتج تصنيف منفرد يعرض رسالة ذلك القسم وتبقى الأقسام الأخرى سليمة.
- توجد catch خارجية فعلًا حول مسار load، إضافة إلى catch منفصلة داخل كل طلب تصنيف.
- إذا نجح الطلب لكن data.products ليست مصفوفة، تصبح items فارغة وerror تظل فارغة، لذلك قد يظهر القسم فارغًا.
- Promise.all تعني أن ظهور المنتجات ينتظر أبطأ طلب. هذا التأخير ما زال مفتوحًا ضمن البند 14.
- الصفحة الرئيسية والهيدر يطلبان قائمة التصنيفات كلٌ على حدة؛ توحّد مصدر البيانات لكن لا تشارك نتيجة الطلب بين المكوّنين.
- تعليقات المطور داخل JSX في نهاية الملف لا تؤثر على التنفيذ.
- export default Home يصدر المكوّن ليستخدمه نظام الصفحات والمسارات.

## ماذا يحدث لو حذفنا أو غيّرنا أجزاء من Home

- **حذف AbortController ودالة التنظيف:** عند مغادرة الصفحة، تظل الطلبات الجارية تعمل حتى تنتهي أو تفشل، رغم أن Home لم تعد معروضة. هذا يهدر طلبات الشبكة، كما لن يكون هناك إلغاء لطلبات التشغيل الأول عند إعادة effects في StrictMode أثناء التطوير.
- **حذف encodeURIComponent:** slugs الحالية تعمل عادةً من دونه لأنها نصوص URL بسيطة، لكن قيمة slug تحتوي مسافة أو رموزًا خاصة قد تكوّن رابطًا غير صحيح. ترميزها يجعل إدراجها داخل مسار URL آمنًا.
- **نقل setCategories(list) إلى ما بعد Promise.all:** تظل categories فارغة أثناء جلب منتجات التصنيفات، لذلك لا تملك واجهة Loading تصنيفات تمر عليها لإنشاء SlideProductLoading. ستظهر الأقسام بعد انتهاء طلبات المنتجات بدل ظهور هياكل التحميل خلالها.
- **حذف try/catch الداخلية لكل تصنيف:** فشل طلب واحد يرفض Promise الخاصة به، فترفض Promise.all المجموعة ويصل الخطأ إلى catch الخارجية. عندها تظهر رسالة فشل القائمة بدل الأقسام، حتى لو نجحت طلبات تصنيفات أخرى؛ وتضيع فائدة عزل فشل القسم.
- **حذف catch الخارجية:** فشل طلب قائمة التصنيفات أو خطأ آخر يصل للمستوى الخارجي لن يحفظ رسالة error للمستخدم، وقد ينتج رفض Promise غير معالج. وجود finally وحده يوقف loading، لكنه لا يعرض رسالة الخطأ.

### StrictMode أثناء التطوير

في وضع التطوير، React StrictMode قد يشغّل effect بهذا التسلسل: تشغيل، ثم cleanup، ثم تشغيل مرة ثانية. كل تشغيل ينشئ AbortController جديدًا؛ الـcleanup يلغي طلبات التشغيل الأول. أخطاء AbortError يعاد رميها من catch الداخلية، ثم تتجاهلها catch الخارجية، وfinally لا تغيّر loading إذا كانت signal ملغاة. التشغيل الثاني له signal جديد ويكمل طلباته بشكل طبيعي. هذا السلوك المقصود يساعد على كشف آثار جانبية لا تنظف نفسها؛ وهو خاص بفحوص التطوير، وليس تشغيلًا مزدوجًا معتادًا في production.

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

export default SlideProductLoading يصدر المكوّن. Home تنشئ نسخة لكل عنصر في قائمة التصنيفات التي رجعت من API أثناء loading؛ العدد يتبع القائمة الحالية وليس رقمًا ثابتًا. كل نسخة تعرض بطاقة Skeleton واحدة.

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
| Home | SlideProduct | title | اسم التصنيف القادم من name في API |
| Home | SlideProduct | error | رسالة الفشل أو قيمة فارغة |
| SlideProduct | Product | item | كائن منتج منفرد |

~~~text
DummyJSON
  ↓ طلب قائمة التصنيفات
Home state: categories, loading, error
  ↓ طلب منتجات لكل slug
Home state: products مفهرسة بالـslug
  ↓ Props: data, title من name, error
SlideProduct
  ↓ map لكل منتج
Product: item واحد
~~~

# رحلة التحميل من فتح الصفحة حتى ظهور المنتجات

1. React تستدعي Home. categories وproducts فارغتان، loading=true، وerror نص فارغ. يظهر HeroSlider، ولا يظهر Skeleton بعد لأن قائمة categories لم تصل بعد.
2. useEffect تنشئ AbortController ودالة التنظيف، ثم تبدأ load.
3. يطلب load قائمة التصنيفات من DummyJSON، ويفحص res.ok وأن JSON الناتج مصفوفة.
4. عند نجاح القائمة، setCategories تحفظها قبل جلب المنتجات. في العرض التالي تظهر SlideProductLoading لكل slug بينما loading ما زالت true.
5. يبدأ طلب منتجات لكل slug بالتوازي. encodeURIComponent ترمز slug داخل الرابط، وكل الطلبات تستخدم signal نفسه.
6. إذا نجح طلب تصنيف، تُحفظ منتجاته في نتيجة مؤقتة وerror تكون فارغة. إذا فشل، تعيد catch الخاصة به items فارغة ورسالة هذا التصنيف؛ لذلك لا يمنع الفشل بقية النتائج.
7. Promise.all تنتظر كل النتائج، ثم Object.fromEntries تحول أزواجها إلى كائن مفهرس بـslug، ويحفظه setProducts.
8. finally تجعل loading=false إذا لم تكن الطلبات أُلغيت. عندها تعرض Home أقسام SlideProduct بالترتيب الذي رجع من API؛ القسم الفاشل يعرض عنوانه ورسالة الخطأ، والناجح يعرض Swiper.
9. إذا فشل طلب قائمة التصنيفات أو كانت البيانات ليست مصفوفة، تحفظ catch الخارجية رسالة القائمة. بعد انتهاء التحميل تظهر الرسالة العامة بدل الأقسام.
10. عند مغادرة الصفحة، تستدعي دالة التنظيف controller.abort(). الإلغاء لا يُعرض كخطأ للمستخدم ولا يحدّث حالة التحميل بعد الإزالة.

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
- AbortController: كائن ينشئ signal يمكن تمريره إلى fetch لإلغاء الطلب.
- AbortSignal / signal: الإشارة التي تربط طلب fetch بمتحكم الإلغاء.
- encodeURIComponent: دالة ترمز قيمة لتكون آمنة داخل جزء من عنوان URL.
- Swiper: مكتبة للشرائح والتنقل.
- Skeleton/Placeholder: شكل مؤقت لمكان محتوى لم يصل بعد.
- Breakpoint: حد عرض تتغير عنده إعدادات العرض.

## الخلاصة

Home تجلب قائمة التصنيفات ثم منتجاتها، وتدير حالات categories وproducts وloading وerror. HeroSlider يعرض محتوى دعائيًا. SlideProductLoading يظهر بعد وصول القائمة وأثناء تحميل المنتجات. SlideProduct يعرض تصنيفًا ورسالة خطئه أو منتجاته، وProduct يعرض عنصرًا منفردًا. PageTransition يضيف الحركة حول الصفحة. تنتقل قائمة التصنيفات والمنتجات إلى JSX في Home، ثم تمر بيانات كل قسم عبر Props إلى SlideProduct، وبعدها يصل كل منتج إلى Product.

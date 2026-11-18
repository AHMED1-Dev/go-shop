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

أكد المستخدم ضمن اختبارات البند 9 نجاح ESLint، وتحميل الأقسام بترتيب API على Slow 3G، وظهور رسالة فشل التصنيفات أثناء Offline ثم عودة الأقسام بعد استعادة الاتصال، وعزل فشل طلب Beauty عن بقية الأقسام، وعدم ظهور أخطاء من المشروع في Console بعد مغادرة الصفحة سريعًا على Slow 3G. لم يتأكد بصريًا من ظهور skeletons في اختبار Issue 9 السابق للتعديل. عولج انتظار الأقسام في البند 14 لاحقًا. مظهر رسالة خطأ القسم وتحذير Swiper Loop Warning لم يتضح سببهما أو تاريخهما، ورسالة A listener indicated an asynchronous response... يُرجّح أنها من إضافة متصفح لكن المصدر غير مؤكد.
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

Home هي المكوّن الأب: تجلب قائمة التصنيفات أولًا، ثم تبدأ طلبًا مستقلًا لكل تصنيف. تدير حالات القائمة وحالة التحميل والخطأ العام، كما تدير لكل تصنيف منتجاته وحالة تحميله وخطأه. HeroSlider يعرض محتوى ترويجيًا. بعد وصول قائمة التصنيفات، يعرض SlideProductLoading لكل قسم ما دام طلبه جاريًا؛ ويستبدل كل هيكل بالقسم المكتمل فور وصول نتيجته، من دون انتظار بقية الأقسام. PageTransition يلف الصفحة ويضيف الحركة.

# 1. Home.jsx

المسار: src/page/Home/Home.jsx.

## النص الحالي كاملًا

هذا هو محتوى الملف الذي بُني عليه الشرح، بالترتيب من الاستيرادات إلى التصدير:

~~~jsx
import { useEffect, useState } from "react";
import HeroSlider from "../../conponents/HeroSlider";
import SlideProduct from "../../conponents/slideProducts/SlideProduct";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import PageTransition from "../../conponents/PageTransition";

function Home() {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadCategories() {
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

        list.forEach(({ slug }) => {
          setCategoryProducts((current) => ({
            ...current,
            [slug]: {
              items: [],
              loading: true,
              error: "",
            },
          }));

          loadCategoryProducts(slug);
        });
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setCategoriesError("تعذر تحميل التصنيفات. تحقق من اتصال الإنترنت.");
        }
      } finally {
        if (!signal.aborted) {
          setLoadingCategories(false);
        }
      }
    }

    async function loadCategoryProducts(slug) {
      try {
        const res = await fetch(
          `https://dummyjson.com/products/category/${encodeURIComponent(slug)}`,
          { signal },
        );

        if (!res.ok) {
          throw new Error("Failed to load products");
        }

        const data = await res.json();

        if (!signal.aborted) {
          setCategoryProducts((current) => ({
            ...current,
            [slug]: {
              items: Array.isArray(data.products) ? data.products : [],
              loading: false,
              error: "",
            },
          }));
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        setCategoryProducts((current) => ({
          ...current,
          [slug]: {
            items: [],
            loading: false,
            error: "تعذر تحميل منتجات هذا التصنيف.",
          },
        }));
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  return (
    <PageTransition>
      <div>
        <HeroSlider />

        {loadingCategories ? null : categoriesError ? (
          <p className="py-10! text-center text-red-500!">{categoriesError}</p>
        ) : (
          categories.map(({ slug, name }) => {
            const categoryData = categoryProducts[slug];

            return categoryData?.loading ? (
              // لو الموقع واقف دي اللي هيظهر
              // اللي هتظهر Loading لو البيانات حملت الكود اللي تحت هيظهر ولو البيانات محملتش الكلمه دي
              <SlideProductLoading key={slug} />
            ) : (
              <SlideProduct
                key={slug}
                data={categoryData?.items ?? []}
                // دي يعني اسامي المنتجات category .دي يعني كل المنتجات اللي اضافت بتفاصيل products
                //يعني كل منتج هيكون موجود اسم المنتج هيكون موجود فوق
                error={categoryData?.error}
                title={name}
              />
            );
          })
        )}
      </div>
    </PageTransition>
  );
}

export default Home;
~~~

الأسطر التالية تشرح هذا المصدر بالترتيب، مع التركيز على مسؤولية كل جزء وتدفق البيانات.

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
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
~~~

- function Home يعرّف مكوّن React. المكوّن دالة ترجع JSX وReact تحولها إلى واجهة.
- categories تبدأ بمصفوفة فارغة، ثم تحفظ فيها قائمة التصنيفات القادمة من API. كل عنصر يستخدم في العرض، خصوصًا slug وname.
- categoryProducts تبدأ بكائن فارغ، ثم يُنشأ لها مدخل لكل slug. يحوي المدخل items وloading وerror الخاصة بذلك التصنيف.
- loadingCategories تبدأ true، وتخص طلب قائمة التصنيفات فقط. عند انتهائه يمكن إظهار رسالة الخطأ العامة أو الأقسام.
- categoriesError تبدأ نصًا فارغًا، وتخصص لفشل تحميل القائمة كلها. خطأ المنتجات لتصنيف واحد يُحفظ في مدخل ذلك التصنيف داخل categoryProducts.

شكل تقريبي لحالة قسمين، أحدهما ما زال يحمل والآخر اكتمل:

~~~js
{
  beauty: {
    items: [{ id: 1, title: "..." }],
    loading: false,
    error: ""
  },
  fragrances: {
    items: [],
    loading: false,
    error: "تعذر تحميل منتجات هذا التصنيف."
  }
}
~~~

كل مفتاح هنا هو slug تصنيف. داخله items للمنتجات، وloading لحالة الطلب، وerror لرسالة فشل ذلك التصنيف إن وجدت. أثناء الطلب يبدأ المدخل بـitems فارغة وloading تساوي true وerror فارغة.

## useEffect وتجهيز الإلغاء

~~~
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;
~~~

useEffect تشغّل callback بعد render. نضع جلب الشبكة فيها لأنه عمل جانبي. ينشئ AbortController متحكمًا واحدًا لدورة هذا الـEffect. الخاصية signal هي AbortSignal المرتبطة به؛ تمرر إلى طلب القائمة وكل طلبات المنتجات، وبذلك يستطيع controller.abort() إلغاء الطلبات التابعة لهذا التشغيل. وجود متحكم مشترك يجعل تنظيف الصفحة يلغي كل الطلبات التي بدأها هذا الـEffect.

## جلب قائمة التصنيفات وبدء طلبات المنتجات

~~~
  async function loadCategories() {
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

      list.forEach(({ slug }) => {
        setCategoryProducts((current) => ({
          ...current,
          [slug]: {
            items: [],
            loading: true,
            error: "",
          },
        }));

        loadCategoryProducts(slug);
      });
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setCategoriesError("تعذر تحميل التصنيفات. تحقق من اتصال الإنترنت.");
      }
    } finally {
      if (!signal.aborted) {
        setLoadingCategories(false);
      }
    }
  }
~~~

- async تسمح باستخدام await داخل loadCategories. لا نجعل callback الخاصة بـuseEffect نفسها async؛ لأن React تتوقع منها لا شيء أو دالة تنظيف، بينما async ترجع Promise.
- fetch الأولى تجلب قائمة التصنيفات من نقطة DummyJSON. تمرير signal يسمح بإلغائها.
- categoriesRes.ok تفحص نجاح حالة HTTP. fetch لا تعتبر كل رد HTTP مثل 404 أو 500 خطأً مرفوضًا تلقائيًا، لذلك يفحص الكود هذه الخاصية ويرمي Error عند الفشل.
- res.json تقرأ جسم الاستجابة وتحوله إلى JavaScript.
- Array.isArray تتأكد أن القائمة مصفوفة قبل المرور عليها.
- setCategories(list) تحفظ القائمة بعد التحقق منها.
- list.forEach تمر على القائمة لتجهيز حالة مستقلة لكل slug ثم بدء طلب منتجاته. لكل مدخل جديد، يبقي التحديث الوظيفي بقية مداخل categoryProducts باستخدام ...current ويضيف أو يهيئ [slug].
- تهيئة المدخل بـitems فارغة وloading=true وerror فارغة تجعل JSX يعرف أن هذا القسم ينتظر بياناته. ثم يستدعي الكود loadCategoryProducts(slug) من دون await؛ لذلك لا ينتظر طلب هذا التصنيف كي يبدأ التالي. كل استدعاء يبدأ fetch ثم يتوقف عند await، فتبدأ الطلبات متزامنة من غير Promise.all.
- catch الخارجية تعالج فشل جلب قائمة التصنيفات أو JSON غير الصالح أو خطأ متزامن وصل إلى هذا المستوى. عند فشل القائمة تحفظ categoriesError الرسالة «تعذر تحميل التصنيفات. تحقق من اتصال الإنترنت.».
- AbortError يُستثنى من رسالة الخطأ؛ الإلغاء عند مغادرة الصفحة ليس خطأً ينبغي عرضه للمستخدم.
- finally تعمل بعد النجاح أو الفشل. إذا لم تكن signal ملغاة، تجعل setLoadingCategories قيمة التحميل false حتى تنتقل الواجهة إلى فرع الخطأ العام أو الأقسام. هذا العلم يخص جلب القائمة فقط ولا ينتظر طلبات المنتجات.

## loadCategoryProducts: طلب مستقل لكل تصنيف وتحديثه

~~~jsx
async function loadCategoryProducts(slug) {
  try {
    const res = await fetch(
      `https://dummyjson.com/products/category/${encodeURIComponent(slug)}`,
      { signal },
    );

    if (!res.ok) {
      throw new Error("Failed to load products");
    }

    const data = await res.json();

    if (!signal.aborted) {
      setCategoryProducts((current) => ({
        ...current,
        [slug]: {
          items: Array.isArray(data.products) ? data.products : [],
          loading: false,
          error: "",
        },
      }));
    }
  } catch (requestError) {
    if (requestError.name === "AbortError") {
      return;
    }

    setCategoryProducts((current) => ({
      ...current,
      [slug]: {
        items: [],
        loading: false,
        error: "تعذر تحميل منتجات هذا التصنيف.",
      },
    }));
  }
}
~~~

- loadCategoryProducts تستقبل slug واحدًا، لذلك كل استدعاء مسؤول عن قسم واحد فقط.
- encodeURIComponent ترمز قيمة slug لتناسب وضعها داخل عنوان URL.
- fetch يطلب منتجات هذا التصنيف باستخدام signal المشترك. يفحص res.ok قبل تحليل JSON.
- بعد نجاح JSON، يحمي شرط !signal.aborted تحديث الحالة إذا كان الطلب قد أُلغي. التحديث الوظيفي ينسخ الحالة الحالية ويستبدل مدخل slug الحالي فقط، فلا يمس نتائج الأقسام الأخرى.
- Array.isArray تضمن أن items مصفوفة؛ وإذا لم تكن data.products مصفوفة يستخدم الكود [] كقيمة آمنة، ويعد الطلب مكتملًا بلا error.
- عند النجاح تتحول loading إلى false ويُفرغ error؛ فتستطيع الواجهة عرض منتجات هذا التصنيف فورًا.
- لكل تصنيف try/catch خاصة به. فشل HTTP أو الشبكة أو قراءة JSON ينتقل إلى catch هذا الاستدعاء، الذي يحدث مدخل slug نفسه إلى قائمة فارغة وloading=false ورسالة خطأ. لا يرفض ذلك طلبات التصنيفات الأخرى ولا يمنعها من النجاح.
- إذا كان الخطأ AbortError، تنتهي الدالة من دون تسجيل خطأ للقسم؛ الإلغاء ليس فشلًا يخص المستخدم. catch الخاصة بطلب القائمة تتجاهل AbortError بالطريقة نفسها.
- بخلاف Promise.all، لا تُجمع وعود المنتجات في حاجز واحد ولا تنتظر النتيجة الأبطأ. كل استجابة تحدّث state عند اكتمالها، وReact تعيد العرض بالقسم الذي اكتمل.

## التنظيف عند مغادرة الصفحة

~~~
  loadCategories();

  return () => controller.abort();
}, []);
~~~

- loadCategories() يبدأ طلب القائمة، وبعد نجاحها يبدأ طلب المنتجات لكل slug.
- دالة التنظيف تستدعي controller.abort() عند إزالة Home. كل fetch مررنا لها signal نفسه؛ لذلك تُلغى طلبات القائمة والمنتجات التابعة له.
- [] هي قائمة الاعتماديات الفارغة؛ effect تعمل عند تركيب Home ولا يعاد تشغيلها بسبب تحديث الحالات داخل المكوّن. إذا كانت طلبات الشبكة جارية، يجعل AbortController الإشارة ملغاة وتتعامل الدوال مع AbortError على أنه إلغاء متوقع.

## حالات العرض في JSX

~~~
{loadingCategories ? null : categoriesError ? (
  <p className="py-10! text-center text-red-500!">{categoriesError}</p>
) : (
  categories.map(({ slug, name }) => {
    const categoryData = categoryProducts[slug];

    return categoryData?.loading ? (
      <SlideProductLoading key={slug} />
    ) : (
      <SlideProduct
        key={slug}
        data={categoryData?.items ?? []}
        error={categoryData?.error}
        title={name}
      />
    );
  })
)}
~~~

داخل div الرئيسي يظهر HeroSlider أولًا دائمًا. بعده يختار الشرط حالة الأقسام:

1. **تحميل القائمة:** إذا loadingCategories تساوي true، تكون نتيجة الفرع null؛ لذلك يظهر HeroSlider ولا تظهر أقسام أو هياكل إلى أن تصل القائمة.
2. **خطأ القائمة:** إذا انتهى طلب القائمة وكانت categoriesError غير فارغة، تظهر الرسالة العامة بدل الأقسام. لا يمكن إنشاء الأقسام من دون قائمة.
3. **قائمة التصنيفات متاحة:** يمر map على القائمة بترتيب API، ويقرأ لكل slug حالته من categoryProducts. طالما categoryData.loading صحيحة يعرض SlideProductLoading لهذا التصنيف وحده.
4. **طلب القسم انتهى:** يعرض SlideProduct لهذا slug فور انتهاء طلبه، سواء نجح أو فشل. العنوان يأتي من name، والمنتجات من items، والخطأ من error. لا يعتمد هذا الفرع على اكتمال بقية الأقسام.

في data، categoryData?.items ?? [] يقرأ منتجات التصنيف بأمان؛ Optional chaining تمنع خطأ إذا كان مدخل التصنيف غير موجود، و?? [] توفر مصفوفة عند null أو undefined. error={categoryData?.error} يمرر رسالة هذا التصنيف فقط. أما title={name} فيستخدم الاسم الذي أعاده API بدل تكوين عنوان من slug. حالة المدخل غير الموجود احتياطية؛ في المسار المعتاد، تنشئ forEach مدخلًا لكل تصنيف قبل إتمام أي fetch.

## نقاط مهمة عن السلوك الحالي

- الصفحة تجلب قائمة التصنيفات أولًا، ثم تهيئ حالة loading مستقلة لكل slug وتبدأ طلب منتجات كل تصنيف.
- الطلبات مستقلة ومتوازية؛ كل نتيجة ناجحة أو فاشلة تحدث مدخل تصنيفها وتبدل هيكله فور اكتمال طلبه، من غير حاجز ينتظر أبطأ طلب.
- تبقى الهياكل المؤقتة بعد وصول القائمة، قسمًا قسمًا، إلى أن يكتمل الطلب الخاص بذلك القسم. أكد الاختبار ظهور بيانات الأقسام بينما صور المنتجات تتحمل تدريجيًا؛ غير المؤكد الوحيد هو ظهور قسم جاهز بجوار قسم ما زال Skeleton بصريًا، لأن فرق التوقيت بين الطلبات نحو نصف ثانية.
- فشل القائمة يعرض رسالة عامة للصفحة. فشل منتج تصنيف منفرد يعرض رسالة ذلك القسم وتبقى الأقسام الأخرى سليمة.
- توجد catch خارجية حول تحميل القائمة، وcatch داخل كل استدعاء loadCategoryProducts لمعالجة فشل قسمه.
- إذا نجح الطلب لكن data.products ليست مصفوفة، تصبح items فارغة وerror تظل فارغة، لذلك قد يظهر القسم بلا منتجات أو رسالة Empty مخصصة.
- الطلب الفاشل لقسم لا يمنع بقية الطلبات. AbortError الناتج عن الإلغاء يُتجاهل ولا يعرض كخطأ للقسم. أكد اختبار الخروج السريع على Slow 3G عدم ظهور أخطاء من المشروع في Console؛ ظهرت فقط تحذيرات Swiper Loop Warning المعروفة.
- الصفحة الرئيسية والهيدر يطلبان قائمة التصنيفات كلٌ على حدة؛ توحّد مصدر البيانات لكن لا تشارك نتيجة الطلب بين المكوّنين.
- تعليقات المطور داخل JSX في نهاية الملف لا تؤثر على التنفيذ.
- export default Home يصدر المكوّن ليستخدمه نظام الصفحات والمسارات.

## ماذا يحدث لو حذفنا أو غيّرنا أجزاء من Home

- **حذف AbortController ودالة التنظيف:** عند مغادرة الصفحة، تظل الطلبات الجارية تعمل حتى تنتهي أو تفشل، رغم أن Home لم تعد معروضة. هذا يهدر طلبات الشبكة، كما لن يكون هناك إلغاء لطلبات التشغيل الأول عند إعادة effects في StrictMode أثناء التطوير.
- **حذف encodeURIComponent:** slugs الحالية تعمل عادةً من دونه لأنها نصوص URL بسيطة، لكن قيمة slug تحتوي مسافة أو رموزًا خاصة قد تكوّن رابطًا غير صحيح. ترميزها يجعل إدراجها داخل مسار URL آمنًا.
- **حذف تهيئة categoryProducts لكل slug:** لن تكون للواجهة حالة loading خاصة بالقسم؛ سيستخدم JSX القيمة الافتراضية الآمنة للبيانات وقد يظهر SlideProduct بقائمة فارغة بدل SlideProductLoading إلى أن يصل تحديث الطلب.
- **إعادة تجميع النتائج في Promise.all:** ستبدأ الطلبات بالتوازي، لكن إذا جرى تأخير تحديث state إلى ما بعد Promise.all فسيعود ظهور الأقسام لانتظار أبطأ طلب، وهي المشكلة التي عالجها البند 14.
- **حذف try/catch داخل loadCategoryProducts:** قد يتحول فشل fetch إلى رفض غير معالج بدل تحديث القسم برسالة، كما قد لا تُحدّث حالة loading للقسم إلى false.
- **حذف catch الخارجية:** فشل طلب قائمة التصنيفات أو خطأ آخر يصل للمستوى الخارجي لن يحفظ رسالة error للمستخدم، وقد ينتج رفض Promise غير معالج. وجود finally وحده يوقف loading، لكنه لا يعرض رسالة الخطأ.

### StrictMode أثناء التطوير

في وضع التطوير، React StrictMode قد يشغّل effect بهذا التسلسل: تشغيل، ثم cleanup، ثم تشغيل مرة ثانية. كل تشغيل ينشئ AbortController جديدًا؛ الـcleanup يلغي طلبات التشغيل الأول. إذا نتج AbortError من طلب قائمة التصنيفات، تتجاهله catch الخارجية ولا تغيّر finally حالة التحميل لأن signal ملغاة. وإذا نتج من طلب منتجات، تنهي catch الداخلية ذلك الطلب فقط من دون عرض رسالة فشل. التشغيل الثاني له signal جديد ويكمل طلباته بشكل طبيعي. هذا السلوك المقصود يساعد على كشف آثار جانبية لا تنظف نفسها؛ وهو خاص بفحوص التطوير، وليس تشغيلًا مزدوجًا معتادًا في production.

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

export default SlideProductLoading يصدر المكوّن. Home تنشئ نسخة لكل تصنيف يكون طلبه الجاري في categoryProducts؛ العدد يتبع قائمة التصنيفات الحالية وليس رقمًا ثابتًا. عند اكتمال طلب تصنيف، تستبدل Home هيكله وحده بـSlideProduct، بينما تستمر هياكل التصنيفات الأخرى في الظهور حتى تنتهي طلباتها. كل نسخة تعرض بطاقة Skeleton واحدة.

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
Home state: categories, loadingCategories, categoriesError
  ↓ تهيئة مدخل لكل slug وبدء طلبات مستقلة ومتوازية
Home state: categoryProducts[slug] = { items, loading, error }
  ↓ يتحدث كل مدخل فور اكتمال طلبه
SlideProductLoading للقسم الجاري / SlideProduct للقسم المكتمل
  ↓ Props: data, title من name, error
SlideProduct
  ↓ map لكل منتج
Product: item واحد
~~~

# رحلة التحميل من فتح الصفحة حتى ظهور المنتجات

1. React تستدعي Home. تبدأ categories وcategoryProducts فارغتين، وloadingCategories=true، وcategoriesError نص فارغ. يظهر HeroSlider، ولا يظهر Skeleton بعد لأن القائمة لم تصل بعد.
2. useEffect تنشئ AbortController وتستخرج signal، وتعرّف loadCategories وloadCategoryProducts. ثم تستدعي loadCategories وتسجل دالة تنظيف تستدعي controller.abort().
3. loadCategories تطلب قائمة التصنيفات من DummyJSON مع signal. تفحص categoriesRes.ok ثم تحلل JSON وتتأكد أن list مصفوفة.
4. عند نجاح القائمة، setCategories تحفظها. بعدها يمر list.forEach على slugs؛ ويضيف setCategoryProducts الوظيفي لكل slug مدخلًا أوليًا items=[] وloading=true وerror="".
5. في المرور نفسه يستدعى loadCategoryProducts(slug) من دون await. يبدأ fetch لكل قسم بعنوان مرمّز بـencodeURIComponent ومع signal نفسه؛ لذلك الطلبات مستقلة ومتوازية ولا ينتظر استدعاء القسم السابق.
6. بعد انتهاء طلب ناجح، يفحص الكود signal.aborted ثم يستبدل مدخل slug وحده: items تصبح data.products إذا كانت مصفوفة، وloading=false وerror فارغة. يعاد render؛ فيظهر هذا القسم كـSlideProduct فورًا، ولو بقيت أقسام أخرى قيد التحميل.
7. عند فشل HTTP أو الشبكة أو تحليل JSON في طلب قسم، تعيّن catch الخاصة به items=[] وloading=false ورسالة الخطأ لذلك slug. يتحول ذلك القسم من Skeleton إلى SlideProduct الذي يعرض رسالة الخطأ؛ وتواصل بقية الطلبات عملها.
8. إذا فشل طلب قائمة التصنيفات أو كان JSON ليس مصفوفة، تحفظ catch الخارجية categoriesError. finally توقف loadingCategories إن لم تكن signal ملغاة. هذا لا ينتظر اكتمال طلبات المنتجات.
9. JSX يخفي الأقسام فقط بينما قائمة التصنيفات نفسها قيد التحميل. بعد انتهائها يعرض خطأ القائمة إن وجد؛ وإلا يمر على القائمة بالترتيب الأصلي، فيختار لكل slug SlideProductLoading إذا كانت loading صحيحة أو SlideProduct إذا انتهت.
10. في SlideProduct، الخطأ يجعل المكوّن يعرض رسالة التصنيف بدل Swiper؛ والنجاح يعرض المنتجات في الشريط. إذا نجح الطلب لكن products ليست مصفوفة، يمرر Home مصفوفة فارغة ولا توجد رسالة Empty مخصصة حاليًا.
11. عند إزالة Home، تستدعي دالة التنظيف controller.abort() لإلغاء القائمة وأي طلبات منتجات لا تزال جارية. AbortError لا يعرض كخطأ للمستخدم. في اختبار الخروج السريع على Slow 3G لم تظهر أخطاء من المشروع في Console، وظهرت فقط تحذيرات Swiper Loop Warning المعروفة. الاختبار أكد سلامة الخروج من ناحية الأخطاء الظاهرة؛ أما ظهور قسم جاهز بجوار Skeleton في اللحظة نفسها فلم يتأكد بصريًا بسبب قصر فرق التوقيت بين الطلبات.

مثال نتيجة furniture الناجحة:

~~~js
categoryProducts.furniture = {
  items: [{ id: 10, title: "Chair" }],
  loading: false,
  error: ""
};
~~~

Home تمرر items إلى data، وSlideProduct تحول كل منتج إلى شريحة ثم تمرره إلى Product.

مثال fragrances عند الفشل:

~~~js
categoryProducts.fragrances = {
  items: [],
  loading: false,
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

Home تجلب قائمة التصنيفات ثم تهيئ categoryProducts بحالة مستقلة لكل slug، وتدير loadingCategories وcategoriesError لتحميل القائمة. طلبات المنتجات مستقلة ومتوازية؛ نتيجة كل طلب تحدّث items وloading وerror لقسم واحد، فيظهر SlideProductLoading للقسم الجاري وSlideProduct لكل قسم يكتمل من دون انتظار أبطأ طلب. HeroSlider يعرض محتوى دعائيًا. SlideProduct يعرض رسالة خطأ القسم أو منتجاته، وProduct يعرض عنصرًا منفردًا. PageTransition يضيف الحركة حول الصفحة. تمر بيانات كل قسم عبر Props إلى SlideProduct، وبعدها يصل كل منتج إلى Product.

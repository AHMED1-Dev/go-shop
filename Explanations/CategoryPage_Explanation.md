# شرح تعليمي مفصل لملف `CategoryPage.jsx`

الشرح ده ماشي مع الكود الموجود حاليًا في المشروع، وهدفه يوضح إزاي صفحة التصنيف بتشتغل من أول ما المستخدم يفتح الرابط لحد ما المنتجات تظهر أو تظهر رسالة خطأ. الشرح تعليمي فقط؛ ما بيطلبش تعديل ملف `CategoryPage.jsx`.

## الفكرة العامة للصفحة

الصفحة بتقرأ اسم التصنيف من عنوان المتصفح، مثل `beauty` أو `smartphones`. بعد كده تطلب المنتجات الخاصة بالتصنيف من DummyJSON. خلال انتظار الرد تعرض شكل تحميل. لو الطلب نجح تعرض عدد المنتجات وبطاقات المنتجات. ولو الطلب فشل تعرض رسالة الخطأ.

الحالات الثلاث في واجهة الصفحة هي:

1. **تحميل:** لسه ما وصلتش بيانات التصنيف الحالي.
2. **خطأ:** الطلب انتهى، لكنه فشل.
3. **نجاح:** البيانات وصلت، فنعرض العنوان والمنتجات.

## الكود الحالي

```jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Product from "../../conponents/slideProducts/Product";
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
import PageTransition from "../../conponents/PageTransition";

function CategoryPage() {
  const { category } = useParams();
  // console.log(category);

  const [categoryData, setCategoryData] = useState({
    category: "",
    products: [],
    total: 0,
    error: "",
  });
  const loading = categoryData.category !== category;

  useEffect(() => {
    const controller = new AbortController();

    fetch(`https://dummyjson.com/products/category/${category}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("تعذر تحميل منتجات هذا التصنيف.");
        }

        return res.json();
      })
      .then((data) => {
        setCategoryData({
          category,
          products: data.products ?? [],
          total: data.total ?? 0,
          error: "",
        });
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setCategoryData({
            category,
            products: [],
            total: 0,
            error: err.message,
          });
        }
      });

    return () => controller.abort();
  }, [category]);
  const error = categoryData.category === category ? categoryData.error : "";

  return (
    <PageTransition key={category}>
      {/*  categoryProducts */}
      <div className="">
        {loading ? (
          <SlideProductLoading key={category} />
        ) : error ? (
          <div className="w-[90%] mx-auto! max-w-337.5">
            <p className="text-red-500 text-center py-10">{error}</p>
          </div>
        ) : (
          // container
          <div className="w-[90%] mx-auto! max-w-337.5">
            <div className="top_slide relative pt-2.5! pr-5! pl-0">
              <h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
                {category} : {categoryData.total}
              </h2>
            </div>
            {/* Products */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-7!">
              {categoryData.products.map((item, index) => {
                return <Product item={item} key={index} />;
              })}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default CategoryPage;
```

## شرح الاستيرادات

### `useEffect` و`useState`

```jsx
import { useEffect, useState } from "react";
```

- `useState` من React لتخزين معلومات تتغير مع الوقت، مثل بيانات التصنيف والخطأ. لما نستدعي دالة التحديث الخاصة بها، React يعيد رسم المكوّن بالقيم الجديدة.
- `useEffect` لتشغيل عمل جانبي بعد ما React يرسم المكوّن، مثل طلب بيانات من API. طلب الشبكة مش جزء من إنشاء عناصر JSX نفسها، لذلك مكانه المناسب هنا.

### `useParams`

```jsx
import { useParams } from "react-router-dom";
```

ده Hook من React Router بيقرأ القيم المتغيرة الموجودة في مسار الصفحة. لو تعريف المسار في التطبيق مثل `/category/:category` وفتحنا `/category/beauty`، قيمة `category` هتبقى النص `beauty`.

### المكونات المستخدمة

```jsx
import Product from "../../conponents/slideProducts/Product";
```

بيستورد بطاقة المنتج. الصفحة هتكرر المكوّن ده مرة لكل منتج، وتمرر بيانات المنتج له.

```jsx
import SlideProductLoading from "../../conponents/slideProducts/SlideProductLoading";
```

بيستورد شكلًا مؤقتًا يشبه محتوى المنتجات ويظهر أثناء التحميل، عشان المستخدم يعرف إن الصفحة بتعمل حاجة.

```jsx
import PageTransition from "../../conponents/PageTransition";
```

بيستورد غلافًا يضيف حركة انتقال عند عرض الصفحة. تهجئة `conponents` في المسار هي اسم المجلد الموجود حاليًا في المشروع.

## تعريف المكوّن وقراءة الرابط

```jsx
function CategoryPage() {
```

ده تعريف مكوّن React اسمه `CategoryPage`. جسم الدالة يحدد الحالات والمنطق وعناصر الواجهة اللي هتظهر عند استخدام الصفحة.

```jsx
const { category } = useParams();
```

`useParams()` بيرجع كائنًا فيه القيم الموجودة في المسار. فكّينا منه الخاصية `category` مباشرة باستخدام destructuring.

مثال:

| رابط الصفحة | قيمة `category` |
| --- | --- |
| `/category/beauty` | `"beauty"` |
| `/category/smartphones` | `"smartphones"` |

```jsx
// console.log(category);
```

ده سطر تعليق. لو شلنا `//` هيطبع قيمة التصنيف في Console، وده مفيد مؤقتًا أثناء تتبع الكود. حاليًا هو لا يعمل ولا يؤثر في الموقع.

## حالة بيانات التصنيف

```jsx
const [categoryData, setCategoryData] = useState({
  category: "",
  products: [],
  total: 0,
  error: "",
});
```

`useState` هنا بترجع قيمتين:

- `categoryData`: القيمة الحالية للحالة.
- `setCategoryData`: الدالة اللي نستخدمها لتغيير الحالة.

الحالة عبارة عن object واحد يجمع بيانات الطلب المرتبطة ببعضها:

- `category`: التصنيف اللي تخصه البيانات المحفوظة. يبدأ فاضيًا لأن مفيش طلب اكتمل لسه.
- `products`: مصفوفة المنتجات. تبدأ `[]` عشان نضمن إن القيمة قابلة للاستخدام كمصفوفة.
- `total`: عدد النتائج. يبدأ `0`.
- `error`: رسالة الخطأ. تبدأ `""`، يعني مفيش خطأ معروض.

تجميعهم في object بيسهل حفظ نتيجة كل طلب كوحدة واحدة: اسم التصنيف، منتجاته، عدده، وخطؤه إن وجد.

## حساب حالة التحميل من البيانات

```jsx
const loading = categoryData.category !== category;
```

`loading` هنا متغير عادي مشتق من الحالة، مش حالة مستقلة بـ `useState`.

- في أول فتح الصفحة تكون `categoryData.category` فاضية، مثل `""`، بينما `category` قد تكون `"beauty"`. القيمتان مختلفتان، فـ `loading` تساوي `true`.
- بعد نجاح الطلب، الكود يحفظ `category` الحالي داخل `categoryData.category`. تصبح القيمتان مثل `"beauty"`، فـ `loading` تساوي `false`.
- لو المستخدم انتقل إلى `smartphones`، بينما البيانات المحفوظة تخص `beauty`، يحصل اختلاف مؤقت، فترجع `loading` إلى `true` تلقائيًا.

استخدمنا قيمة مشتقة بدل استدعاء `setLoading(true)` تزامنيًا داخل `useEffect`. كده ما بنخزنش معلومة ممكن حسابها من بيانات موجودة، وبنتجنب تحذير ESLint عن تحديث الحالة مباشرة داخل effect.

## طلب البيانات باستخدام `useEffect`

```jsx
useEffect(() => {
```

يقول لـ React: شغّل الدالة الداخلية بعد ظهور المكوّن، وأعد تشغيلها إذا تغيّرت قيمة من قيم الاعتماديات في آخر الـ effect.

### إنشاء أداة إلغاء الطلب

```jsx
const controller = new AbortController();
```

`AbortController` واجهة متوفرة في المتصفح لإلغاء عملية مثل `fetch`. وجودها مفيد لو المستخدم انتقل لتصنيف جديد قبل اكتمال الطلب القديم.

### بناء طلب الـ API

```jsx
fetch(`https://dummyjson.com/products/category/${category}`, {
  signal: controller.signal,
})
```

- `fetch` يرسل طلب HTTP إلى API.
- علامات backtick تسمح بإدخال قيمة متغير داخل النص باستخدام `${...}`.
- لو `category` قيمتها `beauty` يصبح الرابط:

  ```text
  https://dummyjson.com/products/category/beauty
  ```

- `signal` يربط الطلب بـ `controller`. لما ننفّذ لاحقًا `controller.abort()`، يعرف `fetch` إن عليه إلغاء هذا الطلب.

## فحص رد الخادم وتحويله إلى بيانات

```jsx
.then((res) => {
```

`fetch` يرجع Promise. أول `then` يستقبل الاستجابة HTTP في المتغير `res`.

```jsx
if (!res.ok) {
```

`res.ok` تكون `true` عادةً عند نجاح HTTP، و`false` عند حالات مثل `404` أو `500`. مهم نفحصها لأن `fetch` لا يعتبر كل استجابة HTTP فاشلة رفضًا تلقائيًا للـ Promise.

```jsx
throw new Error("تعذر تحميل منتجات هذا التصنيف.");
```

لو الاستجابة فاشلة، ننشئ Error برسالة مفهومة. `throw` ينقل التنفيذ إلى سلسلة معالجة الأخطاء `catch` بدل التعامل مع الرد كأنه بيانات منتجات صحيحة.

```jsx
return res.json();
```

لو الاستجابة ناجحة، نحوّل جسم الرد من JSON إلى كائنات ومصفوفات JavaScript. التحويل نفسه غير متزامن، لذلك `return` يسمح للـ Promise التالي باستقبال النتيجة بعد اكتماله.

## حفظ البيانات بعد النجاح

```jsx
.then((data) => {
```

يستقبل `data` النتيجة التي خرجت من `res.json()`.

```jsx
setCategoryData({
```

نحدّث حالة الصفحة. استدعاء setter يجعل React يعيد تصيير المكوّن بالقيمة الجديدة.

```jsx
category,
```

يحفظ اسم التصنيف الذي ينتمي إليه الرد. دي النقطة اللي تخلي مقارنة `loading` تعرف إن البيانات الحالية تخص المطلوب.

```jsx
products: data.products ?? [],
```

يأخذ مصفوفة المنتجات من رد API. العامل `??` معناه: استخدم القيمة على اليسار، إلا لو كانت `null` أو `undefined`؛ وقتها استخدم القيمة البديلة `[]`.

مثال: إذا كان `data.products` مصفوفة، نحفظها. ولو لم يرسل الخادم الخاصية، نحفظ مصفوفة فارغة كي لا يفشل `.map()` لاحقًا.

```jsx
total: data.total ?? 0,
```

يأخذ عدد النتائج من الرد، ويستخدم صفرًا كقيمة بديلة إذا لم تكن `total` موجودة.

```jsx
error: "",
```

يمسح رسالة خطأ سابقة عند نجاح الطلب.

```jsx
});
```

ينهي تمرير الكائن إلى `setCategoryData`.

## معالجة الفشل والإلغاء

```jsx
.catch((err) => {
```

يمسك الأخطاء التي حصلت في السلسلة السابقة، مثل فشل الشبكة، أو الخطأ الذي أنشأناه بسبب `!res.ok`، أو مشكلة في قراءة JSON.

```jsx
if (err.name !== "AbortError") {
```

إلغاء الطلب بواسطة `AbortController` ينتج خطأ اسمه `AbortError`. الإلغاء هنا متوقع عند تغيير التصنيف أو مغادرة الصفحة، لذلك لا نعرضه كخطأ للمستخدم. الأخطاء الأخرى تُعالج وتُعرض.

```jsx
setCategoryData({
  category,
  products: [],
  total: 0,
  error: err.message,
});
```

عند فشل الطلب:

- نسجل التصنيف الذي فشل طلبه، حتى لا تبقى الصفحة في حالة تحميل إلى الأبد.
- نضع المنتجات في مصفوفة فارغة والعدد صفرًا، فلا نعرض نتائج قديمة على أنها نتائج التصنيف الحالي.
- نحفظ رسالة الخطأ داخل `error` لعرضها في JSX.

مثال عملي: لو طلب `beauty` فشل برسالة `Failed to fetch`، تصبح الحالة تقريبًا:

```js
{
  category: "beauty",
  products: [],
  total: 0,
  error: "Failed to fetch"
}
```

بما أن التصنيف أصبح محفوظًا، `loading` تصبح `false`، وبما أن `error` غير فارغة تعرض الواجهة رسالة الخطأ.

```jsx
}
});
```

يقفل شرط تجاهل `AbortError` ثم يقفل دالة `catch`.

## تنظيف الـ effect ومراقبة التصنيف

```jsx
return () => controller.abort();
```

الدالة المرجعة من effect هي cleanup function. React يشغلها قبل تشغيل effect مرة أخرى بسبب تغير `category`، أو عند إزالة المكوّن من الشاشة. هنا تلغي الطلب الذي يخص التصنيف القديم.

مثال: المستخدم فتح `/category/beauty`، ثم بسرعة فتح `/category/laptops`. cleanup يلغي طلب `beauty`، والـ effect الجديد يطلب `laptops`. هذا يقلل احتمال استمرار طلب لم نعد نحتاجه.

```jsx
}, [category]);
```

`[category]` هي قائمة الاعتماديات. معناها:

- شغّل effect عند تركيب المكوّن.
- أعد تشغيله عندما تتغير قيمة `category`.
- لا تعِد الطلب بسبب تغييرات لا علاقة لها بالتصنيف.

## اختيار الخطأ الخاص بالتصنيف الحالي

```jsx
const error = categoryData.category === category ? categoryData.error : "";
```

هذا متغير مشتق. يسمح باستخدام رسالة الخطأ فقط عندما تكون بيانات الحالة تخص التصنيف الموجود حاليًا في الرابط.

لو الرابط تغيّر من `beauty` إلى `laptops`، قد تكون الحالة للحظات ما زالت تخص `beauty`. المقارنة تمنع عرض خطأ `beauty` للمستخدم وهو يطلب `laptops`.

## بدء JSX وحركة الصفحة

```jsx
return (
```

يبدأ الجزء الذي يرجع عناصر الواجهة. JSX صيغة تكتب شكل عناصر شبيهًا بـ HTML داخل JavaScript، لكنها ليست HTML نصيًا؛ React يحولها إلى عناصر واجهة.

```jsx
<PageTransition key={category}>
```

يغلّف محتوى الصفحة بمكوّن الحركة.

- `key` خاصية يستخدمها React للتعرف على هوية هذا العنصر بين عمليات التصيير. تغييرها عند تغيير `category` يجعل React يتعامل مع غلاف الانتقال على أنه عنصر جديد، وهو مفيد لإعادة حركة الانتقال حسب التصنيف.
- `key` خاصية خاصة بـ React ولا تُمرر إلى `PageTransition` كـ prop عادي.

```jsx
{/*  categoryProducts */}
```

تعليق JSX. عكس تعليق JavaScript العادي، التعليق داخل JSX يكتب بالشكل `{/* ... */}`. لا يظهر للمستخدم ولا ينفّذ شيئًا.

```jsx
<div className="">
```

حاوية داخلية. `className` هي الطريقة المعتادة لإضافة CSS classes في JSX. هنا قيمتها فارغة، يعني الحاوية لا تضيف تنسيقًا من هذه الخاصية حاليًا.

## Conditional Rendering: اختيار واجهة حسب الحالة

```jsx
{loading ? (
  <SlideProductLoading key={category} />
) : error ? (
  ...
) : (
  ...
)}
```

ده اسمه conditional rendering، أي عرض واجهة مختلفة حسب القيم. هنا نستخدم عامل الشرط الثلاثي `condition ? A : B`، ومتداخل معه شرط آخر:

1. لو `loading` صحيحة، اعرض مكوّن التحميل.
2. وإلا لو `error` فيها رسالة، اعرض رسالة الخطأ.
3. وإلا، اعرض بيانات التصنيف والمنتجات.

ترتيب الفحص مهم: أثناء الطلب، حالة الخطأ تكون غالبًا فارغة، لكن الأهم أن واجهة التحميل تظهر أولًا. بعد انتهاء الطلب، إما يظهر فرع الخطأ أو فرع النجاح.

### فرع التحميل

```jsx
<SlideProductLoading key={category} />
```

يعرض المكوّن المستورد كعنصر placeholder. `key={category}` يجعل React يميز شكل التحميل لكل تصنيف أثناء التنقل.

### فرع الخطأ

```jsx
<div className="w-[90%] mx-auto! max-w-337.5">
```

حاوية رسالة الخطأ:

- `w-[90%]`: عرضها 90% من المساحة المتاحة.
- `mx-auto!`: توسيط أفقي باستخدام الهوامش التلقائية؛ علامة `!` جزء من أسلوب Tailwind المستخدم في هذا المشروع لفرض القاعدة.
- `max-w-337.5`: حد أقصى للعرض كي لا تتمدد كثيرًا على الشاشات الكبيرة.

```jsx
<p className="text-red-500 text-center py-10">{error}</p>
```

يعرض نص الخطأ داخل فقرة. `text-red-500` يلوّن النص بالأحمر، و`text-center` يوسّطه، و`py-10` يضيف مساحة أعلى وأسفل. `{error}` تعني إدراج قيمة JavaScript داخل JSX.

### فرع النجاح

```jsx
<div className="w-[90%] mx-auto! max-w-337.5">
```

حاوية نتائج الصفحة بعرض متجاوب وحد أقصى.

```jsx
<div className="top_slide relative pt-2.5! pr-5! pl-0">
```

حاوية عنوان التصنيف. أسماء `top_slide` قد تكون class مخصصة للمشروع، أما بقية الأسماء فهي classes تنسيق من Tailwind للموقع والمسافات.

```jsx
<h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
```

عنوان من مستوى `h2`:

- `text-3xl`: حجم نص كبير.
- `text-main!`: لون المشروع الأساسي مع فرض التنسيق.
- `mb-2.5!` و`mt-3.5!`: مسافة أسفل وأعلى.
- `capitalize`: يجعل بداية الكلمات كبيرة بصريًا، مثل `home-decoration` التي قد تظهر `Home-decoration`؛ لا يغير قيمة `category` نفسها في JavaScript.

```jsx
{category} : {categoryData.total}
```

يعرض اسم التصنيف ثم العدد الموجود في الحالة. لو `category` تساوي `beauty` و`total` يساوي `30`، يظهر عنوان قريب من:

```text
beauty : 30
```

```jsx
<div className="flex items-center justify-between flex-wrap gap-4 py-7!">
```

حاوية البطاقات باستخدام Flexbox:

- `flex`: ترتيب الأبناء بجانب بعض.
- `items-center`: محاذاة العناصر على المحور العرضي.
- `justify-between`: توزيع العناصر والمساحات بينها.
- `flex-wrap`: السماح للبطاقات بالانتقال لسطر جديد عند ضيق العرض.
- `gap-4`: مسافة بين البطاقات.
- `py-7!`: مساحة رأسية حول مجموعة المنتجات.

## `map` وProps و`key`

```jsx
{categoryData.products.map((item, index) => {
  return <Product item={item} key={index} />;
})}
```

### `map`

`products` مصفوفة. الدالة `map` تمر على كل عنصر فيها وتنتج مصفوفة جديدة من عناصر React.

لو كانت البيانات:

```js
[
  { id: 1, title: "Essence Mascara" },
  { id: 2, title: "Eyeshadow Palette" }
]
```

فـ `map` تستدعي الدالة مرة للمنتج الأول ومرة للثاني، وبالتالي تنشئ بطاقتين من `Product`.

### `item` و`index`

- `item` هو كائن المنتج الحالي، مثل عنوانه وسعره وصوره.
- `index` هو ترتيبه في المصفوفة: الأول `0`، والثاني `1`، وهكذا.

### Props

```jsx
<Product item={item} ... />
```

`item={item}` يمرر كائن المنتج إلى مكوّن `Product` تحت اسم الخاصية `item`. داخل المكوّن يمكن استعمال معلوماته لعرض الاسم والصورة والسعر.

### `key`

```jsx
key={index}
```

`key` تساعد React على تمييز كل بطاقة عن البطاقات الأخرى عند تحديث المصفوفة، مثلًا عند إضافة أو إزالة أو إعادة ترتيب منتجات. الكود الحالي يستخدم `index` كـ key. عادةً يكون معرّف المنتج الثابت، مثل `item.id`، اختيارًا أفضل إذا كانت القائمة يمكن أن تتغير أو يعاد ترتيبها؛ لكن هذا الشرح يصف الكود الحالي ولا يغيّره.

## إغلاق عناصر JSX والدالة

```jsx
        )}
      </div>
    </PageTransition>
  );
}
```

هذه الأقواس تقفل بالتدريج:

- الفرع الأخير من الشرط الثلاثي `)}`.
- الحاوية الداخلية `div`.
- مكوّن `PageTransition`.
- تعبير `return`.
- جسم دالة `CategoryPage`.

```jsx
export default CategoryPage;
```

يصدر المكوّن كـ default export كي يستطيع ملف توجيه التطبيق استيراده وعرضه على مسار التصنيف.

## العلاقة بين الأجزاء

يمكن تلخيص العلاقة بهذا التسلسل:

```text
رابط الصفحة
  ↓
useParams يقرأ category
  ↓
useEffect يطلب منتجات category
  ↓
نجاح الطلب أو فشله يحدّث categoryData
  ↓
loading و error يحددان حالة العرض
  ↓
الـ JSX يعرض تحميلًا أو خطأ أو قائمة منتجات
  ↓
map ينشئ Product لكل عنصر ويمرر بياناته عبر item
```

## تدفق عمل الصفحة من البداية للنهاية

### مثال نجاح: فتح تصنيف `beauty`

1. يفتح المستخدم `/category/beauty`.
2. `useParams` تعيد `category = "beauty"`.
3. `categoryData.category` تبدأ `""`؛ إذن `loading` تكون `true`.
4. React يعرض `SlideProductLoading`.
5. `useEffect` يرسل طلبًا إلى `https://dummyjson.com/products/category/beauty`.
6. لو كانت الاستجابة ناجحة، يحول `res.json()` المحتوى إلى `data`.
7. `setCategoryData` تحفظ اسم التصنيف وعدد المنتجات ومصفوفتها، وتمسح أي خطأ.
8. React يعيد تصيير الصفحة. `categoryData.category` أصبحت `"beauty"`، فـ `loading` تصير `false` و`error` فارغة.
9. يظهر العنوان والعدد، ثم `map` تنشئ بطاقة `Product` لكل منتج.

### مثال فشل: الشبكة لا تعمل

1. يبدأ الطلب للتصنيف الحالي، وتظهر واجهة التحميل.
2. `fetch` يرفض الطلب أو يفشل فحص `res.ok`.
3. التنفيذ يصل إلى `catch`.
4. إذا لم يكن الإلغاء `AbortError`، تُحفظ رسالة الخطأ والتصنيف مع مصفوفة منتجات فارغة.
5. React يعيد التصيير. اسم التصنيف المحفوظ يطابق الحالي، إذن `loading` تصبح `false`.
6. `error` تحمل رسالة، لذلك يعرض الشرط الثلاثي رسالة الخطأ ولا يحاول عرض قائمة المنتجات.

### مثال تغيير التصنيف بسرعة

1. يبدأ طلب `beauty`.
2. ينتقل المستخدم إلى `laptops` قبل انتهاء الطلب.
3. قيمة `category` تتغير؛ React ينظف effect القديم فيستدعي `controller.abort()`.
4. يبدأ effect جديد بطلب `laptops`.
5. خطأ الإلغاء للطلب القديم لا يُعرض للمستخدم لأن اسمه `AbortError`.
6. تُعرض بيانات `laptops` عند اكتمال الطلب الجديد.

## حدود السلوك الحالي

- لو نجح الطلب ورجع `products` فارغة، سيظهر العنوان والعدد صفرًا، لكن الصفحة لا تعرض حاليًا رسالة خاصة مثل «لا توجد منتجات في هذا التصنيف».
- المفتاح داخل قائمة المنتجات حاليًا هو `index`، رغم أن `item.id` هو معرّف منتج ثابت متاح غالبًا.
- رسالة الخطأ من API أو الشبكة تظهر كما هي في الواجهة. في هذا المثال رسالة HTTP المخصصة عربية، أما خطأ الشبكة فقد يكون نصه إنجليزيًا.
- الملف يجلب التصنيف عند كل تغيير في `category`؛ لا يوجد cache مشترك لهذه البيانات في هذا المكوّن.

النقاط دي وصف للسلوك الموجود، وليست تعديلات مقترحة تم تنفيذها.

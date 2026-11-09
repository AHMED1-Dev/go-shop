# شرح `SerachResults.jsx`
## 1. الاستيرادات
```jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageTransition from "../conponents/PageTransition";
import SlideProductLoading from "../conponents/slideProducts/SlideProductLoading";
import Product from "../conponents/slideProducts/Product";
```
- `useEffect` يشغّل كودًا جانبيًا بعد العرض، وهنا نستخدمه لطلب نتائج البحث من API.
- `useState` يحفظ نتائج البحث والخطأ بحيث React يعيد رسم الصفحة لما تتغير.
- `useLocation` يقرأ معلومات عنوان الصفحة الحالي، ومنها query string بعد علامة `?`.
- `PageTransition` يلف محتوى الصفحة ويضيف له انتقالًا بصريًا.
- `SlideProductLoading` يعرض شكلًا مؤقتًا أثناء انتظار الطلب.
- `Product` يعرض بطاقة منتج واحدة.
## 2. المكوّن وقراءة كلمة البحث
```jsx
function SerachResults() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query")?.trim() ?? "";
```
- `function SerachResults()` يعرّف مكوّن React الخاص بصفحة نتائج البحث.
- `useLocation()` يجيب كائن الموقع الحالي من React Router.
- `location.search` يحتوي جزء الاستعلام من العنوان، مثل `?query=phone`.
- `new URLSearchParams(...).get("query")` يقرأ قيمة المفتاح `query` من الرابط.
- `?.trim()` يشيل المسافات من بداية الكلمة ونهايتها، و`?.` يمنع استدعاء `trim` لو المفتاح مش موجود.
- `?? ""` يستخدم نصًا فاضيًا لو قيمة `query` كانت `null` أو `undefined`.
## 3. الحالة
```jsx
  const [searchData, setSearchData] = useState({
    query: null,
    results: [],
    error: "",
  });
```
- `useState({...})` ينشئ حالة واحدة تجمع معلومات نتيجة البحث المرتبطة ببعضها.
- `searchData` هي قيمة الحالة الحالية، و`setSearchData` تحدّثها وتجعل React يعيد العرض.
- `query: null` يسجل كلمة البحث التي تخص البيانات المخزنة؛ `null` في البداية معناها إن مفيش طلب اكتمل بعد.
- `results: []` يبدأ قائمة المنتجات كمصفوفة فاضية عشان نقدر نستخدم `map` بأمان بعدين.
- `error: ""` يبدأ رسالة الخطأ فاضية، يعني مفيش فشل مسجل حاليًا.
- تجميع الكلمة والنتائج والخطأ مهم عشان ما نعرضش نتائج كلمة قديمة باعتبارها نتائج الكلمة الحالية.
## 4. القيم المشتقة
```jsx
  const loading = Boolean(query) && searchData.query !== query;
  const error = searchData.query === query ? searchData.error : "";
  const results = searchData.query === query ? searchData.results : [];
```
- `Boolean(query)` يحول قيمة البحث إلى `true` لو فيها كلمة، و`false` لو فاضية.
- `loading` قيمة مشتقة وليست state مستقلة؛ تكون `true` لما فيه بحث حالي ولسه الحالة ما سجلتش نتيجة لنفس الكلمة.
- عند تغيير `query`، اختلافها عن `searchData.query` يشغل التحميل فورًا من غير `setLoading` داخل effect.
- `error` يعرض خطأ الحالة فقط لو الحالة تخص كلمة البحث الحالية؛ غير كده يرجع نصًا فاضيًا.
- `results` يعرض منتجات الحالة فقط لو تخص البحث الحالي؛ وإلا يرجع مصفوفة فاضية حتى لا تظهر نتائج قديمة أثناء تحميل كلمة جديدة.
- استخدام قيم مشتقة يخلي حالة التحميل والبيانات متوافقة مع كلمة البحث الحالية بدون تخزين قيم ممكن حسابها من `searchData` و`query`.
## 5. الـ effect وطلب البحث
```jsx
  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();
    let ignoreResult = false;

    async function fetchData() {
      try {
        const encodedQuery = encodeURIComponent(query);
        const res = await fetch(
          `https://dummyjson.com/products/search?q=${encodedQuery}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error("تعذر تحميل نتائج البحث. حاول مرة أخرى.");
        }

        const data = await res.json();

        if (!Array.isArray(data.products)) {
          throw new Error("استجابة البحث غير صالحة. حاول مرة أخرى.");
        }

        if (!ignoreResult) {
          setSearchData({
            query,
            results: data.products,
            error: "",
          });
        }
      } catch (err) {
        if (err.name === "AbortError" || ignoreResult) return;

        setSearchData({
          query,
          results: [],
          error: "حصلت مشكلة أثناء البحث. حاول مرة أخرى.",
        });
      }
    }

    fetchData();

    return () => {
      ignoreResult = true;
      controller.abort();
    };
  }, [query]);
```
- `useEffect` يشغل طلب البحث بعد العرض، ويعيد تشغيله لو `query` اتغيرت.
- `if (!query) return` يمنع إرسال طلب لما المستخدم ما كتبش كلمة بحث.
- `new AbortController()` ينشئ أداة تقدر تلغي طلب `fetch` لو بقى قديمًا أو الصفحة اتقفلت.
- `ignoreResult` علامة محلية بتبدأ `false`؛ بنحوّلها إلى `true` في التنظيف عشان نمنع استخدام رد الطلب القديم.
- `async function fetchData()` تعرف دالة غير متزامنة، وبالتالي تقدر تستخدم `await` لانتظار خطوات الطلب بالترتيب.
- `try` يجمع الخطوات اللي ممكن تفشل، عشان الأخطاء تنتقل للـ`catch` بدل ما توقف المنطق من غير معالجة.
- `encodeURIComponent(query)` يرمّز الكلمة لتناسب قيمة داخل عنوان URL؛ مثلًا `a&b` تصبح `a%26b` عشان `&` ما يتفسرش كفاصل بين معاملات الرابط.
- `encodedQuery` يحفظ النسخة المرمّزة عشان نستخدمها في عنوان API.
- `fetch(...)` يطلب البحث من DummyJSON باستخدام الكلمة المرمّزة.
- `` `...?q=${encodedQuery}` `` يركّب قيمة البحث داخل عنوان API.
- `{ signal: controller.signal }` يربط الطلب بالـ`AbortController`، فيقدر `controller.abort()` يوقفه.
- `await fetch(...)` ينتظر وصول استجابة HTTP ويحفظها في `res`.
- `if (!res.ok)` يفحص نجاح حالة HTTP؛ `fetch` ما بيرميش خطأ تلقائيًا لمجرد إن الرد `404` أو `500`.
- `throw new Error(...)` يحول استجابة HTTP الفاشلة إلى خطأ ينتقل إلى `catch`، بدل اعتبارها بحثًا ناجحًا بلا نتائج.
- `await res.json()` يقرأ جسم الاستجابة ويحوّله من JSON إلى كائن JavaScript.
- `Array.isArray(data.products)` يتأكد إن الخاصية اللي هنعرضها قائمة فعلًا قبل ما نعتمد عليها.
- `throw new Error(...)` هنا يعالج شكل استجابة غير متوقع؛ من غير الفحص قد يحفظ التطبيق قيمة لا تصلح لقائمة المنتجات.
- `if (!ignoreResult)` يسمح بحفظ البيانات فقط لو الطلب ما اتلغاش وما بقاش قديمًا.
- `setSearchData({...})` يحفظ كلمة البحث مع منتجاتها ويمسح الخطأ؛ React بعدها يعيد العرض وتتحول `loading` إلى `false`.
- `catch (err)` يلتقط أخطاء الشبكة، وأخطاء HTTP اللي رميناها، وأخطاء قراءة JSON أو شكل البيانات.
- `err.name === "AbortError"` يتعرف على الإلغاء المتوقع للطلب، و`ignoreResult` يكشف إن effect اتنظف؛ في الحالتين نخرج من غير ما نعرض فشلًا للمستخدم.
- `setSearchData` داخل مسار الخطأ يحفظ نفس كلمة البحث مع قائمة آمنة ورسالة فشل، وده يوقف التحميل ويميّز الفشل عن نجاح البحث بلا نتائج.
- `fetchData()` يبدأ تنفيذ دالة الطلب؛ تعريف الدالة وحده لا يرسل الطلب.
- دالة التنظيف تضبط `ignoreResult` قبل إلغاء الطلب، فتمنع الرد القديم من تعديل الحالة حتى لو اكتمل قرب وقت الإلغاء.
- `controller.abort()` يطلب من المتصفح إلغاء `fetch` الجاري.
- `[query]` تعني إن effect يعمل عند تركيب المكوّن، ثم يعيد العمل كلما تغيرت كلمة البحث.
## 6. JSX وحالات العرض
```jsx
  return (
    <PageTransition key={query}>
      <div>
        {!query ? (
          <p>اكتب كلمة للبحث عن المنتجات.</p>
        ) : loading ? (
          <SlideProductLoading key={query} />
        ) : error ? (
          <p role="alert">{error}</p>
        ) : results.length > 0 ? (
          <div className="w-[90%] mx-auto! max-w-337.5">
            <div className="top_slide relative pt-2.5! pr-5! pl-0">
              <h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
                Results for : {query}
              </h2>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4 py-7!">
              {results.map((item) => (
                <Product item={item} key={item.id} />
              ))}
            </div>
          </div>
        ) : (
          <p>No Results found</p>
        )}
      </div>
    </PageTransition>
  );
```
- `return` يرجع واجهة المكوّن بصيغة JSX.
- `<PageTransition key={query}>` يلف الصفحة بمكوّن الانتقال؛ تغيير `key` مع كلمة البحث يجعل React يعيد تركيب الغلاف للبحث الجديد.
- `{!query ? (...) : ...}` يفحص الكلمة أولًا؛ لو فاضية يعرض رسالة تطلب من المستخدم إدخال كلمة بدل skeleton.
- `<p>اكتب كلمة للبحث عن المنتجات.</p>` هي رسالة حالة البحث الفارغ.
- `loading ? (...) : ...` يعرض شكل التحميل فقط لما يكون فيه استعلام جديد لم تصل نتيجته بعد.
- `<SlideProductLoading key={query} />` يعرض هيكل التحميل، ومفتاح البحث يميز هيكل كل استعلام.
- `error ? (...) : ...` يختار رسالة الخطأ بعد انتهاء التحميل وقبل فحص قائمة النتائج.
- `<p role="alert">{error}</p>` يعرض رسالة الفشل؛ `role="alert"` يساعد تقنيات المساعدة على إعلان التغيير للمستخدم.
- `results.length > 0 ? (...) : (...)` يفرق بين قائمة فيها منتجات وقائمة فارغة بعد طلب ناجح.
- `w-[90%] mx-auto! max-w-337.5` اتشرحت قبل كده في `Home_Explanation.md` و`CategoryPage_Explanation.md`؛ بتحدد عرض المحتوى وتوسيطه وحده الأقصى.
- `top_slide relative pt-2.5! pr-5! pl-0` اتشرحت قبل كده في `CategoryPage_Explanation.md`؛ تنسّق موضع ومسافات حاوية العنوان.
- `text-3xl text-main! mb-2.5! mt-3.5! capitalize` اتشرحت قبل كده في `CategoryPage_Explanation.md`؛ تنسّق حجم العنوان ولونه ومسافاته وشكل الحروف.
- `Results for : {query}` يعرض الكلمة اللي المستخدم بحث عنها داخل عنوان النتائج.
- `flex items-center justify-between flex-wrap gap-4 py-7!` اتشرحت قبل كده في `CategoryPage_Explanation.md`؛ ترتب بطاقات المنتجات وتسمح بالتفافها مع مسافات بينها.
- `results.map(...)` يمر على كل منتج في المصفوفة وينشئ عنصر `Product` لكل واحد.
- `(item)` هو كائن المنتج الحالي في دورة `map`.
- `<Product item={item} key={item.id} />` يمرر المنتج إلى بطاقة `Product`، ويستخدم معرّفه الثابت كمفتاح للقائمة.
- `<p>No Results found</p>` يظهر فقط بعد نجاح الطلب وعدم وجود رسالة خطأ، لما تكون قائمة المنتجات فارغة؛ لذلك الفشل لا يختلط مع عدم وجود نتائج.
## 7. رحلة البحث من البداية للنهاية
### بحث ناجح: `phone`
1. يفتح المستخدم رابط بحث فيه `?query=phone`، فتقرأ `useLocation` العنوان وتستخرج `query` قيمة `phone`.
2. في أول render تكون `searchData.query` تساوي `null`، لذلك `loading` تساوي `true` ويظهر skeleton.
3. `useEffect` يبدأ `fetchData`، وترميز `phone` يبقى `phone`، ثم يرسل `fetch` الطلب ويربطه بـ`controller.signal`.
4. لو كان `res.ok` صحيحًا، يقرأ الكود JSON ويتأكد إن `data.products` مصفوفة.
5. يحفظ `setSearchData` الكلمة `phone` والمنتجات، فتصبح `loading` خطأً وتعرض الواجهة العنوان وبطاقات المنتجات.
### بحث فاشل
1. يبدأ الطلب ويظهر skeleton كما في البحث العادي.
2. لو فشل الاتصال، أو كان رد HTTP غير ناجح، أو كانت الاستجابة غير صالحة، ينتقل التنفيذ إلى `catch`.
3. يحفظ مسار الخطأ كلمة البحث مع `results: []` ورسالة خطأ؛ عندها `loading` تتوقف، وفرع `error` يعرض الرسالة بدل `No Results found`.
### بحث فاضي
1. لو الرابط بلا قيمة `query` أو قيمتها مسافات فقط، `trim()` تنتج نصًا فاضيًا.
2. `useEffect` يخرج مبكرًا ولا يرسل طلبًا، و`loading` تظل `false` لأن `Boolean(query)` تساوي `false`.
3. JSX يعرض «اكتب كلمة للبحث عن المنتجات.» ولا يعرض skeleton أو رسالة عدم وجود نتائج.
### تبديل سريع بين كلمتين
1. يبدأ البحث عن `phone`، فيظهر skeleton ويُنشأ له `controller` خاص.
2. قبل اكتماله تتغير الكلمة إلى `laptop`؛ `loading` تصبح `true` لأن `searchData.query` لا تطابق الكلمة الجديدة.
3. تنظيف effect الخاص بـ`phone` يضبط `ignoreResult` ثم يلغي الطلب بـ`controller.abort()`، وبعده يبدأ effect جديد لطلب `laptop`.
4. حتى لو وصل رد `phone` قرب وقت الإلغاء، `ignoreResult` تمنعه من تحديث الحالة؛ وعند اكتمال `laptop` تُحفظ نتائجه وتظهر وحدها.

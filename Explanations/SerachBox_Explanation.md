# شرح تعليمي لملف SerachBox.jsx

الشرح ده مبني على الكود الحالي بالكامل في src/conponents/header/SerachBox.jsx. هنمشي من أول سطر لآخر سطر، ونوضح وظيفة كل جزء وسبب وجوده، وإزاي بيتفاعل مع بقية المكوّن. أسماء الملف والمجلد وبعض المتغيرات فيها تهجئة المشروع الحالية؛ هنشرحها زي ما هي من غير تعديل.

## وظيفة المكوّن

SerachBox هو مربع البحث الموجود في الهيدر الثابت في GoShop. المستخدم يكتب كلمة، وبعد ما يوقف كتابة لمدة 300 مللي ثانية، المكوّن يطلب اقتراحات منتجات من DummyJSON. يعرض أول خمسة اقتراحات. الضغط على اقتراح يفتح صفحة تفاصيل المنتج، وإرسال النموذج بـEnter أو زر العدسة يفتح صفحة نتائج البحث.

الاقتراحات تفضل متاحة عند الانتقال العادي من Shop إلى Home لأن ظهورها لم يعد مربوطًا بمفتاح الصفحة. لكنها تختفي عند إرسال البحث أو اختيار منتج. كما أن رقم الطلب يمنع رد طلب أقدم من إعادة نتائج لم تعد مطلوبة.

## الكود الحالي كاملًا

~~~jsx
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function SerachBox() {
  const [serachTerm, setSerachTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedTerm, setSubmittedTerm] = useState("");
  const navigate = useNavigate();
  const requestIdRef = useRef(0);

  const isFresh = hasSearched;

  const invalidateSuggestions = () => {
    requestIdRef.current += 1;
    setSuggestions([]);
    setHasSearched(false);
  };

  const handleSbumit = (e) => {
    e.preventDefault();

    const term = serachTerm.trim();

    if (term) {
      setSubmittedTerm(term);
      invalidateSuggestions();
      navigate(`/search?query=${encodeURIComponent(term)}`);
    }
  };

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    // رقم يميز طلب البحث الحالي
    const controller = new AbortController();
    // Effect وسيلة لإلغاء طلب الشبكة السابق عند تنظيف الـ

    const fetchSuggestions = async () => {
      if (!serachTerm.trim() || serachTerm.trim() === submittedTerm) {
        setSuggestions([]);
        setHasSearched(false);
        return;
      }

      try {
        const res = await fetch(
          `https://dummyjson.com/products/search?q=${encodeURIComponent(
            serachTerm.trim(),
          )}`,
          {
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch suggestions");
        }

        const data = await res.json();

        if (requestId !== requestIdRef.current) return;
        // لو الطلب اللي رجع مش هو الطلب الحالي، تجاهل النتيجة وما تحدّثش الاقتراحات

        setSuggestions(data.products?.slice(0, 5) || []);
        setHasSearched(true);
      } catch (error) {
        if (error.name !== "AbortError" && requestId === requestIdRef.current) {
          console.log("Search Error:", error);
          setSuggestions([]);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      if (requestId === requestIdRef.current) {
        requestIdRef.current += 1;
      }
    }; // ويلغي طلب الشبكة، ويبطل صلاحية الطلب لو لسه هو الطلب الحالي timeout وده بيعمل تنظيف للـ
  }, [serachTerm, submittedTerm]);

  return (
    <div className="relative">
      <form
        onSubmit={handleSbumit}
        className="flex items-center bg-bg rounded-4xl border border-main"
      >
        <input
          className="h-11.25 w-full py-1! px-4! bg-bg rounded-tl-[30px] rounded-bl-[30px]"
          type="text"
          name="search"
          id="search"
          placeholder="Search For Products"
          onChange={(e) => {
            setSerachTerm(e.target.value);
            setSubmittedTerm("");
            invalidateSuggestions();
          }}
          autoComplete="off"
        />
        <button
          type="submit"
          className="w-11.25 h-11.25 flex items-center justify-center bg-main text-lg cursor-pointer rounded-tr-[30px] rounded-br-[30px]"
        >
          <FaSearch className="text-white" />
        </button>
      </form>

      {isFresh && suggestions.length > 0 && (
        <ul className="absolute bg-white w-full! list-none mt-1! border border-border z-50">
          {suggestions.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.id}`}
              onClick={() => {
                setSubmittedTerm(serachTerm.trim());
                invalidateSuggestions();
              }}
            >
              <li className=" flex items-center gap-2 py-1! px-2! border-b border-border">
                <img
                  className="w-10! h-10 object-contain"
                  src={item.images[0]}
                  alt={item.title}
                />{" "}
                <span className="text-sm">{item.title}</span>
              </li>
            </Link>
          ))}
        </ul>
      )}

      {isFresh && serachTerm.trim() && suggestions.length === 0 && (
        <p className="absolute bg-white w-full p-3! border border-border z-50">
          No suggestions found.
        </p>
      )}
    </div>
  );
}

export default SerachBox;
~~~

## شرح الاستيرادات: أول ثلاثة أسطر

### React Hooks

~~~jsx
import { useEffect, useRef, useState } from "react";
~~~

- import يستورد أسماء من مكتبة أخرى.
- useState يخزن قيمًا تتغير مع تفاعل المستخدم. عند تحديث الحالة، React يعيد رسم المكوّن بالقيم الجديدة.
- useEffect ينفذ عملًا جانبيًا بعد الرسم. جلب بيانات من API مثال على side effect لأنه يتواصل مع خارج حساب JSX.
- useRef يحتفظ بقيمة بين عمليات الرسم من غير ما يؤدي تغييرها وحده إلى إعادة الرسم. هنا نحفظ فيه رقم الطلب الحالي.
- الأقواس المعقوفة تعني استيراد الأسماء المسماة من React.
- حذف Hook من الاستيراد مع بقاء استخدامه يجعل الاسم غير معروف ويؤدي إلى خطأ.

### أيقونة البحث

~~~jsx
import { FaSearch } from "react-icons/fa";
~~~

FaSearch أيقونة عدسة جاهزة من مكتبة react-icons، ومصدرها مجموعة Font Awesome. نعرضها داخل زر البحث. حذف هذا الاستيراد مع بقاء JSX الخاص بالأيقونة يسبب خطأ؛ حذف الأيقونة والاستيراد معًا يزيل الشكل فقط.

### أدوات React Router

~~~jsx
import { Link, useNavigate } from "react-router-dom";
~~~

- Link رابط داخلي للانتقال لصفحة تفاصيل المنتج من غير تحميل كامل للتطبيق.
- useNavigate يعطي المكوّن دالة تنقل برمجية، ونستخدمها لإرسال المستخدم إلى صفحة نتائج البحث.
- لا نحتاج useLocation في النسخة الحالية؛ لم نعد نربط صلاحية الاقتراحات بمفتاح الصفحة.
- أدوات React Router تعمل لما يكون المكوّن داخل Router.

## تعريف المكوّن والحالات

~~~jsx
function SerachBox() {
~~~

ده مكوّن React وظيفي. JSX يستخدم الحرف الكبير في بداية الاسم لتمييز المكوّن عن عناصر HTML. الاسم والتهجئة كما هما في المشروع.

### عبارة البحث الحالية

~~~jsx
const [serachTerm, setSerachTerm] = useState("");
~~~

- الحالة تبدأ بنص فارغ.
- serachTerm تمثل ما كتبه المستخدم في الحقل الآن، مثل HP.
- setSerachTerm تحدث الحالة عند تغيير input.
- نحتاجها لبناء عنوان API ورابط صفحة النتائج.
- لو حذفناها، لن يعرف المكوّن ما الذي يبحث عنه المستخدم.

### منتجات الاقتراحات

~~~jsx
const [suggestions, setSuggestions] = useState([]);
~~~

- suggestions مصفوفة المنتجات التي رجعت من API.
- تبدأ []، حتى تكون قابلة لاستخدام length وmap قبل وصول الرد.
- setSuggestions تحفظ أول خمسة منتجات، أو تمسح القائمة عند إبطالها.
- حذفها يمنع حفظ وعرض نتائج الاقتراحات.

### حالة اكتمال البحث

~~~jsx
const [hasSearched, setHasSearched] = useState(false);
~~~

- قيمة منطقية تبدأ false.
- بعد نجاح الطلب تصبح true، حتى نميز بين بحث لم يكتمل وبين بحث ناجح بلا منتجات.
- setHasSearched تحدث هذه الحالة.
- رسالة No suggestions found لا تظهر لمجرد أن suggestions فارغة عند بداية الصفحة؛ يلزم hasSearched أيضًا عبر isFresh.

### العبارة التي أُرسلت

~~~jsx
const [submittedTerm, setSubmittedTerm] = useState("");
~~~

- تحفظ عبارة البحث التي أرسلها المستخدم، أو العبارة التي اختار منها منتجًا.
- عند كتابة نص جديد تصير فارغة.
- effect يقارنها بالنص الحالي؛ إذا كانا متساويين يرجع من غير جلب اقتراحات.
- بعد Enter أو اختيار منتج، مساواة القيمتين تمنع إنشاء طلب اقتراحات جديد لنفس العبارة.
- هي غير serachTerm: serachTerm محتوى الحقل الحالي، وsubmittedTerm علامة العبارة التي عوملت على أنها أُرسلت أو اختير منها منتج.

### التنقل ومرجع رقم الطلب

~~~jsx
const navigate = useNavigate();
const requestIdRef = useRef(0);
~~~

- navigate دالة React Router التي تنقل إلى صفحة النتائج.
- useRef(0) ينشئ مرجعًا له خاصية current تبدأ بصفر.
- requestIdRef.current يخزن عدادًا للطلبات.
- تغيير current لا يسبب render جديدًا، لأن رقم الطلب للتحكم في صلاحية نتائج غير مرئية وليس معلومة واجهة.
- نزيد الرقم عند تشغيل طلب جديد، وعند إبطال النتائج، وعند تنظيف effect.
- لو استخدمنا state للعداد فكل زيادة قد تسبب render إضافيًا، وهو غير مطلوب.

## isFresh وإبطال الاقتراحات

~~~jsx
const isFresh = hasSearched;
~~~

isFresh متغير مشتق وليس state. هنا «fresh» معناها أن نجاح طلب الاقتراحات مسجل في hasSearched. لا يوجد فحص location.key. لذلك تغيير الصفحة وحده، مثل Shop إلى Home، لا يبطل الاقتراحات، ويظل النص والنتائج مرئيين ما دام TopHeader مستمرًا في الشجرة. عند إرسال البحث أو اختيار منتج، نجعل hasSearched false فتصبح isFresh false وتختفي القائمة.

### invalidateSuggestions

~~~jsx
const invalidateSuggestions = () => {
  requestIdRef.current += 1;
  setSuggestions([]);
  setHasSearched(false);
};
~~~

- هذه دالة محلية تساعد على تنفيذ عملية واحدة متكررة: إبطال نتيجة الاقتراحات.
- requestIdRef.current += 1 يرفع رقم الطلب الحالي. أي طلب قديم يحتفظ برقمه السابق، فيعرف عند عودته أنه لم يعد صالحًا.
- setSuggestions([]) تزيل المنتجات من الواجهة والحالة.
- setHasSearched(false) تجعل isFresh false، فتختفي القائمة ورسالة عدم النتائج.
- نستخدمها عند الكتابة وعند إرسال البحث وعند النقر على اقتراح.
- لو حذفنا زيادة رقم الطلب فقط، يمكن لرد قديم أن يمر بفحص الصلاحية ويعيد البيانات. لو حذفنا مسح الاقتراحات قد تبقى النتيجة السابقة في الواجهة. لو حذفنا تغيير hasSearched قد يظل شرط العرض صحيحًا لرسالة القائمة الفارغة.

## handleSbumit: إرسال البحث

~~~jsx
const handleSbumit = (e) => {
  e.preventDefault();

  const term = serachTerm.trim();

  if (term) {
    setSubmittedTerm(term);
    invalidateSuggestions();
    navigate(`/search?query=${encodeURIComponent(term)}`);
  }
};
~~~

- handleSbumit دالة حدث onSubmit. التهجئة كما في الكود.
- e كائن الحدث الذي يمرره المتصفح/React عند إرسال form.
- preventDefault يمنع السلوك الافتراضي للنموذج، وهو إعادة تحميل الصفحة.
- term متغير محلي يحمل serachTerm بعد trim، أي إزالة المسافات من البداية والنهاية.
- if (term) يمنع إرسال استعلام فارغ أو مكون من مسافات.
- setSubmittedTerm(term) يسجل العبارة المرسلة. هذا يغيّر dependency في effect، وبعدها شرط effect يمنع طلب الاقتراحات للعبارة نفسها.
- invalidateSuggestions يمسح القائمة ويجعل الطلب السابق غير صالح.
- encodeURIComponent يرمز قيمة البحث لتناسب URL. مثلًا a&b تصبح a%26b حتى لا يُفهم & كفاصل معاملات.
- navigate ينقل إلى /search?query=... من غير تحميل كامل للصفحة.
- حذف preventDefault قد يعيد تحميل الموقع. حذف شرط term يسمح ببحث فارغ. حذف encodeURIComponent قد يسبب مشكلة عند الرموز الخاصة.

## useEffect من البداية للنهاية

~~~jsx
useEffect(() => {
  const requestId = ++requestIdRef.current;
  // رقم يميز طلب البحث الحالي
  const controller = new AbortController();
  // Effect وسيلة لإلغاء طلب الشبكة السابق عند تنظيف الـ

  const fetchSuggestions = async () => {
    if (!serachTerm.trim() || serachTerm.trim() === submittedTerm) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    try {
      const res = await fetch(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(
          serachTerm.trim(),
        )}`,
        {
          signal: controller.signal,
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await res.json();

      if (requestId !== requestIdRef.current) return;
      // لو الطلب اللي رجع مش هو الطلب الحالي، تجاهل النتيجة وما تحدّثش الاقتراحات

      setSuggestions(data.products?.slice(0, 5) || []);
      setHasSearched(true);
    } catch (error) {
      if (error.name !== "AbortError" && requestId === requestIdRef.current) {
        console.log("Search Error:", error);
        setSuggestions([]);
      }
    }
  };

  const timeoutId = setTimeout(() => {
    fetchSuggestions();
  }, 300);

  return () => {
    clearTimeout(timeoutId);
    controller.abort();
    if (requestId === requestIdRef.current) {
      requestIdRef.current += 1;
    }
  }; // ويلغي طلب الشبكة، ويبطل صلاحية الطلب لو لسه هو الطلب الحالي timeout وده بيعمل تنظيف للـ
}, [serachTerm, submittedTerm]);
~~~

### بداية effect ورقم الطلب

- useEffect ينفذ بعد render.
- requestIdRef.current يزيد واحدًا، وتُحفظ القيمة الجديدة في requestId المحلي لهذا التشغيل.
- مثال: requestId قد يكون 4 لهذا البحث. لو تغير النص وبدأ طلب جديد، سيحصل على رقم مختلف.
- التعليق يشرح أن الرقم يميز الطلب؛ التعليق لا ينفذ كودًا.
- controller هو AbortController مستقل لهذا التشغيل من effect.

### fetchSuggestions وasync/await

- fetchSuggestions دالة async؛ تعريفها لا يرسل الطلب وحده. setTimeout يستدعيها لاحقًا.
- async تسمح باستخدام await داخلها.
- await ينتظر العملية غير المتزامنة داخل الدالة، مثل وصول رد fetch، من غير ما يجمّد تفاعل المستخدم مع الصفحة.
- شرط البداية: النص فارغ بعد trim، أو النص الحالي يساوي submittedTerm.
- في الحالتين نمسح الاقتراحات ونجعل hasSearched false ثم return لإنهاء الدالة.
- الشرط يمنع البحث عن الفراغ، ويمنع إعادة طلب اقتراحات بعد Enter أو اختيار المنتج لنفس النص.

### fetch وعنوان DummyJSON

- try يحتوي عمليات يمكن أن تفشل، حتى نمسك أخطاءها في catch.
- fetch يرسل طلب HTTP إلى endpoint البحث عن منتجات DummyJSON.
- q هو معامل البحث في الرابط.
- trim يشيل المسافات الطرفية من العبارة.
- encodeURIComponent يرمز قيمة q؛ مثلًا المسافة تصبح ترميز URL، و& لا يُفسر كفاصل query.
- await fetch ينتظر الرد ويحفظه في res.
- signal: controller.signal يربط الطلب بأداة الإلغاء. استدعاء controller.abort() يطلب من المتصفح إلغاء الطلب.
- res.ok يفحص حالة HTTP. fetch لا يرمي تلقائيًا خطأ لكل رد 404 أو 500.
- عند !res.ok ينشئ throw new Error خطأ ينتقل إلى catch.
- await res.json() يقرأ جسم الرد ويحوله من JSON إلى كائن JavaScript اسمه data.

### فحص requestId قبل تحديث الحالة

~~~jsx
if (requestId !== requestIdRef.current) return;
~~~

ده حارس يمنع النتيجة القديمة من تحديث الواجهة. الطلب يحتفظ بقيمة requestId وقت بدايته؛ requestIdRef.current يعرض أحدث رقم الآن. لو اختلفا، الطلب صار قديمًا فنخرج بـreturn قبل setSuggestions وsetHasSearched.

التحقق مهم حتى لو عندنا AbortController: الإلغاء وسيلة لإيقاف الشبكة، أما مقارنة الرقم فهي فحص إضافي يمنع استخدام نتيجة قديمة إذا انتهى الطلب أو وصل الرد قرب لحظة الإلغاء.

### حفظ الاقتراحات بعد النجاح

~~~jsx
setSuggestions(data.products?.slice(0, 5) || []);
setHasSearched(true);
~~~

- data.products هي المنتجات التي رجعها API.
- علامة الاستفهام بعد products هي Optional Chaining، وتُكتب ?.؛ معناها: نفّذ slice فقط لو data.products مش null ومش undefined.
- slice(0, 5) يرجع أول خمسة عناصر في مصفوفة جديدة؛ لا يغير القائمة الأصلية.
- setSuggestions تحفظ الاقتراحات وتجعل React يعيد الرسم.
- setHasSearched(true) تعلن أن البحث اكتمل بنجاح.
- لو data.products تساوي null أو undefined، Optional Chaining توقف الوصول وترجع undefined بدل رمي خطأ. بعد ذلك || [] تختار مصفوفة فارغة، فتحصل setSuggestions على [] بأمان.
- لو data.products موجودة، ينفذ slice(0, 5) وتُحفظ أول خمسة منتجات. والمصفوفة الفارغة [] قيمة truthy في JavaScript، لذلك تظل نتيجة slice الفارغة [] ولا تستبدلها || [] .
- الفرق عن السطر السابق data.products.slice(0, 5) || [] أن السطر القديم كان يحاول قراءة slice من data.products مباشرة قبل تقييم || []. إذا كانت products غائبة أو null كان يحدث TypeError، ولا يصل التنفيذ إلى البديل []. السطر الحالي يضيف حماية من هذه الحالة.
- الحماية تخص غياب products أو كونها null فقط. لو data نفسها null/undefined، أو كانت products قيمة غير مناسبة لا تملك slice، فقد يظل هناك خطأ. الكود يتوقع عادةً أن data كائن API وأن products مصفوفة.
- إذا كانت المنتجات موجودة، يظهر dropdown. إذا كانت القائمة فارغة، تظهر رسالة عدم وجود اقتراحات.

### catch والأخطاء

- catch(error) يمسك فشل الشبكة أو خطأ HTTP الذي رميناه أو مشكلة أثناء قراءة/استخدام البيانات.
- AbortError معناه أن الطلب ألغي عمدًا؛ لا نطبعه كخطأ شبكة عادي.
- الشرط الثاني requestId === requestIdRef.current يتأكد أن الخطأ يخص آخر طلب فقط. خطأ الطلب القديم يُتجاهل.
- عند خطأ حالي، console.log يكتب تفاصيل للمطور في Console، وsetSuggestions([]) يمسح أي اقتراحات.
- لا يصبح hasSearched true في فرع الخطأ؛ لذلك No suggestions found تعني بحثًا ناجحًا بلا منتجات. الفشل يسجل في Console فقط ولا يعرض رسالة خطأ للمستخدم في هذا المكوّن.

## setTimeout وcleanup

### setTimeout

~~~jsx
const timeoutId = setTimeout(() => {
  fetchSuggestions();
}, 300);
~~~

- setTimeout يجدول تنفيذ الدالة بعد وقت.
- الرقم 300 بوحدة millisecond، أي 0.3 ثانية.
- عند توقف المستخدم عن الكتابة لهذه الفترة، يبدأ fetchSuggestions.
- هذا تأخير بسيط يقلل طلبًا مع كل حرف أثناء الكتابة السريعة.
- timeoutId هو معرّف المؤقت كي نستطيع إلغاءه.
- لو حذفنا التأخير سيبدأ طلبات أكثر للعبارات الوسيطة مثل H ثم HP ثم HPH.

### cleanup

~~~jsx
return () => {
  clearTimeout(timeoutId);
  controller.abort();
  if (requestId === requestIdRef.current) {
    requestIdRef.current += 1;
  }
};
~~~

React يشغل الدالة الراجعة قبل تشغيل effect جديد بسبب تغير dependency، أو عند إزالة المكوّن.

- clearTimeout يلغي المؤقت إذا لم ينته بعد؛ فلا يبدأ طلب للكلمة السابقة.
- controller.abort يلغي fetch إذا كان قد بدأ.
- المقارنة تتأكد أن هذا effect ما زال صاحب أحدث رقم. لو نعم، نزيد الرقم لإبطال صلاحيته.
- بهذه الطريقة نتعامل مع الطلب في ثلاث مراحل: إلغاء المؤقت، محاولة إلغاء الشبكة، ثم منع استعمال نتيجة الطلب القديم برقم الطلب.
- التعليق في الكود يشرح هذه الخطوات فقط ولا يغير التنفيذ.

### dependency array

~~~jsx
}, [serachTerm, submittedTerm]);
~~~

- المصفوفة تحدد متى يعاد effect.
- عند أول تركيب يعمل effect.
- عند تغير serachTerm يعمل cleanup القديم ثم effect جديد.
- عند تغير submittedTerm يحصل الشيء نفسه.
- لا توجد location ضمن dependencies؛ التنقل وحده لا يبدأ fetch جديدًا ولا يخفي الاقتراحات.
- عند الانتقال من Shop إلى Home، TopHeader يبقى خارج Routes ومحتوى البحث يبقى mounted، لذلك النص والحالات تبقى. لأن isFresh لا يفحص الصفحة، تظل الاقتراحات الناجحة ظاهرة.
- لو أضفنا dependency للموقع قد نعيد جلب اقتراحات لمجرد الانتقال، وهذا غير مطلوب.

## JSX والحقل والنموذج

### الحاوية والنموذج

~~~jsx
return (
  <div className="relative">
    <form
      onSubmit={handleSbumit}
      className="flex items-center bg-bg rounded-4xl border border-main"
    >
~~~

- return يحدد الواجهة التي يرجعها المكوّن.
- JSX صياغة لعناصر الواجهة داخل JavaScript.
- div حاوية البحث.
- relative يحدد مرجع التموضع للقائمة والرسالة اللتين تستخدمان absolute.
- form يجمع input وزر الإرسال.
- onSubmit يربط إرسال النموذج بـhandleSbumit.
- className هي طريقة React لكتابة أصناف CSS. الأصناف هنا من Tailwind: flex لترتيب العناصر، items-center لمحاذاتها، bg-bg للخلفية، rounded للزوايا، وborder للإطار.
- تغيير الأصناف يغير التصميم، لذلك لا نحتاجها لتفسير منطق البحث ولا نغيرها هنا.

### حقل input وonChange

~~~jsx
<input
  className="h-11.25 w-full py-1! px-4! bg-bg rounded-tl-[30px] rounded-bl-[30px]"
  type="text"
  name="search"
  id="search"
  placeholder="Search For Products"
  onChange={(e) => {
    setSerachTerm(e.target.value);
    setSubmittedTerm("");
    invalidateSuggestions();
  }}
  autoComplete="off"
/>
~~~

- input عنصر إدخال.
- className يحدد الارتفاع والعرض والمسافات والخلفية واستدارة الزاويتين اليسريين؛ لا يغير منطق البحث.
- type text يجعل الحقل يقبل نصًا.
- name اسم الحقل في form وid معرفه.
- placeholder يظهر كإرشاد والحقل فارغ.
- onChange يعمل عند كتابة أو مسح حرف.
- e هو حدث التغيير، وe.target هو input، وe.target.value النص الجديد.
- setSerachTerm تحفظ الكلمة الجديدة؛ هذا يغير dependency في effect فيبدأ مؤقت جديد.
- setSubmittedTerm("") يمسح علامة العبارة السابقة حتى يسمح بطلب اقتراحات للنص الحالي.
- invalidateSuggestions تبطل رقم الطلب القديم وتمسح الاقتراحات وتعطل ظهورها.
- autoComplete off يطلب من المتصفح عدم إظهار اقتراحاته المحفوظة التي قد تتداخل مع قائمة الموقع.
- لا توجد value={serachTerm} على الحقل، لذلك النص نفسه غير مضبوط بالكامل بواسطة React؛ المتصفح يحتفظ به في input وonChange يبلغ المكوّن عند تغيره.

## زر البحث وEnter

~~~jsx
<button
  type="submit"
  className="w-11.25 h-11.25 flex items-center justify-center bg-main text-lg cursor-pointer rounded-tr-[30px] rounded-br-[30px]"
>
  <FaSearch className="text-white" />
</button>
~~~

- button زر تفاعل.
- type submit يرسل form.
- FaSearch يعرض أيقونة العدسة، وtext-white يجعلها بيضاء.
- بقية الأصناف تنسق المقاس واللون والمحاذاة والمؤشر والزوايا.
- الضغط على الزر يشغل onSubmit، تمامًا مثل الضغط على Enter داخل input؛ كلاهما يستدعي handleSbumit.

## قائمة الاقتراحات وLink

~~~jsx
{isFresh && suggestions.length > 0 && (
  <ul className="absolute bg-white w-full! list-none mt-1! border border-border z-50">
    {suggestions.map((item) => (
      <Link
        key={item.id}
        to={`/products/${item.id}`}
        onClick={() => {
          setSubmittedTerm(serachTerm.trim());
          invalidateSuggestions();
        }}
      >
        <li className=" flex items-center gap-2 py-1! px-2! border-b border-border">
          <img
            className="w-10! h-10 object-contain"
            src={item.images[0]}
            alt={item.title}
          />{" "}
          <span className="text-sm">{item.title}</span>
        </li>
      </Link>
    ))}
  </ul>
)}
~~~

- الأقواس المعقوفة تسمح بإدخال JavaScript داخل JSX.
- شرط العرض يتطلب isFresh صحيحة وsuggestions فيها عنصر على الأقل.
- && تعرض العنصر عند تحقق الشرط.
- ul قائمة HTML للاقتراحات. absolute يضعها فوق الصفحة بالنسبة إلى الحاوية relative. الأصناف الأخرى تنسق الخلفية والعرض والهامش والإطار وطبقة الظهور.
- map تمر على كل منتج وتبني صفًا.
- item هو المنتج الحالي في الدورة.
- Link رابط داخلي ينقل إلى تفاصيل المنتج، مثل /products/12 عند id يساوي 12.
- key={item.id} يعطي React معرفًا ثابتًا لكل عنصر في القائمة.
- onClick قبل التنقل يسجل نص البحث في submittedTerm ويبطل الطلب ويمسح الاقتراحات. تحديث submittedTerm يجعل effect ينظف التشغيل السابق، والشرط داخله يمنع طلبًا جديدًا لنفس النص.
- li يمثل صف الاقتراح.
- img تعرض أول صورة من item.images. src رابط الصورة وalt وصف بديل بعنوان المنتج.
- {" "} يضيف مسافة نصية بين الصورة والعنوان.
- span يعرض item.title.
- الضغط على المنتج يظل ينقل إلى التفاصيل، لكن القائمة تمسح قبل التنقل ولا يعيد طلب قديم إظهارها.

## رسالة عدم وجود اقتراحات

~~~jsx
{isFresh && serachTerm.trim() && suggestions.length === 0 && (
  <p className="absolute bg-white w-full p-3! border border-border z-50">
    No suggestions found.
  </p>
)}
~~~

- isFresh تعني أن hasSearched صحيحة.
- serachTerm.trim() يمنع الرسالة لو الحقل فارغ أو فيه مسافات فقط.
- suggestions.length === 0 يعني أن البحث الناجح لم يرجع عناصر.
- يلزم تحقق الشروط الثلاثة معًا.
- p تعرض الرسالة، والأصناف تضعها في صندوق منسق تحت الحقل.
- عند Enter أو اختيار منتج تجعل invalidateSuggestions hasSearched false، فلا تظهر الرسالة في صفحة النتائج أو التفاصيل.
- عند فشل الطلب، لا يجعل catch hasSearched true، فلا يخلط بين فشل الشبكة وبين بحث ناجح بلا اقتراحات.

## رحلات عملية داخل GoShop

### من كتابة أول حرف إلى ظهور النتائج

1. المستخدم يكتب H.
2. onChange تحفظ H، تمسح submittedTerm وتستدعي invalidateSuggestions.
3. عداد requestIdRef يزيد فتُبطل أي نتيجة قديمة، والاقتراحات القديمة تُمسح.
4. تغير serachTerm يجعل React يشغل effect جديدًا؛ ينظف المؤقت/الطلب السابق.
5. effect يزيد عداد الطلب وينشئ controller ويضبط مؤقت 300ms.
6. لو كتب المستخدم P قبل انتهاء المؤقت، cleanup يلغي مؤقت H. يبدأ تشغيل جديد لعبارة HP.
7. بعد توقفه 300ms، fetchSuggestions تطلب المنتجات المطابقة لـHP من DummyJSON.
8. عند النجاح، يتحقق requestId أن هذا ما زال أحدث طلب، ثم يحفظ أول خمسة منتجات ويجعل hasSearched true.
9. JSX يعرض القائمة لأن isFresh صحيحة وطول suggestions أكبر من صفر.

### الانتقال من Shop إلى Home مع بقاء كلمة البحث

1. يكتب المستخدم HP في صفحة Shop، فتُحفظ الاقتراحات بعد نجاح الطلب.
2. TopHeader وSerachBox مستمران لأن الهيدر موضوع خارج Routes في App.
3. الانتقال إلى Home لا يغير serachTerm ولا submittedTerm؛ لذلك effect لا يعيد طلب الاقتراحات.
4. لا توجد مقارنة location.key، وisFresh تظل true. النص والاقتراحات يظلان ظاهرين في Home.
5. لو لم توجد اقتراحات، تظهر رسالة عدم العثور فقط إذا كان الطلب قد نجح وhasSearched true.

### الضغط على Enter أو زر العدسة

1. يرسل المستخدم العبارة الحالية.
2. handleSbumit يمنع إعادة التحميل وينظف النص بـtrim.
3. عند وجود نص، setSubmittedTerm تحفظه وinvalidateSuggestions تزيد رقم الطلب، وتمسح القائمة وتجعل hasSearched false.
4. navigate يفتح /search?query=...
5. تغير submittedTerm يعيد effect؛ بعد التأخير يرى شرط التطابق بين النص وsubmittedTerm، فيخرج من دون طلب اقتراحات لنفس العبارة.
6. isFresh false، لذلك الاقتراحات لا تظهر مرة أخرى على صفحة النتائج.
7. صفحة SerachResults تجلب نتائج الصفحة بشكل مستقل.

### اختيار منتج من القائمة

1. المستخدم يضغط اقتراحًا.
2. onClick يسجل نص الحقل في submittedTerm ويستدعي invalidateSuggestions.
3. القائمة تمسح فورًا، ويتقدم عداد الطلب لإبطال أي رد قديم.
4. Link ينتقل إلى /products/{id}.
5. effect الناتج عن submittedTerm لا يجلب اقتراحات لهذا النص.
6. صفحة تفاصيل المنتج تظهر، ولا تعود القائمة للظهور.

### منع رد قديم من تحديث القائمة

افترض أن طلب HP رقمه 3، ثم المستخدم غيّر النص وبدأ طلب HTML رقمه 5. لو رجع HP متأخرًا، سيقارن الكود requestId المحلي 3 بالعداد الحالي 5. لأنهما مختلفان، ينفذ return ولا يحدث suggestions. AbortController يحاول إلغاء الطلب، ورقم الطلب يحمي الواجهة حتى لو وصل رد قديم قرب الإلغاء.

## معاني المصطلحات

- **Hook:** وظيفة من React تضيف للمكوّن سلوكًا مثل الحالة أو الآثار الجانبية.
- **State:** بيانات المكوّن التي يؤدي تحديثها إلى إعادة الرسم.
- **Ref:** حاوية تحتفظ بقيمة في current بين عمليات الرسم، وتغييرها وحده لا يعيد الرسم.
- **Render:** حساب React لشكل الواجهة المطلوب عرضه.
- **Effect:** عمل جانبي بعد render، مثل طلب HTTP.
- **Dependency array:** مصفوفة تحدد القيم التي يؤدي تغيرها إلى تشغيل effect من جديد.
- **Cleanup:** دالة ينفذها React لتنظيف effect السابق.
- **Promise:** تمثيل لعملية غير متزامنة ستنجح لاحقًا أو تفشل.
- **async/await:** صياغة لترتيب انتظار العمليات غير المتزامنة بطريقة مقروءة.
- **HTTP response:** رد الخادم على طلب الشبكة، ويضم حالة مثل 200 أو 404 وجسم البيانات.
- **API:** واجهة يطلب التطبيق عبرها بيانات من خدمة أخرى.
- **Stale/قديمة:** نتيجة طلب لم تعد تخص النص الحالي أو لم تعد مطلوبة.
- **Debounce:** تأخير قصير حتى يتوقف المستخدم عن الكتابة قبل تنفيذ الطلب؛ هنا 300ms مع إلغاء المؤقت السابق.
- **JSX:** صياغة تشبه HTML نكتب بها واجهة React داخل JavaScript.
- **Conditional rendering:** عرض عنصر فقط إذا تحقق شرط.
- **map:** دالة مصفوفة تنشئ قيمة مقابلة لكل عنصر، وهنا عنصر واجهة لكل منتج.
- **Route:** مسار في التطبيق يحدد الصفحة التي تعرضها React Router.

## خلاصة

useState تحفظ نص البحث والاقتراحات وحالة نجاحها والعبارة المعالجة. useRef يحمل رقم الطلب من غير renders إضافية. invalidateSuggestions تمسح الاقتراحات وتبطل الطلب الجاري. useEffect يؤخر الطلب ويجلب البيانات ويلغي المؤقت والطلب عند تغير الاعتماديات. requestId يمنع الرد القديم من تعديل الحالة. isFresh الآن تعني hasSearched فقط، لذلك التنقل العادي إلى Home لا يخفي الاقتراحات. أما Enter واختيار المنتج فيبطلانها صراحةً قبل الانتقال. لم يتغير التصميم أو الكلاسات في هذا الشرح، ولم يعدّل هذا الملف أي كود.

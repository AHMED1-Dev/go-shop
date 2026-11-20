# شرح Checkout وContact والملفات المرتبطة

الشرح ده مبني على الكود الحالي في `src/page/Checkout/Checkout.jsx` و`src/page/Contact/Contact.jsx`، وعلى الملفات المحلية اللي بيستخدموها. النماذج في المشروع تجريبية: مفيش backend بيحفظ طلب Checkout أو يرسل رسالة Contact.

## الصورة العامة وانتقال البيانات

```text
main.jsx
└── CartProvider
    └── App
        ├── /checkout → Checkout
        └── /contact  → Contact

Checkout / Contact
├── FormField       يعرض الحقول ويربطها بالـstate
├── useForm         يحتفظ بالقيم والأخطاء ويتحقق منها
├── validators      يحدد قواعد التحقق
└── CartContext     Checkout يقرأ منه السلة ويمسحها بعد تأكيد الطلب
```

في النموذج، `FormField` يرسل حدث التغيير إلى `handleChange` في `useForm`. الـhook يحدّث `values`، فتظهر القيمة الجديدة في الحقل لأن `value` مربوط بالـstate. عند الإرسال، `handleSubmit` يمنع إعادة تحميل الصفحة، ويشغّل `validate`. لو البيانات سليمة ينادي دالة الإرسال؛ لو فيها أخطاء، يخزنها في `errors` وتعرضها `FormField` تحت الحقول.

## `src/page/Checkout/Checkout.jsx`

### الاستيرادات

- `useContext` من React لقراءة قيمة `CartContext`، و`useState` لحفظ رقم الطلب بعد الإرسال.
- `Link` من React Router لعرض رابط انتقال للـShop في صفحة التأكيد من غير تحميل صفحة كامل.
- `CartContext` من `CartContextValue.jsx` للوصول إلى `cartItems` و`clearCart`.
- `FormField` مكوّن المشروع المشترك لعرض input أو textarea مع label ورسالة خطأ.
- `useForm` لإدارة قيم حقول Checkout وأخطاء التحقق ومعالجة التغيير والإرسال.
- `required` و`phone` و`minLength` قواعد التحقق المستوردة من `validators.jsx`.

### قواعد التحقق

```jsx
const rules = {
  fullName: [required("Full name")],
  phone: [required("Phone"), phone],
  city: [required("City")],
  address: [required("Address"), minLength("Address", 10)],
};
```

المفاتيح هنا لازم تطابق `name` للحقول. الاسم والمدينة مطلوبان. الهاتف لازم يكون موجودًا ثم يطابق صيغة رقم الهاتف. العنوان لازم يكون موجودًا وطوله 10 أحرف على الأقل. كل قاعدة ترجع نص الخطأ عند الفشل أو نصًا فارغًا عند النجاح.

### المكوّن والحالة

```jsx
function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const [orderNumber, setOrderNumber] = useState(null);
```

`Checkout` هو مكوّن صفحة الدفع. `useContext` يقرأ السلة المشتركة. `orderNumber` يبدأ بـ`null`؛ بعد نجاح الإرسال يصبح نصًا مثل `GS-12345678`. وجود الرقم هو العلامة التي تحدد عرض صفحة التأكيد.

```jsx
const { values, errors, handleChange, handleSubmit } = useForm(
  { fullName: "", phone: "", city: "", address: "" },
  rules,
);
```

القيمة الأولى هي القيم الابتدائية للحقول، والثانية قواعد التحقق. الـhook يرجع القيم الحالية والأخطاء والدوال المستخدمة في الحقول والنموذج.

### ملخص الطلب والأسعار

```jsx
const subtotal = cartItems.reduce(
  (acc, item) => acc + item.price * item.quantity,
  0,
);
const shipping = subtotal > 0 ? 5 : 0;
const total = (subtotal + shipping).toFixed(2);
```

`reduce` يجمع سعر كل منتج مضروبًا في كميته، ويبدأ من صفر. الشحن ثابت بقيمة 5 عندما يكون الإجمالي قبل الشحن أكبر من صفر، وإلا يساوي صفرًا. `toFixed(2)` يحوّل الناتج إلى نص بمنزلتين عشريتين للعرض. هذه الحسابات تحصل في الواجهة وتعتمد على بيانات السلة؛ لا يوجد تحقق من السعر على خادم في المشروع الحالي.

### إرسال الطلب وإنشاء رقم التأكيد

```jsx
const onPlaceOrder = () => {
  // يتم إنشاء رقم الطلب عند إرسال النموذج فقط.
  // eslint-disable-next-line react-hooks/purity
  const number = `GS-${Date.now().toString().slice(-8)}`;

  setOrderNumber(number);
  clearCart();
};
```

`onPlaceOrder` هي دالة النجاح التي يمررها النموذج إلى `handleSubmit`. بعد اجتياز التحقق، تنشئ رقمًا يبدأ بـ`GS-` ويتبعه آخر 8 أرقام من وقت الجهاز بالـmilliseconds. `Date.now()` لا ينشئ رقمًا محفوظًا في backend، ولا يضمن وحده عدم تكرار الرقم؛ هو رقم تجريبي لواجهة التأكيد.

التعليق `eslint-disable-next-line react-hooks/purity` يطلب من ESLint تجاهل قاعدة `react-hooks/purity` في **السطر التالي فقط**. أضيف لأن ESLint أبلغ عن `Date.now()` كاستدعاء غير نقي، رغم أن `onPlaceOrder` تُستدعى من callback الإرسال بعد تحقق النموذج، لا أثناء رسم JSX. التعليق لا يغير JavaScript ولا سلوك الموقع، ولا يخفي أخطاء بقية الملف أو الأسطر.

بعد إنشاء الرقم، `setOrderNumber` يغيّر الحالة كي يعيد React رسم المكوّن بصفحة التأكيد. `clearCart` يفرّغ السلة المشتركة؛ وProvider يحفظ التغيير في `localStorage` عبر effect الموضح لاحقًا. لا يرسل هذا الكود تفاصيل الطلب إلى خادم.

### فرع صفحة التأكيد والسلة الفارغة

```jsx
if (orderNumber) { ... }
```

لو `orderNumber` موجود، المكوّن يرجع صفحة نجاح بدل نموذج Checkout. الصفحة تعرض علامة نجاح، عنوان التأكيد، شكرًا، رقم الطلب، و`Link` للعودة إلى `/shop`. هذا الشرط يسبق شرط السلة الفارغة؛ لذلك بعد `clearCart` تظل صفحة التأكيد ظاهرة في نفس المكوّن.

```jsx
if (cartItems.length === 0) { ... }
```

لو مفيش رقم تأكيد والسلة فارغة، يرجع المكوّن رسالة أن السلة فارغة ورابطًا للـShop بدل عرض نموذج لا يحتوي منتجات.

### نموذج بيانات الشحن

```jsx
<form
  id="checkout-form"
  onSubmit={handleSubmit(onPlaceOrder)}
  noValidate
>
```

`id` يربط زر Place Order بالنموذج. `handleSubmit(onPlaceOrder)` ينشئ event handler؛ عند submit يستدعي `preventDefault` ويتحقق من القيم ثم ينفذ `onPlaceOrder` عند النجاح فقط. `noValidate` يمنع فقاعات التحقق الأصلية للمتصفح، لأن قواعد المشروع تعرض رسائلها بنفسها.

كل استدعاء لـ`FormField` يمرر `label` و`name` و`value` و`onChange` و`error` و`placeholder`. الاسم والهاتف في صف ذي عمودين عند المساحة المناسبة؛ المدينة والعنوان أسفلهما. حقل العنوان يمرر `textarea` ليعرض مساحة نصية. `name` يحدد خاصية `values` التي سيحدثها `handleChange`.

قسم الدفع يعرض خيار Cash on Delivery على هيئة radio محدد (`checked`) وغير قابل للتغيير (`readOnly`). لا توجد معالجة دفع أو اختيار وسيلة أخرى في الكود الحالي.

### ملخص المنتجات وزر الطلب

```jsx
{cartItems.map((item) => (...))}
```

يعرض كل عنصر في السلة باستخدام `item.id` كمفتاح React. الصورة والعنوان والكمية والسعر مأخوذة من عنصر السلة. إجمالي السطر هو `item.price * item.quantity` ويعرض بمنزلتين عشريتين. بعد القائمة يعرض `subtotal` والشحن و`total` المحسوبة أعلاه.

زر Place Order موضوع خارج عنصر `<form>` بصريًا داخل `<aside>`، لكنه يحمل `form="checkout-form"` و`type="submit"`؛ لذلك يرسل نموذج بيانات الشحن المرتبط بالـid. لا يغير الزر قواعد التحقق أو يستدعي الطلب مباشرة.

## `src/page/Contact/Contact.jsx`

### الاستيرادات

- `toast` من `react-hot-toast` لإظهار إشعار نجاح في الواجهة. المكتبة نفسها موصولة بالتطبيق عبر `<Toaster />` في `App.jsx`.
- `FaPhone` و`FaEnvelope` و`FaLocationDot` و`FaClock` أيقونات من `react-icons/fa6` لبطاقات معلومات التواصل الثابتة.
- `FormField` لعرض حقول الاسم والبريد والموضوع والرسالة.
- `useForm` لإدارة قيم النموذج وأخطائه وإرساله وإعادة ضبطه.
- `required` و`email` و`minLength` للتحقق من المدخلات.

### قواعد التحقق

```jsx
const rules = {
  name: [required("Name")],
  email: [required("Email"), email],
  subject: [required("Subject")],
  message: [required("Message"), minLength("Message", 10)],
};
```

كل الحقول مطلوبة. البريد يمر أولًا باختبار عدم الفراغ ثم اختبار صيغة البريد. الرسالة مطلوبة وطولها 10 أحرف على الأقل. القواعد مرتبطة بمفاتيح `name` الموجودة في عناصر `FormField`.

### الحالة ودالة الإرسال

```jsx
const { values, errors, handleChange, handleSubmit, reset } = useForm(
  { name: "", email: "", subject: "", message: "" },
  rules,
);
```

كل حقل يبدأ فارغًا. `values` تعرض القيم الحالية، و`errors` أخطاء التحقق، و`handleChange` يحدّث القيمة، و`handleSubmit` يعالج الإرسال، و`reset` يعيد النموذج إلى حالته الابتدائية.

```jsx
const onSend = () => {
  toast.success("This is a demo form. Message sending is not available yet.");
  reset();
};
```

الدالة لا تستقبل `data` لأن النموذج لا يرسل رسالة إلى أي backend ولا يحتاج القيم بعد التحقق. عند صحة المدخلات تظهر رسالة Toast توضح أن الإرسال غير متاح لأنه نموذج تجريبي، ثم يمسح `reset` القيم والأخطاء. لو فشل التحقق، `handleSubmit` لا ينادي `onSend`؛ لذلك لا تظهر رسالة النجاح ولا تُمسح القيم.

### بيانات التواصل الثابتة والعرض

```jsx
const info = [ ... ];
```

`info` مصفوفة معلومات ثابتة عن المتجر: العنوان والهاتف والبريد وساعات العمل، وكل عنصر يحتوي الأيقونة والاسم والنص. هذه بيانات عرض مكتوبة في الكود، وليست بيانات أدخلها زائر النموذج.

في `return` يعرض العنوان والوصف، ثم يمر على `info` بـ`map` لإنشاء بطاقة لكل معلومة. بعدها يعرض النموذج. `onSubmit={handleSubmit(onSend)}` يربط الإرسال بالتحقق. `noValidate` يجعل رسائل قواعد `useForm` هي المعروضة بدل التحقق المدمج في المتصفح. كل `FormField` يحصل على قيمته وخطئه ومعالج التغيير من `useForm`؛ حقل Email يمرر `type="email"` لتحسين نوع لوحة المفاتيح/دلالة الحقل، مع بقاء التحقق الفعلي في `validators` بسبب `noValidate`.

## الملفات المحلية المرتبطة

### `src/conponents/FormField.jsx`

`FormField` مكوّن عرض مشترك، وليس مالكًا لحالة الحقل. يستقبل `label`, `name`, `type`, `value`, `onChange`, `error`, `textarea`, و`placeholder` كـprops. `type` افتراضي إلى `text`، و`textarea` افتراضي إلى `false`.

`baseStyle` يجمع تنسيق الحقل المشترك. `borderStyle` يختار لون إطار الخطأ أو إطار الحالة العادية. يربط `<label htmlFor={name}>` التسمية بمعرّف العنصر. لو `textarea` صحيحة يرسم `<textarea>`، وإلا يرسم `<input>`. في الحالتين `id` و`name` يساويان الاسم، و`value` و`onChange` يأتيان من الصفحة؛ بهذا يظل الحقل controlled بواسطة `useForm`. التعبير `{error && <p>...</p>}` يعرض رسالة التحقق فقط عند وجودها.

### `src/conponents/useForm.jsx`

- يستورد `useState` من React ويصدر الدالة `useForm(initialValues, rules)`.
- `values` حالة القيم الحالية، و`errors` حالة رسائل الأخطاء.
- `handleChange(e)` يقرأ `name` و`value` من `e.target`، ثم يستخدم تحديثًا وظيفيًا لـ`setValues` وينسخ القيم القديمة مع تحديث الخاصية المحددة (`[name]`). لو كان للحقل خطأ ظاهر، يمسح رسالة ذلك الحقل أثناء الكتابة؛ لا يعيد التحقق الكامل إلا في submit.
- `validate()` يبدأ بـ`newErrors`، ويمر على مفاتيح `rules`. لكل حقل يشغّل قواعده بالترتيب ويمرر لها `values[field]` وكائن `values` كاملًا. أول رسالة خطأ تُحفظ ويوقف بقية قواعد ذلك الحقل. بعد ذلك يحدّث `errors` ويرجع `true` فقط لو لم تتكون أخطاء.
- `handleSubmit(onValid)` يرجع event handler للنموذج. هذا handler يمنع الإرسال الافتراضي، وينادي `validate()`، ثم ينادي `onValid(values)` عند نجاح التحقق.
- `reset()` يعيد `values` إلى `initialValues` ويمسح `errors`.
- يرجع الـhook هذه القيم والدوال لتستخدمها الصفحات. في النسخة الحالية لا توجد فيه سجلات Console.

### `src/conponents/validators.jsx`

- `required(label)` ينشئ قاعدة تفحص `value.trim()`. القيمة الفارغة أو المسافات فقط تنتج رسالة مثل `Name is required`.
- `email(value)` يختبر صيغة عامة بواسطة Regex يتوقع نصًا قبل `@` وبعده ونقطة وامتدادًا. ده فحص صيغة بسيط، وليس تحققًا من أن البريد موجود فعلًا.
- `minLength(label, min)` ينشئ قاعدة تقارن `value.length` بالحد الأدنى، وترجع رسالة عند القصر.
- `phone(value)` يحذف المسافات ثم يقبل اختيارية `+` وبعدها من 10 إلى 13 رقمًا. لا يتحقق من ملكية الرقم أو صحته لدى شركة اتصالات.

الـvalidator لا يعدل النموذج ولا يعرض الرسالة بنفسه؛ يرجع نصًا إلى `validate` في `useForm`، والـhook يخزن النص في `errors`، ثم يعرضه `FormField`.

### `src/conponents/context/CartContextValue.jsx`

ينشئ `CartContext` باستخدام `createContext()` ويصدره. ده تعريف قناة مشاركة البيانات فقط؛ لا يحتوي على بيانات السلة أو دوال تعديلها. القيمة الفعلية يضعها `CartProvider` في ملف `CartContext.jsx`.

### `src/conponents/context/CartContext.jsx`

هذا الملف يعرّف `CartProvider` ويوفر قيمة السياق.

- `isValidFavorite(item)` يفحص شكل المنتج الأساسي المطلوب للمفضلة: object صالح ومعرّف وعنوان وصور وسعر وتقييم وخصم بأنواع متوقعة.
- `isValidCartItem(item)` يعيد نتيجة الفحص الأساسي ويشترط كمية رقمية لا تقل عن 1.
- `readSavedList(key, isValidItem)` يقرأ من `localStorage` داخل `try/catch`. عند غياب القيمة أو فساد JSON أو كون المحتوى ليس مصفوفة أو وجود عنصر غير صالح يرجع `[]`.
- `CartProvider({ children })` ينشئ حالتي `favorites` و`cartItems` من التخزين المحلي. يوفر دوال إضافة وإزالة المفضلة، إضافة منتج للسلة، زيادة/تقليل الكمية، إزالة عنصر، ومسح السلة. `clearCart` يستدعي `setCartItems([])`.
- `useEffect` يكتب `favorites` و`cartItems` إلى `localStorage` عند تغيرهما.
- `CartContext.Provider` يمرر الحالات والدوال في `value` لكل `children`. لذلك `Checkout` يستطيع قراءة `cartItems` واستدعاء `clearCart` من غير تمرير props خلال كل طبقات التطبيق.

### `src/main.jsx` و`src/App.jsx`: تركيب السياق والصفحتين

`main.jsx` يستورد `CartProvider` ويلف `<App />` به داخل `BrowserRouter` و`StrictMode`. هذا يجعل قيمة السلة متاحة لصفحات التطبيق كلها. `App.jsx` يستورد `Checkout` و`Contact` ويضعهما على المسارين `/checkout` و`/contact`. كما يحتوي `<Toaster />` من `react-hot-toast` مرة واحدة على مستوى التطبيق؛ لذلك تظهر إشعارات `toast.success` التي تطلقها Contact.

## سجلات Console وحالة التحقق

سجلات Checkout التي كانت تطبع رقم الطلب وبيانات العميل وعناصر الطلب والإجمالي حُذفت. وسجل Contact الذي كان يطبع بيانات الرسالة حُذف؛ والسطر المعلق `console.log(values)` أزيل أيضًا. في `useForm.jsx` لا توجد سجلات Console في النسخة الحالية.

مسح المشروع الحالي وجد سجلًا فعّالًا واحدًا في `src/conponents/header/SerachBox.jsx`: `console.log("Search Error:", error)` داخل catch لطلب اقتراحات DummyJSON. الكود لا يمرر `serachTerm` إلى Console، ولا يسجل حقول Checkout/Contact أو بيانات الطلب/الرسالة. السجلات الأخرى التي ظهرت بالبحث كانت معلقة أو في ملفات شرح تاريخية.

فحص ESLint للملفات الثلاثة اكتمل بلا أخطاء أو تحذيرات بتاريخ 2026-11-21. هذا يثبت نتيجة lint فقط. لم أجد في سجل المشروع أو المحادثة نتيجة مؤكدة للاختبارات اليدوية المطلوبة (إرسال Checkout وظهور التأكيد ومسح السلة؛ إرسال Contact وظهور Toast ومسح النموذج؛ وإظهار أخطاء الحقول الفارغة)، ولم أتمكن من فحص واجهة المتصفح في هذه المراجعة. لذلك لا أسجل هذه الاختبارات كأنها نجحت، وتظل حالة البند 17 بانتظار تأكيد الاختبارات اليدوية قبل وضع `Resolved`.

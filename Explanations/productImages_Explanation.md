# شرح مكوّن صور المنتج

الملف `src/page/productDetails/productImages.jsx` يعرض صور المنتج المصغّرة والصورة الكبيرة المختارة. يستقبل كائن `product` من `ProductDetails`، ويستخدم الصور الموجودة في `product.images`.

## الاستيراد والحالة

```jsx
import { useState } from "react";

function ProductImages({ product }) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
```

- `useState` يحتفظ بعنوان الصورة التي يجب عرضها في المساحة الكبيرة.
- عند أول تركيب للمكوّن، تبدأ `selectedImage` بأول عنصر في `product.images`.
- `setSelectedImage` تغيّر الصورة المختارة عندما ينقر المستخدم صورة مصغّرة.
- لا يستخدم المكوّن `useEffect` حاليًا.

## الصور المصغّرة

يعرض `product.images.map(...)` زرًا لكل صورة. عند النقر على الزر تُحفظ صورته في `selectedImage`. يحدد `isActive` إن كانت الصورة المصغّرة هي المختارة، ويغيّر الكلاس لون إطارها. النص البديل يضم اسم المنتج ورقم الصورة، و`type="button"` يمنع الزر من إرسال نموذج.

```jsx
{product.images.map((img, index) => {
  const isActive = selectedImage === img;
  return (
    <button
      type="button"
      key={index}
      onClick={() => setSelectedImage(img)}
      className={`... ${isActive ? "border-main!" : "border-border! hover:border-main!"}`}
    >
      <img src={img} alt={`${product.title} ${index + 1}`} />
    </button>
  );
})}
```

## الصورة الكبيرة والتخطيط

```jsx
<img
  src={selectedImage}
  alt={product.title}
  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
/>
```

الصورة الكبيرة تأخذ `src` من الحالة، فتتغير عند النقر على صورة مصغّرة. `object-contain` يعرض الصورة كاملة داخل المساحة، والانتقال والتكبير عند المرور بالمؤشر يحافظان على السلوك البصري. الحاوية الرئيسية تستخدم Flex لوضع الصور المصغّرة والصورة الكبيرة بجانب بعضهما؛ وتحدد كلاسات Tailwind عروضًا وارتفاعات ومسافات تتغير مع نقاط `sm` و`md` و`lg`. لم تتغير هذه الكلاسات ضمن البند 19.

## لماذا حُذف `useEffect`؟

كان الكود السابق يستورد `useEffect` وينفذ:

```jsx
useEffect(() => {
  setSelectedImage(product.images[0]);
}, [product.id]);
```

وظيفته إعادة الصورة المختارة إلى أول صورة عندما يتغير معرّف المنتج. لكن `ProductDetails.jsx` يعرض الصفحة داخل `<PageTransition key={id}>`. عند تغير `id` تتغير قيمة `key`، فيزيل React شجرة الصفحة القديمة ويركب شجرة جديدة. `ProductImages` داخل هذه الشجرة، لذا يُعاد تركيبه وتبدأ حالته من جديد بقيمة `product.images[0]`. هذا يحقق إعادة الضبط نفسها دون Effect يحدّث الحالة مباشرة بعد العرض.

حذف الـEffect أزال تشخيص `react-hooks/set-state-in-effect`، كما أزال تحذير `react-hooks/exhaustive-deps` الذي ظهر لأن الـEffect يقرأ `product.images` بينما قائمة الاعتماديات كانت تحتوي `product.id` فقط. لذلك حُذف `useEffect` من الاستيراد أيضًا. لم يتغير تفاعل اختيار الصور أو التصميم.

## التحقق

- أكد المستخدم أن `npx eslint src/page/productDetails/productImages.jsx` أصبح بلا أخطاء أو تحذيرات.
- أكد المستخدم أن اختيار الصور المصغّرة يعمل.
- أكد المستخدم أن الانتقال بين منتجات السرير والسيارات واللابتوب يجعل كل منتج يبدأ بأول صورة.

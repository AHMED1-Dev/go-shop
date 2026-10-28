import { useState } from "react";

export function useForm(initialValues, rules) {
  /*
  { name: "", email: "" } القيم الابتدائية للحقول، زي : initialValues
  { name: [required("Name")] } القواعد لكل حقل، زي : rules
  */
  const [values, setValues] = useState(initialValues);
  // values: object فيه قيمة كل حقل دلوقتي. بيبدأ بالقيم الابتدائية.
  // values = { email: "", password: "" }
  const [errors, setErrors] = useState({});
  // errors: object فيه رسالة خطأ كل حقل. بيبدأ فاضي {} (مفيش أخطاء).
  // errors = {}

  const handleChange = (e) => {
    const { name, value } = e.target;
    /*
    value="a" و name="email" نفسه. فيه <input> هو الـ e.target
   value = "a" , name = "email" : بتسحب الاتنين const { name, value } = e.target
    */
    setValues((prev) => ({ ...prev, [name]: value }));
    /*
    { [name]: value }
     من غير الأقواس المربعة:
    const name = "email";
    const obj = { name: "a" };   // { name: "a" }  ← الاسم حرفياً "name"
    :معاها
    const name = "email";
    const obj = { [name]: "a" }; // { email: "a" }  ← اسم الخاصية = قيمة المتغير
    فلازم يتحدد وقت التشغيل. (email مرة، password مرة) واحدة بتخدم كل الحقول، فاسم الحقل بيتغيّر handleChange :وده سبب وجودها
    */

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    // بتعمل حاجة واحدة: تفحص كل حقل بالقواعد بتاعته، وتجمّع الأخطاء، وتقول: الفورم سليم ولا لأ؟ validate
    const newErrors = {}; // البداية
    // مرة واحدة state ومينفعش نعدّل فيها مباشرة. فبنجمّع في متغير عادي، وفي الآخر ندخله الـ state الموجودة؟ لأنها errors فاضي، هنحط فيه الأخطاء اللي نلاقيها. ليه مش بنستخدم object بنعمل

    Object.keys(rules).forEach((field) => {
      console.log("بنفحص الحقل:", field);
      for (const rule of rules[field]) {
        const message = rule(values[field], values);
        console.log("   قاعدة رجّعت:", message === "" ? "(سليم)" : message);
        if (message) {
          newErrors[field] = message;
          break;
        }
      }
    });
    /*
    Object.keys(rules)
    بتعمل إيه؟ Object.keys :دي أول حاجة سألت عنها
    فيها أسماء الخصائص بس (المفاتيح)، من غير القيم array وترجّع object بتاخد Object.keys(obj)
    */

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (onValid) => (e) => {
    e.preventDefault();
    if (validate()) onValid(values);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, handleChange, handleSubmit, reset };
}

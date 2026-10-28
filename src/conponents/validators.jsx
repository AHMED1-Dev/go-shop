export const required = (label) => (value) =>
  value.trim() === "" ? `${label} is required` : "";

export const email = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Enter a valid email";
/*
email: function عادية بتاخد القيمة مباشرة (مش محتاجة label لأن رسالتها ثابتة).
/^[^\s@]+@[^\s@]+\.[^\s@]+$/: Regex (نمط للتحقق من شكل النص). تفكيكه:
^ بداية النص.
[^\s@]+ حرف واحد أو أكتر ليس مسافة وليس @ (اسم المستخدم).
@ علامة @ لازم تتواجد.
[^\s@]+ الدومين (مثلاً gmail).
\. نقطة حرفية.
[^\s@]+ الامتداد (مثلاً com).
$ نهاية النص.
.test(value): بترجّع true لو النص بيطابق النمط، وfalse لو لأ.
لو true ارجع "" (سليم)، وإلا رسالة الخطأ.
*/
export const minLength = (label, min) => (value) =>
  value.length < min ? `${label} must be at least ${min} characters` : "";

export const phone = (value) =>
  /^\+?[0-9]{10,13}$/.test(value.replace(/\s/g, ""))
    ? ""
    : "Enter a valid phone number";

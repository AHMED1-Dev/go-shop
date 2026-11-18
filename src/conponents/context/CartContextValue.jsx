import { createContext } from "react";
//الدالة اللي بتعمل بيها "صندوق بيانات مشترك" بين كل المكونات - createContext بتستورد

export const CartContext = createContext();
// تاني محتاج يوصل لبيانات الكارت component معناها إنك هتقدر تستورده في أي CartContext. export هنا بتعمل الصندوق نفسه، واسمه

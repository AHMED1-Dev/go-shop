import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

function SerachBox() {
  const [serachTerm, setSerachTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSbumit = (e) => {
    e.preventDefault();
    // console.log(serachTerm);
    if (serachTerm.trim()) {
      // يكون مكتوب عليها قيمه search فاضي وانا دوست عليها ميرحش علي الصفحه فاضيه لازم  search علشان لو  serachTerm.trim() انا بعمل دي
      navigate(`/search?query=${encodeURIComponent(serachTerm.trim())}`);
    }
    setSuggestions([]);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!serachTerm.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://dummyjson.com/products/search?q=${encodeURIComponent(serachTerm)}`,
        );
        const data = await res.json();
        setSuggestions(data.products.slice(0, 5) || []);
        // علشان انا لما ابحث علي منتج لو المنتج اللي انا ببحث عليها في 10 منتجات انا مش عاوز يظهر ال10 منتجات انا عاوز يظهر 5 بس slice(0, 5) انا عملت
      } catch (error) {
        console.log("Search Error :", error);
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [serachTerm]);

  // console.log(suggestions);

  useEffect(() => {
    setSuggestions([]);
  }, [location]);
  // الفكرة: "لما المستخدم ينتقل من صفحة لصفحة تانية (أو حتى يعمل بحث جديد)، اقفل/امسح قائمة اقتراحات البحث المنسدلة تلقائيًا."

  return (
    <div className="relative">
      {/* search_form */}
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
          onChange={(e) => setSerachTerm(e.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="w-11.25 h-11.25 flex items-center justify-center bg-main text-lg cursor-pointer rounded-tr-[30px] rounded-br-[30px]"
        >
          <FaSearch className="text-white" />
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul className="absolute bg-white w-full! list-none mt-1! border border-border z-50">
          {suggestions.map((item) => (
            <Link to={`/products/${item.id}`}>
              <li
                className=" flex items-center gap-2 py-1! px-2! border-b border-border"
                key={item.id}
              >
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
    </div>
  );
}

export default SerachBox;

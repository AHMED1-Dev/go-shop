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

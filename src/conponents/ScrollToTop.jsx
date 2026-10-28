
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);
  // هتشتغل  useEffect ده يتغير يعني لما اروح من صفحه الي صفحه  pathnameدي بتشتغل امتي بتشتغل كل ما useEffect
  return null;
  // يعني انا مش عاوز يرجعلي حاجه null
}

export default ScrollToTop;

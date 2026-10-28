import { useContext } from "react";
import { CartContext } from "../../conponents/context/CartContext";
import PageTransition from "../../conponents/PageTransition";
import Product from "../../conponents/slideProducts/Product";

function favorites() {
  const { favorites } = useContext(CartContext);
  return (
    <PageTransition>
      <section>
        {/* container */}
        <div className="w-[90%] mx-auto! max-w-337.5">
          <div className="top_slide relative pt-2.5! pr-5! pl-0">
            <h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
              Your Favorites
            </h2>
          </div>

          {/* {favorites.length > 0 ? ( 
            <div className="flex flex-wrap gap-5 mt-5">
              {favorites.map((item) => (
                <Product item={item} key={item.id} />
              ))}
            </div>
          ) : (
            <div className="text-3xl text-main! mb-2.5! mt-3.5! capitalize text-center">
              No favorites yet
            </div>
          )} */}

          {favorites.length === 0 ? (
            <div className="text-3xl text-main! mb-2.5! mt-3.5! capitalize text-center">
              No favorites yet
            </div>
          ) : (
            <div className="flex flex-wrap gap-5 mt-5">
              {favorites.map((item) => (
                <Product item={item} key={item.id} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}

export default favorites;

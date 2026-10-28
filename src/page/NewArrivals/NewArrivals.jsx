import Product from "../../conponents/slideProducts/Product";
import { useProducts } from "../../conponents/useProducts";

const ARRIVALS_COUNT = 20; // عدد المنتجات اللي هتظهر

function NewArrivals() {
  const { products, loading, error } = useProducts();

  const newArrivals = [...products]
    .sort((a, b) => {
      const dateDiff =
        new Date(b.meta?.createdAt) - new Date(a.meta?.createdAt);
      // لو التواريخ متساوية (أو NaN) نرتب بالـ id تنازلياً
      return dateDiff || b.id - a.id;
    })
    .slice(0, ARRIVALS_COUNT);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32!">
        <div className="size-10 rounded-full border-4 border-border border-t-main animate-spin" />
        <p className="text-secondary!">Loading new arrivals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32">
        <p className="text-danger! font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5! py-2! bg-main text-white! rounded-lg cursor-pointer hover:opacity-90 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="container w-[90%] mx-auto! max-w-337.5 px-4! py-8!">
      <div className="mb-6!">
        <h1 className="text-2xl sm:text-3xl font-bold text-main!">
          New Arrivals
        </h1>
        <p className="text-sm text-secondary! mt-1!">
          The latest {newArrivals.length} products in our store
        </p>
      </div>

      {newArrivals.length === 0 ? (
        <div className="text-center py-20 text-secondary!">
          No new arrivals right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {newArrivals.map((item) => (
            <Product key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default NewArrivals;

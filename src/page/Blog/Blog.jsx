import { Link } from "react-router-dom";
import { useProducts } from "../../conponents/useProducts";

const TOP_COUNT = 5;

const GUIDES = [
  {
    category: "fragrances",
    title: "Fragrances",
    tips: [
      "Know your scent family: floral, woody, fresh or oriental.",
      "Test on your skin, not just on paper. Perfume smells different on everyone.",
      "Eau de Parfum lasts longer than Eau de Toilette.",
    ],
  },
  {
    category: "laptops",
    title: "Laptops",
    tips: [
      "Decide your use first: study, programming, design or gaming.",
      "Choose at least 8GB of RAM, and 16GB if you multitask.",
      "An SSD is far faster than a traditional hard drive.",
    ],
  },
  {
    category: "smartphones",
    title: "Smartphones",
    tips: [
      "Check battery capacity and how fast it charges.",
      "Camera quality matters more than megapixel numbers.",
      "Make sure the storage is enough for your photos and apps.",
    ],
  },
  {
    category: "beauty",
    title: "Beauty",
    tips: [
      "Pick products that match your skin type.",
      "Check the ingredients if you have sensitive skin.",
      "Start with one new product at a time to see how it works.",
    ],
  },
  {
    category: "mens-watches",
    title: "Men's Watches",
    tips: [
      "Choose between analog, digital or smart based on how you'll use it.",
      "Check water resistance if you wear it daily.",
      "Pick a strap material that suits your style and comfort.",
    ],
  },
  {
    category: "mens-shirts",
    title: "Men's Shirts",
    tips: [
      "Cotton is breathable for summer; wool blends keep you warm in winter.",
      "Measure your chest and shoulders instead of guessing your size.",
      "Neutral colors like white, navy and grey match almost everything.",
    ],
  },
  {
    category: "womens-dresses",
    title: "Women's Dresses",
    tips: [
      "Choose the right size and fit for your body.",
      "Check the fabric and material before buying.",
      "Choose a style that matches the occasion.",
    ],
  },
];

function Blog() {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32!">
        <div className="size-10 rounded-full border-4 border-border border-t-main animate-spin" />
        <p className="text-secondary!">Loading guides...</p>
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
      {/* Header */}
      <div className="mb-8!">
        <h1 className="text-2xl sm:text-3xl font-bold text-main!">Blog</h1>
        <p className="text-sm text-secondary! mt-1!">
          Buying guides and our top picks from the store
        </p>
      </div>

      {GUIDES.map((guide) => {
        const topProducts = products
          .filter((product) => product.category === guide.category)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, TOP_COUNT);

        if (topProducts.length === 0) return null;

        return (
          <article key={guide.category} className="mb-14!">
            <h2 className="text-xl sm:text-2xl font-bold text-heading! mb-4!">
              {/* Top {topProducts.length} {guide.title} */}
              Best {guide.title} in GoShop
            </h2>

            {/* How to choose */}
            <div className="bg-bg rounded-2xl p-5! mb-6!">
              <h3 className="font-bold text-main! mb-3!">
                How to choose {guide.title.toLowerCase()}
              </h3>
              <ul className="space-y-2! list-disc pl-5!">
                {guide.tips.map((tip) => (
                  <li key={tip} className="text-sm text-secondary!">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Top products */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {topProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group relative bg-white border border-border rounded-2xl p-3! hover:border-main hover:shadow-md transition-shadow"
                >
                  <span className="absolute top-2 left-2 z-10 size-7 grid place-items-center rounded-full bg-main text-white! text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="h-36 bg-bg rounded-xl flex items-center justify-center mb-3!">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-main!">
                    {product.title}
                  </h4>
                  <p className="text-xs text-secondary! mt-1!">
                    ⭐ {product.rating}
                  </p>
                  <p className="font-bold text-heading! mt-1!">
                    ${product.price}
                  </p>
                </Link>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default Blog;

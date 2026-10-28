// import React from "react";

function SlideProductLoading() {
  return (
    // Loading SlideProduct
    //bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer
    <div>
      <div className="slide_products slide my-5!">
        <div className="w-[90%] mx-auto! max-w-337.5">
          <div className="top_slide relative pt-2.5! pr-5! h-15 w-62.5 bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer">
            <h2 className="text-3xl text-main! mb-2.5! mt-3.5! h-8.75"></h2>
            <p></p>
          </div>
          {/* Loading SlideProduct */}
          <div className="prodcuts_losding mt-5! flex gap-2">
            <div className="prodcut">
              <section className="group w-61.25 bg-white border border-border rounded-2xl overflow-hidden shadow-xs p-4! cursor-pointer hover:border-main hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1! bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer">
                  <span className="text-[15px] tracking-wider! block bg-danger text-white! px-1.5! rounded-[5px] "></span>

                  <span className="top-3 right-3 text-2xl p-1.5! backdrop-blur-xs rounded-full text-slate-500! hover:text-main!"></span>
                </div>
                <div className="relative w-full h-56 bg-bg rounded-xl overflow-hidden flex items-center justify-center mb-3! bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer">
                  <div className="img max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 "></div>
                </div>
                <h2 className="text-2xl font-bold line-clamp-1 group-hover:text-main! bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h2>
                <div className="stars flex items-center text-[18px] text-gold py-3.5! px-0 bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer">
                  <span className="text-[13px] text-secondary! ml-1.5!"></span>
                </div>
                <span className="text-[20px] text-heading! font-bold bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></span>
                <span className="text-[11px] text-secondary! line-through ml-1.25! bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></span>

                <p className="text-success! text-[12px] font-medium bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></p>

                <div className="icons flex items-center justify-center gap-2.5 p-2.5! mt-1.5! bg-main rounded-2xl hover:scale-105 transition-transform duration-300  bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer">
                  <span className="text-2xl text-white! "></span>
                  <button className="text-1xl text-white!"></button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlideProductLoading;

// import React from "react";

function ProductDetailsLoading() {
  return (
    <div className="loading_Item">
      <section className="py-12.5!">
        <div className="w-[90%] mx-auto! max-w-337.5 flex items-center justify-between">
          {/* IMAGES  */}
          <div className="w-[48%] flex gap-3 h-125 bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></div>

          {/* ProductDetailsLoading */}
          <div className="w-[48%] h-125 pt-25!">
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
            <h5 className="h-7.5 mb-12.5! rounded bg-linear-to-r from-bg via-white to-bg bg-size-[500px_100%] animate-shimmer"></h5>
          </div>
        </div>
      </section>{" "}
    </div>
  );
}

export default ProductDetailsLoading;

// import React from "react";
import Product from "./Product";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

function SlideProduct({ data, title }) {
  // Home.jsx يعني انا عاوز كل المنتجات من الملف data
  // يعني بيجيب كل اسامي المنتجات title
  // console.log(data);
  return (
    <div className="slide_products slide my-5!">
      <div className="w-[90%] mx-auto! max-w-337.5">
        <div className="top_slide relative pt-2.5! pr-5! pl-0">
          <h2 className="text-3xl text-main! mb-2.5! mt-3.5! capitalize">
            {title}
          </h2>
        </div>
        <Swiper
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            type: "progressbar",
          }}
          navigation={true}
          modules={[Pagination, Navigation, Autoplay]}
          className="mySwiper"
          breakpoints={{
            // 📱 Mobile
            0: {
              slidesPerView: 2,
              spaceBetween: 12,
            },

            // 📱 Mobile كبير
            480: {
              slidesPerView: 2,
              spaceBetween: 15,
            },

            // 📱 Tablet
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },

            // 💻 Laptop
            1024: {
              slidesPerView: 4,
              spaceBetween: 24,
            },

            // 🖥️ Desktop
            1280: {
              slidesPerView: 5,
              spaceBetween: 25,
            },

            // 🖥️ Large Desktop
            1536: {
              slidesPerView: 5,
              spaceBetween: 30,
            },
          }}
        >
          {data.map((item) => {
            return (
              <SwiperSlide key={item.id} className="mt-5!">
                <Product item={item} />
              </SwiperSlide>
            );
          })}
          {/* الكود دا اللي بيكرر كل المنتجات */}
        </Swiper>
      </div>
    </div>
  );
}
//

export default SlideProduct;

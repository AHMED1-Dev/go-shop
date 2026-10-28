// import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// import required modules
import { Autoplay, Pagination } from "swiper/modules";
import { Link } from "react-router-dom";

// import required modules
// import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import HeroImage from "../assets/images/Hero.jpeg";
import HeroImage1 from "../assets/images/Hero1.jpeg";
import HeroImage2 from "../assets/images/Hero2.jpeg";

function HeroSlider() {
  const slides = [
    {
      image: HeroImage,
      subtitle: "New Arrivals",
      title: "Next-Gen Tech is Here",
      description:
        "Discover the latest innovations designed to elevate your everyday life.",
      button: "Explore Tech",
    },
    {
      image: HeroImage1,
      subtitle: "Best Products",
      title: "Discover Our Latest Products",
      description: "Find everything you need with our latest collection.",
      button: "Shop Now",
    },
    {
      image: HeroImage2,
      subtitle: "Smart Choices",
      title: "Everything You Need, All in One Place",
      description:
        "Discover quality products, great prices, and everything you need for your everyday life.",
      button: "Start Shopping",
    },
  ];
  return (
    <>
      <div className="hero relative mb-10! pt-5!">
        <div className="w-[90%] mx-auto! max-w-337.5 flex items-center justify-between">
          <Swiper
            pagination={true}
            modules={[Pagination, Autoplay]}
            className="mySwiper w-full h-100"
            loop={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.title}>
                <div className="content absolute top-1/2 left-[5%] -translate-y-1/2">
                  <span className="text-[2vw] mb-[0.5vw]! bg-main px-3! py-1! text-white! rounded-md">
                    {slide.subtitle}
                  </span>

                  <h1 className="uppercase text-[2vw] font-bold mt-3! text-white!">
                    {slide.title}
                  </h1>
                  <p className="max-w-100 mt-2! text-white!">
                    {slide.description}
                  </p>
                  <Link
                    to="/"
                    className="btn inline-block bg-main text-white px-6! py-3! rounded-md mt-5! hover:text-white! hover:bg-[#ffa318]! hover:scale-105 transition-all duration-300 ease-in-out"
                  >
                    {slide.button}
                  </Link>
                </div>
                <img
                  className="block w-full h-full object-cover"
                  src={slide.image}
                  alt={slide.title}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
}

export default HeroSlider;

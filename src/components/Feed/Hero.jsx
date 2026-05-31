import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import HeroLoad from "./HeroLoad";

const Hero = ({ slides = [], loading = false }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  const images = [
    "/photos/hero/image.png",
    "/photos/hero/image1.png",
    "/photos/hero/image2.png",
  ];

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: images.length > 1,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  React.useEffect(() => {
    instanceRef.current?.update();
  }, [instanceRef]);

  React.useEffect(() => {
    if (!instanceRef.current || images.length < 2) return;

    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 4000);

    return () => clearInterval(interval);
  }, [instanceRef]);

  if (loading) {
    return (
      <section className="relative w-full pt-6 sm:pt-8 lg:pt-16">
        <div className="h-[18.75rem] sm:h-[25rem] md:h-[29rem] lg:h-[48rem] animate-pulse bg-emerald-50" />
      </section>
    );
  }

  return (
    <section className="relative w-full pt-6 sm:pt-8 lg:pt-18">
      <div className="relative overflow-hidden">
        <div ref={sliderRef} className="keen-slider">
          {images.map((img, index) => (
            <div
              key={img}
              className="keen-slider__slide relative h-[18.75rem] sm:h-[25rem] md:h-[29rem] lg:h-[55rem]"
            >
              <img
                src={img}
                alt="KrishiGhar Banner"
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
            </div>
          ))}
        </div>

        {loaded && instanceRef.current && images.length > 1 && (
          <HeroLoad instanceRef={instanceRef}  />
        )}

        {loaded && instanceRef.current && images.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => instanceRef.current.moveToIdx(idx)}
                className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "bg-white scale-110" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;

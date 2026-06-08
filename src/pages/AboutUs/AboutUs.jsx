import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageSeo } from "../../utils/seo";

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const root = useRef(null);
  const hero = useRef(null);
  const stats = useRef(null);
  const mission = useRef(null);

  usePageSeo({
    title: "আমাদের সম্পর্কে | কৃষিঘর",
    description:
      "কৃষিঘরের লক্ষ্য হলো বাংলাদেশের কৃষক, পাইকার ও ক্রেতাদের জন্য স্বচ্ছ, কার্যকর এবং নির্ভরযোগ্য কৃষি বাণিজ্য প্ল্যাটফর্ম তৈরি করা।",
    keywords: "কৃষিঘর সম্পর্কে, বাংলাদেশ কৃষি মার্কেটপ্লেস লক্ষ্য",
    path: "/about",
  });

  useEffect(() => {
    if (!root.current) return;

    const ctx = gsap.context(() => {
      // hero: headline + paragraph + buttons rise-in
      gsap.from(hero.current.querySelectorAll(".rise"), {
        y: 40,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power2.out",
      });

      // stats: fade-up on scroll
      gsap.from(stats.current.querySelectorAll(".stat"), {
        y: 30,
        autoAlpha: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: stats.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // mission cards: subtle scrub parallax
      gsap.from(mission.current.querySelectorAll(".card"), {
        y: 80,
        autoAlpha: 0,
        stagger: 0.2,
        ease: "none",
        scrollTrigger: {
          trigger: mission.current,
          start: "top 70%",
          end: "bottom 40%",
          scrub: true,
        },
      });

      // background parallax
      gsap.to(".parallax-bg", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-wrap",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="bg-[#ffffde2e]">
      {/* Hero */}
      <section ref={hero} className="relative parallax-wrap">
        {/* Keep your height – DO NOT change lg:h-[50rem] */}
        <div
          className="parallax-bg absolute inset-0 -top-20 h-[38rem] md:h-[42rem] lg:h-[50rem]"
          style={{
            backgroundImage:
              "url(https://1000logos.net/wp-content/uploads/2025/04/White-background-wallpaper%E2%80%8B.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* give breathing room so stats won’t collide */}
          <div className="pt-24 md:pt-28 lg:pt-36 pb-14 md:pb-16 lg:pb-24 text-center">
            <div className="mx-auto w-full max-w-5xl">
              {/* SVG gradient stroke headline */}
              <svg
                viewBox="0 0 1200 220"
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-[180px] sm:h-[220px] md:h-[240px]"
              >
                <defs>
                  <linearGradient
                    id="gradStroke"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="0"
                    x2="1200"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#22c55e">
                      <animate
                        attributeName="offset"
                        values="-0.2;1.2"
                        dur="7s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="50%" stopColor="#84cc16">
                      <animate
                        attributeName="offset"
                        values="0.2;1.6"
                        dur="7s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="100%" stopColor="#eab308">
                      <animate
                        attributeName="offset"
                        values="0.6;2"
                        dur="7s"
                        repeatCount="indefinite"
                      />
                    </stop>
                  </linearGradient>

                  <filter
                    id="softGlow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur
                      in="SourceGraphic"
                      stdDeviation="5"
                      result="blur"
                    />
                    <feColorMatrix
                      in="blur"
                      type="matrix"
                      values="0 0 0 0 0.13  0 0 0 0 0.77  0 0 0 0 0.36  0 0 0 0.55 0"
                      result="greenish"
                    />
                    <feMerge>
                      <feMergeNode in="greenish" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g>
                  {/* animated gradient stroke */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="headline neonPulse"
                    fill="transparent"
                    stroke="url(#gradStroke)"
                    strokeWidth="3"
                    filter="url(#softGlow)"
                  >
                    কৃষকের পণ্য ঘরে ঘরে
                  </text>

                  {/* faint white inner stroke for legibility */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="headline"
                    fill="transparent"
                    stroke="#ffffff"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                  >
                    কৃষকের পণ্য ঘরে ঘরে
                  </text>
                </g>

                <style>{`
                  .headline{
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                    font-weight: 800;
                    font-size: clamp(28px, 6vw, 68px);
                    letter-spacing: .5px
                  }
                  @keyframes pulseGlow{
                    0%{filter: drop-shadow(0 0 0px rgba(34,197,94,.25)) drop-shadow(0 0 0px rgba(234,179,8,.2))}
                    50%{filter: drop-shadow(0 0 8px rgba(34,197,94,.55)) drop-shadow(0 0 14px rgba(234,179,8,.45))}
                    100%{filter: drop-shadow(0 0 0px rgba(34,197,94,.25)) drop-shadow(0 0 0px rgba(234,179,8,.2))}
                  }
                  .neonPulse{animation: pulseGlow 3.8s ease-in-out infinite}
                `}</style>
              </svg>
            </div>

            <p className="rise max-w-2xl mx-auto lg:mt-4 lg:text-lg opacity-95">
              কৃষি ঘর উৎপাদক, পাইকার এবং ক্রেতাদের স্বচ্ছ দাম ও নির্ভরযোগ্য সরবরাহের মাধ্যমে নিরাপদে লেনদেন করতে সাহায্য করে।
            </p>

            <div className="rise mt-6 flex items-center justify-center gap-3">
              <a
                href="#mission"
                className="rounded-lg bg-green text-white px-6 py-2.5 hover:shadow-md transition"
              >
                আমাদের লক্ষ্য
              </a>
              <a
                href="#story"
                className="rounded-lg bg-white text-gray-900 px-6 py-2.5 hover:shadow-md transition"
              >
                আমাদের গল্প
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats (no negative margins; aligned below hero) */}
      <section
        ref={stats}
        className="relative z-20 max-w-7xl mx-auto px-4 mt-6 md:mt-8 lg:mt-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat rounded-2xl border bg-white p-6 text-center">
            <p className="text-3xl font-semibold text-green">২.৫ হাজার+</p>
            <p className="text-gray-600 text-sm">সক্রিয় উৎপাদক</p>
          </div>
          <div className="stat rounded-2xl border bg-white p-6 text-center">
            <p className="text-3xl font-semibold text-yellow">১২০ হাজার+</p>
            <p className="text-gray-600 text-sm">সম্পন্ন অর্ডার</p>
          </div>
          <div className="stat rounded-2xl border bg-white p-6 text-center">
            <p className="text-3xl font-semibold text-green">৯৮.৭%</p>
            <p className="text-gray-600 text-sm">সময়মতো ডেলিভারি</p>
          </div>
          <div className="stat rounded-2xl border bg-white p-6 text-center">
            <p className="text-3xl font-semibold text-yellow">৪.৮★</p>
            <p className="text-gray-600 text-sm">গ্রাহক রেটিং</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section
        id="mission"
        ref={mission}
        className="max-w-7xl mx-auto px-4 pt-12 md:pt-14 pb-12 md:pb-14"
      >
        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          আমাদের চালিকাশক্তি
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="card rounded-2xl border bg-white p-6">
            <p className="text-lg font-semibold text-gray-800">ন্যায্য মূল্য</p>
            <p className="text-gray-600 mt-2 text-sm">
              স্বচ্ছ খরচ ও সরাসরি যোগাযোগ মধ্যস্বত্বভোগী কমায় এবং উভয় পক্ষের জন্য ন্যায্য লাভ নিশ্চিত করে।
            </p>
          </div>
          <div className="card rounded-2xl border bg-white p-6">
            <p className="text-lg font-semibold text-gray-800">আধুনিক সরঞ্জাম</p>
            <p className="text-gray-600 mt-2 text-sm">
              কৃষির জন্য তৈরি ইনভেন্টরি, পেমেন্ট ও সরবরাহ ব্যবস্থাপনা যেকোনো ডিভাইস থেকে ব্যবহারযোগ্য।
            </p>
          </div>
          <div className="card rounded-2xl border bg-white p-6">
            <p className="text-lg font-semibold text-gray-800">
              টেকসই কৃষি
            </p>
            <p className="text-gray-600 mt-2 text-sm">
              স্থানীয় উৎস থেকে সংগ্রহ এবং ফসল-পরবর্তী ভালো ব্যবস্থাপনার মাধ্যমে অপচয় কমাতে আমরা কাজ করি।
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl font-semibold text-gray-800">আমাদের গল্প</h3>
            <p className="text-gray-600 mt-3">
              কৃষি ঘর শুরু হয়েছিল একটি সহজ ভাবনা থেকে: উৎপাদকদের নিয়ন্ত্রণ বজায় রেখে কৃষিপণ্য কেনাবেচা সহজ করা। আজ হাজারো কৃষক ও ক্রেতা নিরাপদ এবং দ্রুত লেনদেনের জন্য আমাদের মার্কেটপ্লেস ব্যবহার করছেন।
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border p-4">
                <p className="text-2xl font-semibold text-green">2019</p>
                <p className="text-gray-600 text-sm">প্রোটোটাইপ চালু</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-2xl font-semibold text-yellow">2023</p>
                <p className="text-gray-600 text-sm">সারাদেশব্যাপী সেবা</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1600&auto=format&fit=crop"
              className="w-full h-72 lg:h-96 object-cover rounded-2xl"
              alt="ক্ষেতে কাজ করা কৃষক"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/800x600?text=%20";
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-2xl border bg-white p-6 sm:p-8 text-center">
            <p className="text-xl lg:text-2xl font-semibold text-gray-800">
              আমাদের সঙ্গে যুক্ত হোন
            </p>
            <p className="text-gray-600 mt-2">
              আপনি উৎপাদক বা ক্রেতা যাই হন, আপনার ব্যবসা এগিয়ে নিতে আমরা পাশে আছি।
            </p>
            <a
              href="/contact"
              className="inline-block mt-5 rounded-lg bg-green text-white px-6 py-2.5 hover:shadow-md transition"
            >
              যোগাযোগ করুন
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

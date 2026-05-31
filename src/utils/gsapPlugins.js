// src/utils/gsapPlugins.js
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { CustomBounce } from "gsap/CustomBounce";
import { Draggable } from "gsap/Draggable";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { PhysicsPropsPlugin } from "gsap/PhysicsPropsPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(
  useGSAP,
  Draggable,
  DrawSVGPlugin,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  ScrollTrigger,
  ScrollSmoother,
  ScrollToPlugin,
  CustomEase,
  CustomBounce
);

// ✅ Export Draggable as well
export { gsap, useGSAP, Draggable, ScrollTrigger, ScrollSmoother };

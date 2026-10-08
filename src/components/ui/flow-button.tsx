'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export function FlowButton({ text = "Modern Button" }: { text?: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const leftArrowRef = useRef<SVGSVGElement>(null);
  const rightArrowRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    const circle = circleRef.current;
    const txt = textRef.current;
    const leftArrow = leftArrowRef.current;
    const rightArrow = rightArrowRef.current;

    if (!btn || !circle || !txt || !leftArrow || !rightArrow) return;

    gsap.set(circle, { scale: 0, opacity: 0, xPercent: -50, yPercent: -50 });
    gsap.set(txt, { x: -8 });
    gsap.set(leftArrow, { x: -34, opacity: 0 });
    gsap.set(rightArrow, { x: 0, opacity: 1 });

    let tl: gsap.core.Timeline | null = null;

    const onMouseEnter = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;

      gsap.set(circle, { left: x, top: y });

      if (tl) tl.kill();

      const DURATION = 0.35;
      const EASE = "power2.out";

      tl = gsap.timeline();
      tl.to(circle, { scale: 1, opacity: 1, duration: DURATION, ease: EASE }, 0)
        .to(btn, { borderColor: "transparent", color: "#ffffff", duration: DURATION, ease: EASE }, 0)
        .to(txt, { x: 8, duration: DURATION, ease: EASE }, 0)
        .to(rightArrow, { x: 26, opacity: 0, duration: DURATION, ease: EASE }, 0)
        .to(leftArrow, { x: 0, opacity: 1, duration: DURATION, ease: EASE }, 0);
    };

    const onMouseLeave = () => {
      if (tl) tl.kill();

      const LEAVE_DURATION = 0.3;
      const LEAVE_EASE = "power2.out";

      tl = gsap.timeline();
      tl.to(circle, { scale: 0, opacity: 0, duration: LEAVE_DURATION, ease: LEAVE_EASE }, 0)
        .to(btn, { borderColor: "rgba(51, 51, 51, 0.4)", color: "#111111", duration: LEAVE_DURATION, ease: LEAVE_EASE }, 0)
        .to(txt, { x: -8, duration: LEAVE_DURATION, ease: LEAVE_EASE }, 0)
        .to(leftArrow, { x: -28, opacity: 0, duration: LEAVE_DURATION, ease: LEAVE_EASE }, 0)
        .to(rightArrow, { x: 0, opacity: 1, duration: LEAVE_DURATION, ease: LEAVE_EASE }, 0);
    };

    btn.addEventListener("mouseenter", onMouseEnter);
    btn.addEventListener("mouseleave", onMouseLeave);

    return () => {
      btn.removeEventListener("mouseenter", onMouseEnter);
      btn.removeEventListener("mouseleave", onMouseLeave);
      tl?.kill();
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      className="relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#333333]/40 bg-transparent px-8 py-3 text-sm font-semibold text-[#111111] cursor-pointer select-none active:scale-[0.95]"
    >
      {/* Left arrow */}
      <ArrowRight 
        ref={leftArrowRef}
        className="absolute w-4 h-4 left-4 stroke-white fill-none z-[9]" 
      />

      {/* Text */}
      <span ref={textRef} className="relative z-[1]">
        {text}
      </span>

      {/* Expanding Circle Background */}
      <span
        ref={circleRef}
        className="absolute w-[240px] h-[240px] bg-[#111111] rounded-[50%] pointer-events-none"
      />

      {/* Right arrow */}
      <ArrowRight 
        ref={rightArrowRef}
        className="absolute w-4 h-4 right-4 stroke-current fill-none z-[9]" 
      />
    </button>
  );
}

export default FlowButton;

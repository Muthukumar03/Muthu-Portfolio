"use client";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { heroContent } from "@/data/content";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";

interface HeaderProps {
  onOpenWorks?: () => void;
}

export default function Header({ onOpenWorks }: HeaderProps) {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const leftArrowRef = useRef<SVGSVGElement>(null);
  const rightArrowRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const cta = ctaRef.current;
    const circle = circleRef.current;
    const text = textRef.current;
    const leftArrow = leftArrowRef.current;
    const rightArrow = rightArrowRef.current;

    if (!cta || !circle || !text || !leftArrow || !rightArrow) return;

    // Initial rested state setup
    gsap.set(circle, { scale: 0, opacity: 0, xPercent: -50, yPercent: -50 });
    gsap.set(text, { x: -6 });
    gsap.set(leftArrow, { x: -30, opacity: 0 });
    gsap.set(rightArrow, { x: 0, opacity: 1 });
    gsap.set(cta, {
      borderRadius: 999,
      borderColor: "rgba(255, 255, 255, 0.35)",
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      color: "rgba(245, 239, 233, 0.94)",
    });

    let currentTimeline: gsap.core.Timeline | null = null;

    const onMouseEnter = (e: MouseEvent) => {
      const rect = cta.getBoundingClientRect();
      const relX = rect.width / 2;
      const relY = rect.height / 2;

      // Expand outward symmetrically from center for balanced bloom
      gsap.set(circle, {
        left: relX,
        top: relY,
      });

      if (currentTimeline) currentTimeline.kill();

      const DURATION = 0.35;
      const EASE = "power2.out";

      currentTimeline = gsap.timeline();

      currentTimeline
        .to(
          circle,
          {
            scale: 1,
            opacity: 1,
            duration: DURATION,
            ease: EASE,
          },
          0
        )
        .to(
          cta,
          {
            borderColor: "transparent",
            boxShadow: "0 10px 30px -6px rgba(211, 56, 43, 0.65)",
            color: "#ffffff",
            duration: DURATION,
            ease: EASE,
          },
          0
        )
        .to(
          text,
          {
            x: 8,
            duration: DURATION,
            ease: EASE,
          },
          0
        )
        .to(
          rightArrow,
          {
            x: 26,
            opacity: 0,
            duration: DURATION,
            ease: EASE,
          },
          0
        )
        .to(
          leftArrow,
          {
            x: 0,
            opacity: 1,
            duration: DURATION,
            ease: EASE,
          },
          0
        );
    };

    const onMouseLeave = () => {
      if (currentTimeline) currentTimeline.kill();

      const LEAVE_DURATION = 0.3;
      const LEAVE_EASE = "power2.out";

      currentTimeline = gsap.timeline();

      currentTimeline
        .to(
          circle,
          {
            scale: 0,
            opacity: 0,
            duration: LEAVE_DURATION,
            ease: LEAVE_EASE,
          },
          0
        )
        .to(
          cta,
          {
            borderColor: "rgba(255, 255, 255, 0.35)",
            boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
            color: "rgba(245, 239, 233, 0.94)",
            duration: LEAVE_DURATION,
            ease: LEAVE_EASE,
          },
          0
        )
        .to(
          text,
          {
            x: -6,
            duration: LEAVE_DURATION,
            ease: LEAVE_EASE,
          },
          0
        )
        .to(
          leftArrow,
          {
            x: -28,
            opacity: 0,
            duration: LEAVE_DURATION,
            ease: LEAVE_EASE,
          },
          0
        )
        .to(
          rightArrow,
          {
            x: 0,
            opacity: 1,
            duration: LEAVE_DURATION,
            ease: LEAVE_EASE,
          },
          0
        );
    };

    cta.addEventListener("mouseenter", onMouseEnter);
    cta.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cta.removeEventListener("mouseenter", onMouseEnter);
      cta.removeEventListener("mouseleave", onMouseLeave);
      currentTimeline?.kill();
    };
  }, []);

  return (
    <header className="site-header">
      <div className="header-pill fx fx-header">
        <a className="brand" href="#top" aria-label={`${heroContent.headline} — home`}>
          <Image
            src="/assets/logo.png"
            alt="MK Logo"
            width={82}
            height={82}
            className="brand-mark"
            priority
          />
        </a>

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {heroContent.nav.map((item, i) => (
              <li key={item.label}>
                <a
                  className={`nav-link ${item.active ? "is-active" : ""}`}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  data-slot={`nav-${i}`}
                  onClick={(e) => {
                    if (item.href === "#projects" && onOpenWorks) {
                      e.preventDefault();
                      onOpenWorks();
                    }
                  }}
                >
                  {item.active && <span className="nav-dot" aria-hidden="true"></span>}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <a
            ref={ctaRef}
            className="cta"
            href={heroContent.cta.href}
            target={heroContent.cta.href.endsWith(".pdf") ? "_blank" : undefined}
            rel={heroContent.cta.href.endsWith(".pdf") ? "noopener noreferrer" : undefined}
          >
            {/* Left arrow (arrives on hover) */}
            <ArrowUpRight ref={leftArrowRef} className="cta-arrow cta-arrow--left" aria-hidden="true" />

            {/* Button text */}
            <span ref={textRef} className="cta-text" data-slot="cta">
              {heroContent.cta.label}
            </span>

            {/* Expanding circle background */}
            <span ref={circleRef} className="cta-circle" aria-hidden="true" />

            {/* Right arrow (departs on hover) */}
            <ArrowUpRight ref={rightArrowRef} className="cta-arrow cta-arrow--right" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { heroContent } from "@/data/content";
import Header from "./Header";
import gsap from "gsap";

const RippleDistortion = dynamic(() => import("./RippleDistortion"), {
  ssr: false,
  loading: () => (
    <img
      className="portrait-img"
      src="/assets/muthu-bg.png"
      alt="Portrait of Muthukumar G"
    />
  ),
});

interface HeroSectionProps {
  onOpenWorks?: () => void;
}

export default function HeroSection({ onOpenWorks }: HeroSectionProps) {
  const [dismissed, setDismissed] = useState(false);
  const notificationRef = useRef<HTMLElement>(null);
  const portraitLayerRef = useRef<HTMLDivElement>(null);
  const atmoLayerRef = useRef<HTMLDivElement>(null);
  const cursorLightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const docEl = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const portraitLayer = portraitLayerRef.current;
    const atmoLayer = atmoLayerRef.current;
    const cursorLight = cursorLightRef.current;

    if (reduceMotion) {
      docEl.classList.add("is-ready", "is-settled");
      return;
    }

    const initX = window.innerWidth / 2;
    const initY = window.innerHeight * 0.42;

    if (cursorLight) {
      gsap.set(cursorLight, { x: initX, y: initY });
    }

    const lightXTo = cursorLight ? gsap.quickTo(cursorLight, "x", { duration: 0.45, ease: "power2.out" }) : null;
    const lightYTo = cursorLight ? gsap.quickTo(cursorLight, "y", { duration: 0.45, ease: "power2.out" }) : null;

    const portraitXTo = portraitLayer ? gsap.quickTo(portraitLayer, "x", { duration: 0.5, ease: "power2.out" }) : null;
    const portraitYTo = portraitLayer ? gsap.quickTo(portraitLayer, "y", { duration: 0.5, ease: "power2.out" }) : null;

    const atmoXTo = atmoLayer ? gsap.quickTo(atmoLayer, "x", { duration: 0.6, ease: "power2.out" }) : null;
    const atmoYTo = atmoLayer ? gsap.quickTo(atmoLayer, "y", { duration: 0.6, ease: "power2.out" }) : null;

    const onPointerMove = (e: PointerEvent) => {
      if (docEl.classList.contains("beyond-hero")) return;
      const targetX = e.clientX / window.innerWidth - 0.5;
      const targetY = e.clientY / window.innerHeight - 0.5;

      lightXTo?.(e.clientX);
      lightYTo?.(e.clientY);
      portraitXTo?.(targetX * 10);
      portraitYTo?.(targetY * 6);
      atmoXTo?.(targetX * -16);
      atmoYTo?.(targetY * -9);
    };

    const enableInteractions = () => {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    };

    const disableInteractions = () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (portraitLayer) gsap.set(portraitLayer, { clearProps: "x,y" });
      if (atmoLayer) gsap.set(atmoLayer, { clearProps: "x,y" });
    };

    const SETTLE_AT_MS = 6000;
    docEl.classList.add("is-ready");
    const timer = window.setTimeout(() => {
      docEl.classList.add("is-settled");
      enableInteractions();
    }, SETTLE_AT_MS);

    return () => {
      window.clearTimeout(timer);
      disableInteractions();
    };
  }, []);

  const handleDismiss = () => {
    const el = notificationRef.current;
    if (!el) {
      setDismissed(true);
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDismissed(true);
      return;
    }
    el.classList.add("is-dismissed");
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === "notif-out") {
        setDismissed(true);
        el.removeEventListener("animationend", onEnd);
      }
    };
    el.addEventListener("animationend", onEnd);
  };

  return (
    <section className="hero" id="top">
      {/* L02/03 · Atmosphere */}
      <div ref={atmoLayerRef} className="atmo-parallax" aria-hidden="true">
        <div className="layer-atmosphere fx fx-atmo">
          <div className="atmo-wash"></div>
          <div className="atmo-core"></div>
          <div className="atmo-floor"></div>
          <div className="atmo-vignette"></div>
        </div>
      </div>

      {/* L04/05 · Portrait */}
      <div ref={portraitLayerRef} className="portrait-parallax">
        <div className="portrait-frame">
          <div className="portrait-stage fx fx-portrait">
            <RippleDistortion
              src="/assets/muthu-bg.png"
              className="portrait-img"
              brushSize={50}
              strength={0.075}
              swirl={3}
              rings={1.5}
              spread={5}
              fade={3}
              spacing={8}
              clickStrength={2}
              dispersion={0}
              glint={0}
              tintAmount={0.1}
              tint="#ef4444"
              highlightColor="#ffffff"
              trigger="hover"
              quality="low"
              grayscale={false}
              enabled={true}
            />
            <div className="portrait-veil fx-veil" aria-hidden="true"></div>
            <div className="portrait-sweep fx-sweep" aria-hidden="true"></div>
            <div className="eye-flash eye-flash--right fx-flash" aria-hidden="true"></div>
            <div className="eye-flash fx-flash" aria-hidden="true"></div>
          </div>
        </div>
      </div>

      {/* Film grain */}
      <div className="layer-grain" aria-hidden="true"></div>

      {/* Legibility scrim behind notification zone */}
      <div className="scrim-bottom" aria-hidden="true"></div>

      {/* L07 · Hero typography */}
      <div className="hero-copy">
        <div className="headline-block">
          <h1 className="headline fx fx-headline" data-slot="headline">
            {heroContent.headline}
          </h1>
          <p className="headline-sub fx fx-headline-sub" data-slot="headline-sub">
            {heroContent.experience}
          </p>
        </div>
        <div className="role-block">
          <p className="role">
            <span className="role-line fx fx-role-1" data-slot="role-1">
              {heroContent.role[0]}
            </span>
            <span className="role-line fx fx-role-2" data-slot="role-2">
              {heroContent.role[1]}
            </span>
          </p>
          <ul className="hero-meta fx fx-meta" data-slot="meta">
            {heroContent.meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* L08 · Notification */}
      {!dismissed && (
        <aside
          ref={notificationRef}
          className="notification fx fx-notif"
          aria-label="Notification"
        >
          <button
            className="notif-close"
            type="button"
            aria-label="Dismiss notification"
            onClick={handleDismiss}
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
            </svg>
          </button>
          <div className="notif-card">
            <span className="notif-avatar" aria-hidden="true">
              <span className="notif-badge">
                <svg
                  viewBox="0 0 12 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3.4 1 1 4l2.4 3M8.6 1 11 4 8.6 7" />
                </svg>
              </span>
            </span>
            <div className="notif-body">
              <div className="notif-top">
                <span className="notif-name" data-slot="notif-name">
                  {heroContent.notification.name}
                </span>
                <span className="notif-time" data-slot="notif-time">
                  {heroContent.notification.time}
                </span>
              </div>
              <p className="notif-msg">
                <strong data-slot="notif-lead">{heroContent.notification.lead}</strong>{" "}
                <span data-slot="notif-message">
                  {heroContent.notification.message}
                </span>
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* L06 · Header */}
      <Header onOpenWorks={onOpenWorks} />

      {/* L09 · Interactive cursor light */}
      <div ref={cursorLightRef} className="cursor-light" aria-hidden="true"></div>
    </section>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { heroContent, TechIdea } from "@/data/content";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function BigRobotSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rbSection = sectionRef.current;
    const canvas = canvasRef.current;
    const panelBox = panelsRef.current;
    if (!rbSection || !canvas || !panelBox) return;

    const copy = heroContent.bigRobot;
    const style = rbSection.style;

    const RB = {
      scene: "/assets/big-robot.splinecode",
      zFar: -1500,
      zPast: 760,
      lateral: 23,
      span: 0.62,
      settle: 0.86,
      look: 0.4,
      lookX: 0.07,
      tau: 0.34,
    };

    const panelElements = [
      ...panelBox.querySelectorAll<HTMLElement>(".rb-panel"),
    ];
    const panels = panelElements.map((el, i) => ({
      el,
      side: i % 2 === 0 ? -1 : 1,
    }));

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const band = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
    const isMob = () => window.innerWidth <= 720;

    const measureRb = () => {
      ScrollTrigger.refresh();
    };

    let lastJourney: string | null = null;

    const renderJourney = (raw: number) => {
      const key = raw.toFixed(4);
      if (key === lastJourney) return;
      lastJourney = key;

      const p = clamp01(raw / RB.settle);
      const n = panels.length || 1;
      const step = n > 1 ? (1 - RB.span) / (n - 1) : 0;
      let intro = 1;

      panels.forEach((panel, i) => {
        const u = band(p, i * step, i * step + RB.span);
        const z = RB.zFar + (RB.zPast - RB.zFar) * u;
        const x = panel.side * RB.lateral * (0.52 + 0.48 * u) * (isMob() ? 0.42 : 1);
        const rotY = panel.side * -11 * (0.4 + 0.6 * u);
        const inFade = band(u, 0.04, 0.24);
        const outFade = 1 - band(u, 0.76, 0.97);

        panel.el.style.transform =
          `translate3d(calc(-50% + ${x.toFixed(2)}vw), -50%, ${z.toFixed(1)}px) ` +
          `rotateY(${rotY.toFixed(2)}deg)`;
        panel.el.style.opacity = (inFade * outFade).toFixed(3);
        panel.el.style.setProperty("--haze", (0.62 * (1 - inFade)).toFixed(3));
        panel.el.style.zIndex = String(10 + Math.round(u * 10));

        intro = Math.min(intro, 1 - inFade);
      });

      style.setProperty("--rbP", p.toFixed(4));
      style.setProperty("--rbC", intro.toFixed(3));
    };

    let app: any = null,
      loading = false,
      running = false,
      rig: any = null;
    let active = false;

    // ── GSAP ScrollTrigger for 3D Journey & panels ─────────────────────
    const pinEl = rbSection.querySelector<HTMLElement>(".rb-pin") || rbSection;
    const st = ScrollTrigger.create({
      trigger: pinEl,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.0,
      onUpdate: (self) => {
        renderJourney(self.progress);
      },
    });

    const onResize = () => {
      measureRb();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!active || !rig) return;
      const r = rbSection.getBoundingClientRect();
      const mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      const hy = -mx * RB.look;

      if (rig.head) {
        gsap.to(rig.head.rotation, {
          y: hy,
          x: Math.abs(mx) * RB.lookX,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      if (rig.head2) {
        gsap.to(rig.head2.rotation, {
          y: hy * 0.18,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      if (rig.neck) {
        gsap.to(rig.neck.rotation, {
          y: hy * 0.3,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // ── Watermark stripping helpers ─────────────────────────────────────
    const stripImages = (data: any) => {
      if (data?.shared?.images) {
        for (const k of Object.keys(data.shared.images)) {
          if (/watermark|spline/i.test(k)) delete data.shared.images[k];
        }
      }
    };

    const purgeSplineBadge = () => {
      document
        .querySelectorAll(
          '[data-spline-html-content], iframe[title*="Spline" i], ' +
          '#spline-watermark, .spline-watermark, ' +
          'a[href*="spline.design"], a[href*="spline"]'
        )
        .forEach((el) => el.remove());
    };

    const mountRobot = async () => {
      if (loading || app || !canvas) return;
      loading = true;
      try {
        const importCdn = new Function("url", "return import(url)");
        const { Application } = await importCdn(
          "https://cdn.spline.design/@splinetool/runtime@2.0.13/build/runtime.js"
        );

        // ── Layer 1: Monkey-patch WebGL render pipeline ────────────────
        const origCreateRenderer = Application.prototype._createRenderer;
        if (origCreateRenderer) {
          Application.prototype._createRenderer = async function (...args: any[]) {
            stripImages(this._data);
            const renderer = await origCreateRenderer.apply(this, args);
            if (renderer?.pipeline) {
              renderer.pipeline.setWatermark = function () {
                this.watermarkTexture = null;
                this._effectChainDirty = true;
              };
              renderer.pipeline.watermarkTexture = null;
              renderer.pipeline._chainWatermark = null;
              renderer.pipeline._effectChainDirty = true;
              if (renderer.pipeline.disableUIOverlay) renderer.pipeline.disableUIOverlay();
            }
            return renderer;
          };
        }

        app = new Application(canvas);

        // ── Layer 2: _data property trap ──────────────────────────────
        let splineData: any = undefined;
        Object.defineProperty(app, "_data", {
          get() { return splineData; },
          set(val) {
            stripImages(val);
            splineData = val;
          },
          configurable: true,
          enumerable: true,
        });

        await app.load(RB.scene);
        if (app.setGlobalEvents) app.setGlobalEvents(false);

        // ── Layer 3: Scene graph traversal + live DOM observer ─────────
        if (app._scene?.traverse) {
          app._scene.traverse((obj: any) => {
            if (obj.name && /watermark|spline/i.test(obj.name)) {
              obj.visible = false;
              if (obj.parent) obj.parent.remove(obj);
            }
          });
        }
        purgeSplineBadge();
        if (canvas.parentElement) {
          const obs = new MutationObserver(() => purgeSplineBadge());
          obs.observe(canvas.parentElement, { childList: true, subtree: true });
        }

        const find = (n: string) => (app.findObjectByName ? app.findObjectByName(n) : null);
        rig = { head: find("Head"), head2: find("Head 2"), neck: find("Neck") };
        running = true;
        rbSection.classList.add("is-robot-ready");
        (window as any).__rbBig = { app, rig, panels };
        renderJourney(st.progress);
      } catch (err) {
        console.error("Big robot mount error:", err);
        loading = false;
      }
    };

    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          mountRobot();
          near.disconnect();
        }
      },
      { rootMargin: "120% 0px" }
    );
    near.observe(rbSection);

    const vis = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          active = en.isIntersecting && en.intersectionRatio > 0.02;
          if (active) {
            gsap.to(style, {
              "--rbIn": 1,
              duration: 0.8,
              ease: "power2.out",
              overwrite: "auto",
            });
            if (app && !running) {
              app.play();
              running = true;
            }
          } else if (app && running) {
            app.stop();
            running = false;
          }
        });
      },
      { threshold: [0, 0.12] }
    );
    vis.observe(rbSection);

    renderJourney(st.progress);

    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      near.disconnect();
      vis.disconnect();
      if (app) {
        try { app.dispose?.(); } catch {}
      }
    };
  }, []);

  const copy = heroContent.bigRobot;

  return (
    <section
      ref={sectionRef}
      className="rb"
      id="think"
      aria-label="How I think about technology"
    >
      <div className="rb-pin">
        <div className="rb-stage-wrap">
          <div className="rb-env" aria-hidden="true">
            <span className="rb-glow"></span>
            <span className="rb-grid"></span>
            <span className="rb-vignette"></span>
          </div>




          <div className="rb-space">
            <div className="rb-stage">
              <canvas
                ref={canvasRef}
                className="rb-canvas"
                aria-hidden="true"
              ></canvas>
            </div>
            <div ref={panelsRef} className="rb-panels">
              {copy.techIdeas.map((idea: TechIdea, i: number) => (
                <article key={idea.no} className="rb-panel">
                  <p className="rb-panel-no">{idea.no || String(i + 1).padStart(2, "0")}</p>
                  <h3 className="rb-panel-title">{idea.title}</h3>
                  <p className="rb-panel-text">{idea.description}</p>
                  <ul className="rb-tags">
                    {idea.tags.map((t: string) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <div className="rb-center">
            <p className="rb-eyebrow" data-slot="rb-eyebrow">
              {copy.eyebrow}
            </p>
            <h2 className="rb-title">
              <span data-slot="rb-title-1">{copy.titleLines[0]}</span>
              <span data-slot="rb-title-2">{copy.titleLines[1]}</span>
            </h2>
            <p className="rb-sub" data-slot="rb-sub">
              {copy.description}
            </p>
            <p className="rb-hint">
              <span data-slot="rb-hint">{copy.hint}</span>
              <span className="rb-hint-arrow" aria-hidden="true">
                &darr;
              </span>
            </p>
          </div>

          <span className="rb-depth" aria-hidden="true"></span>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { heroContent } from "@/data/content";

export default function SmallRobotSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const srSection = sectionRef.current;
    const canvas = canvasRef.current;
    if (!srSection || !canvas) return;

    const copy = heroContent.smallRobot;
    const style = srSection.style;

    const SR = {
      scene: "/assets/robot.splinecode",
      turnX: 0.44,   // yaw amount
      turnY: 0.22,   // pitch amount
      tilt: 0.07,    // roll tilt
      tau: 0.32,
    };

    // Resting base pose for the isometric Spline camera angle
    const baseRot = {
      x: -0.45949, // base pitch (tilt forward/down)
      y: -0.80998, // base yaw (angled 45° in isometric view)
      z: -0.34412, // base roll
    };

    let app: any = null,
      head: any = null,
      loading = false,
      running = false;
    let raf: number | null = null,
      active = false,
      entry = 0,
      entryT = 0,
      lastT = 0;
    let mx = 0,
      mxTarget = 0,
      my = 0,
      myTarget = 0;

    const tick = (now: number) => {
      const dt = lastT ? Math.min((now - lastT) / 1000, 0.25) : 0.016;
      lastT = now;

      entry += (entryT - entry) * (1 - Math.exp(-dt / 0.5));
      if (Math.abs(entryT - entry) < 0.002) entry = entryT;
      style.setProperty("--srIn", entry.toFixed(4));

      // Damped Euler rotation update (exponential decay)
      mx += (mxTarget - mx) * (1 - Math.exp(-dt / SR.tau));
      if (Math.abs(mxTarget - mx) < 0.0008) mx = mxTarget;
      my += (myTarget - my) * (1 - Math.exp(-dt / SR.tau));
      if (Math.abs(myTarget - my) < 0.0008) my = myTarget;

      if (head) {
        head.rotation.y = baseRot.y - mx * SR.turnX;      // yaw (left/right)
        head.rotation.x = baseRot.x + my * SR.turnY;      // pitch (up/down)
        head.rotation.z = baseRot.z + mx * SR.tilt;       // natural inquisitive roll
      }

      if (!active || (entry === entryT && mx === mxTarget && my === myTarget)) {
        lastT = 0;
        raf = null;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!active) return;
      const r = srSection.getBoundingClientRect();
      mxTarget = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      myTarget = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      kick();
    };

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

        await app.load(SR.scene);
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

        head = app.findObjectByName ? app.findObjectByName("Cabeza") : null;
        if (head) {
          // Apply base pose immediately
          head.rotation.x = baseRot.x;
          head.rotation.y = baseRot.y;
          head.rotation.z = baseRot.z;
        }
        running = true;
        srSection.classList.add("is-robot-ready");
        (window as any).__rbSmall = { app, head };
        kick();
      } catch {
        loading = false;
        kick();
      }
    };

    const nearSr = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          mountRobot();
          nearSr.disconnect();
        }
      },
      { rootMargin: "120% 0px" }
    );
    nearSr.observe(srSection);

    const visSr = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          active = en.isIntersecting && en.intersectionRatio > 0.02;
          if (active) {
            entryT = 1;
            if (app && !running) {
              app.play();
              running = true;
            }
          } else if (app && running) {
            app.stop();
            running = false;
          }
          kick();
        });
      },
      { threshold: [0, 0.15] }
    );
    visSr.observe(srSection);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      nearSr.disconnect();
      visSr.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
      if (app) {
        try { app.dispose?.(); } catch {}
      }
    };
  }, []);

  const copy = heroContent.smallRobot;

  return (
    <section
      ref={sectionRef}
      className="sr"
      id="curious"
      aria-label="Still curious"
    >
      <div className="sr-env" aria-hidden="true">
        <span className="sr-glow"></span>
        <span className="sr-vignette"></span>
      </div>

      <div className="sr-inner">
        <div className="sr-copy">

          <h2 className="sr-title">
            <span data-slot="sr-title-1">{copy.titleLines[0]}</span>
            <span data-slot="sr-title-2">{copy.titleLines[1]}</span>
          </h2>
          <p className="sr-sub" data-slot="sr-sub">
            {copy.description}
          </p>
        </div>

        <div className="sr-stage">
          <canvas
            ref={canvasRef}
            className="sr-canvas"
            aria-hidden="true"
          ></canvas>
        </div>
      </div>
    </section>
  );
}

# Technical Architecture: Robot Sections, 3D Card Animations & Spline Watermark Removal

---

## 1. 🤖 The Robot Sections (3D Spline Interactive Setup)

The portfolio implements two distinct interactive 3D Spline experiences:
1. **`SmallRobotSection.tsx`** (`#curious` / "Still Curious" section)
2. **`BigRobotSection.tsx`** (`#think` / "How I Think About Technology" section)

---

### A. Dynamic Spline CDN Loading
Instead of bundling the heavy Spline runtime directly into the initial Next.js/React chunk, it is lazy-loaded on demand from CDN when the section approaches the viewport margin:

```typescript
const importCdn = new Function("url", "return import(url)");
const { Application } = await importCdn(
  "https://cdn.spline.design/@splinetool/runtime@2.0.13/build/runtime.js"
);
const app = new Application(canvas);
await app.load(sceneUrl); // "/assets/robot.splinecode" or "/assets/big-robot.splinecode"
```

---

### B. Dual `IntersectionObserver` Strategy (Performance Optimization)
1. **Near Observer (`rootMargin: "120% 0px"`)**: Begins fetching the Spline `.splinecode` file and WebGL shaders well before the user reaches the section so it is ready instantly.
2. **Visibility Observer (`threshold: [0, 0.12]`)**: Calls `app.play()` only when visible on screen, and pauses rendering via `app.stop()` when offscreen to preserve GPU/CPU cycles and battery life.

```typescript
// 1. Lazy-fetch when 120% away
const near = new IntersectionObserver(
  (entries) => {
    if (entries.some((en) => en.isIntersecting)) {
      mountRobot();
      near.disconnect();
    }
  },
  { rootMargin: "120% 0px" }
);
near.observe(sectionRef.current);

// 2. Play/pause depending on visibility
const vis = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      active = en.isIntersecting && en.intersectionRatio > 0.02;
      if (active && app && !running) {
        app.play();
        running = true;
      } else if (!active && app && running) {
        app.stop();
        running = false;
      }
      kick();
    });
  },
  { threshold: [0, 0.12] }
);
vis.observe(sectionRef.current);
```

---

### C. Head Tracking & Cursor Following Mathematics
The robot's head tracking uses **exponential decay damping** via `requestAnimationFrame` to deliver realistic, organic movement rather than rigid tracking.

#### 1. Resting Base Pose (`baseRot`)
Because Spline scenes have an isometric angle, looking straight ahead in world coordinates requires specific Euler angles:
```typescript
const baseRot = {
  x: -0.45949, // Base pitch (tilt forward/down)
  y: -0.80998, // Base yaw (angled 45° in isometric view)
  z: -0.34412, // Base roll
};
```

#### 2. Damped Euler Rotation Update
```typescript
// Exponential decay damping: 1 - Math.exp(-dt / tau)
const dt = lastT ? Math.min((now - lastT) / 1000, 0.25) : 0.016;

mx += (mxTarget - mx) * (1 - Math.exp(-dt / SR.tau));
my += (myTarget - my) * (1 - Math.exp(-dt / SR.tau));

if (head) {
  // Yaw (Left / Right)
  head.rotation.y = baseRot.y - mx * SR.turnX;
  // Pitch (Up / Down)
  head.rotation.x = baseRot.x + my * SR.turnY;
  // Natural inquisitive roll tilt
  head.rotation.z = baseRot.z + mx * SR.tilt;
}
```

---

## 2. 🎴 The Card Animations

Two primary card animation systems are built into the portfolio:
1. **Big Robot Spatial Fly-by Panels (`.rb-panel`)**: Pinned scroll 3D cards that float past the robot in Z-space.
2. **Selected Works 3D Carousel (`.wk-glass` & `.wk-scr`)**: Full-screen 3D glass card stack with camera depth dollying.

---

### A. Big Robot 3D Fly-By Panels (`BigRobotSection.tsx`)

As the user scrolls through the pinned `.rb-pin` container, each card moves along the 3D Z-axis from deep background (`zFar = -1500px`) past the foreground camera (`zPast = 760px`), alternating between left and right sides.

```typescript
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const band = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

// p = normalized scroll progress [0..1]
panels.forEach((panel, i) => {
  // u = progress for this specific card
  const u = band(p, i * step, i * step + RB.span);
  
  // 3D coordinates
  const z = RB.zFar + (RB.zPast - RB.zFar) * u;
  const x = panel.side * RB.lateral * (0.52 + 0.48 * u) * (isMob() ? 0.42 : 1);
  const rotY = panel.side * -11 * (0.4 + 0.6 * u);
  
  // Opacity windowing (fade in quickly, stay solid, fade out as it flies past)
  const inFade = band(u, 0.04, 0.24);
  const outFade = 1 - band(u, 0.76, 0.97);

  panel.el.style.transform =
    `translate3d(calc(-50% + ${x.toFixed(2)}vw), -50%, ${z.toFixed(1)}px) ` +
    `rotateY(${rotY.toFixed(2)}deg)`;
  panel.el.style.opacity = (inFade * outFade).toFixed(3);
  
  // Fake depth-of-field haze without expensive blur filters
  panel.el.style.setProperty("--haze", (0.62 * (1 - inFade)).toFixed(3));
  panel.el.style.zIndex = String(10 + Math.round(u * 10));
});
```

#### CSS Depth & Glass Effect (`styles.css`):
```css
.rb-panel {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(38vw, 440px);
  border-radius: 20px;
  background: linear-gradient(158deg, rgba(52, 30, 26, 0.72), rgba(14, 7, 6, 0.62));
  backdrop-filter: blur(16px) saturate(125%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transform-style: preserve-3d;
  will-change: transform, opacity;
}

/* Haze layer fakes camera depth-of-field without re-rendering CSS blur */
.rb-panel::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: rgba(6, 3, 2, 0.72);
  opacity: var(--haze, 0);
}
```

---

### B. Selected Works 3D Glass Stack Carousel (`SelectedWorks.tsx`)

When navigating through projects, each project card is positioned in virtual 3D space according to its relative offset `off = i - a` (where `i` is the card index and `a` is the continuous camera position).

```typescript
screens.forEach((s, i) => {
  const off = i - a;

  // Cull cards far outside view
  if (off < -0.85 || off > 1.55) {
    s.el.style.visibility = "hidden";
    s.el.style.opacity = "0";
    s.el.style.pointerEvents = "none";
    return;
  }

  s.el.style.visibility = "visible";
  s.el.style.pointerEvents = Math.abs(off) <= 0.32 ? "auto" : "none";

  // Spatial geometry: departing cards fly out left/right, upcoming cards arrive from depth
  const x = off < 0 ? (s.side || -1) * (lat + 14) * -off : s.side * lat * off;
  const y = off < 0 ? off * -6 : 0;
  const z = -off * depth;
  const rotY = Math.max(-6, Math.min(6, (s.side || 1) * -3.2 * off));
  const rotX = Math.max(-2.2, Math.min(2.2, off * 1.0));
  const scale = off < 0 ? Math.max(0.82, 1 + off * 0.24) : Math.max(0.86, 1 - off * 0.12);

  s.el.style.transform =
    `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}svh, ${z.toFixed(1)}px) ` +
    `scale(${scale.toFixed(3)}) ` +
    `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;

  const opacity = off < 0 ? Math.max(0, 1 + off * 1.6) : Math.max(0, 1 - off * 0.85);
  s.el.style.opacity = opacity.toFixed(3);
  s.el.style.zIndex = String(100 - Math.round(off * 10));

  if (!mobile) {
    const blur = Math.abs(off) > 0.2 ? Math.min(Math.abs(off) * 4, 7) : 0;
    s.el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "";
  }
});
```

---

## 3. 🛡️ How the Spline Watermark is Removed

Spline injects watermarks at **four different layers**: WebGL shader pipeline, scene texture registry, 3D scene graph, and DOM elements. A 4-layer stripping architecture completely eliminates all watermarks:

```
┌────────────────────────────────────────────────────────┐
│  Layer 1: Prototype Patching (WebGL Render Pipeline)   │
│  Layer 2: Memory Interception (_data Getter/Setter)    │
│  Layer 3: Scene Graph Traversal & DOM MutationObserver │
│  Layer 4: Defensive CSS Override Rules                 │
└────────────────────────────────────────────────────────┘
```

---

### Layer 1: Monkey-Patching Spline's WebGL Render Pipeline
Before creating the `Application` instance, `Application.prototype._createRenderer` is intercepted. This deletes watermark image references from the internal asset buffer and neutralizes the pipeline's watermark texture and UI overlay:

```typescript
const origCreateRenderer = Application.prototype._createRenderer;
if (origCreateRenderer) {
  Application.prototype._createRenderer = async function (...args: any[]) {
    // 1. Remove watermark images from internal shared dictionary
    if (this._data?.shared?.images) {
      for (const k of Object.keys(this._data.shared.images)) {
        if (/watermark|spline/i.test(k)) {
          delete this._data.shared.images[k];
        }
      }
    }

    const renderer = await origCreateRenderer.apply(this, args);

    // 2. Neutralize WebGL watermark pipeline & UI overlay
    if (renderer?.pipeline) {
      renderer.pipeline.setWatermark = function () {
        this.watermarkTexture = null;
        this._effectChainDirty = true;
      };
      renderer.pipeline.watermarkTexture = null;
      renderer.pipeline._chainWatermark = null;
      renderer.pipeline._effectChainDirty = true;
      if (renderer.pipeline.disableUIOverlay) {
        renderer.pipeline.disableUIOverlay();
      }
    }
    return renderer;
  };
}
```

---

### Layer 2: Asset Data Interception (`_data` Property Trap)
Spline often sets its data structure asynchronously after initialization. A property trap strips incoming watermark assets immediately:

```typescript
let splineData: any = undefined;
Object.defineProperty(app, "_data", {
  get() {
    return splineData;
  },
  set(val) {
    if (val?.shared?.images) {
      for (const k of Object.keys(val.shared.images)) {
        if (/watermark|spline/i.test(k)) {
          delete val.shared.images[k];
        }
      }
    }
    splineData = val;
  },
  configurable: true,
  enumerable: true,
});
```

---

### Layer 3: Scene Graph Purge & Live `MutationObserver`
After `app.load()` completes, the 3D scene hierarchy is traversed to remove any internal watermark meshes. Additionally, a `MutationObserver` watches the canvas container for any runtime HTML/iframe badges injected by Spline:

```typescript
// 1. Scene graph traversal
if (app._scene?.traverse) {
  app._scene.traverse((obj: any) => {
    if (obj.name && /watermark|spline/i.test(obj.name)) {
      obj.visible = false;
      if (obj.parent) obj.parent.remove(obj);
    }
  });
}

// 2. DOM purge function
const purgeSplineBadge = () => {
  document
    .querySelectorAll(
      '[data-spline-html-content], iframe[title*="Spline" i], #spline-watermark, .spline-watermark, a[href*="spline.design"], a[href*="spline"]'
    )
    .forEach((el) => el.remove());
};
purgeSplineBadge();

// 3. Live DOM observer
if (canvas.parentElement) {
  const obs = new MutationObserver(() => purgeSplineBadge());
  obs.observe(canvas.parentElement, { childList: true, subtree: true });
}
```

---

### Layer 4: Defensive CSS Overrides (`styles.css`)
As a final fallback, CSS completely suppresses any Spline DOM elements if they attempt to render before JS executes:

```css
#spline-watermark,
.spline-watermark,
[data-spline-html-content],
[data-spline-html-content] *,
iframe[title*="Spline" i],
a[href*="spline.design"],
a[href*="spline.design"] *,
a[href*="spline"],
.rb-stage > :not(canvas),
.sr-stage > :not(canvas),
.rb-stage [data-spline-html-content],
.sr-stage [data-spline-html-content],
.rb-stage a,
.sr-stage a,
.rb-stage iframe,
.sr-stage iframe {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  width: 0 !important;
  height: 0 !important;
  max-width: 0 !important;
  max-height: 0 !important;
  position: absolute !important;
  left: -99999px !important;
  top: -99999px !important;
}
```

---

## 4. 📁 Summary Table

| Component | Source File | Core Mechanics |
|---|---|---|
| **Small Robot** | `src/components/SmallRobotSection.tsx` | CDN runtime loading, base pose Euler mapping, damped cursor tracking (`SR.tau`) |
| **Big Robot Section** | `src/components/BigRobotSection.tsx` | Pinned stage, multi-part rig (`Head`, `Head 2`, `Neck`), 3D depth card fly-by |
| **Card Animations** | `src/components/SelectedWorks.tsx` & `BigRobotSection.tsx` | Z-space camera translation, progressive opacity/scale/blur decay, smooth gestures |
| **Watermark Stripping** | `SmallRobotSection.tsx`, `BigRobotSection.tsx`, `styles.css` | Pipeline prototype interception, data setter traps, DOM MutationObserver & CSS hides |

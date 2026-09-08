/* ============================================================
   All hero copy lives here — edit text freely without touching
   animation logic (script.js) or presentation (styles.css).
   index.html carries the same strings as a no-JS fallback.
   ============================================================ */
/* ============================================================
   All hero copy lives here — edit text freely without touching
   animation logic (script.js) or presentation (styles.css).
   index.html carries the same strings as a no-JS fallback.
   ============================================================ */
const heroContent = {
  nav: [
    { label: "Work", href: "#work", active: true },
    { label: "About", href: "#section-03" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Contact", href: "#contact" },
  ],

  cta: { label: "Let’s Talk", href: "#contact" },

  headline: "Muthukumar G",
  role: ["UI/UX", "Designer"],
  meta: ["UI/UX", "Product Design", "Design Systems"],

  notification: {
    name: "Muthukumar G",
    time: "now",
    lead: "UI/UX Designer",
    message: "2+ years of experience designing user-centered websites, mobile apps, dashboards & design systems.",
  },

  section2: {
    sideLeft: ["Muthukumar G", "Design."],
    sideRight: ["User-Centered.", "Scalable."],
  },

  /* My Works — Muthukumar G Key Projects */
  works: {
    brand: "Muthukumar G Studio",
    projects: [
      { key: "taxiby", name: "Taxiby Ecosystem", img: "assets/work-tourtripx.jpg", w: 498, h: 405,
        cat: "Mobile App · Admin Dashboard", year: "2024", accent: "#ff5722",
        title: "Taxi Booking Ecosystem for Customers, Drivers & Admins" },
      { key: "eastland", name: "Eastland Distribution", img: "assets/work-classlogic.jpg", w: 383, h: 363,
        cat: "CMS Dashboard · Web", year: "2024", accent: "#4da3ff",
        title: "Content & Brand Management System for Distribution Enterprise" },
      { key: "spearwin", name: "Spearwin Platform", img: "assets/work-couchops.jpg", w: 186, h: 362,
        cat: "Career Platform · Dashboard", year: "2024", accent: "#a8e063",
        title: "Career Development Platform with Interactive Animations & CMS" },
      { key: "snk", name: "SNK Construction", img: "assets/work-teaser.jpg", w: 400, h: 350,
        cat: "Interactive Web · Brand", year: "2024", accent: "#ffc107",
        title: "Modern Construction Services Website with Interactive Visual Layouts" },
      { key: "amaramba", name: "Amaramba Stock Market", img: "assets/work-tourtripx.jpg", w: 498, h: 405,
        cat: "FinTech · Admin Dashboard", year: "2024", accent: "#9c27b0",
        title: "Stock Market Administrative Dashboard & Data Visualization Platform" },
    ],
  },

  /* ---- BIG ROBOT section ---- */
  bigRobot: {
    labels: { left: "UI/UX & Product Designer", right: "Webnox Technologies · Coimbatore" },
    eyebrow: "( 05 · The Mind )",
    titleLines: ["I design interfaces that", "feel natural and look stunning."],
    description: "Skilled in user research, wireframing, high-fidelity prototyping, interaction design, and 3D visual assets.",
    hint: "Scroll to move through the design ideas.",

    techIdeas: [
      {
        no: "01",
        title: "User-Centered Experience",
        description: "Crafting intuitive user flows, wireframes, and high-fidelity prototypes grounded in user research and business goals.",
        tags: ["Figma", "Wireframing", "User Research", "Prototyping", "Usability Testing"],
      },
      {
        no: "02",
        title: "Design Systems & 3D Visuals",
        description: "Building scalable component libraries and creating high-quality 3D models in Blender for enhanced website aesthetics.",
        tags: ["Design Systems", "Blender (3D)", "Adobe Suite", "Interaction Design", "Brand Identity"],
      },
    ],
  },

  /* ---- EDITORIAL / SKILLS section ---- */
  editorial: {
    eyebrow: "( 06 · The Method )",
    statement: ["Empathy is my compass.", "Design is my medium."],
    note: "UI/UX Designer with 2+ years of experience delivering intuitive and scalable digital experiences.",
    skills: {
      title: "I Work With",
      groups: [
        { name: "Design Tools", items: ["Figma", "Blender (3D)", "Adobe Illustrator", "Adobe Photoshop", "Adobe After Effects", "Adobe XD"] },
        { name: "Core Skills", items: ["User-Centered Design", "Product Design", "Interaction Design", "User Research", "Wireframing", "Prototyping", "Logo Design", "Design Systems"] },
        { name: "Experience", items: ["Webnox Technologies (UI/UX Designer)", "ICore Software Technologies (UI/UX Intern)"] },
      ],
    },
    mindset: {
      title: "Research → Wireframe → Prototype → Test → Deliver",
      lines: [
        "I listen to users.",
        "I map user flows.",
        "I prototype and iterate.",
        "And I deliver pixel-perfect implementations.",
      ],
    },
    exploring: {
      title: "Focus & Expertise",
      items: [
        "Mobile Apps & Responsive Web UI",
        "Enterprise Admin Dashboards",
        "Design System Component Libraries",
        "3D Visual Assets & Micro-animations",
        "User Flows & Usability Testing",
      ],
    },
    ending: { lines: ["Still refining.", "Still designing.", "Still creating."], note: "B.E. Engineering Graduate · Dr. MCET, Pollachi." },
  },

  /* ---- SMALL ROBOT section ---- */
  smallRobot: {
    eyebrow: "( 06 · Interaction )",
    titleLines: ["Crafting meaningful", "digital experiences."],
    description: "Combining strategic user research with clean visual design.",
    note: "Move your cursor · it follows",
  },

  /* ---- FOOTER ---- */
  footer: {
    eyebrow: "( 07 \u00b7 Contact )",
    headline: ["Let\u2019s create", "something great."],
    line: "Open to UI/UX product design, design systems, and freelance opportunities.",
    email: "muthugmk641@gmail.com",
    emailLabel: "Say hello",
    columns: [
      {
        title: "Sections",
        items: [
          { label: "Hero", href: "#top" },
          { label: "Creative", href: "#work" },
          { label: "About", href: "#section-03" },
          { label: "Selected Works", href: "#projects" },
          { label: "The Mind", href: "#think" },
        ],
      },
      {
        title: "Method",
        items: [
          { label: "How I think", href: "#method" },
          { label: "What I work with", href: "#method" },
          { label: "Focus & Expertise", href: "#method" },
          { label: "Interaction", href: "#curious" },
        ],
      },
    ],
    social: [
      { label: "Behance Portfolio", href: "https://www.behance.net/muthukumarg2" },
      { label: "Phone: +91 9944536385", href: "tel:+919944536385" },
      { label: "Coimbatore, India", href: "#contact" },
    ],
    legal: "\u00a9 2026 Muthukumar G",
    note: "Built with passion and design thinking.",
    backToTop: "Back to top",
  },

  /* About Me chapter */
  about: {
    boxes: {
      who:   { title: "Who I Am",   sub: "Muthukumar G — UI/UX Designer with 2+ years experience." },
      what:  { title: "What I Do",  sub: "UI/UX · Product Design · Design Systems · 3D" },
      think: { title: "How I Think", sub: "Research · Wireframe · Prototype · Test · Deliver" },
    },
    views: {
      who: {
        eyebrow: "01 — Who I Am",
        head: "Muthukumar G",
        text: "UI/UX Designer with 2+ years of experience designing user-centered websites, mobile applications, dashboards, and enterprise products in Coimbatore, India.",
      },
      what: {
        eyebrow: "02 — What I Do",
        head: "User-Centered Product Design.",
        text: "Proficient in Figma, Adobe Creative Suite, and Blender. Delivering intuitive, scalable digital experiences through wireframes, high-fidelity prototypes, 3D visual elements, and design systems.",
      },
      think: {
        eyebrow: "03 — How I Think",
        head: "Empathy to Impact",
        text: "User Research · Competitor Analysis · Wireframing · High-Fidelity Prototyping · Pixel-Perfect Developer Handoff.",
      },
    },
  },
};

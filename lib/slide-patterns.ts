/**
 * Visual pattern library for SpeakToSlides.
 *
 * These patterns + reference templates are injected into the Claude system
 * prompt so the AI knows what "great" HTML slides look like.
 *
 * The patterns describe WHAT to build.  The templates show HOW.
 */

// ---------------------------------------------------------------------------
// PATTERN DESCRIPTIONS (injected as text into the system prompt)
// ---------------------------------------------------------------------------

export const VISUAL_PATTERNS = {
  // Layout patterns
  twoColumn:
    "CSS grid with 2 columns — text left, visual/diagram right. Use for content + supporting graphic.",
  fullBleed:
    "Full-width hero with gradient background and centered text overlay. Use for title and impact slides.",
  cardGrid:
    "3-column card grid for feature lists or key points. Each card has an icon, heading, and description.",
  timeline:
    "Vertical timeline with CSS borders, dots, and alternating content blocks. Use for history or roadmaps.",

  // Data visualization
  comparisonBar:
    "Side-by-side horizontal bars using CSS width % for visual comparison of two values.",
  progressRing:
    "Inline SVG circle (stroke-dasharray) showing progress percentage. Clean and modern.",
  statHighlight:
    "Giant number (4-6rem) with a small label underneath, centered in a card. Use for KPIs.",

  // Diagrams
  flowchart:
    "CSS flexbox row of boxes connected by SVG or CSS arrows (→). For process flows.",
  processList:
    "Numbered steps in a vertical list with a connecting line (CSS border-left). For step-by-step.",
  orgChart:
    "Hierarchical tree using nested CSS flexbox. For organization or taxonomy.",

  // Content types
  quoteSlide:
    "Large pull-quote in italic, oversized opening quote mark, attribution below. Centered.",
  bulletGrid:
    "Inline SVG icon + text pairs arranged in a 2-column grid. Replaces boring bullet lists.",
  beforeAfter:
    "Split-screen comparison: left = before (muted), right = after (accent-highlighted).",
  iconRow:
    "Row of 3-5 circular SVG icons with labels below. Great for values, features, or pillars.",
} as const;

// ---------------------------------------------------------------------------
// 5 REFERENCE TEMPLATES
//
// Each is a self-contained HTML snippet (~30-60 lines) using only inline
// styles and inline SVG.  NO external URLs, fonts, or images.
// ---------------------------------------------------------------------------

/**
 * 1. TITLE SLIDE — gradient background, large centered text, subtle decoration
 */
export const TEMPLATE_TITLE = `<!-- TEMPLATE: Title Slide -->
<div style="position:absolute;inset:0;background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#312e81 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <!-- Decorative top bar -->
  <div style="width:80px;height:4px;background:#6366f1;border-radius:2px;margin-bottom:40px;"></div>
  <!-- Main title -->
  <h1 style="font-size:3.5rem;font-weight:800;color:#f1f5f9;text-align:center;line-height:1.15;margin:0 0 20px;max-width:900px;">
    The Future of&nbsp;Remote&nbsp;Work
  </h1>
  <!-- Subtitle -->
  <p style="font-size:1.35rem;color:#94a3b8;text-align:center;margin:0;font-weight:300;max-width:700px;">
    Trends, challenges, and opportunities for 2025 and beyond
  </p>
  <!-- Decorative bottom bar -->
  <div style="width:80px;height:4px;background:#6366f1;border-radius:2px;margin-top:40px;"></div>
</div>`;

/**
 * 2. STATS SLIDE — 3 big numbers with labels, card layout
 */
export const TEMPLATE_STATS = `<!-- TEMPLATE: Stats Slide -->
<div style="position:absolute;inset:0;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <h2 style="font-size:2.2rem;font-weight:700;color:#f1f5f9;margin:0 0 48px;text-align:center;">By the Numbers</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;max-width:900px;width:100%;">
    <!-- Stat 1 -->
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:36px 24px;text-align:center;border-top:3px solid #6366f1;">
      <div style="font-size:3.2rem;font-weight:800;color:#6366f1;line-height:1;margin-bottom:12px;">87%</div>
      <div style="font-size:1rem;color:#94a3b8;font-weight:500;">Employees prefer hybrid</div>
    </div>
    <!-- Stat 2 -->
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:36px 24px;text-align:center;border-top:3px solid #22d3ee;">
      <div style="font-size:3.2rem;font-weight:800;color:#22d3ee;line-height:1;margin-bottom:12px;">2.5×</div>
      <div style="font-size:1rem;color:#94a3b8;font-weight:500;">Productivity increase</div>
    </div>
    <!-- Stat 3 -->
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:36px 24px;text-align:center;border-top:3px solid #a78bfa;">
      <div style="font-size:3.2rem;font-weight:800;color:#a78bfa;line-height:1;margin-bottom:12px;">$11K</div>
      <div style="font-size:1rem;color:#94a3b8;font-weight:500;">Saved per remote worker/yr</div>
    </div>
  </div>
</div>`;

/**
 * 3. PROCESS FLOW — 4 steps connected by CSS/SVG arrows
 */
export const TEMPLATE_PROCESS = `<!-- TEMPLATE: Process Flow -->
<div style="position:absolute;inset:0;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <h2 style="font-size:2.2rem;font-weight:700;color:#f1f5f9;margin:0 0 48px;text-align:center;">How It Works</h2>
  <div style="display:flex;align-items:center;gap:0;max-width:960px;width:100%;">
    <!-- Step 1 -->
    <div style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:28px 20px;text-align:center;">
      <div style="width:44px;height:44px;background:#6366f1;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
        <svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2 2"/></svg>
      </div>
      <div style="font-size:0.85rem;font-weight:700;color:#6366f1;margin-bottom:6px;">STEP 1</div>
      <div style="font-size:1.05rem;font-weight:600;color:#f1f5f9;margin-bottom:6px;">Research</div>
      <div style="font-size:0.85rem;color:#94a3b8;">Gather requirements and data</div>
    </div>
    <!-- Arrow -->
    <svg width="36" height="24" style="flex-shrink:0;"><path d="M4 12h20m-6-6 6 6-6 6" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <!-- Step 2 -->
    <div style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:28px 20px;text-align:center;">
      <div style="width:44px;height:44px;background:#22d3ee;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
        <svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 7h6M7 10h4"/></svg>
      </div>
      <div style="font-size:0.85rem;font-weight:700;color:#22d3ee;margin-bottom:6px;">STEP 2</div>
      <div style="font-size:1.05rem;font-weight:600;color:#f1f5f9;margin-bottom:6px;">Design</div>
      <div style="font-size:0.85rem;color:#94a3b8;">Create the blueprint</div>
    </div>
    <!-- Arrow -->
    <svg width="36" height="24" style="flex-shrink:0;"><path d="M4 12h20m-6-6 6 6-6 6" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <!-- Step 3 -->
    <div style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:28px 20px;text-align:center;">
      <div style="width:44px;height:44px;background:#a78bfa;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
        <svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><path d="M12 2 L2 7 L12 12 L22 7 Z"/><path d="M2 12l10 5 10-5"/></svg>
      </div>
      <div style="font-size:0.85rem;font-weight:700;color:#a78bfa;margin-bottom:6px;">STEP 3</div>
      <div style="font-size:1.05rem;font-weight:600;color:#f1f5f9;margin-bottom:6px;">Build</div>
      <div style="font-size:0.85rem;color:#94a3b8;">Develop and iterate</div>
    </div>
    <!-- Arrow -->
    <svg width="36" height="24" style="flex-shrink:0;"><path d="M4 12h20m-6-6 6 6-6 6" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <!-- Step 4 -->
    <div style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:28px 20px;text-align:center;">
      <div style="width:44px;height:44px;background:#34d399;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
        <svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><path d="M4 10l4 4 8-8"/></svg>
      </div>
      <div style="font-size:0.85rem;font-weight:700;color:#34d399;margin-bottom:6px;">STEP 4</div>
      <div style="font-size:1.05rem;font-weight:600;color:#f1f5f9;margin-bottom:6px;">Launch</div>
      <div style="font-size:0.85rem;color:#94a3b8;">Ship and measure results</div>
    </div>
  </div>
</div>`;

/**
 * 4. COMPARISON SLIDE — before/after with color coding
 */
export const TEMPLATE_COMPARISON = `<!-- TEMPLATE: Before / After Comparison -->
<div style="position:absolute;inset:0;background:#0f172a;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <h2 style="font-size:2.2rem;font-weight:700;color:#f1f5f9;margin:0 0 40px;text-align:center;">Before vs After</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;max-width:900px;width:100%;">
    <!-- Before column -->
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;border-top:4px solid #ef4444;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
        <svg width="24" height="24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 8l8 8M16 8l-8 8"/></svg>
        <span style="font-size:1.1rem;font-weight:700;color:#ef4444;">Before</span>
      </div>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px;">
        <li style="display:flex;align-items:flex-start;gap:10px;font-size:1rem;color:#94a3b8;">
          <span style="color:#ef4444;font-size:1.1rem;line-height:1.5;">✗</span> Manual processes everywhere
        </li>
        <li style="display:flex;align-items:flex-start;gap:10px;font-size:1rem;color:#94a3b8;">
          <span style="color:#ef4444;font-size:1.1rem;line-height:1.5;">✗</span> 3-day turnaround on reports
        </li>
        <li style="display:flex;align-items:flex-start;gap:10px;font-size:1rem;color:#94a3b8;">
          <span style="color:#ef4444;font-size:1.1rem;line-height:1.5;">✗</span> Error rate above 12%
        </li>
        <li style="display:flex;align-items:flex-start;gap:10px;font-size:1rem;color:#94a3b8;">
          <span style="color:#ef4444;font-size:1.1rem;line-height:1.5;">✗</span> Team morale declining
        </li>
      </ul>
    </div>
    <!-- After column -->
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;border-top:4px solid #22c55e;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
        <svg width="24" height="24" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>
        <span style="font-size:1.1rem;font-weight:700;color:#22c55e;">After</span>
      </div>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px;">
        <li style="display:flex;align-items:flex-start;gap:10px;font-size:1rem;color:#f1f5f9;">
          <span style="color:#22c55e;font-size:1.1rem;line-height:1.5;">✓</span> Fully automated pipeline
        </li>
        <li style="display:flex;align-items:flex-start;gap:10px;font-size:1rem;color:#f1f5f9;">
          <span style="color:#22c55e;font-size:1.1rem;line-height:1.5;">✓</span> Real-time dashboards
        </li>
        <li style="display:flex;align-items:flex-start;gap:10px;font-size:1rem;color:#f1f5f9;">
          <span style="color:#22c55e;font-size:1.1rem;line-height:1.5;">✓</span> Error rate below 0.5%
        </li>
        <li style="display:flex;align-items:flex-start;gap:10px;font-size:1rem;color:#f1f5f9;">
          <span style="color:#22c55e;font-size:1.1rem;line-height:1.5;">✓</span> Team NPS up 40 points
        </li>
      </ul>
    </div>
  </div>
</div>`;

/**
 * 5. QUOTE SLIDE — large pull quote with visual treatment
 */
export const TEMPLATE_QUOTE = `<!-- TEMPLATE: Quote Slide -->
<div style="position:absolute;inset:0;background:linear-gradient(160deg,#0f172a 0%,#1e1b4b 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:800px;text-align:center;position:relative;">
    <!-- Decorative quote mark -->
    <span style="font-size:8rem;color:#6366f1;opacity:0.25;line-height:1;position:absolute;top:-60px;left:-20px;font-family:Georgia,serif;">"</span>
    <!-- Quote text -->
    <blockquote style="font-size:2rem;font-style:italic;color:#f1f5f9;line-height:1.6;margin:0 0 32px;position:relative;z-index:1;">
      The best way to predict the future is to invent it.
    </blockquote>
    <!-- Divider line -->
    <div style="width:60px;height:3px;background:#6366f1;margin:0 auto 20px;border-radius:2px;"></div>
    <!-- Attribution -->
    <cite style="font-size:1.1rem;color:#a78bfa;font-style:normal;font-weight:500;">— Alan Kay, Computer Scientist</cite>
  </div>
</div>`;

// ---------------------------------------------------------------------------
// COMBINED: all 5 templates as an array (for prompt injection)
// ---------------------------------------------------------------------------

export const REFERENCE_TEMPLATES = [
  { name: "Title Slide", html: TEMPLATE_TITLE },
  { name: "Stats Slide", html: TEMPLATE_STATS },
  { name: "Process Flow", html: TEMPLATE_PROCESS },
  { name: "Comparison (Before/After)", html: TEMPLATE_COMPARISON },
  { name: "Quote Slide", html: TEMPLATE_QUOTE },
];

// ---------------------------------------------------------------------------
// VISUAL DESIGN INSTRUCTIONS (injected into the system prompt)
// ---------------------------------------------------------------------------

export const VISUAL_DESIGN_INSTRUCTIONS = `
## Visual Design Rules — CRITICAL

You are generating HTML slides that will be rendered in a browser. The HTML IS the visual engine — there are no external image APIs. Every slide must look DESIGNED, not templated.

### Layout & Composition
- Every slide must have ONE clear visual hierarchy: one primary element that draws the eye first.
- Use contrasting background colors across slides — alternate between solid dark backgrounds and subtle gradients. Never make all slides the same background.
- Use CSS custom properties or a consistent color palette per deck: one primary color, one secondary, one accent.
- Minimum font size: 1.2rem. No tiny text ever.
- Maximum content width: 960px. Center content horizontally.
- Use generous padding (60px on desktop). White space is a design tool.

### Icons & Graphics
- Use inline SVG for ALL icons. Never reference external image URLs or icon libraries.
- SVG icons should be 20-24px with stroke-width: 2, matching the accent color.
- For decorative elements: use CSS shapes (border-radius circles, gradient bars, dashed borders).
- For charts/data viz: use CSS width percentages for bars, inline SVG for circles/rings.

### Typography
- Use a system font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
- Headings: font-weight 700-800, size 2-3.5rem.
- Body: font-weight 400-500, size 1-1.3rem, line-height 1.6-1.8.
- Stats/numbers: font-weight 800, size 3-4rem, in the accent color.
- Use letter-spacing: -0.02em on large headings for tightness.

### Color Strategy
- For "modern" theme: dark navy (#0f172a) backgrounds, indigo (#6366f1) accent, slate text (#f1f5f9, #94a3b8).
- For "minimal" theme: near-white (#f8f9fa) backgrounds, blue (#2563eb) accent, gray text (#111827, #6b7280).
- For "bold" theme: deep dark (#0f0f1a) backgrounds, amber (#f59e0b) accent, white/zinc text.
- Use a SECOND accent color for variety (e.g., cyan #22d3ee, purple #a78bfa, emerald #34d399).
- Apply accent colors to: borders (border-top: 3px solid), stat numbers, icons, decorative bars.

### Slide Type Patterns
- **Process flows**: Use CSS flexbox row of rounded boxes connected by SVG arrow elements.
- **Comparisons**: Side-by-side columns with distinct color coding (red for "before", green for "after").
- **Statistics**: Giant numbers (3-4rem) centered in cards with colored top borders.
- **Lists**: Replace bullet points with numbered circles or inline SVG icons in a grid layout.
- **Quotes**: Large italic text with an oversized decorative quote mark, centered composition.
- **Timelines**: Vertical line (CSS border-left) with positioned dots and alternating content.

### What NOT to Do
- No external image URLs — ever. No <img src="https://...">.
- No emoji as primary visual elements (small decorative emoji is OK).
- No walls of text — if a paragraph exceeds 3 lines, split it or use bullet points.
- No identical layouts on consecutive slides.
- No plain white backgrounds on dark themes or plain black on light themes.
`;

// ---------------------------------------------------------------------------
// Combine templates into a prompt-ready string
// ---------------------------------------------------------------------------

export function getTemplatePromptSection(): string {
  const lines = [
    "\n## Reference Slide Templates\n",
    "Here are 5 reference slides showing the visual quality standard you MUST match or exceed. Study the HTML patterns, color usage, SVG icons, and layout approach:\n",
  ];

  for (const t of REFERENCE_TEMPLATES) {
    lines.push(`### ${t.name}\n\`\`\`html\n${t.html}\n\`\`\`\n`);
  }

  lines.push(
    "Use these as inspiration. Do NOT copy them verbatim — adapt the patterns to match each deck's content. Vary colors, layouts, and decorative elements across slides.\n"
  );

  return lines.join("\n");
}

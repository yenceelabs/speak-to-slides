export interface Slide {
  type: "title" | "bullets" | "content" | "quote" | "stats" | "image";
  heading?: string;
  subtitle?: string;
  points?: string[];
  body?: string;
  text?: string;
  attribution?: string;
  stats?: Array<{ value: string; label: string }>;
  caption?: string;
  placeholder?: boolean;
  /** User-uploaded image URL — overrides AI placeholder on any slide type */
  user_image_url?: string;
}

export interface DeckJSON {
  title: string;
  theme?: "modern" | "minimal" | "bold";
  slides: Slide[];
}

function getThemeColors(theme: string): {
  bg: string;
  surface: string;
  accent: string;
  accentAlt: string;
  text: string;
  textMuted: string;
  border: string;
} {
  switch (theme) {
    case "minimal":
      return {
        bg: "#f8f9fa",
        surface: "#ffffff",
        accent: "#2563eb",
        accentAlt: "#1d4ed8",
        text: "#111827",
        textMuted: "#6b7280",
        border: "#e5e7eb",
      };
    case "bold":
      return {
        bg: "#0f0f1a",
        surface: "#1a1a2e",
        accent: "#f59e0b",
        accentAlt: "#d97706",
        text: "#ffffff",
        textMuted: "#a1a1aa",
        border: "#2d2d42",
      };
    case "modern":
    default:
      return {
        bg: "#0f172a",
        surface: "#1e293b",
        accent: "#6366f1",
        accentAlt: "#4f46e5",
        text: "#f1f5f9",
        textMuted: "#94a3b8",
        border: "#334155",
      };
  }
}

function renderSlide(slide: Slide, index: number, total: number, colors: ReturnType<typeof getThemeColors>): string {
  const { bg, surface, accent, accentAlt, text, textMuted, border } = colors;

  const slideStyle = `
    position: absolute; inset: 0;
    background: ${bg};
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 60px;
    box-sizing: border-box;
  `;

  switch (slide.type) {
    case "title":
      return `
        <div class="slide" data-index="${index}" style="${slideStyle}">
          <div style="text-align:center; max-width:900px; width:100%;">
            <div style="width:60px;height:4px;background:${accent};margin:0 auto 40px;border-radius:2px;"></div>
            <h1 style="font-size:clamp(2rem,5vw,4rem);font-weight:800;color:${text};line-height:1.15;margin:0 0 24px;">${slide.heading || ""}</h1>
            ${slide.subtitle ? `<p style="font-size:clamp(1rem,2vw,1.5rem);color:${textMuted};margin:0;font-weight:300;">${slide.subtitle}</p>` : ""}
            <div style="width:60px;height:4px;background:${accent};margin:40px auto 0;border-radius:2px;"></div>
          </div>
        </div>`;

    case "bullets": {
      const bulletUserImg = slide.user_image_url;
      return `
        <div class="slide" data-index="${index}" style="${slideStyle}align-items:flex-start;">
          <div style="max-width:960px;width:100%;display:flex;gap:40px;align-items:flex-start;">
            <div style="flex:1;min-width:0;">
              <h2 style="font-size:clamp(1.5rem,3vw,2.5rem);font-weight:700;color:${text};margin:0 0 40px;padding-bottom:16px;border-bottom:2px solid ${border};">${slide.heading || ""}</h2>
              <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px;">
                ${(slide.points || []).map((pt, i) => `
                  <li class="bullet-item" style="display:flex;align-items:flex-start;gap:16px;opacity:0;transform:translateX(-20px);transition:all 0.4s ease ${i * 0.1}s;">
                    <span style="min-width:32px;height:32px;background:${accent};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:#fff;flex-shrink:0;margin-top:2px;">${i + 1}</span>
                    <span style="font-size:clamp(1rem,1.8vw,1.3rem);color:${text};line-height:1.6;">${pt}</span>
                  </li>`).join("")}
              </ul>
            </div>
            ${bulletUserImg ? `<div style="flex-shrink:0;width:320px;"><img src="${bulletUserImg}" alt="Slide image" style="width:100%;border-radius:12px;border:2px solid ${border};object-fit:cover;max-height:400px;" /></div>` : ""}
          </div>
        </div>`;
    }

    case "content": {
      const contentUserImg = slide.user_image_url;
      return `
        <div class="slide" data-index="${index}" style="${slideStyle}align-items:flex-start;">
          <div style="max-width:960px;width:100%;display:flex;gap:40px;align-items:flex-start;">
            <div style="flex:1;min-width:0;">
              <h2 style="font-size:clamp(1.5rem,3vw,2.5rem);font-weight:700;color:${text};margin:0 0 32px;padding-bottom:16px;border-bottom:2px solid ${border};">${slide.heading || ""}</h2>
              <p style="font-size:clamp(1rem,1.8vw,1.25rem);color:${textMuted};line-height:1.8;margin:0;">${slide.body || ""}</p>
            </div>
            ${contentUserImg ? `<div style="flex-shrink:0;width:320px;"><img src="${contentUserImg}" alt="Slide image" style="width:100%;border-radius:12px;border:2px solid ${border};object-fit:cover;max-height:400px;" /></div>` : ""}
          </div>
        </div>`;
    }

    case "quote":
      return `
        <div class="slide" data-index="${index}" style="${slideStyle}">
          <div style="max-width:800px;width:100%;text-align:center;">
            <span style="font-size:6rem;color:${accent};line-height:1;display:block;margin-bottom:-20px;opacity:0.5;">"</span>
            <blockquote style="font-size:clamp(1.2rem,2.5vw,2rem);font-style:italic;color:${text};line-height:1.6;margin:0 0 32px;">${slide.text || ""}</blockquote>
            ${slide.attribution ? `<cite style="font-size:1rem;color:${textMuted};font-style:normal;">— ${slide.attribution}</cite>` : ""}
          </div>
        </div>`;

    case "stats":
      return `
        <div class="slide" data-index="${index}" style="${slideStyle}align-items:flex-start;">
          <div style="max-width:960px;width:100%;">
            <h2 style="font-size:clamp(1.5rem,3vw,2.5rem);font-weight:700;color:${text};margin:0 0 48px;text-align:center;">${slide.heading || ""}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;">
              ${(slide.stats || []).map(stat => `
                <div style="background:${surface};border:1px solid ${border};border-radius:16px;padding:32px 24px;text-align:center;border-top:3px solid ${accent};">
                  <div style="font-size:clamp(2rem,4vw,3.5rem);font-weight:800;color:${accent};line-height:1;margin-bottom:12px;">${stat.value}</div>
                  <div style="font-size:1rem;color:${textMuted};font-weight:500;">${stat.label}</div>
                </div>`).join("")}
            </div>
          </div>
        </div>`;

    case "image": {
      const imgSrc = slide.user_image_url;
      const imageBlock = imgSrc
        ? `<img src="${imgSrc}" alt="${slide.heading || "Slide image"}" style="width:100%;height:320px;object-fit:cover;border-radius:16px;border:2px solid ${border};margin-bottom:24px;display:block;" />`
        : `<div style="width:100%;height:320px;background:linear-gradient(135deg,${accent}33,${accentAlt}66);border-radius:16px;display:flex;align-items:center;justify-content:center;border:2px dashed ${border};margin-bottom:24px;" data-image-placeholder="true">
              <span style="color:${textMuted};font-size:1rem;">🖼️ Drop an image here — or paste one via the bot</span>
            </div>`;
      return `
        <div class="slide" data-index="${index}" style="${slideStyle}align-items:flex-start;">
          <div style="max-width:900px;width:100%;">
            <h2 style="font-size:clamp(1.5rem,3vw,2.5rem);font-weight:700;color:${text};margin:0 0 32px;">${slide.heading || ""}</h2>
            ${imageBlock}
            ${slide.caption ? `<p style="font-size:1rem;color:${textMuted};text-align:center;font-style:italic;">${slide.caption}</p>` : ""}
          </div>
        </div>`;
    }

    default:
      return `<div class="slide" data-index="${index}" style="${slideStyle}"><p style="color:${text};">Slide ${index + 1}</p></div>`;
  }
}

export function renderDeckToHTML(deckJson: DeckJSON, isPro = false): string {
  const theme = deckJson.theme || "modern";
  const colors = getThemeColors(theme);
  const { bg, surface, accent, text, textMuted, border } = colors;
  const slides = deckJson.slides || [];
  const total = slides.length;

  const slidesHTML = slides.map((slide, i) => renderSlide(slide, i, total, colors)).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${deckJson.title || "Presentation"}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width:100%; height:100%; overflow:hidden; background:${bg}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
  
  #deck { position:fixed; inset:0; }
  
  .slide { display:none; }
  .slide.active { display:flex !important; }
  
  /* Bullet animation */
  .slide.active .bullet-item { opacity:1 !important; transform:translateX(0) !important; }
  
  /* Navigation controls */
  #controls {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    display:flex; align-items:center; gap:12px;
    background:rgba(0,0,0,0.6); backdrop-filter:blur(10px);
    padding:10px 20px; border-radius:50px;
    border:1px solid ${border};
    z-index:100;
  }
  .btn {
    background:${surface}; color:${text}; border:1px solid ${border};
    padding:8px 16px; border-radius:24px; cursor:pointer;
    font-size:0.85rem; font-weight:500; transition:all 0.2s;
    user-select:none;
  }
  .btn:hover { background:${accent}; border-color:${accent}; color:#fff; }
  .btn:disabled { opacity:0.3; cursor:not-allowed; }
  .btn.icon { padding:8px 12px; font-size:1rem; }
  
  #slide-counter {
    color:${textMuted}; font-size:0.85rem; font-weight:500; min-width:60px; text-align:center;
  }
  
  /* Progress bar */
  #progress {
    position:fixed; top:0; left:0; height:3px;
    background:${accent}; transition:width 0.3s ease; z-index:100;
  }
  
  /* Fullscreen button */
  #fs-btn {
    position:fixed; top:16px; right:16px; z-index:100;
    background:rgba(0,0,0,0.5); border:1px solid ${border};
    color:${textMuted}; padding:8px 12px; border-radius:8px;
    cursor:pointer; font-size:0.8rem; transition:all 0.2s;
    backdrop-filter:blur(10px);
  }
  #fs-btn:hover { color:${text}; border-color:${accent}; }
  
  /* Watermark */
  #watermark {
    position:fixed; bottom:16px; right:16px; z-index:100;
    font-size:0.72rem; color:${textMuted}; opacity:0.6;
    font-weight:500; letter-spacing:0.01em;
    background:rgba(0,0,0,0.35); backdrop-filter:blur(6px);
    padding:5px 10px; border-radius:6px;
    border:1px solid ${border};
    text-decoration:none; display:block;
    transition:opacity 0.2s;
  }
  #watermark:hover { opacity:1; }
  
  /* Transition */
  .slide { animation:fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  
  /* Mobile touch areas */
  #touch-prev, #touch-next {
    position:fixed; top:0; width:30%; height:100%;
    z-index:50; cursor:pointer;
  }
  #touch-prev { left:0; }
  #touch-next { right:0; }
  
  @media (max-width:768px) {
    #controls { bottom:16px; padding:8px 14px; gap:8px; }
    .btn { padding:6px 12px; font-size:0.8rem; }
  }
</style>
</head>
<body>

<div id="progress"></div>
${isPro ? "" : '<a id="watermark" href="https://speaktoslides.com" target="_blank" rel="noopener noreferrer">Made with speaktoslides.com</a>'}
<button id="fs-btn" onclick="toggleFullscreen()">⛶ Fullscreen</button>

<div id="deck">
${slidesHTML}
</div>

<!-- Touch zones for mobile swipe -->
<div id="touch-prev" onclick="prevSlide()"></div>
<div id="touch-next" onclick="nextSlide()"></div>

<div id="controls">
  <button class="btn icon" id="prev-btn" onclick="prevSlide()">←</button>
  <span id="slide-counter">1 / ${total}</span>
  <button class="btn icon" id="next-btn" onclick="nextSlide()">→</button>
</div>

<script>
  var current = 0;
  var total = ${total};
  var slides = document.querySelectorAll('.slide');
  var startX = 0;

  function showSlide(n) {
    if (n < 0 || n >= total) return;
    slides.forEach(function(s) { s.classList.remove('active'); });
    current = n;
    slides[current].classList.add('active');
    document.getElementById('slide-counter').textContent = (current + 1) + ' / ' + total;
    document.getElementById('prev-btn').disabled = current === 0;
    document.getElementById('next-btn').disabled = current === total - 1;
    document.getElementById('progress').style.width = ((current + 1) / total * 100) + '%';
    // Notify parent frame of slide change
    try { window.parent.postMessage({ type: 'slideChange', index: current }, '*'); } catch(e) {}
  }

  function nextSlide() { showSlide(current + 1); }
  function prevSlide() { showSlide(current - 1); }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function(){});
      document.getElementById('fs-btn').textContent = '✕ Exit';
    } else {
      document.exitFullscreen();
      document.getElementById('fs-btn').textContent = '⛶ Fullscreen';
    }
  }

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); nextSlide(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prevSlide(); }
    if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
  });

  // Touch swipe support
  document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide(); else prevSlide();
    }
  }, { passive: true });

  // Init — run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { showSlide(0); });
  } else {
    showSlide(0);
  }
</script>
</body>
</html>`;
}

export function parseDeckJSON(rawContent: string): DeckJSON {
  // Strip markdown code blocks if present
  let clean = rawContent.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    console.error("parseDeckJSON: AI returned non-JSON. First 300 chars:", clean.slice(0, 300));
    throw new Error("AI returned invalid JSON for deck. This is a temporary issue — please try again.");
  }

  // Basic shape validation
  if (typeof parsed !== "object" || parsed === null || !Array.isArray((parsed as DeckJSON).slides)) {
    throw new Error("AI returned unexpected structure for deck. Expected { slides: [...] }.");
  }

  return parsed as DeckJSON;
}

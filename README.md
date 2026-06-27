# Hooga — Electric Motorcycles (Website)

A clean, premium, fully responsive landing page for **Hooga**, a high-performance
electric-motorcycle brand. Built from the Figma design ("Hooga Website Design") with a
sunday.ai-inspired aesthetic — lots of whitespace, confident type, full-bleed imagery.

Pure **HTML / CSS / JS** — no build step, no dependencies.

## Structure
```
hooga website/
├── index.html        # all sections / markup
├── css/styles.css    # design system, layout, responsive, animations
├── js/main.js        # interactions (see below)
├── assets/           # downloaded imagery (hero, gallery, terrain)
└── README.md
```

## Sections
Hero → Spec bar → "Built Different. Proven Everywhere." → Gallery → Industry First
→ Terrain band → Founding Riders band → Comparison table → Dimensions → Reserve → Footer.

## Functionality
- **Model switcher** (M15 / M1R) — animates the hero name + spec bar numbers and syncs the reserve form
- **Sticky header** that turns solid on scroll, with a top **scroll-progress bar**
- **Mobile slide-in menu** (hamburger) with backdrop + Esc to close
- **Scroll-reveal** animations (IntersectionObserver, staggered)
- **Drag-to-scroll gallery** with snap + prev/next arrows
- **Interactive dimensions** diagram (hover/tap pins reveal measurements)
- **Reserve form** with validation + success state
- **Scroll-spy** active nav highlighting
- Respects `prefers-reduced-motion`

## Run it locally
From inside this folder:

```bash
python3 -m http.server 5500
```

Open **http://localhost:5500**

(Any static server works — `npx serve`, VS Code Live Server, etc.)

## Notes
- Imagery in `assets/` was pulled from Unsplash as production-stand-in photography.
  Swap in real Hooga product shots with the same filenames to update the whole site.
- Exact Figma tokens (colors/spacing) couldn't be auto-extracted because the Figma MCP
  hit its Starter-plan rate limit; the build was reconstructed from the provided
  screenshot + reference style. Share specific hex/spacing values and they can be matched 1:1.

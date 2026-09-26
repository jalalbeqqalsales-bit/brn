# VONI Studio website

Static single-page site for voniweb.com. No build step: deploy the contents of
this folder as-is.

```
index.html               page, styles and scripts (inline)
favicon.svg
robots.txt, sitemap.xml
assets/og.png            1200×630 social preview (WhatsApp, Instagram, X, LinkedIn)
assets/apple-touch-icon.png
assets/logo/             source logo SVGs
assets/fonts/            Archivo variable, latin subset, wdth 100–125, wght 400–900 (OFL)
assets/js/               GSAP 3.13.0, Lenis 1.3.4 (self-hosted, unmodified)
```

Preview locally: `python3 -m http.server -d website 8080` → http://localhost:8080

## Notes

- Everything is self-hosted; the page makes no third-party requests.
- The WebGL hero globe and the four lab canvases only run on hardware GPUs. On
  software renderers (SwiftShader/llvmpipe, blocklisted GPUs) the page keeps
  the static SVG/CSS fallbacks instead of rendering at a few FPS.
- Deep links (`/#quote`, `/#faq`, `/#contact`, …) jump to the section once the
  loader finishes.
- `og:image` and the JSON-LD use absolute `https://voniweb.com/` URLs; update
  them if the domain changes.

# WishAura 🎂✨

> The most beautiful way to say happy birthday.

WishAura is a premium, animated birthday wish generator built with **pure HTML, CSS and vanilla JavaScript** — no frameworks, no bundlers, no dependencies. Open `index.html` and you're live.

## ✨ Features

- **Cinematic aurora background** — animated gradient blobs, subtle grain and noise
- **7 signature themes** — Aurora · Kids · Minimal · Luxury Gold · Royal Purple · Cute Pink · Dark Neon
- **Live generator** — name, message, photo, theme; every keystroke updates the card in real time
- **Confetti + sparkles + floating emojis + firefly particles**
- **3D card tilt** — physical, mouse-tracked parallax
- **1-tap share** — WhatsApp, native share, copy link
- **HD export** — download the card as PNG or JPG
- **Ambient WebAudio music** — never autoplays, remembers preference
- **AdSense / Adsterra ready** — three tasteful ad slots (top banner, in-content native, bottom banner)
- **SEO 100** — meta, Open Graph, Twitter cards, structured data, sitemap, robots, manifest
- **Accessible** — semantic HTML, keyboard focus states, ARIA labels, `prefers-reduced-motion`
- **Responsive** — pixel-perfect from 320px to 1920px+

## 📁 Structure

```
/
├── index.html         # single-page application
├── style.css          # all styles (glassmorphism, aurora, themes, motion)
├── script.js          # form, tilt, confetti, particles, share, export, audio
├── favicon.svg
├── manifest.json
├── robots.txt
├── sitemap.xml
└── README.md
```

## 🚀 Deploy

Any static host works — WishAura has zero build step.

- **GitHub Pages** — push to `main`, enable Pages, done.
- **Netlify / Cloudflare Pages / Vercel** — drop the folder, done.
- **Any Apache / Nginx** — copy the files, done.

## 💰 Ads

Three semantic `<aside class="ad">` slots are already placed:

- `[data-slot="top-banner"]` — above the fold, safe for a leaderboard
- `[data-slot="in-content"]` — mid-page native placement
- `[data-slot="bottom-banner"]` — before the footer

Drop your AdSense or Adsterra snippet inside the matching `.ad-slot` element.

## 🎨 Customization

Every color, radius and shadow lives in `:root` CSS variables inside `style.css`. Duplicate a `[data-theme="..."]` block to add a new theme.

## 🛣 Roadmap

- Video export (MP4 / GIF)
- Custom music upload
- Named URL sharing (`/wish/amara`)
- More themes (Retro, Aesthetic, Anime)

Made with 💛 for birthdays everywhere.

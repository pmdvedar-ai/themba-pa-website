# themba-pa.com — Website

Single-page site for The MBA PA consulting & courses brand.

## Stack
- Plain HTML/CSS/JS — no build step required
- Hosted on Cloudflare Pages (free)
- Domain: themba-pa.com (Namecheap → Cloudflare DNS)

## Deploy

1. Push this folder to a GitHub repo (e.g. `themba-pa-website`)
2. Connect repo to Cloudflare Pages (dashboard.cloudflare.com → Pages → Create project)
3. Build settings: none needed — it's static HTML
4. Add custom domain: themba-pa.com in Cloudflare Pages settings
5. Point Namecheap nameservers to Cloudflare (shown in Cloudflare DNS setup)

## Contact Form
Currently using Formspree as placeholder. Replace with a Cloudflare Worker endpoint for zero cost and no third-party dependency.

## Colors
- Navy: #1B2A4A
- Gold: #C9973A

## Fonts
- Body: Inter (Google Fonts)
- Display/Headings: Playfair Display (Google Fonts)

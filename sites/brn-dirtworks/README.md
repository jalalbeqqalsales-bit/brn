# BRN Dirtworks LTD website

Single-page lead-generation site for BRN Dirtworks LTD, Lac La Biche, AB.
Static HTML/CSS/JS with no build step and no dependencies. It is separate from the
Voniweb engine in the rest of this repo, and nothing here is served by it.

```
index.html                 the page (content, SEO meta, LocalBusiness schema)
assets/css/site.css        design tokens + all styles
assets/js/site.js          menu, open-now status, action bar, image reveal, quote form
assets/fonts/              Archivo variable (self-hosted, OFL licence included)
assets/img/                favicon + temporary drawings (to be replaced)
tools/check-launch.mjs     launch gate: fails while anything unconfirmed remains
```

Preview locally: `python3 -m http.server -d sites/brn-dirtworks 8080`, then open
http://localhost:8080.

## Current state: preview build

The page ships with `class="is-preview"` on `<html>` and a `noindex` robots tag.
Every element whose content BRN has not confirmed carries a `data-confirm`
attribute. In preview it shows a dashed outline and a label. Nothing marked this
way should go live as-is.

`node tools/check-launch.mjs` lists every blocker and exits non-zero until the
page is ready.

## What research verified (Sept 2026)

| Fact | Source |
|---|---|
| Name BRN Dirtworks LTD, Construction company, Lac La Biche | Google Business listing (supplied by client brief) |
| 67033 Range Rd 142 #108, Lac La Biche, AB T0A 2C0 | Brief; the address is a multi-unit industrial/shop property |
| 780-689-0758, brnnash11@gmail.com | Brief |
| Hours Mon–Fri 7–7, Sat 7–12 | Google listing (brief) |
| 5.0 / 5 from 2 Google reviews | Google listing (brief). Re-check before launch |
| Facebook page: facebook.com/61555155162397 | Search results |
| Blake Nashim works with BRN Dirtworks; attended a Lac La Biche County reverse trade fair for local contractors | [Lakeland Today](https://www.lakelandtoday.ca/lac-la-biche-news/reverse-trade-fairs-allow-lac-la-biche-county-officials-to-connect-with-local-contractors-12329062) |

Not found anywhere public: a website, Instagram, a specific service list,
equipment, service area, years in business, certifications, or review text. The
Facebook page and Google listing could not be opened from the build environment,
so their photos and posts were not reviewed.

## Questions for BRN before launch

1. **Services.** Which of the six listed services do you actually offer, and what's
   missing (snow removal, hauling, septic, demolition, …)? Update both the
   services list and the matching `Project type` options in the form.
2. **Service area.** Where will you travel? This updates the service-area line and
   should be added to the schema as `areaServed`.
3. **Photos.** Five or more real job photos: equipment on site, before/after,
   finished pads and driveways. Phone photos are fine if they're sharp and in daylight.
4. **Logo.** Is there a real logo? The current wordmark is typographic only.
5. **Named contact.** Is Blake the owner or the person customers should ask for?
   A name next to the phone number is a strong trust signal. Add it only if confirmed.
6. **Sunday.** The Google listing shows no Sunday hours. The site says "Closed". Confirm.
7. **Texts.** The form offers "Text" as a contact preference. Does 780-689-0758 take texts?
8. **Headline.** Once services are confirmed, name the top two or three in the
   `<h1>` and `<title>` (e.g. "Excavation, site prep and gravel in Lac La Biche").
   That's clearer to visitors and stronger for local search than "dirt work".
9. **Reviews.** With the reviewers' permission, the two Google reviews can be
   quoted word-for-word in the proof block. Never paraphrase or invent them.

## Replacing images

- **Hero:** save a job photo as `assets/img/hero.jpg` (about 1600×2000, 4:5, under
  250 KB). In `index.html`, change the hero `<img src>` to it, write alt text that
  describes the job (e.g. "BRN excavator digging a basement on an acreage near
  Lac La Biche"), and remove `data-confirm` from its `<figure>`.
- **Recent work:** same process for the four `photo-placeholder.svg` slots
  (about 1600×1200, under 200 KB each). Replace each caption with what was done
  and where, e.g. "Shop pad, 40 × 60 ft, Plamondon". Unused slots can be deleted.
  The grid still works with fewer.
- Export as JPEG (quality ~75) or WebP. Keep the `width`/`height` attributes in
  proportion to the photo to avoid layout shift.

## Quote form

With `data-endpoint=""` (current), submitting validates the form and opens the
visitor's email app with the request pre-filled to brnnash11@gmail.com. This
works without any service, but depends on the visitor having an email app set up.

Recommended before launch: create a form on a form backend (Formspree, Basin,
Netlify Forms, …) that forwards to brnnash11@gmail.com, and put its URL in
`data-endpoint`. The script then posts the form with `fetch`, shows "Quote
request sent." on success, and on failure tells the visitor to call. The hidden
`_gotcha` field is a spam trap (Formspree reads it by that name).

## Launch checklist

- [ ] Every `data-confirm` resolved (confirmed → attribute removed; not offered → element deleted)
- [ ] Real photos in, with alt text and captions
- [ ] Remove `is-preview` from `<html>` and the `noindex` robots meta
- [ ] Add `canonical`, `og:url`, `og:image` (1200×630 photo) using the live domain
- [ ] Add `"url"` and, once confirmed, `"areaServed"` to the JSON-LD
- [ ] Configure `data-endpoint` and send a test request
- [ ] Re-check the Google rating/review count in the hero and proof block
- [ ] Add `robots.txt` and `sitemap.xml` with the live domain
- [ ] Add the website URL to the Google Business Profile and Facebook page
- [ ] `node tools/check-launch.mjs` passes
- [ ] Test on a real iPhone: call button dials, action bar doesn't cover the form, form submits

## Notes

- The Google star rating is deliberately **not** in the schema. Google treats
  self-published ratings on a LocalBusiness page as "self-serving" and ignores or
  penalises them.
- Open/closed status is calculated in `America/Edmonton` time. If hours change,
  update the hours table, the footer, the schema, and `HOURS` in `site.js`.
- Motion is limited to the hero load and the photo wipe, and is disabled under
  `prefers-reduced-motion`.

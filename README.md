
# For You — Falak

A simple, premium, romantic web page: a dark navy/charcoal background, a
gentle petal rain, and your bouquet photo centered with a soft glow and
a clean fade-in entrance.

## Files

- `index.html` — page structure and all the editable text
- `style.css` — all visual styling (colors, layout, animation)
- `script.js` — petal rain, cursor interaction, bouquet parallax
- `README.md` — this file

No frameworks, no build step. Just open `index.html` in a browser.

## 1. Add your bouquet photo

1. Export/save your bouquet photo as a PNG (ideally with a transparent
   or clean background) and name it **`bouquet.png`**.
2. Put `bouquet.png` in the **same folder** as `index.html`.
3. Reload the page — that's it.

Until you add the file, the page still runs and simply shows a soft
placeholder where the bouquet will go, so nothing looks broken.

If you'd rather use a different filename or a sub-folder, open
`index.html`, find the `<img id="bouquet" ...>` tag (it's clearly
commented as "BOUQUET IMAGE"), and change the `src="bouquet.png"`
value to your path.

## 2. Edit the text

All the text lives directly in `index.html`, inside two clearly marked
sections:

- **"EDITABLE TEXT: pre-message"** — the small line above the bouquet
  ("A little something, just for you.")
- **"EDITABLE TEXT: names / message"** — "FOR YOU", the name "FALAK",
  and the closing line ("Because some people deserve flowers.")

Just replace the text between the tags — no other changes needed.

## 3. Adjust the look (optional)

Everything visual is controlled from the top of `style.css` in the
`:root { ... }` block:

- `--charcoal`, `--navy`, `--navy-deep` — background gradient
- `--warm-white` — main text color
- `--pink`, `--rose-glow` — pink accents and glow
- `--gold` — the small gold highlight used on "FOR YOU"

To make the bouquet bigger or smaller, adjust `max-height` on the
`#bouquet` rule in `style.css` (desktop) and inside the
`@media (max-width:480px)` block near the bottom (mobile).

To make the petal rain lighter or heavier, open `script.js` and adjust
the `backCount` / `frontCount` calculations inside `createRain()`.

## Notes

- Fully responsive — the bouquet scales down and the layout re-centers
  automatically on mobile.
- Respects `prefers-reduced-motion` for people who've asked their
  system to minimize animation.
- Works fully offline except for the two Google Fonts used for the
  typography (Cormorant Garamond, Playfair Display); everything else
  is plain HTML/CSS/JS with zero dependencies.

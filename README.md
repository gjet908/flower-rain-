
# FOR YOU

A premium, cinematic, interactive digital flower experience — built as a personal gift.

A single luxury bouquet blooms slowly across the screen, followed by a soft petal rain,
a quiet name reveal, and a short closing message. No frameworks, no external assets —
just HTML, CSS, and vanilla JavaScript, rendered with inline SVG.

## Features

- A single, dense, professionally-composed SVG bouquet — 5 hero flowers, 8 medium
  flowers, 12 small flowers and 10 tiny filler blooms, all placed at fixed, intentional
  positions (never randomized), with a short stem cluster and a champagne paper wrapper
  tying it together
- A slow, staged opening sequence: stems rise, leaves unfold, buds appear, flowers bloom
  one by one
- A gentle, physics-like petal rain in two depth layers (behind and in front of the
  bouquet), biased toward the sides of the screen so the text column stays readable —
  recycled efficiently so it never overwhelms performance
- Subtle cursor parallax on desktop; automatic gentle motion and tap interaction on mobile
- Hover and click interactions on every flower, with a small petal-and-sparkle burst on click
- A layered text reveal, positioned entirely below the bouquet: an intro line, "FOR YOU",
  a letter-by-letter name reveal, and a closing message
- An optional, non-autoplaying music control
- Fully responsive (desktop, laptop, tablet, mobile) with no horizontal scroll and a fixed,
  intentional composition at every breakpoint
- Respects `prefers-reduced-motion`

## Technologies

- HTML5
- CSS3 (custom properties, gradients, transitions)
- Vanilla JavaScript (`requestAnimationFrame`, DOM/SVG APIs)
- Inline SVG (no image assets, no external libraries)

## Project structure

```
for-you/
├── index.html      Page structure, SVG defs, text overlay, music control
├── style.css        Palette, layout, typography, animation states
├── script.js         Bouquet generation, animation timeline, petal system, interactions
└── README.md
```

## How to run locally

No build step is required.

1. Download or clone the four files into one folder.
2. Open `index.html` directly in a browser, **or** serve the folder locally, e.g.:
   ```
   npx serve .
   ```
   or
   ```
   python3 -m http.server
   ```
3. Visit the local address shown in your terminal.

## How to upload to GitHub

1. Create a new repository (e.g. `for-you`).
2. Add the four files (`index.html`, `style.css`, `script.js`, `README.md`) to the
   repository root.
3. Commit and push:
   ```
   git init
   git add .
   git commit -m "For You"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

## How to enable GitHub Pages

1. In your repository, go to **Settings → Pages**.
2. Under **Source**, choose the `main` branch and the `/ (root)` folder.
3. Save. GitHub will provide a URL such as:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```
4. It may take a minute or two to go live.

## Customization

### Change the name

In `script.js`, near the top:

```js
const girlName = "FALAK";
```

Change this to any name — letters will animate in one by one automatically.

### Change the messages

Still in `script.js`:

```js
const introText  = "A little something…";
const introText2 = "just for you.";

const finalMessages = [
  "Because some people deserve flowers.",
  "Just because they are them."
];
```

### Change the colors

In `style.css`, everything is driven by the `:root` custom properties at the top:

```css
--bg-burgundy:#260D18;
--bg-plum:#3B172F;
--bg-navy:#0B1020;
--rose:#C77A8B;
--blush:#E8A9B8;
--ivory:#FFF4E8;
--gold:#D8B878;
```

The individual petal gradients (`petalRose`, `petalBlush`, `petalIvory`, `flowerCenter`,
`wrapperGrad`) live inside the `<defs>` block in `index.html` if you want finer control
over shading.

### Change the composition / positioning

The overall layout — where the bouquet sits and where each line of text sits — is also
controlled by `:root` custom properties in `style.css`:

```css
--intro-top: 7vh;
--bouquet-top: 16vh;
--bouquet-height: 58vh;
--bouquet-width: min(760px, 72vw);
--foryou-top: 76vh;
--falak-top: 82vh;
--final-top: 91vh;
```

Each breakpoint (`1199px`, `720px`, `420px`) overrides a subset of these variables so the
bouquet stays centered and the text always sits below it, never overlapping. Adjust these
if you change the amount of text or want a taller/shorter bouquet.

### Change animation speed

In `script.js`, the `TIMELINE` object controls every stage of the opening sequence and
text reveal (in milliseconds):

```js
const TIMELINE = {
  stemsAt: 1900,
  leavesAt: 3400,
  firstBudAt: 4200,
  bloomStart: 5000,
  bloomStep: 480,
  settleAt: 10200,
  introAt: 10600,
  intro2At: 12100,
  darkenAt: 15600,
  forYouAt: 16400,
  nameStartAt: 18400,
  letterStep: 150,
  finalMsgGapAfterName: 1300,
  hintDelayAfterMsg2: 1800
};
```

Increase values to slow the experience down, decrease them to speed it up.

### Customize the bouquet

Also in `script.js`, the bouquet is built from fixed lists — never `Math.random()` —
inside a 0–100 percentage coordinate space (`x`/`y` are percentages of the bouquet
container):

- `largeFlowers` — the 5 hero blooms (center top, upper-left/right, lower-left/right)
- `mediumFlowers` — the 8 flowers that fill the gaps between the hero blooms
- `smallFlowers` — 12 smaller flowers around the edges and gaps
- `fillerFlowers` — 10 tiny blooms/buds tucked close to their neighbours
- `leafSpecs` — every leaf's position, length, width and angle
- `stemAnchors` — the 6–8 short stems that converge into the wrapper
- `WRAPPER_APEX` — the point the stems and paper wrapper converge on

Each entry has a `type` (`"large"`, `"soft"`, `"small"`, `"bud"`) and `palette`
(`"rose"`, `"blush"`, `"ivory"`). Edit the numbers directly to reshape the arrangement —
positions are intentional and fixed, so the bouquet looks the same every time it loads.
`Math.random()` is only ever used for petal-rain motion, background particles, and tiny
cosmetic jitter in petal curvature/rotation — never for where a flower sits.

### Add music (optional)

Place an audio file named `music.mp3` in the same folder as `index.html` (referenced by
the `<audio>` element's `src`). The music control in the bottom-right corner will play or
pause it — the site works perfectly with no audio file present.

## Notes

- No horizontal scrolling on any screen size.
- The bouquet always stays centered and fully visible; text never overlaps the flowers.
- Petal count and particle count are automatically reduced on smaller screens for
  performance.

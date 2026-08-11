
# flower-rain-# FOR YOU

A premium, cinematic, interactive digital flower experience — built as a personal gift.

A single luxury bouquet blooms slowly across the screen, followed by a soft petal rain,
a quiet name reveal, and a short closing message. No frameworks, no external assets —
just HTML, CSS, and vanilla JavaScript, rendered with inline SVG.

## Features

- A single, professionally-composed SVG bouquet (large, medium, small and bud flowers,
  elegant leaves, and natural stems) rather than scattered clip-art flowers
- A slow, staged opening sequence: stems rise, leaves unfold, buds appear, flowers bloom
  one by one
- A gentle, physics-like petal rain that drifts, rotates, and fades — recycled efficiently
  so it never overwhelms performance
- Subtle cursor parallax on desktop; automatic gentle motion and tap interaction on mobile
- Hover and click interactions on every flower, with a small petal-and-sparkle burst on click
- A layered text reveal: an intro line, "FOR YOU", a letter-by-letter name reveal, and a
  closing message
- An optional, non-autoplaying music control
- Fully responsive (desktop, laptop, tablet, mobile) with no horizontal scroll
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

The individual petal gradients (`petalRose`, `petalBlush`, `petalIvory`, `flowerCenter`)
live inside the `<defs>` block in `index.html` if you want finer control over shading.

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

Also in `script.js`, `flowerSpecs` defines every flower's position, size, type
(`"large"`, `"soft"`, `"small"`, `"bud"`) and color palette (`"rose"`, `"blush"`,
`"ivory"`), and `leafSpecs` defines every leaf's position, length, width and angle,
inside an 800×900 coordinate space. Add, remove, or reposition entries to reshape the
bouquet — the bloom timing is generated automatically from the list order.

### Add music (optional)

Place an audio file named `music.mp3` in the same folder as `index.html` (referenced by
the `<audio>` element's `src`). The music control in the bottom-right corner will play or
pause it — the site works perfectly with no audio file present.

## Notes

- No horizontal scrolling on any screen size.
- The bouquet always stays centered and fully visible; text never overlaps the flowers.
- Petal count and particle count are automatically reduced on smaller screens for
  performance.

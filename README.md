# A Little Light, A Lot of Love

A small interactive Diwali celebration made with warmth, colour, and a little bit of browser magic.

The site is designed to feel like a festive evening: you can light diyas, create a rangoli, open a handwritten letter, send a personalised wish, and fill the sky with fireworks.

## Run It

This is a simple static website, so there is no build process or dependency installation.

From the project folder, run:

```bash
python -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## What You Can Do

- Light individual diyas or light them all at once.
- Launch colourful fireworks with trails and different patterns.
- Turn sound on when you want small original firework sound effects.
- Make a rangoli using flowers, petals, and diyas in different colours.
- Open the sealed envelope to read the handwritten Diwali letter.
- Create a personalised Diwali wish with your name.
- Copy the wish or share it using WhatsApp or the Web Share menu.
- Celebrate again from the final section.

The page also includes responsive layouts, floating petals, lanterns, sweets, festive decorations, reduced-motion support, and a small ownership note at the end.

## Project Files

- `index.html` contains the page structure and the words visitors see.
- `style.css` contains the visual design, responsive layout, illustrations, and animations.
- `script.js` powers the interactions, fireworks canvas, rangoli drawing, sound effects, letter animation, and sharing tools.

## Notes

The website uses browser features such as Canvas, Web Audio, Clipboard, and Web Share when they are available. It still works without optional sound or sharing support, using sensible fallbacks.

Made by Abhinav Deshwal with love.

[English](README.md) | [繁體中文](README.zh-Hant.md)

# finger-lottery

A mobile-first multi-touch lottery picker for picking winners on the spot. Everyone puts a finger on the screen, hold for a few seconds, and one gets randomly selected with a smooth liquid fill animation.

## Features

- **Multi-touch Support**: Works with 2-10 fingers simultaneously. Each finger gets a unique high-end color.
- **Premium Color Palette**: 10 curated colors like Coral Red, Ice Crystal Blue, Lavender. Toggle between color names and P1, P2 labels.
- **Liquid Fill Effect**: When a winner is picked, the screen smoothly fills with their color from the touch point.
- **Sound Feedback**: Web Audio API generated sounds for press, countdown ticks, and win. Toggle on/off.
- **Confetti Celebration**: Optional confetti burst on winner selection.
- **Shareable Settings**: All settings are encoded into the URL hash. Copy the link and share it to reproduce the exact setup.
- **Minimal Mode**: Hide all UI text for a pure visual experience.

## How to Use

1. Open the page on your phone.
2. Have 2+ people place fingers on the screen.
3. Hold until the countdown finishes.
4. The winner’s finger expands, screen fills with their color, and name is revealed.

## Settings

Access the side panel via the hamburger menu in the top right:

- **Timer**: Adjust countdown duration from 1s to 10s.
- **Reset on Join**: Restart countdown if a new finger touches during counting.
- **Sound**: Toggle Web Audio feedback.
- **Confetti**: Toggle confetti effect.
- **Color Names**: Use premium color names instead of P1, P2.
- **Info Panel**: Show/hide the top status card.
- **Minimal Mode**: Hide all text for a clean look.

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- Canvas API for rendering touches and effects
- Web Audio API for sound synthesis
- No dependencies, works offline once loaded

## Local Setup

Just open `index.html` in a modern mobile browser.  
For best results, use it on a phone with multi-touch support.

## License

MIT
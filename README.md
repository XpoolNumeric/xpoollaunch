# 🎊 MS Family - Theater Screen Presence & Launch Reveal

A high-impact **Vite + React JSX** theater experience designed for live ceremonies, projectors, and stage displays.

---

## 🌟 Modern Architecture (Vite + React JSX)

- ⚡ **Build Engine:** [Vite 6](https://vitejs.dev/) with Fast HMR and optimized production bundles.
- ⚛️ **UI Framework:** React 18 with modular JSX components:
  - [`src/App.jsx`](file:///c:/Users/ARULPRAKASH/Documents/ms%20family%20launch/src/App.jsx) — Stage coordinator and lifecycle controller.
  - [`src/components/Curtains.jsx`](file:///c:/Users/ARULPRAKASH/Documents/ms%20family%20launch/src/components/Curtains.jsx) — Royal velvet theater curtains with 3D folds and smooth parting animation.
  - [`src/components/Countdown.jsx`](file:///c:/Users/ARULPRAKASH/Documents/ms%20family%20launch/src/components/Countdown.jsx) — Dramatic 5-4-3-2-1 countdown overlay with golden typography and energy rings.
  - [`src/components/LaunchVideo.jsx`](file:///c:/Users/ARULPRAKASH/Documents/ms%20family%20launch/src/components/LaunchVideo.jsx) — Fullscreen video player (`VN20261021_214849.mp4`), perfectly fitted (`object-fit: contain`) with seamless looping.
  - [`src/components/Pyrotechnics.jsx`](file:///c:/Users/ARULPRAKASH/Documents/ms%20family%20launch/src/components/Pyrotechnics.jsx) — 60 FPS HTML5 Canvas fireworks & dual confetti cannons.
  - [`src/components/StageControls.jsx`](file:///c:/Users/ARULPRAKASH/Documents/ms%20family%20launch/src/components/StageControls.jsx) — Floating glassmorphic dock with auto-hide idle detection.
  - [`src/audio/soundEngine.js`](file:///c:/Users/ARULPRAKASH/Documents/ms%20family%20launch/src/audio/soundEngine.js) — Web Audio API engine (heartbeat, drumroll, fanfare, crowd cheers, cymbal crash).

---

## 🎮 Stage Controls

| Action | Control | Description |
|---|---|---|
| **Start Reveal** | <kbd>Enter</kbd> / <kbd>Space</kbd> / Click | Begins the 5-4-3-2-1 countdown and dramatic reveal |
| **Reset Stage** | <kbd>R</kbd> | Closes the royal velvet curtains and resets video to start |
| **Fullscreen** | <kbd>F</kbd> | Toggles full-screen projector / stage presentation mode |
| **Toggle Mute** | <kbd>M</kbd> | Mutes / Unmutes synthesized fanfare and sound effects |

---

## 🚀 Running the Project

```bash
# Start development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

- 🔗 **Active Dev Server:** [http://localhost:3000](http://localhost:3000)

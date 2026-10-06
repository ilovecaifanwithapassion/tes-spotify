# Sonora 🎵 — Spotify UI + Apple Music Synced Lyrics Hybrid

> A high-performance modern web music player that combines **Spotify's sleek browsing interface** with **Apple Music's signature real-time fluid kinetic lyrics**.

---

## ✨ Key Features

### 🎧 Spotify UI Core
- **Glassmorphic Navigation Sidebar**: Instant access to Home, Search, Your Library, Liked Songs, and custom playlist creation.
- **Dynamic 6-Pack Quick Cards**: Interactive cards with animated hover-to-play buttons.
- **Universal Search Engine**: Search tracks by title, artist, genre, or even phrases within lyrics.
- **Persistent Bottom Player Bar**: Complete playback controls, seek scrubber, volume slider, mute, shuffle, and repeat modes.
- **5-Band Equalizer & Spatial 3D Audio**: Built-in audio studio presets (*Bass Boost, Vocal Clarity, Club Synth, Apple Spatial 3D*).
- **Custom Local Audio Importer**: Import your own `.mp3` tracks and synchronized `.lrc` lyrics.

### 🎤 Apple Music Lyrics Engine (The Signature Highlight)
- **Dynamic Ambient Fluid Mesh Backdrop**: Animated colorful glow that automatically adapts to the active song's album art color palette.
- **Kinetic Typography with Spring Physics**: Real-time line highlighting with active line bounce, smooth transitions, and background line dimming.
- **Center-Lock Smooth Auto-Scroll**: Keeps the currently sung lyric line centered without jarring jumps.
- **Interactive Click-to-Seek**: Click any lyric line to jump playback directly to that exact timestamp.
- **Real-Time Spectrum Visualizer**: Live audio wave bars reacting to rhythm and frequencies.
- **View Modes**: Toggle between split-view (Album Art + Lyrics) and centered full-width lyrics, plus font scaling (*Standard / Large / Compact*).

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / Pause |
| `L` | Toggle Apple Music Synced Lyrics Overlay |
| `→` / `←` | Next / Previous Track |
| `M` | Mute / Unmute |
| `S` | Toggle Shuffle |
| `R` | Toggle Repeat |
| `Esc` | Close Lyrics / Modals |

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser (Chrome, Edge, Safari, Firefox) or serve locally:

```bash
# Using Python
python -m http.server 3000

# Or using Node / npx
npx serve .
```
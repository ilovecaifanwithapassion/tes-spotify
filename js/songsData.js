/**
 * Sonora Song Catalog & LRC Synced Lyrics Data
 * Includes rich color palettes for Apple Music dynamic fluid backgrounds
 */

// Helper function to generate rich gradient SVG Album Arts
function createAlbumArtSvg(title, artist, colorA, colorB, patternType = 'circle') {
  const encodedTitle = encodeURIComponent(title);
  const encodedArtist = encodeURIComponent(artist);
  
  let pattern = '';
  if (patternType === 'circle') {
    pattern = `
      <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8" />
      <circle cx="150" cy="150" r="60" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4" />
      <circle cx="150" cy="150" r="25" fill="#ffffff" />
    `;
  } else if (patternType === 'mesh') {
    pattern = `
      <path d="M 0 150 Q 75 50 150 150 T 300 150" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="12" />
      <path d="M 0 200 Q 75 100 150 200 T 300 200" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8" />
    `;
  } else if (patternType === 'geometry') {
    pattern = `
      <polygon points="150,30 270,240 30,240" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="10" />
      <polygon points="150,80 230,220 70,220" fill="rgba(255,255,255,0.15)" />
    `;
  } else {
    pattern = `
      <rect x="50" y="50" width="200" height="200" rx="40" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="10" transform="rotate(45 150 150)" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="100%" stop-color="${colorB}" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#grad)" />
      ${pattern}
      <text x="24" y="240" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="20" letter-spacing="-0.5">${title}</text>
      <text x="24" y="265" fill="rgba(255,255,255,0.75)" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="600" font-size="13">${artist}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SONGS_DATA = [
  {
    id: "song-1",
    title: "Midnight City Lights",
    artist: "Aura & The Synthwaves",
    album: "Neon Horizons",
    genre: "Synthwave / Pop",
    category: "pop",
    duration: 72, // 1:12 demo loop or full duration
    colors: ["#fa2d48", "#8338ec", "#3a86ff", "#ff006e"],
    art: createAlbumArtSvg("Midnight City Lights", "Aura", "#ff007f", "#3a0ca3", "circle"),
    bpm: 120,
    synthPreset: "synthwave",
    lyrics: [
      { time: 0.0, text: "(Intro — Electric Arpeggio)" },
      { time: 4.5, text: "Driving down the empty neon boulevard" },
      { time: 9.0, text: "Reflections shining in the rain so hard" },
      { time: 13.8, text: "Every street sign whispering your name" },
      { time: 18.2, text: "Nothing in this midnight feels the same" },
      { time: 22.8, text: "And we accelerate into the open sky" },
      { time: 27.5, text: "Leave our shadows behind, watch them fly" },
      { time: 32.0, text: "City lights are glowing in your eyes tonight" },
      { time: 36.8, text: "We are infinite beneath the starlight" },
      { time: 41.5, text: "Hold the wheel, feel the beat pulse inside" },
      { time: 46.2, text: "There is nowhere we can't run and hide" },
      { time: 51.0, text: "Midnight city, take us far away" },
      { time: 56.0, text: "Into the sunrise of a brand new day" },
      { time: 61.5, text: "(Euphoric Synth Solos & Climax)" },
      { time: 68.0, text: "City lights... fade into the dawn." }
    ]
  },
  {
    id: "song-2",
    title: "Golden Hour Glow",
    artist: "Solana Ray",
    album: "Sunset Reverie",
    genre: "R&B / Chill",
    category: "rnb",
    duration: 68,
    colors: ["#ff9e00", "#ff5400", "#9d4edd", "#ff0054"],
    art: createAlbumArtSvg("Golden Hour Glow", "Solana Ray", "#ffaa00", "#ff0077", "mesh"),
    bpm: 96,
    synthPreset: "chill_rnb",
    lyrics: [
      { time: 0.0, text: "(Warm Rhodes Chords & Vinyl Crackle)" },
      { time: 4.0, text: "Sun is dipping low behind the hills" },
      { time: 8.5, text: "Time stops moving and the city chills" },
      { time: 13.2, text: "Golden amber dripping on the floor" },
      { time: 17.8, text: "I don't think I could ever want for more" },
      { time: 22.4, text: "Just your voice echoing in the breeze" },
      { time: 27.0, text: "Gentle rhythm putting my soul at ease" },
      { time: 31.6, text: "Stay with me until the twilight falls" },
      { time: 36.2, text: "Shadows dancing quietly on the walls" },
      { time: 41.0, text: "Golden hour... stay a little while" },
      { time: 45.8, text: "Watching the horizon wear your smile" },
      { time: 50.5, text: "(Mellow Bassline Groove)" },
      { time: 56.0, text: "Lost in the glow, forever we remain." },
      { time: 62.0, text: "Soft light fades to purple night..." }
    ]
  },
  {
    id: "song-3",
    title: "Celestial Drift",
    artist: "Nova Soundscape",
    album: "Deep Orbitals",
    genre: "Electronic / Ambient",
    category: "pop",
    duration: 75,
    colors: ["#00f5d4", "#00bbf9", "#7209b7", "#4361ee"],
    art: createAlbumArtSvg("Celestial Drift", "Nova", "#00f5d4", "#4361ee", "geometry"),
    bpm: 128,
    synthPreset: "ambient_electro",
    lyrics: [
      { time: 0.0, text: "(Atmospheric Cosmic Sweep)" },
      { time: 5.0, text: "Floating past the rings of Jupiter" },
      { time: 9.8, text: "Signal transmission getting clearer, closer" },
      { time: 14.6, text: "Gravity releases all our heavy fears" },
      { time: 19.5, text: "Traveling across ten million light-years" },
      { time: 24.2, text: "Catch the solar wind and let it ride" },
      { time: 29.0, text: "Cosmic echoes singing by our side" },
      { time: 34.0, text: "We are stardust dancing in the deep" },
      { time: 39.0, text: "Secrets that the universe will keep" },
      { time: 44.2, text: "Drifting through constellations unknown" },
      { time: 49.5, text: "Never feeling lost, we are heading home" },
      { time: 54.8, text: "(Hyperdrive Bass Drop)" },
      { time: 61.0, text: "Across the galaxies we sail..." },
      { time: 68.0, text: "(Fade into deep cosmic silence)" }
    ]
  },
  {
    id: "song-4",
    title: "Rainy Afternoon Cafe",
    artist: "Lofi Dreamer",
    album: "Study in Kyoto",
    genre: "Lofi Beats",
    category: "lofi",
    duration: 65,
    colors: ["#2a9d8f", "#e76f51", "#f4a261", "#264653"],
    art: createAlbumArtSvg("Rainy Cafe", "Lofi Dreamer", "#2a9d8f", "#e76f51", "square"),
    bpm: 84,
    synthPreset: "lofi_beats",
    lyrics: [
      { time: 0.0, text: "(Tape Hiss & Gentle Rain Outside)" },
      { time: 4.5, text: "Steam rising from a warm ceramic cup" },
      { time: 9.2, text: "Pages turning, nobody looking up" },
      { time: 14.0, text: "Drops tapping gently on the window glass" },
      { time: 18.8, text: "Watching all the hurried strangers pass" },
      { time: 23.5, text: "Lofi piano chords in four-four time" },
      { time: 28.2, text: "Simple thoughts that gently rhyme" },
      { time: 33.0, text: "No rush, no deadlines in the room" },
      { time: 37.8, text: "Just quiet solace chasing out the gloom" },
      { time: 42.5, text: "Coffee brews and sweet memories flow" },
      { time: 47.5, text: "In this little corner that we know" },
      { time: 53.0, text: "(Acoustic guitar brush & snare loop)" },
      { time: 59.0, text: "Peace in the sound of rain..." }
    ]
  },
  {
    id: "song-5",
    title: "Acoustic Memories",
    artist: "Eliza Green",
    album: "Wooden Strings",
    genre: "Indie Folk",
    category: "indie",
    duration: 70,
    colors: ["#d4a373", "#ccd5ae", "#e9edc9", "#faedcd"],
    art: createAlbumArtSvg("Acoustic Memories", "Eliza", "#d4a373", "#588157", "mesh"),
    bpm: 104,
    synthPreset: "indie_folk",
    lyrics: [
      { time: 0.0, text: "(Fingerpicked Acoustic Melody)" },
      { time: 4.2, text: "Found an old photograph between the books" },
      { time: 9.0, text: "Remembering the mountain trails and brooks" },
      { time: 13.8, text: "You were wearing that oversized wool sweater" },
      { time: 18.5, text: "Promising that everything gets better" },
      { time: 23.2, text: "Seasons change and autumn leaves descend" },
      { time: 28.0, text: "Some melodies never really end" },
      { time: 33.0, text: "Strumming these six strings into the wind" },
      { time: 38.0, text: "To the truest companion and oldest friend" },
      { time: 43.0, text: "Footsteps along the quiet forest floor" },
      { time: 48.0, text: "Knocking on an open wooden door" },
      { time: 53.5, text: "(Harmonica & Guitar Interlude)" },
      { time: 60.0, text: "Memories stay warm forevermore." }
    ]
  },
  {
    id: "song-6",
    title: "Cyberpunk Overdrive",
    artist: "Kuro Synth",
    album: "Neo-Tokyo 2099",
    genre: "Darksynth / Club",
    category: "pop",
    duration: 74,
    colors: ["#f72585", "#7209b7", "#3a0ca3", "#4cc9f0"],
    art: createAlbumArtSvg("Cyberpunk Overdrive", "Kuro Synth", "#f72585", "#4361ee", "geometry"),
    bpm: 132,
    synthPreset: "darksynth",
    lyrics: [
      { time: 0.0, text: "(Pumping Cyber Saw Bass & Kick)" },
      { time: 4.8, text: "Holograms flicker in the acid fog" },
      { time: 9.5, text: "Binary pulses on the neural log" },
      { time: 14.2, text: "Speeding on the upper expressway line" },
      { time: 19.0, text: "Glitching the grid, crossing the design" },
      { time: 23.8, text: "High voltage flowing through our veins" },
      { time: 28.5, text: "Breaking apart the artificial chains" },
      { time: 33.4, text: "Overdrive! Crank the sub to ten" },
      { time: 38.2, text: "We rewrite the code right here again" },
      { time: 43.0, text: "Neon sparks fly in the cyber night" },
      { time: 48.0, text: "Burning brighter than electric light" },
      { time: 53.0, text: "(Aggressive Synth Lead Solo)" },
      { time: 60.0, text: "System fully online. Maximum power." },
      { time: 67.0, text: "Neo-Tokyo never sleeps..." }
    ]
  }
];

const GENRES_DATA = [
  { name: "Synthwave & Pop", color: "linear-gradient(135deg, #fa2d48, #8338ec)", icon: "🌆", filter: "pop" },
  { name: "R&B / Soul", color: "linear-gradient(135deg, #ff9e00, #ff0054)", icon: "🎷", filter: "rnb" },
  { name: "Lofi Beats", color: "linear-gradient(135deg, #2a9d8f, #264653)", icon: "☕", filter: "lofi" },
  { name: "Indie & Acoustic", color: "linear-gradient(135deg, #d4a373, #588157)", icon: "🎸", filter: "indie" },
  { name: "Electronic & Dance", color: "linear-gradient(135deg, #00f5d4, #7209b7)", icon: "⚡", filter: "pop" },
  { name: "Apple Spatial Audio", color: "linear-gradient(135deg, #1ed760, #00d2ff)", icon: "🎧", filter: "all" }
];

const ARTISTS_DATA = [
  { name: "Aura & The Synthwaves", monthly: "4,210,900 monthly listeners", art: createAlbumArtSvg("Aura", "Artist", "#ff007f", "#3a0ca3", "circle"), tag: "Synthpop Duo" },
  { name: "Solana Ray", monthly: "2,840,120 monthly listeners", art: createAlbumArtSvg("Solana", "Artist", "#ffaa00", "#ff0077", "mesh"), tag: "R&B Vocalist" },
  { name: "Nova Soundscape", monthly: "1,950,400 monthly listeners", art: createAlbumArtSvg("Nova", "Artist", "#00f5d4", "#4361ee", "geometry"), tag: "Electronic Producer" },
  { name: "Lofi Dreamer", monthly: "3,100,500 monthly listeners", art: createAlbumArtSvg("Lofi", "Artist", "#2a9d8f", "#e76f51", "square"), tag: "Chillhop Creator" }
];

window.SONGS_DATA = SONGS_DATA;
window.GENRES_DATA = GENRES_DATA;
window.ARTISTS_DATA = ARTISTS_DATA;

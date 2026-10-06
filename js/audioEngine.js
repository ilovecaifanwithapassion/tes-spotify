/**
 * Sonora Advanced Audio & WebAudio Procedural Synth Engine
 * High-precision timer, EQ 5-band filter, Spatial Panning, Frequency Spectrum Analyser
 */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.masterGain = null;
    this.panner = null;
    this.eqNodes = [];
    
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 72;
    this.volume = 0.75;
    this.isMuted = false;
    
    this.currentSong = null;
    this.synthInterval = null;
    this.startTimeOffset = 0;
    this.audioElement = document.getElementById('core-audio-element');
    this.isCustomAudio = false;

    this.onTimeUpdateCallbacks = [];
    this.onEndedCallbacks = [];
    this.onStateChangeCallbacks = [];
  }

  init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

    // 5-Band EQ Filters
    const frequencies = [60, 250, 1000, 4000, 12000];
    const types = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];

    this.eqNodes = frequencies.map((freq, i) => {
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = types[i];
      filter.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      filter.gain.setValueAtTime(0, this.audioCtx.currentTime);
      return filter;
    });

    // Connect EQ chain
    for (let i = 0; i < this.eqNodes.length - 1; i++) {
      this.eqNodes[i].connect(this.eqNodes[i + 1]);
    }

    // Spatial Panner
    if (this.audioCtx.createStereoPanner) {
      this.panner = this.audioCtx.createStereoPanner();
      this.panner.pan.setValueAtTime(0, this.audioCtx.currentTime);
      this.eqNodes[this.eqNodes.length - 1].connect(this.panner);
      this.panner.connect(this.masterGain);
    } else {
      this.eqNodes[this.eqNodes.length - 1].connect(this.masterGain);
    }

    // Analyser Node for Spectrum & Ambient Visualizer
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    // Setup custom audio element bridge if needed
    if (this.audioElement) {
      try {
        const source = this.audioCtx.createMediaElementSource(this.audioElement);
        source.connect(this.eqNodes[0]);
      } catch (e) {
        // Element already connected or restricted
      }
    }

    this.startPlaybackTimer();
  }

  loadSong(song) {
    this.currentSong = song;
    this.duration = song.duration || 72;
    this.currentTime = 0;
    this.isCustomAudio = false;

    if (song.audioSrc) {
      this.isCustomAudio = true;
      if (this.audioElement) {
        this.audioElement.src = song.audioSrc;
        this.audioElement.currentTime = 0;
      }
    }
  }

  loadCustomFile(file, title, artist) {
    this.init();
    const objectUrl = URL.createObjectURL(file);
    const customSong = {
      id: "custom-" + Date.now(),
      title: title || file.name.replace(/\.[^/.]+$/, ""),
      artist: artist || "Local Artist",
      album: "Local Imports",
      genre: "User Upload",
      duration: 180,
      colors: ["#fa2d48", "#00d2ff", "#9d4edd", "#1ed760"],
      art: createAlbumArtSvg(title || "Local Track", "Custom Upload", "#11998e", "#38ef7d", "mesh"),
      audioSrc: objectUrl,
      lyrics: [
        { time: 0.0, text: "(Audio playback started)" },
        { time: 5.0, text: "Playing your custom audio track..." },
        { time: 15.0, text: "Enjoy high-fidelity sound & dynamic ambient visuals" },
        { time: 30.0, text: "Click any line to scrub playback" }
      ]
    };
    this.loadSong(customSong);
    return customSong;
  }

  play() {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.isPlaying = true;

    if (this.isCustomAudio && this.audioElement) {
      this.audioElement.play().catch(e => console.log(e));
    } else {
      this.startSynthesizer();
    }

    this.notifyStateChange();
  }

  pause() {
    this.isPlaying = false;
    if (this.isCustomAudio && this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynthesizer();
    this.notifyStateChange();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.isCustomAudio && this.audioElement) {
      this.audioElement.currentTime = this.currentTime;
    }
    this.notifyTimeUpdate();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(val, 1));
    if (this.masterGain && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  setEQBand(bandIndex, gainDb) {
    if (this.eqNodes[bandIndex] && this.audioCtx) {
      this.eqNodes[bandIndex].gain.setTargetAtTime(gainDb, this.audioCtx.currentTime, 0.05);
    }
  }

  setSpatialAudio(enabled) {
    if (this.panner && this.audioCtx) {
      if (enabled) {
        // Subtle stereo movement
        this.panner.pan.setTargetAtTime(0.2, this.audioCtx.currentTime, 0.1);
      } else {
        this.panner.pan.setTargetAtTime(0, this.audioCtx.currentTime, 0.1);
      }
    }
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(64).fill(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  startPlaybackTimer() {
    let lastTimestamp = performance.now();
    const tick = (now) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (this.isPlaying) {
        if (this.isCustomAudio && this.audioElement) {
          this.currentTime = this.audioElement.currentTime;
          if (this.audioElement.duration) this.duration = this.audioElement.duration;
        } else {
          this.currentTime += delta;
        }

        if (this.currentTime >= this.duration) {
          this.currentTime = 0;
          this.notifyEnded();
        }

        this.notifyTimeUpdate();
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Procedural Multi-Instrument Synth Loop Engine (High-Fi Chords & Melodies)
  startSynthesizer() {
    this.stopSynthesizer();
    if (!this.audioCtx) return;

    let step = 0;
    const bpm = this.currentSong?.bpm || 120;
    const intervalMs = (60 / bpm / 4) * 1000; // 16th notes

    // Chord progressions for presets
    const chordProgressions = {
      synthwave: [
        [220, 261.63, 329.63, 392], // Am7
        [174.61, 220, 261.63, 329.63], // Fmaj7
        [261.63, 329.63, 392, 493.88], // Cmaj7
        [196, 246.94, 293.66, 349.23] // G7
      ],
      chill_rnb: [
        [293.66, 349.23, 440, 523.25], // Dm9
        [246.94, 293.66, 370, 440], // Bm7b5
        [261.63, 329.63, 392, 493.88], // Cmaj9
        [220, 261.63, 329.63, 392] // Am7
      ],
      ambient_electro: [
        [130.81, 196, 261.63, 392], // C add9
        [146.83, 220, 293.66, 440], // D add9
        [164.81, 246.94, 329.63, 493.88], // Em9
        [174.61, 261.63, 349.23, 523.25] // Fmaj7
      ],
      lofi_beats: [
        [261.63, 329.63, 392, 440], // C6
        [220, 261.63, 329.63, 392], // Am7
        [174.61, 220, 261.63, 349.23], // Fadd9
        [196, 246.94, 293.66, 349.23] // Gdom7
      ],
      indie_folk: [
        [196, 246.94, 293.66, 392], // G
        [164.81, 196, 246.94, 329.63], // Em
        [174.61, 220, 261.63, 349.23], // C
        [146.83, 220, 293.66, 370] // D
      ],
      darksynth: [
        [110, 130.81, 164.81], // Am
        [123.47, 146.83, 174.61], // Bdim
        [98, 123.47, 146.83], // G
        [87.31, 110, 130.81] // F
      ]
    };

    const currentPreset = this.currentSong?.synthPreset || 'synthwave';
    const chords = chordProgressions[currentPreset] || chordProgressions.synthwave;

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying) return;

      const chordIdx = Math.floor((step / 16) % chords.length);
      const currentChord = chords[chordIdx];
      const beatInBar = step % 16;

      // 1. Kick Drum (Beats 0, 4, 8, 12)
      if (beatInBar % 4 === 0) {
        this.triggerKick();
      }

      // 2. Snare / Clap (Beats 4, 12)
      if (beatInBar === 4 || beatInBar === 12) {
        this.triggerSnare();
      }

      // 3. Hi-hats (Every 2nd 16th)
      if (beatInBar % 2 === 0) {
        this.triggerHiHat(beatInBar % 4 === 2 ? 0.08 : 0.04);
      }

      // 4. Bassline (Syncopated)
      if (beatInBar === 0 || beatInBar === 3 || beatInBar === 6 || beatInBar === 10 || beatInBar === 14) {
        const rootFreq = currentChord[0] / 2;
        this.triggerBass(rootFreq);
      }

      // 5. Lush Chord Pad / Arpeggio
      if (beatInBar === 0 || beatInBar === 8) {
        this.triggerPad(currentChord);
      }

      // 6. Arpeggiator Lead Note
      const arpNote = currentChord[step % currentChord.length] * 2;
      this.triggerArp(arpNote);

      step++;
    }, intervalMs);
  }

  stopSynthesizer() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  triggerKick() {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.25);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.eqNodes[0]);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  triggerSnare() {
    const now = this.audioCtx.currentTime;
    // Noise buffer for snare snap
    const bufferSize = this.audioCtx.sampleRate * 0.15;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.eqNodes[0]);

    noise.start(now);
    noise.stop(now + 0.16);
  }

  triggerHiHat(volume = 0.05) {
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'highpass';

    const bufferSize = this.audioCtx.sampleRate * 0.04;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.eqNodes[0]);

    noise.start(now);
    noise.stop(now + 0.05);
  }

  triggerBass(freq) {
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.eqNodes[0]);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  triggerPad(chordFreqs) {
    const now = this.audioCtx.currentTime;
    chordFreqs.forEach((freq) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.eqNodes[0]);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  triggerArp(freq) {
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.eqNodes[0]);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Event Listeners
  onTimeUpdate(cb) { this.onTimeUpdateCallbacks.push(cb); }
  onEnded(cb) { this.onEndedCallbacks.push(cb); }
  onStateChange(cb) { this.onStateChangeCallbacks.push(cb); }

  notifyTimeUpdate() {
    this.onTimeUpdateCallbacks.forEach(cb => cb(this.currentTime, this.duration));
  }
  notifyEnded() {
    this.onEndedCallbacks.forEach(cb => cb());
  }
  notifyStateChange() {
    this.onStateChangeCallbacks.forEach(cb => cb(this.isPlaying));
  }
}

window.AudioEngine = AudioEngine;

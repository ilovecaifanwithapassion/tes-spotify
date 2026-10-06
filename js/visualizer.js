/**
 * Sonora Ambient Fluid Visualizer
 * Apple Music style dynamic morphing color blobs + spectrum wave bars
 */

class AmbientVisualizer {
  constructor(canvasId, audioEngine) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.audioEngine = audioEngine;
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // Blob definitions for fluid background
    this.blobs = [
      { x: 0.2, y: 0.3, radius: 0.45, vx: 0.0008, vy: 0.0006, color: '#fa2d48' },
      { x: 0.8, y: 0.2, radius: 0.5, vx: -0.0007, vy: 0.0008, color: '#8338ec' },
      { x: 0.4, y: 0.8, radius: 0.48, vx: 0.0006, vy: -0.0005, color: '#3a86ff' },
      { x: 0.7, y: 0.7, radius: 0.4, vx: -0.0005, vy: -0.0007, color: '#ff006e' }
    ];

    this.currentColors = ['#fa2d48', '#8338ec', '#3a86ff', '#ff006e'];
    this.targetColors = ['#fa2d48', '#8338ec', '#3a86ff', '#ff006e'];

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.render();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width / 2; // Downscaled for ultra smooth performance with blur
    this.canvas.height = this.height / 2;
  }

  setPalette(colors) {
    if (!colors || colors.length === 0) return;
    this.targetColors = colors;
    
    // Set CSS Variables for Apple Music Lyrics Backdrop
    const root = document.documentElement;
    root.style.setProperty('--lyric-bg-color-1', colors[0] || '#fa2d48');
    root.style.setProperty('--lyric-bg-color-2', colors[1] || '#8338ec');
    root.style.setProperty('--lyric-bg-color-3', colors[2] || '#3a86ff');
    root.style.setProperty('--lyric-bg-color-4', colors[3] || '#ff006e');
  }

  updateWaveBars() {
    const waveContainer = document.getElementById('realtime-wave-bars');
    if (!waveContainer) return;

    if (waveContainer.children.length === 0) {
      for (let i = 0; i < 18; i++) {
        const bar = document.createElement('span');
        bar.className = 'w-bar';
        waveContainer.appendChild(bar);
      }
    }

    const freqData = this.audioEngine.getFrequencyData();
    const bars = waveContainer.querySelectorAll('.w-bar');
    
    bars.forEach((bar, i) => {
      const val = freqData[i * 2] || 0;
      const heightPercent = Math.max(15, (val / 255) * 100);
      bar.style.height = `${heightPercent}%`;
      bar.style.background = this.audioEngine.isPlaying 
        ? `linear-gradient(to top, rgba(255,255,255,0.4), #fff)`
        : 'rgba(255,255,255,0.25)';
    });
  }

  render() {
    if (!this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const freqData = this.audioEngine.getFrequencyData();
    const audioEnergy = (freqData[2] || 0) / 255; // Bass punch

    // Clear
    this.ctx.fillStyle = '#08080c';
    this.ctx.fillRect(0, 0, w, h);

    // Render smooth fluid blobs
    this.blobs.forEach((b, idx) => {
      // Update pos
      b.x += b.vx;
      b.y += b.vy;

      if (b.x < 0.1 || b.x > 0.9) b.vx *= -1;
      if (b.y < 0.1 || b.y > 0.9) b.vy *= -1;

      const targetColor = this.targetColors[idx % this.targetColors.length] || '#fa2d48';
      b.color = targetColor;

      const cx = b.x * w;
      const cy = b.y * h;
      const baseRadius = b.radius * Math.min(w, h);
      const radius = baseRadius * (1 + audioEnergy * 0.25);

      const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, b.color);
      grad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.updateWaveBars();
    requestAnimationFrame(() => this.render());
  }
}

window.AmbientVisualizer = AmbientVisualizer;

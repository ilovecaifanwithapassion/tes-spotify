/**
 * Sonora Apple Music Lyrics Overview Engine
 * Synchronized kinetic typography, center-lock auto-scroll, click-to-seek, responsive layout modes
 */

class LyricsEngine {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    
    // DOM Elements
    this.overlay = document.getElementById('apple-lyrics-overlay');
    this.linesWrapper = document.getElementById('lyrics-lines-wrapper');
    this.scrollerPanel = document.getElementById('lyrics-scroller-panel');
    this.stageContainer = document.getElementById('lyrics-stage-container');
    
    this.songTitleEl = document.getElementById('lyrics-song-title');
    this.artistNameEl = document.getElementById('lyrics-artist-name');
    this.miniArtEl = document.getElementById('lyrics-header-art');
    this.largeArtEl = document.getElementById('lyrics-large-art');
    this.albumTitleEl = document.getElementById('lyrics-album-title');
    
    this.currentTimeEl = document.getElementById('lyrics-current-time');
    this.durationTimeEl = document.getElementById('lyrics-duration-time');
    this.progressFillEl = document.getElementById('lyrics-progress-fill');
    this.progressTrackEl = document.getElementById('lyrics-progress-track');
    
    this.btnPlay = document.getElementById('btn-lyrics-play');
    this.btnPrev = document.getElementById('btn-lyrics-prev');
    this.btnNext = document.getElementById('btn-lyrics-next');
    this.btnClose = document.getElementById('btn-close-lyrics');
    this.btnModeLyrics = document.getElementById('btn-mode-lyrics');
    this.btnModeFull = document.getElementById('btn-mode-full');
    this.btnFontToggle = document.getElementById('btn-lyrics-font-toggle');
    this.btnLayoutToggle = document.getElementById('btn-lyrics-layout-toggle');

    this.isOpen = false;
    this.currentLyrics = [];
    this.activeLineIndex = -1;
    this.fontSizeMode = 'normal'; // 'normal', 'large', 'small'
    this.isFullTextMode = false;
    this.isUserScrolling = false;
    this.userScrollTimeout = null;

    this.init();
  }

  init() {
    this.bindEvents();

    // Listen to audio engine time updates
    this.audioEngine.onTimeUpdate((currentTime, duration) => {
      this.handleTimeUpdate(currentTime, duration);
    });

    this.audioEngine.onStateChange((isPlaying) => {
      this.updatePlayBtnState(isPlaying);
    });
  }

  bindEvents() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.close());
    }

    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', () => this.audioEngine.togglePlay());
    }

    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', () => {
        if (window.app) window.app.playPrevTrack();
      });
    }

    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => {
        if (window.app) window.app.playNextTrack();
      });
    }

    // Mode Toggle
    if (this.btnModeLyrics && this.btnModeFull) {
      this.btnModeLyrics.addEventListener('click', () => {
        this.isFullTextMode = false;
        this.btnModeLyrics.classList.add('active');
        this.btnModeFull.classList.remove('active');
        this.stageContainer.classList.remove('full-text-mode');
        this.scrollToActiveLine(true);
      });

      this.btnModeFull.addEventListener('click', () => {
        this.isFullTextMode = true;
        this.btnModeFull.classList.add('active');
        this.btnModeLyrics.classList.remove('active');
        this.stageContainer.classList.add('full-text-mode');
      });
    }

    // Font Sizing Toggle (Normal -> Large -> Small -> Normal)
    if (this.btnFontToggle) {
      this.btnFontToggle.addEventListener('click', () => {
        if (this.fontSizeMode === 'normal') {
          this.fontSizeMode = 'large';
          this.stageContainer.classList.remove('font-small');
          this.stageContainer.classList.add('font-large');
          this.showToast("Lyrics Font: Large");
        } else if (this.fontSizeMode === 'large') {
          this.fontSizeMode = 'small';
          this.stageContainer.classList.remove('font-large');
          this.stageContainer.classList.add('font-small');
          this.showToast("Lyrics Font: Compact");
        } else {
          this.fontSizeMode = 'normal';
          this.stageContainer.classList.remove('font-small', 'font-large');
          this.showToast("Lyrics Font: Standard");
        }
        this.scrollToActiveLine(true);
      });
    }

    // Side-by-Side Art Layout vs Centered Mode Toggle
    if (this.btnLayoutToggle) {
      this.btnLayoutToggle.addEventListener('click', () => {
        this.stageContainer.classList.toggle('centered-mode');
        const isCentered = this.stageContainer.classList.contains('centered-mode');
        this.showToast(isCentered ? "View: Centered Lyrics" : "View: Split Artwork & Lyrics");
        this.scrollToActiveLine(true);
      });
    }

    // Quick Scrubber Track in Lyrics Bottom
    if (this.progressTrackEl) {
      this.progressTrackEl.addEventListener('click', (e) => {
        const rect = this.progressTrackEl.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        const seekTime = pct * this.audioEngine.duration;
        this.audioEngine.seek(seekTime);
      });
    }

    // Detect user manual scroll to avoid jerking
    if (this.scrollerPanel) {
      this.scrollerPanel.addEventListener('wheel', () => {
        this.isUserScrolling = true;
        clearTimeout(this.userScrollTimeout);
        this.userScrollTimeout = setTimeout(() => {
          this.isUserScrolling = false;
        }, 2500);
      });
    }
  }

  showToast(msg) {
    if (window.app && window.app.showToast) {
      window.app.showToast(msg);
    }
  }

  open() {
    this.isOpen = true;
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.renderSongMetadata();
    this.renderLyricsList();
    setTimeout(() => this.scrollToActiveLine(true), 150);
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  renderSongMetadata() {
    const song = this.audioEngine.currentSong;
    if (!song) return;

    if (this.songTitleEl) this.songTitleEl.textContent = song.title;
    if (this.artistNameEl) this.artistNameEl.textContent = song.artist;
    if (this.albumTitleEl) this.albumTitleEl.textContent = song.album || song.title;
    if (this.miniArtEl) this.miniArtEl.src = song.art;
    if (this.largeArtEl) this.largeArtEl.src = song.art;
  }

  renderLyricsList() {
    const song = this.audioEngine.currentSong;
    if (!song || !song.lyrics) {
      this.linesWrapper.innerHTML = `<div class="lyric-line instrumental">No synchronized lyrics available for this track.</div>`;
      return;
    }

    this.currentLyrics = song.lyrics;
    this.linesWrapper.innerHTML = '';
    this.activeLineIndex = -1;

    this.currentLyrics.forEach((lyric, index) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'lyric-line';
      lineEl.dataset.index = index;
      lineEl.dataset.time = lyric.time;

      if (lyric.text.startsWith('(') && lyric.text.endsWith(')')) {
        lineEl.classList.add('instrumental');
        lineEl.innerHTML = `
          <span>${this.escapeHtml(lyric.text)}</span>
          <span class="dots-pulse"><span></span><span></span><span></span></span>
        `;
      } else {
        lineEl.textContent = lyric.text;
      }

      // Click to seek (Interactive lyric scrubbing)
      lineEl.addEventListener('click', () => {
        this.audioEngine.seek(lyric.time);
        if (!this.audioEngine.isPlaying) {
          this.audioEngine.play();
        }
        this.isUserScrolling = false;
        this.setActiveLine(index, true);
      });

      this.linesWrapper.appendChild(lineEl);
    });
  }

  handleTimeUpdate(currentTime, duration) {
    // Update lyrics progress bar & times
    if (this.currentTimeEl) this.currentTimeEl.textContent = this.formatTime(currentTime);
    if (this.durationTimeEl) this.durationTimeEl.textContent = this.formatTime(duration);
    
    if (this.progressFillEl && duration > 0) {
      const pct = (currentTime / duration) * 100;
      this.progressFillEl.style.width = `${pct}%`;
    }

    if (!this.currentLyrics || this.currentLyrics.length === 0) return;

    // Find active line matching current timestamp
    let foundIndex = -1;
    for (let i = 0; i < this.currentLyrics.length; i++) {
      if (currentTime >= this.currentLyrics[i].time) {
        foundIndex = i;
      } else {
        break;
      }
    }

    if (foundIndex !== this.activeLineIndex) {
      this.setActiveLine(foundIndex);
    }
  }

  setActiveLine(index, immediateScroll = false) {
    this.activeLineIndex = index;
    const lines = this.linesWrapper.querySelectorAll('.lyric-line');

    lines.forEach((el, idx) => {
      el.classList.remove('active', 'past');
      if (idx === index) {
        el.classList.add('active');
      } else if (idx < index) {
        el.classList.add('past');
      }
    });

    if (!this.isFullTextMode && (!this.isUserScrolling || immediateScroll)) {
      this.scrollToActiveLine(immediateScroll);
    }
  }

  scrollToActiveLine(force = false) {
    if (this.activeLineIndex < 0 || !this.scrollerPanel) return;

    const activeEl = this.linesWrapper.querySelector(`.lyric-line[data-index="${this.activeLineIndex}"]`);
    if (!activeEl) return;

    const panelHeight = this.scrollerPanel.clientHeight;
    const activeElTop = activeEl.offsetTop;
    const activeElHeight = activeEl.clientHeight;

    // Center lock calculation: place active lyric in the center 40% vertical zone
    const targetScroll = activeElTop - (panelHeight / 2) + (activeElHeight / 2);

    this.scrollerPanel.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: force ? 'auto' : 'smooth'
    });
  }

  updatePlayBtnState(isPlaying) {
    if (!this.btnPlay) return;
    if (isPlaying) {
      this.btnPlay.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    } else {
      this.btnPlay.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    }
  }

  formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

window.LyricsEngine = LyricsEngine;

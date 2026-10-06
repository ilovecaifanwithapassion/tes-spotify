/**
 * Sonora Main Application Controller
 * Spotify UI Architecture + Apple Music Synced Lyrics Integration
 */

class SonoraApp {
  constructor() {
    this.songs = window.SONGS_DATA || [];
    this.currentIndex = 0;
    this.queue = [...this.songs];
    this.likedSongIds = new Set(["song-1", "song-2"]);
    this.isShuffle = false;
    this.isRepeat = false;
    this.currentFilter = 'all';

    // Core Subsystems
    this.audioEngine = new AudioEngine();
    this.visualizer = new AmbientVisualizer('ambient-canvas', this.audioEngine);
    this.lyricsEngine = new LyricsEngine(this.audioEngine);

    // DOM Elements Cache
    this.cacheDom();
    this.init();
  }

  cacheDom() {
    // Navigation
    this.navHome = document.getElementById('nav-home');
    this.navSearch = document.getElementById('nav-search');
    this.navLibrary = document.getElementById('nav-library');
    this.viewHome = document.getElementById('view-home');
    this.viewSearch = document.getElementById('view-search');
    this.viewLibrary = document.getElementById('view-library');

    // Hero
    this.heroPlayBtn = document.getElementById('btn-hero-play');
    this.heroLyricsBtn = document.getElementById('btn-hero-lyrics');
    this.heroTitle = document.getElementById('hero-track-title');
    this.heroDesc = document.getElementById('hero-track-desc');
    this.heroArt = document.getElementById('hero-art-img');
    this.heroPillLyrics = document.getElementById('btn-hero-lyrics-pill');

    // Player Bar
    this.playerTitle = document.getElementById('player-track-title');
    this.playerArtist = document.getElementById('player-track-artist');
    this.playerArt = document.getElementById('player-track-art');
    this.btnLikeCurrent = document.getElementById('btn-like-current');
    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.iconPlay = document.getElementById('icon-play');
    this.iconPause = document.getElementById('icon-pause');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.btnShuffle = document.getElementById('btn-shuffle');
    this.btnRepeat = document.getElementById('btn-repeat');
    this.btnToggleLyrics = document.getElementById('btn-toggle-lyrics');
    this.btnExpandArt = document.getElementById('btn-expand-art');

    // Scrubber & Volume
    this.seekBarContainer = document.getElementById('seek-bar-container');
    this.seekBarFill = document.getElementById('seek-bar-fill');
    this.currentTimeLabel = document.getElementById('current-time-label');
    this.durationLabel = document.getElementById('duration-label');
    this.volumeBarContainer = document.getElementById('volume-bar-container');
    this.volumeBarFill = document.getElementById('volume-bar-fill');
    this.btnMute = document.getElementById('btn-mute');
    this.iconVolHigh = document.getElementById('icon-vol-high');
    this.iconVolMute = document.getElementById('icon-vol-mute');

    // Queue & Playlists
    this.btnToggleQueue = document.getElementById('btn-toggle-queue');
    this.queueDrawer = document.getElementById('queue-drawer');
    this.btnCloseQueue = document.getElementById('btn-close-queue');
    this.queueNowPlaying = document.getElementById('queue-now-playing');
    this.queueListContainer = document.getElementById('queue-list-container');
    this.btnLikedSongs = document.getElementById('btn-liked-songs');
    this.likedCountLabel = document.getElementById('liked-count-label');
    this.btnCreatePlaylist = document.getElementById('btn-create-playlist');
    this.playlistListContainer = document.getElementById('playlist-list-container');

    // Search
    this.globalSearchInput = document.getElementById('global-search-input');
    this.clearSearchBtn = document.getElementById('clear-search-btn');
    this.searchResultsContainer = document.getElementById('search-results-container');
    this.searchSongList = document.getElementById('search-song-list');
    this.genreGrid = document.getElementById('genre-grid');

    // Sidebar preview
    this.sidebarPreviewArt = document.getElementById('sidebar-preview-art');
    this.sidebarPreviewTitle = document.getElementById('sidebar-preview-title');
    this.sidebarPreviewArtist = document.getElementById('sidebar-preview-artist');

    // Equalizer Modal
    this.btnToggleEq = document.getElementById('btn-toggle-eq');
    this.eqModal = document.getElementById('eq-modal');
    this.btnCloseEq = document.getElementById('btn-close-eq');
    this.toggleSpatial = document.getElementById('toggle-spatial');

    // Uploader
    this.btnCustomAudioUploader = document.getElementById('btn-custom-audio-uploader');
    this.localFileInput = document.getElementById('local-file-input');
  }

  init() {
    this.renderSidebarPlaylists();
    this.renderHomeViews();
    this.renderSearchGenres();
    this.renderTrackTable();
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.setupAudioListeners();

    // Load initial featured track
    this.loadTrack(0, false);
    this.updateGreeting();
  }

  updateGreeting() {
    const greetingEl = document.getElementById('greeting-title');
    if (!greetingEl) return;
    const hour = new Date().getHours();
    if (hour < 12) greetingEl.textContent = "Good morning";
    else if (hour < 18) greetingEl.textContent = "Good afternoon";
    else greetingEl.textContent = "Good evening";
  }

  setupAudioListeners() {
    this.audioEngine.onTimeUpdate((currentTime, duration) => {
      this.currentTimeLabel.textContent = this.formatTime(currentTime);
      this.durationLabel.textContent = this.formatTime(duration);
      if (duration > 0) {
        const pct = (currentTime / duration) * 100;
        this.seekBarFill.style.width = `${pct}%`;
      }
    });

    this.audioEngine.onStateChange((isPlaying) => {
      if (isPlaying) {
        this.iconPlay.style.display = 'none';
        this.iconPause.style.display = 'block';
      } else {
        this.iconPlay.style.display = 'block';
        this.iconPause.style.display = 'none';
      }
    });

    this.audioEngine.onEnded(() => {
      if (this.isRepeat) {
        this.audioEngine.seek(0);
        this.audioEngine.play();
      } else {
        this.playNextTrack();
      }
    });
  }

  loadTrack(index, autoPlay = true) {
    if (index < 0 || index >= this.songs.length) return;
    this.currentIndex = index;
    const song = this.songs[index];

    this.audioEngine.loadSong(song);
    this.visualizer.setPalette(song.colors);

    // Update Player Bar UI
    this.playerTitle.textContent = song.title;
    this.playerArtist.textContent = song.artist;
    this.playerArt.src = song.art;

    // Update Sidebar Track Preview
    if (this.sidebarPreviewArt) this.sidebarPreviewArt.src = song.art;
    if (this.sidebarPreviewTitle) this.sidebarPreviewTitle.textContent = song.title;
    if (this.sidebarPreviewArtist) this.sidebarPreviewArtist.textContent = song.artist;

    // Update Hero (if on home)
    if (this.heroTitle) this.heroTitle.textContent = song.title;
    if (this.heroArt) this.heroArt.src = song.art;

    // Update Like status
    this.updateLikeButtonUI();

    // Update Queue UI
    this.renderQueueDrawer();

    // Re-render lyrics metadata
    this.lyricsEngine.renderSongMetadata();
    this.lyricsEngine.renderLyricsList();

    // Highlight active in track table
    this.updateTrackTableActiveState();

    if (autoPlay) {
      this.audioEngine.play();
    }
  }

  playTrackById(id) {
    const idx = this.songs.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.loadTrack(idx, true);
    }
  }

  playNextTrack() {
    if (this.isShuffle) {
      const randomIdx = Math.floor(Math.random() * this.songs.length);
      this.loadTrack(randomIdx, true);
    } else {
      const nextIdx = (this.currentIndex + 1) % this.songs.length;
      this.loadTrack(nextIdx, true);
    }
  }

  playPrevTrack() {
    if (this.audioEngine.currentTime > 3) {
      this.audioEngine.seek(0);
    } else {
      const prevIdx = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
      this.loadTrack(prevIdx, true);
    }
  }

  toggleLike(songId) {
    if (this.likedSongIds.has(songId)) {
      this.likedSongIds.delete(songId);
      this.showToast("Removed from Liked Songs");
    } else {
      this.likedSongIds.add(songId);
      this.showToast("Added to Liked Songs ❤️");
    }
    this.updateLikeButtonUI();
    this.renderTrackTable();
    this.likedCountLabel.textContent = `${this.likedSongIds.size} songs`;
  }

  updateLikeButtonUI() {
    const currentSong = this.songs[this.currentIndex];
    if (!currentSong) return;
    const isLiked = this.likedSongIds.has(currentSong.id);
    if (isLiked) {
      this.btnLikeCurrent.classList.add('liked');
      this.btnLikeCurrent.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    } else {
      this.btnLikeCurrent.classList.remove('liked');
      this.btnLikeCurrent.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    }
  }

  // ==========================================================================
  // DOM RENDERING
  // ==========================================================================

  renderHomeViews() {
    // 1. Quick Cards Grid (6 Spotify Items)
    const quickContainer = document.getElementById('quick-cards-container');
    if (quickContainer) {
      quickContainer.innerHTML = '';
      this.songs.slice(0, 6).forEach((song) => {
        const card = document.createElement('div');
        card.className = 'quick-card';
        card.innerHTML = `
          <img src="${song.art}" alt="${song.title}" class="quick-card-art">
          <span class="quick-card-title">${song.title}</span>
          <button class="quick-card-play-btn" title="Play">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
          </button>
        `;
        card.addEventListener('click', () => this.playTrackById(song.id));
        quickContainer.appendChild(card);
      });
    }

    // 2. Featured & Synced Tracks Grid
    this.renderFilteredMediaCards();

    // 3. Featured Artists
    const artistsContainer = document.getElementById('artists-cards-container');
    if (artistsContainer && window.ARTISTS_DATA) {
      artistsContainer.innerHTML = '';
      window.ARTISTS_DATA.forEach(artist => {
        const card = document.createElement('div');
        card.className = 'media-card artist-card';
        card.innerHTML = `
          <div class="media-card-art-box">
            <img src="${artist.art}" alt="${artist.name}" class="media-card-art">
            <button class="media-card-play-btn" title="Play">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
            </button>
          </div>
          <h4 class="media-card-title">${artist.name}</h4>
          <p class="media-card-subtitle">${artist.tag} &bull; ${artist.monthly}</p>
        `;
        card.addEventListener('click', () => {
          this.showToast(`Playing artist radio: ${artist.name}`);
          this.loadTrack(0, true);
        });
        artistsContainer.appendChild(card);
      });
    }
  }

  renderFilteredMediaCards() {
    const featuredContainer = document.getElementById('featured-cards-container');
    if (!featuredContainer) return;

    featuredContainer.innerHTML = '';
    const filtered = this.currentFilter === 'all'
      ? this.songs
      : this.songs.filter(s => s.category === this.currentFilter);

    filtered.forEach((song) => {
      const card = document.createElement('div');
      card.className = 'media-card';
      card.innerHTML = `
        <div class="media-card-art-box">
          <img src="${song.art}" alt="${song.title}" class="media-card-art">
          <button class="media-card-play-btn" title="Play">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
          </button>
        </div>
        <h4 class="media-card-title">${song.title}</h4>
        <p class="media-card-subtitle">${song.artist} &bull; ${song.genre}</p>
      `;
      card.addEventListener('click', () => this.playTrackById(song.id));
      featuredContainer.appendChild(card);
    });
  }

  renderSearchGenres() {
    if (!this.genreGrid || !window.GENRES_DATA) return;
    this.genreGrid.innerHTML = '';

    window.GENRES_DATA.forEach(genre => {
      const card = document.createElement('div');
      card.className = 'genre-card';
      card.style.background = genre.color;
      card.innerHTML = `
        <h3 class="genre-card-title">${genre.name}</h3>
        <span class="genre-card-icon">${genre.icon}</span>
      `;
      card.addEventListener('click', () => {
        this.currentFilter = genre.filter;
        this.switchView('home');
        this.updateFilterPills(genre.filter);
        this.renderFilteredMediaCards();
        this.showToast(`Browsing category: ${genre.name}`);
      });
      this.genreGrid.appendChild(card);
    });
  }

  renderSidebarPlaylists() {
    const dummyPlaylists = [
      "✨ Synthwave Cyberpunk",
      "☕ Cozy Rainy Study",
      "🌌 Deep Space Odyssey",
      "🌅 Golden Sunset Acoustic",
      "🎧 Lossless Spatial Masters"
    ];

    if (this.playlistListContainer) {
      this.playlistListContainer.innerHTML = '';
      dummyPlaylists.forEach((name, i) => {
        const li = document.createElement('li');
        li.className = 'playlist-list-item';
        li.textContent = name;
        li.addEventListener('click', () => {
          document.querySelectorAll('.playlist-list-item').forEach(el => el.classList.remove('active'));
          li.classList.add('active');
          this.showToast(`Loaded playlist: ${name}`);
          this.switchView('library');
          document.getElementById('library-view-title').textContent = name;
        });
        this.playlistListContainer.appendChild(li);
      });
    }
  }

  renderTrackTable() {
    const tbody = document.getElementById('track-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    this.songs.forEach((song, idx) => {
      const isCurrent = idx === this.currentIndex;
      const tr = document.createElement('tr');
      tr.className = `track-row ${isCurrent ? 'active' : ''}`;
      tr.dataset.id = song.id;

      tr.innerHTML = `
        <td class="td-num">${idx + 1}</td>
        <td class="td-title">
          <div class="td-title-wrapper">
            <img src="${song.art}" alt="${song.title}" class="table-track-art">
            <div>
              <div class="td-title-text">${song.title}</div>
              <div class="td-artist-text">${song.artist}</div>
            </div>
          </div>
        </td>
        <td class="td-album">${song.album || song.title}</td>
        <td class="td-date">${song.genre}</td>
        <td class="td-time">${this.formatTime(song.duration)}</td>
      `;

      tr.addEventListener('click', () => this.loadTrack(idx, true));
      tbody.appendChild(tr);
    });
  }

  updateTrackTableActiveState() {
    const rows = document.querySelectorAll('.track-row');
    rows.forEach((row, idx) => {
      if (idx === this.currentIndex) {
        row.classList.add('active');
      } else {
        row.classList.remove('active');
      }
    });
  }

  renderQueueDrawer() {
    if (!this.queueNowPlaying || !this.queueListContainer) return;

    const currentSong = this.songs[this.currentIndex];
    if (currentSong) {
      this.queueNowPlaying.innerHTML = `
        <img src="${currentSong.art}" class="queue-item-art">
        <div class="quick-info">
          <span class="title">${currentSong.title}</span>
          <span class="sub">${currentSong.artist}</span>
        </div>
      `;
    }

    this.queueListContainer.innerHTML = '';
    const nextSongs = this.songs.filter((_, idx) => idx !== this.currentIndex);
    nextSongs.forEach(song => {
      const item = document.createElement('div');
      item.className = 'queue-item';
      item.innerHTML = `
        <img src="${song.art}" class="queue-item-art">
        <div class="quick-info">
          <span class="title">${song.title}</span>
          <span class="sub">${song.artist}</span>
        </div>
      `;
      item.addEventListener('click', () => this.playTrackById(song.id));
      this.queueListContainer.appendChild(item);
    });
  }

  // ==========================================================================
  // VIEW SWITCHER & SEARCH
  // ==========================================================================

  switchView(viewName) {
    [this.navHome, this.navSearch, this.navLibrary].forEach(btn => btn?.classList.remove('active'));
    [this.viewHome, this.viewSearch, this.viewLibrary].forEach(panel => panel?.classList.remove('active-panel'));

    if (viewName === 'home') {
      this.navHome.classList.add('active');
      this.viewHome.classList.add('active-panel');
    } else if (viewName === 'search') {
      this.navSearch.classList.add('active');
      this.viewSearch.classList.add('active-panel');
      this.globalSearchInput.focus();
    } else if (viewName === 'library') {
      this.navLibrary.classList.add('active');
      this.viewLibrary.classList.add('active-panel');
    }
  }

  updateFilterPills(filter) {
    document.querySelectorAll('.pill').forEach(pill => {
      if (pill.dataset.filter === filter) pill.classList.add('active');
      else pill.classList.remove('active');
    });
  }

  handleSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.searchResultsContainer.style.display = 'none';
      this.genreGrid.style.display = 'grid';
      this.clearSearchBtn.style.display = 'none';
      return;
    }

    this.clearSearchBtn.style.display = 'block';
    this.searchResultsContainer.style.display = 'flex';
    this.genreGrid.style.display = 'none';

    // Search by title, artist, album, or even lyrics content!
    const matches = this.songs.filter(song => {
      const matchMeta = song.title.toLowerCase().includes(q) ||
                        song.artist.toLowerCase().includes(q) ||
                        song.genre.toLowerCase().includes(q);
      const matchLyrics = song.lyrics && song.lyrics.some(l => l.text.toLowerCase().includes(q));
      return matchMeta || matchLyrics;
    });

    this.searchSongList.innerHTML = '';
    if (matches.length === 0) {
      this.searchSongList.innerHTML = `<p style="color: var(--text-muted); padding: 12px;">No matching songs or lyrics found.</p>`;
      return;
    }

    matches.forEach(song => {
      const item = document.createElement('div');
      item.className = 'quick-card';
      
      // Highlight if matched in lyrics
      const lyricMatch = song.lyrics?.find(l => l.text.toLowerCase().includes(q));
      const subInfo = lyricMatch ? `Lyric match: "${lyricMatch.text}"` : `${song.artist} &bull; ${song.genre}`;

      item.innerHTML = `
        <img src="${song.art}" class="quick-card-art">
        <div style="padding: 0 16px; overflow: hidden;">
          <div style="font-weight: 700; color: #fff;">${song.title}</div>
          <div style="font-size: 0.8rem; color: var(--spotify-green); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${subInfo}</div>
        </div>
        <button class="quick-card-play-btn" title="Play">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
        </button>
      `;
      item.addEventListener('click', () => {
        this.playTrackById(song.id);
        if (lyricMatch) {
          this.lyricsEngine.open();
        }
      });
      this.searchSongList.appendChild(item);
    });
  }

  // ==========================================================================
  // EVENT BINDINGS
  // ==========================================================================

  bindEvents() {
    // Navigation items
    this.navHome.addEventListener('click', () => this.switchView('home'));
    this.navSearch.addEventListener('click', () => this.switchView('search'));
    this.navLibrary.addEventListener('click', () => this.switchView('library'));

    // Hero buttons
    this.heroPlayBtn.addEventListener('click', () => {
      this.loadTrack(0, true);
    });
    this.heroLyricsBtn.addEventListener('click', () => {
      this.lyricsEngine.open();
    });
    this.heroPillLyrics.addEventListener('click', () => {
      this.lyricsEngine.open();
    });

    // Player Play/Pause
    this.btnPlayPause.addEventListener('click', () => this.audioEngine.togglePlay());
    this.btnNext.addEventListener('click', () => this.playNextTrack());
    this.btnPrev.addEventListener('click', () => this.playPrevTrack());

    // Shuffle & Repeat
    this.btnShuffle.addEventListener('click', () => {
      this.isShuffle = !this.isShuffle;
      this.btnShuffle.classList.toggle('active', this.isShuffle);
      this.showToast(this.isShuffle ? "Shuffle On" : "Shuffle Off");
    });
    this.btnRepeat.addEventListener('click', () => {
      this.isRepeat = !this.isRepeat;
      this.btnRepeat.classList.toggle('active', this.isRepeat);
      this.showToast(this.isRepeat ? "Repeat 1 Track" : "Repeat Off");
    });

    // Like
    this.btnLikeCurrent.addEventListener('click', () => {
      const current = this.songs[this.currentIndex];
      if (current) this.toggleLike(current.id);
    });

    // Lyrics overlay toggles
    this.btnToggleLyrics.addEventListener('click', () => this.lyricsEngine.toggle());
    this.btnExpandArt.addEventListener('click', () => this.lyricsEngine.open());

    // Queue drawer
    this.btnToggleQueue.addEventListener('click', () => this.queueDrawer.classList.toggle('open'));
    this.btnCloseQueue.addEventListener('click', () => this.queueDrawer.classList.remove('open'));

    // Scrubber
    this.seekBarContainer.addEventListener('click', (e) => {
      const rect = this.seekBarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      const seekTime = pct * this.audioEngine.duration;
      this.audioEngine.seek(seekTime);
    });

    // Volume
    this.volumeBarContainer.addEventListener('click', (e) => {
      const rect = this.volumeBarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      this.audioEngine.setVolume(pct);
      this.volumeBarFill.style.width = `${pct * 100}%`;
    });

    this.btnMute.addEventListener('click', () => {
      const isMuted = this.audioEngine.toggleMute();
      if (isMuted) {
        this.iconVolHigh.style.display = 'none';
        this.iconVolMute.style.display = 'block';
        this.volumeBarFill.style.width = '0%';
      } else {
        this.iconVolHigh.style.display = 'block';
        this.iconVolMute.style.display = 'none';
        this.volumeBarFill.style.width = `${this.audioEngine.volume * 100}%`;
      }
    });

    // Filter pills
    document.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.currentFilter = pill.dataset.filter;
        this.updateFilterPills(this.currentFilter);
        this.renderFilteredMediaCards();
      });
    });

    // Search input
    this.globalSearchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });
    this.clearSearchBtn.addEventListener('click', () => {
      this.globalSearchInput.value = '';
      this.handleSearch('');
    });

    // Library buttons
    document.getElementById('btn-library-play-all')?.addEventListener('click', () => {
      this.loadTrack(0, true);
    });
    document.getElementById('btn-library-shuffle')?.addEventListener('click', () => {
      this.isShuffle = true;
      this.btnShuffle.classList.add('active');
      this.playNextTrack();
    });

    // Equalizer Modal
    this.btnToggleEq.addEventListener('click', () => {
      this.eqModal.style.display = 'flex';
    });
    this.btnCloseEq.addEventListener('click', () => {
      this.eqModal.style.display = 'none';
    });
    this.eqModal.addEventListener('click', (e) => {
      if (e.target === this.eqModal) this.eqModal.style.display = 'none';
    });

    // EQ Presets
    const presets = {
      flat: [0, 0, 0, 0, 0],
      bass: [8, 4, 0, -2, -1],
      vocal: [-2, 2, 6, 4, 1],
      spatial: [4, -1, 3, 5, 6],
      electronic: [6, 2, -1, 4, 7]
    };

    document.querySelectorAll('.eq-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.eq-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const presetVals = presets[chip.dataset.preset] || presets.flat;
        const sliders = [
          document.getElementById('slider-bass'),
          document.getElementById('slider-lowmid'),
          document.getElementById('slider-mid'),
          document.getElementById('slider-highmid'),
          document.getElementById('slider-treble')
        ];
        const valLabels = [
          document.getElementById('val-bass'),
          document.getElementById('val-lowmid'),
          document.getElementById('val-mid'),
          document.getElementById('val-highmid'),
          document.getElementById('val-treble')
        ];

        sliders.forEach((slider, i) => {
          slider.value = presetVals[i];
          valLabels[i].textContent = `${presetVals[i]}dB`;
          this.audioEngine.setEQBand(i, presetVals[i]);
        });
        this.showToast(`Applied EQ Preset: ${chip.textContent}`);
      });
    });

    // EQ Sliders
    ['slider-bass', 'slider-lowmid', 'slider-mid', 'slider-highmid', 'slider-treble'].forEach((id, index) => {
      const slider = document.getElementById(id);
      slider?.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        const label = document.getElementById(id.replace('slider-', 'val-'));
        if (label) label.textContent = `${val > 0 ? '+' : ''}${val}dB`;
        this.audioEngine.setEQBand(index, val);
      });
    });

    // Spatial toggle
    this.toggleSpatial.addEventListener('change', (e) => {
      this.audioEngine.setSpatialAudio(e.target.checked);
      this.showToast(e.target.checked ? "Spatial Audio: 3D Expanded" : "Spatial Audio: Standard Stereo");
    });

    // Custom Audio File Importer
    this.btnCustomAudioUploader.addEventListener('click', () => {
      this.localFileInput.click();
    });
    this.localFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const customTrack = this.audioEngine.loadCustomFile(file);
        this.songs.unshift(customTrack);
        this.renderHomeViews();
        this.renderTrackTable();
        this.loadTrack(0, true);
        this.showToast(`Loaded custom track: ${file.name}`);
        this.lyricsEngine.open();
      }
    });

    // Create playlist button
    this.btnCreatePlaylist.addEventListener('click', () => {
      const playlistName = prompt("Enter new playlist name:", "My Awesome Mix");
      if (playlistName) {
        const li = document.createElement('li');
        li.className = 'playlist-list-item';
        li.textContent = `🎵 ${playlistName}`;
        this.playlistListContainer.prepend(li);
        this.showToast(`Created playlist: ${playlistName}`);
      }
    });
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Avoid hotkeys if typing in search input
      if (e.target.tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.audioEngine.togglePlay();
          break;
        case 'KeyL':
          e.preventDefault();
          this.lyricsEngine.toggle();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.playNextTrack();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.playPrevTrack();
          break;
        case 'KeyM':
          e.preventDefault();
          this.btnMute.click();
          break;
        case 'KeyS':
          e.preventDefault();
          this.btnShuffle.click();
          break;
        case 'KeyR':
          e.preventDefault();
          this.btnRepeat.click();
          break;
        case 'Escape':
          if (this.lyricsEngine.isOpen) this.lyricsEngine.close();
          if (this.eqModal.style.display !== 'none') this.eqModal.style.display = 'none';
          this.queueDrawer.classList.remove('open');
          break;
      }
    });
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SonoraApp();
});

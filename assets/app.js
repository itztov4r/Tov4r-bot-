/* TOV4R MUSIC — Static public website. Real local HTML5 audio; no Discord token or secrets. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.TOV4R_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = $('#header');
  const menuToggle = $('#menuToggle');
  const toast = $('#toast');
  const dialog = $('#configDialog');
  const dialogMessage = $('#dialogMessage');
  let toastTimer = null;

  // Header / responsive navigation
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  function closeMenu() {
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
  }
  menuToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  $$('.main-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
    if (event.key === '/' && !/input|textarea/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      $('#commandSearch').focus();
      $('#commands').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  });

  // Scroll reveals / active section link
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .1, rootMargin: '0px 0px -15px 0px' });
    $$('.reveal').forEach(el => observer.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }
  const sectionObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.main-nav .nav-link').forEach(link => link.classList.toggle('is-current', link.hash === '#' + entry.target.id));
    });
  }, { rootMargin: '-30% 0px -60% 0px' }) : null;
  $$('main section[id]').forEach(section => sectionObserver?.observe(section));
  $('#year').textContent = new Date().getFullYear();

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
  }
  async function copyText(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.top = '-1000px';
        document.body.appendChild(textarea);
        textarea.focus(); textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Copy not supported');
      }
      notify('Copié : ' + value);
    } catch {
      notify('Copie impossible ici — sélectionne la commande manuellement.');
    }
  }
  function showDialog(message) {
    dialogMessage.textContent = message;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else { dialog.setAttribute('open', ''); }
    closeMenu();
  }
  function closeDialog() { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }
  $('#closeDialog').addEventListener('click', closeDialog);
  $('#okDialog').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });

  // Invite: Discord's default configured installation link. Only public client ID here.
  const discordInstallLink = () => {
    if (typeof config.inviteUrl === 'string' && /^https:\/\/discord(?:app)?\.com\//i.test(config.inviteUrl.trim())) return config.inviteUrl.trim();
    const id = String(config.clientId || '').trim();
    if (/^\d{17,22}$/.test(id)) return 'https://discord.com/oauth2/authorize?client_id=' + encodeURIComponent(id);
    return '';
  };
  const openSafeLink = url => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') throw new Error('unsafe URL');
      window.open(parsed.href, '_blank', 'noopener,noreferrer');
    } catch { notify('Le lien configuré est invalide.'); }
  };
  $$('[data-action]').forEach(button => button.addEventListener('click', async () => {
    const action = button.dataset.action;
    if (action === 'invite') {
      const url = discordInstallLink();
      if (url) { closeMenu(); openSafeLink(url); }
      else showDialog('Pour activer « Ajouter le bot », renseigne ton Application ID dans clientId (ou ton lien officiel dans inviteUrl). Aucun token Discord n’est nécessaire.');
    } else if (action === 'support' || action === 'github') {
      const url = action === 'support' ? config.supportUrl : config.githubUrl;
      if (url) { closeMenu(); openSafeLink(url); }
      else if (action === 'support') window.location.href = 'support.html';
      else showDialog('Ajoute le lien de ton dépôt GitHub dans githubUrl.');
    } else if (action === 'share') {
      const details = { title: 'TOV4R MUSIC', text: 'Découvre TOV4R MUSIC, le bot Discord !', url: window.location.href };
      if (navigator.share) {
        try { await navigator.share(details); } catch { /* user cancelled */ }
      } else await copyText(details.url);
    }
  }));

  // Commands displayed here reflect available / planned slash commands;
  // availability depends on the installed bot version.
  const commands = [
    { name: 'sma3', description: 'Rechercher et lancer une musique depuis ton serveur.', category: 'music' },
    { name: 'skot', description: 'Mettre en pause la musique en cours.', category: 'control' },
    { name: 'kml', description: 'Reprendre la lecture après une pause.', category: 'control' },
    { name: 'next', description: 'Passer au morceau suivant.', category: 'control' },
    { name: 'saf', description: 'Vider la liste des prochains morceaux.', category: 'music' },
    { name: 'list', description: 'Afficher la file d’attente musicale.', category: 'music' },
    { name: 'volume', description: 'Régler le volume du bot dans le vocal.', category: 'control' },
    { name: 'chno', description: 'Afficher les informations du morceau en cours.', category: 'utility' },
    { name: 'dour', description: 'Activer ou modifier le mode répétition.', category: 'control' },
    { name: 'mix', description: 'Mélanger l’ordre de la file d’attente.', category: 'music' },
    { name: 'khrej', description: 'Faire quitter le salon vocal au bot.', category: 'control' },
    { name: 'jaw', description: 'Découvrir les ambiances et modes disponibles.', category: 'utility' },
    { name: 'tov4r', description: 'Afficher les infos et l’aide de TOV4R MUSIC.', category: 'utility' }
  ];
  const labels = { music: 'MUSIQUE', control: 'CONTRÔLE', utility: 'UTILITAIRE' };
  const grid = $('#commandsGrid');
  const noResults = $('#noResults');
  const search = $('#commandSearch');
  let activeFilter = 'all';
  $('#allCount').textContent = String(commands.length);
  function renderCommands() {
    const query = search.value.toLocaleLowerCase('fr').trim();
    const filtered = commands.filter(command => (activeFilter === 'all' || command.category === activeFilter) && (command.name.includes(query) || command.description.toLocaleLowerCase('fr').includes(query)));
    grid.replaceChildren(...filtered.map(command => {
      const card = document.createElement('article'); card.className = 'command-card';
      const top = document.createElement('div'); top.className = 'command-card-top';
      const name = document.createElement('span'); name.className = 'command-card-name';
      const slash = document.createElement('span'); slash.className = 'slash'; slash.textContent = '/';
      name.append(slash, document.createTextNode(command.name));
      const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'command-copy'; copy.title = 'Copier /' + command.name; copy.setAttribute('aria-label', 'Copier /' + command.name);
      copy.innerHTML = '<svg class="ico"><use href="#i-copy"></use></svg>';
      copy.addEventListener('click', () => copyText('/' + command.name));
      top.append(name, copy);
      const description = document.createElement('p'); description.textContent = command.description;
      const type = document.createElement('span'); type.className = 'command-card-type'; type.textContent = '// ' + labels[command.category];
      card.append(top, description, type);
      return card;
    }));
    noResults.hidden = filtered.length > 0;
  }
  $$('.filter-btn').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    $$('.filter-btn').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    renderCommands();
  }));
  search.addEventListener('input', renderCommands);
  renderCommands();

    // First-party real audio player: original locally packaged tracks and user-imported audio only.
  // Official copyrighted music (Stormy) is streamed separately by the official Apple Music embed.
  const originalTracks = [
    { title: 'MIDNIGHT SIGNAL', artist: 'TOV4R MUSIC · ORIGINAL SYNTH', seconds: 22, theme: '', cover: 'assets/track-midnight.webp', badge: 'TOV4R / VOL. 01', mood: 'NIGHT DRIVE', file: 'assets/audio/midnight-signal.mp3' },
    { title: 'AFTER HOURS', artist: 'TOV4R MUSIC · ORIGINAL GROOVE', seconds: 22, theme: 'theme-two', cover: 'assets/track-afterhours.webp', badge: 'TOV4R / VOL. 02', mood: 'LIVE ENERGY', file: 'assets/audio/after-hours.mp3' },
    { title: 'NEON FREQUENCY', artist: 'TOV4R MUSIC · ORIGINAL WAVE', seconds: 22, theme: 'theme-three', cover: 'assets/track-neon.webp', badge: 'TOV4R / VOL. 03', mood: 'NEON VIBES', file: 'assets/audio/neon-frequency.mp3' },
    { title: 'RED ROOM SESSION', artist: 'TOV4R MUSIC · ORIGINAL MIX', seconds: 22, theme: 'theme-four', cover: 'assets/track-redroom.webp', badge: 'TOV4R / VOL. 04', mood: 'DJ MODE', file: 'assets/audio/red-room.mp3' }
  ];
  const tracks = [...originalTracks];
  const audio = $('#nativeAudio');
  const player = $('.player-shell'), title = $('#trackTitle'), artist = $('#trackArtist');
  const durationEl = $('#duration'), elapsedEl = $('#elapsed');
  const playBtn = $('#playBtn'), progressRail = $('#progressRail'), progressFill = $('#progressFill');
  const albumPhoto = $('#albumPhoto'), playlistList = $('#playlistList');
  const trackBadge = $('#trackBadge'), playerStatus = $('#playerStatus'), queueCount = $('#queueCount'), playerMood = $('#playerMood');
  const playlistTotal = $('#playlistTotal');
  let current = 0, shuffled = false, repeat = false;
  const localObjectUrls = new Set();
  const formatTime = seconds => !Number.isFinite(seconds) ? '0:00' : Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  const durationOf = track => Number.isFinite(track.seconds) ? track.seconds : 0;
  function updatePlaylistSummary() {
    queueCount.textContent = tracks.length + ' TRACKS';
    playlistTotal.textContent = formatTime(tracks.reduce((sum, track) => sum + durationOf(track), 0));
  }
  function removeLocalTrack(index) {
    const item = tracks[index];
    if (!item || !item.imported) return;
    const wasCurrent = current === index;
    const wasPlaying = !audio.paused;
    if (wasCurrent) audio.pause();
    tracks.splice(index, 1);
    if (localObjectUrls.has(item.file)) {
      URL.revokeObjectURL(item.file);
      localObjectUrls.delete(item.file);
    }
    if (wasCurrent) {
      loadTrack(Math.min(index, tracks.length - 1));
      if (wasPlaying) void setPlay(true);
    } else {
      if (index < current) current -= 1;
      renderPlaylist();
      updatePlaylistSummary();
    }
    notify('Piste retirée : ' + item.title);
  }
  function renderPlaylist() {
    playlistList.replaceChildren(...tracks.map((track, index) => {
      const wrap = document.createElement('div');
      wrap.className = 'playlist-row' + (index === current ? ' is-current' : '');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'playlist-item' + (index === current ? ' is-current' : '');
      button.setAttribute('aria-pressed', String(index === current));
      button.setAttribute('aria-label', 'Écouter ' + track.title);
      const art = document.createElement('span'); art.className = 'playlist-art';
      const img = document.createElement('img'); img.src = track.cover; img.alt = ''; img.loading = 'lazy';
      art.append(img);
      const copy = document.createElement('span'); copy.className = 'playlist-copy';
      const number = document.createElement('small'); number.textContent = String(index + 1).padStart(2, '0');
      const name = document.createElement('strong'); name.textContent = track.title;
      const desc = document.createElement('em'); desc.textContent = track.artist;
      copy.append(number, name, desc);
      const time = document.createElement('span'); time.className = 'playlist-time'; time.textContent = track.seconds ? formatTime(track.seconds) : '♪';
      button.append(art, copy, time);
      button.addEventListener('click', async () => { loadTrack(index); await setPlay(true); });
      wrap.append(button);
      if (track.imported) {
        const remove = document.createElement('button');
        remove.type = 'button'; remove.className = 'playlist-remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', 'Retirer ' + track.title + ' de la playlist');
        remove.title = 'Retirer ce fichier de la playlist';
        remove.addEventListener('click', () => removeLocalTrack(index));
        wrap.append(remove);
      }
      return wrap;
    }));
  }
  const favorites = new Set();
  function syncFavoriteButton() {
    const selected = favorites.has(tracks[current]?.file);
    $('#favoriteBtn').textContent = selected ? '♥' : '♡';
    $('#favoriteBtn').setAttribute('aria-pressed', String(selected));
  }
  function loadTrack(index) {
    if (tracks.length === 0) return;
    current = (index + tracks.length) % tracks.length;
    const track = tracks[current];
    audio.pause();
    audio.src = track.file;
    audio.load();
    title.textContent = track.title;
    artist.textContent = track.artist;
    durationEl.textContent = formatTime(track.seconds);
    $('#albumArt').className = 'album-art ' + track.theme;
    if (albumPhoto) { albumPhoto.src = track.cover; albumPhoto.alt = 'Pochette : ' + track.title; }
    trackBadge.textContent = track.badge;
    playerMood.textContent = track.mood;
    syncFavoriteButton();
    syncPlaying();
    updateProgress();
    renderPlaylist();
    updatePlaylistSummary();
  }
  function syncPlaying() {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('is-playing', playing);
    playerStatus.textContent = audio.error ? 'ERREUR' : (playing ? 'PLAYING' : 'PAUSED');
    playBtn.setAttribute('aria-pressed', String(playing));
    playBtn.setAttribute('aria-label', playing ? 'Mettre la musique en pause' : 'Lire la musique');
    $('#playIcon').innerHTML = playing ? '<use href="#i-pause"></use>' : '<use href="#i-play"></use>';
  }
  async function setPlay(value) {
    if (!value) { audio.pause(); syncPlaying(); return; }
    try { await audio.play(); }
    catch (error) {
      // Ignore aborted play() when the user immediately switches tracks.
      if (error?.name !== 'AbortError') notify('Lecture impossible. Vérifie les fichiers audio ou ton navigateur.');
    }
    syncPlaying();
  }
  function updateProgress() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : (tracks[current]?.seconds || 0);
    const elapsed = audio.currentTime || 0;
    const pct = duration > 0 ? elapsed / duration * 100 : 0;
    progressFill.style.width = pct.toFixed(2) + '%';
    elapsedEl.textContent = formatTime(elapsed);
    durationEl.textContent = formatTime(duration);
    progressRail.setAttribute('aria-valuenow', String(Math.round(pct)));
    progressRail.setAttribute('aria-valuetext', formatTime(elapsed) + ' sur ' + formatTime(duration));
  }
  function randomOtherTrack() { return tracks.length < 2 ? current : (current + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length; }
  async function skipNext() { loadTrack(shuffled ? randomOtherTrack() : current + 1); await setPlay(true); }
  playBtn.addEventListener('click', () => setPlay(audio.paused));
  $('#nextBtn').addEventListener('click', skipNext);
  $('#prevBtn').addEventListener('click', async () => {
    if (audio.currentTime >= 3) audio.currentTime = 0;
    else loadTrack(current - 1);
    await setPlay(true);
  });
  $('#shuffleBtn').addEventListener('click', event => { shuffled = !shuffled; event.currentTarget.setAttribute('aria-pressed', String(shuffled)); notify(shuffled ? 'Lecture aléatoire activée' : 'Lecture aléatoire désactivée'); });
  $('#repeatBtn').addEventListener('click', event => { repeat = !repeat; event.currentTarget.setAttribute('aria-pressed', String(repeat)); notify(repeat ? 'Répétition du morceau activée' : 'Répétition désactivée'); });
  $('#favoriteBtn').addEventListener('click', () => {
    const key = tracks[current].file;
    if (favorites.has(key)) { favorites.delete(key); notify('Favori retiré'); }
    else { favorites.add(key); notify('Ajouté aux favoris (session actuelle)'); }
    syncFavoriteButton();
  });
  const seek = ratio => { if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration; updateProgress(); };
  progressRail.addEventListener('click', event => { const rect = progressRail.getBoundingClientRect(); seek((event.clientX - rect.left) / rect.width); });
  progressRail.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); seek((audio.currentTime / audio.duration || 0) + (event.key === 'ArrowRight' ? .05 : -.05)); }
    else if (event.key === 'Home') { event.preventDefault(); seek(0); }
    else if (event.key === 'End') { event.preventDefault(); seek(1); }
  });
  audio.volume = .7;
  const muteBtn = $('#muteBtn');
  let previousVolume = 70;
  function syncVolume(value) {
    const n = Math.max(0, Math.min(100, Number(value)));
    audio.volume = n / 100;
    audio.muted = n === 0;
    $('#volumeInput').value = String(n);
    $('#volumeValue').textContent = n + '%';
    muteBtn.setAttribute('aria-label', n === 0 ? 'Réactiver le son' : 'Couper le son');
    muteBtn.setAttribute('aria-pressed', String(n === 0));
    muteBtn.querySelector('use').setAttribute('href', n === 0 ? '#i-volume-off' : '#i-volume');
  }
  $('#volumeInput').addEventListener('input', event => {
    const n = Number(event.target.value);
    if (n > 0) previousVolume = n;
    syncVolume(n);
  });
  muteBtn.addEventListener('click', () => syncVolume(audio.muted ? (previousVolume || 70) : 0));
  audio.addEventListener('play', syncPlaying);
  audio.addEventListener('pause', syncPlaying);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(audio.duration)) tracks[current].seconds = audio.duration;
    updateProgress(); updatePlaylistSummary(); renderPlaylist();
  });
  audio.addEventListener('ended', async () => {
    if (repeat) { audio.currentTime = 0; await setPlay(true); }
    else await skipNext();
  });
  audio.addEventListener('error', () => { if (audio.src) { notify('Impossible de charger cette piste audio.'); syncPlaying(); } });
  $('#localAudioFiles').addEventListener('change', async event => {
    const selected = [...event.target.files];
    if (!selected.length) return; // File picker cancelled
    const files = selected.filter(file => (file.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|webm)$/i.test(file.name)) && file.size > 0 && file.size <= 100 * 1024 * 1024);
    if (!files.length) { notify('Format incompatible ou fichier trop volumineux (100 Mo max).'); event.target.value = ''; return; }
    const initialIndex = tracks.length;
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      localObjectUrls.add(url);
      tracks.push({ title: file.name.replace(/\.[^.]+$/u, '').slice(0, 60), artist: 'TON FICHIER LOCAL · AUDIO', seconds: 0, theme: '', cover: 'assets/track-midnight.webp', badge: 'LOCAL AUDIO / IMPORTÉ', mood: 'YOUR MUSIC', file: url, imported: true });
    });
    loadTrack(initialIndex); await setPlay(true);
    notify(files.length + ' fichier(s) ajouté(s)' + (selected.length > files.length ? ' (certains fichiers ignorés)' : ''));
    event.target.value = '';
  });
  window.addEventListener('pagehide', () => localObjectUrls.forEach(url => URL.revokeObjectURL(url)));
  loadTrack(0);

  // Verified 2026 release: Stormy — DESPERADO. This is metadata only.
  // Audio playback takes place in the publisher's official Apple Music embed, not in our audio player.
  const stormyTracks = [
    ['CANDYSHOP', 'Stormy', '2:30'],
    ['OTAGE', 'Stormy', '3:13'],
    ['SKI', 'Stormy', '2:13'],
    ['EL MEJOR', 'Stormy, JRK 19', '2:15'],
    ['COME STAI', 'Stormy', '2:48'],
    ['5 STAR', 'Stormy', '2:42'],
    ['FOR LIFE', 'Stormy, M Huncho', '3:00'],
    ['ROUTINE', 'Stormy, MC PH', '3:00'],
    ['PER LA VITA', 'Stormy', '3:12'],
    ['POGBA', 'Stormy', '2:53'],
    ['SATA 9TTALA', 'Stormy, Manal', '3:33'],
    ['CHANEL', 'Stormy', '3:28'],
    ['CAMEMBERT', 'Stormy, TIF', '3:11'],
    ['NO WOMAN NO CRY', 'Stormy', '2:43'],
    ['KILOWAT', 'Stormy', '2:44']
  ];
  const stormyList = $('#stormyTracklist');
  if (stormyList) {
    stormyList.replaceChildren(...stormyTracks.map(([name, performers, length], i) => {
      const row = document.createElement('div');
      row.className = 'stormy-track';
      row.title = name + ' — écoute via le lecteur officiel Apple Music ci-dessous';
      const number = document.createElement('span'); number.className = 'stormy-track-index'; number.textContent = String(i + 1).padStart(2, '0');
      const details = document.createElement('span'); details.className = 'stormy-track-details';
      const nameEl = document.createElement('strong'); nameEl.textContent = name;
      const performerEl = document.createElement('small'); performerEl.textContent = performers;
      details.append(nameEl, performerEl);
      const time = document.createElement('span'); time.className = 'stormy-track-time'; time.textContent = length;
      row.append(number, details, time);
      return row;
    }));
  }

  // Lightweight cursor effect / hero mouse parallax (desktop only).
  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    const glow = $('#cursorGlow'); let lastMove = 0;
    document.addEventListener('pointermove', event => {
      const now = performance.now(); if (now - lastMove < 20) return; lastMove = now;
      glow.style.left = event.clientX + 'px'; glow.style.top = event.clientY + 'px';
    }, { passive: true });
    const art = $('#heroArt');
    art.addEventListener('pointermove', event => {
      const rect = art.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      art.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    }, { passive: true });
    art.addEventListener('pointerleave', () => art.style.transform = '');
  }
})();

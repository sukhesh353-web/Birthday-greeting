/* ==========================================================================
   LAVENDER DREAMS - BIRTHDAY WEB APP JAVASCRIPT
   Clean, Locked & Responsive Birthday Greeting Experience
   Uses image resource folder (images/photo1.jpg, etc.)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. SOUND & AUDIO SYNTHESIZER (WEB AUDIO API - ZERO EXTERNAL ASSETS NEEDED)
  // =========================================================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.isMusicPlaying = false;
      this.sfxEnabled = true;
      this.musicTimer = null;
      this.noteIndex = 0;

      // Happy Birthday Melody in soft music box tones (Hz, duration in beats)
      this.birthdayMelody = [
        { f: 261.63, d: 0.75 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 1.0 }, { f: 261.63, d: 1.0 }, { f: 349.23, d: 1.0 }, { f: 329.63, d: 2.0 },
        { f: 261.63, d: 0.75 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 1.0 }, { f: 261.63, d: 1.0 }, { f: 392.00, d: 1.0 }, { f: 349.23, d: 2.0 },
        { f: 261.63, d: 0.75 }, { f: 261.63, d: 0.25 }, { f: 523.25, d: 1.0 }, { f: 440.00, d: 1.0 }, { f: 349.23, d: 1.0 }, { f: 329.63, d: 1.0 }, { f: 293.66, d: 1.5 },
        { f: 466.16, d: 0.75 }, { f: 466.16, d: 0.25 }, { f: 440.00, d: 1.0 }, { f: 349.23, d: 1.0 }, { f: 392.00, d: 1.0 }, { f: 349.23, d: 2.5 }
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.8, gainVal = 0.15) {
      if (!this.ctx) this.init();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio playTone error:', e);
      }
    }

    playSparkleChime() {
      if (!this.sfxEnabled) return;
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.6, 0.12);
        }, idx * 70);
      });
    }

    playBlowSound() {
      if (!this.sfxEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        this.playTone(880, 'triangle', 0.45, 0.08);
      } catch (e) {
        console.warn(e);
      }
    }

    playFlipSound() {
      if (!this.sfxEnabled) return;
      this.init();
      this.playTone(440, 'sine', 0.22, 0.08);
      setTimeout(() => this.playTone(660, 'sine', 0.22, 0.08), 70);
    }

    playCelebration() {
      if (!this.sfxEnabled) return;
      this.init();
      const chord = [349.23, 440.00, 523.25, 698.46, 880.00];
      chord.forEach((note, idx) => {
        setTimeout(() => this.playTone(note, 'sine', 1.2, 0.15), idx * 90);
      });
    }

    startMusic() {
      this.init();
      this.isMusicPlaying = true;
      this.noteIndex = 0;
      this.playNextMusicNote();
      updateMusicUI(true);
    }

    stopMusic() {
      this.isMusicPlaying = false;
      if (this.musicTimer) clearTimeout(this.musicTimer);
      updateMusicUI(false);
    }

    toggleMusic() {
      if (this.isMusicPlaying) {
        this.stopMusic();
      } else {
        this.startMusic();
      }
    }

    playNextMusicNote() {
      if (!this.isMusicPlaying) return;

      const note = this.birthdayMelody[this.noteIndex];
      this.playTone(note.f, 'sine', note.d * 0.9, 0.09);
      setTimeout(() => {
        if (this.isMusicPlaying) this.playTone(note.f * 1.5, 'sine', note.d * 0.6, 0.03);
      }, 40);

      this.noteIndex = (this.noteIndex + 1) % this.birthdayMelody.length;
      const beatDurationMs = note.d * 480;

      this.musicTimer = setTimeout(() => {
        this.playNextMusicNote();
      }, beatDurationMs);
    }
  }

  const sound = new SoundManager();

  // Mobile Audio gesture unlock
  const unlockAudio = () => {
    sound.init();
    ['touchstart', 'touchend', 'click', 'pointerdown'].forEach(ev => {
      document.removeEventListener(ev, unlockAudio);
    });
  };
  ['touchstart', 'touchend', 'click', 'pointerdown'].forEach(ev => {
    document.addEventListener(ev, unlockAudio, { once: true, passive: true });
  });

  // =========================================================================
  // 2. CANVAS PARTICLE ENGINE (HIGH-DPI / RETINA AWARE)
  // =========================================================================
  const canvas = document.getElementById('fx-canvas');
  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;
  let width = window.innerWidth;
  let height = window.innerHeight;

  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const petals = [];
  const sparkles = [];
  const cursorSparkles = [];

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -30;
      this.size = Math.random() * 12 + 8;
      this.speedY = Math.random() * 1.0 + 0.5;
      this.speedX = Math.random() * 1.0 - 0.5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.025;
      this.opacity = Math.random() * 0.4 + 0.25;
      this.color = Math.random() > 0.4 ? '#d8b4fe' : (Math.random() > 0.5 ? '#fbcfe8' : '#c084fc');
      this.wobble = Math.random() * Math.PI;
      this.wobbleSpeed = Math.random() * 0.03 + 0.01;
    }

    update() {
      this.y += this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 0.7 + this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      ctx.ellipse(0, 0, this.size / 2, this.size, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 0.7);
      ctx.lineTo(0, this.size * 0.7);
      ctx.stroke();

      ctx.restore();
    }
  }

  class Sparkle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.2 + 1;
      this.alpha = Math.random();
      this.speed = Math.random() * 0.02 + 0.005;
      this.growing = Math.random() > 0.5;
    }

    update() {
      if (this.growing) {
        this.alpha += this.speed;
        if (this.alpha >= 0.9) this.growing = false;
      } else {
        this.alpha -= this.speed;
        if (this.alpha <= 0.1) {
          this.growing = true;
          this.x = Math.random() * width;
          this.y = Math.random() * height;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.6;
      ctx.fillStyle = '#fff4d2';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#fde047';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const isMobile = window.innerWidth <= 768;
  const petalCount = isMobile ? 22 : 36;
  const sparkleCount = isMobile ? 35 : 60;

  for (let i = 0; i < petalCount; i++) petals.push(new Petal());
  for (let i = 0; i < sparkleCount; i++) sparkles.push(new Sparkle());

  function addSparkleAt(x, y) {
    if (Math.random() > 0.5) {
      cursorSparkles.push({
        x: x,
        y: y,
        size: Math.random() * 3.5 + 2,
        alpha: 1,
        color: Math.random() > 0.5 ? '#fbcfe8' : '#e9d5ff',
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4 - 0.4
      });
    }
  }

  window.addEventListener('pointermove', (e) => addSparkleAt(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      addSparkleAt(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    sparkles.forEach(s => {
      s.update();
      s.draw();
    });

    petals.forEach(p => {
      p.update();
      p.draw();
    });

    for (let i = cursorSparkles.length - 1; i >= 0; i--) {
      const cs = cursorSparkles[i];
      cs.x += cs.vx;
      cs.y += cs.vy;
      cs.alpha -= 0.035;
      cs.size *= 0.95;

      if (cs.alpha <= 0 || cs.size <= 0.5) {
        cursorSparkles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = cs.alpha;
      ctx.fillStyle = cs.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = cs.color;
      ctx.beginPath();
      ctx.arc(cs.x, cs.y, cs.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(renderParticles);
  }
  renderParticles();

  // =========================================================================
  // 3. FULL CONFETTI CANNON ENGINE
  // =========================================================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  const cctx = confettiCanvas.getContext('2d');

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth * dpr;
    confettiCanvas.height = window.innerHeight * dpr;
    confettiCanvas.style.width = window.innerWidth + 'px';
    confettiCanvas.style.height = window.innerHeight + 'px';
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);

  let confettiParticles = [];
  const confettiColors = ['#a855f7', '#c084fc', '#d8b4fe', '#f472b6', '#fbcfe8', '#fde047', '#ffffff'];

  function fireConfetti(count = 80, originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
    const adjustedCount = isMobile ? Math.min(count, 60) : count;
    for (let i = 0; i < adjustedCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 5;
      confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        size: Math.random() * 7 + 5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.22,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.009,
        shape: Math.random() > 0.4 ? 'rect' : 'heart'
      });
    }
  }

  function renderConfetti() {
    cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        confettiParticles.splice(i, 1);
        continue;
      }

      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rotation);
      cctx.globalAlpha = p.alpha;
      cctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        cctx.beginPath();
        const topCurveHeight = p.size * 0.3;
        cctx.moveTo(0, topCurveHeight);
        cctx.bezierCurveTo(0, 0, -p.size / 2, 0, -p.size / 2, topCurveHeight);
        cctx.bezierCurveTo(-p.size / 2, (p.size + topCurveHeight) / 2, 0, p.size, 0, p.size * 1.2);
        cctx.bezierCurveTo(0, p.size, p.size / 2, (p.size + topCurveHeight) / 2, p.size / 2, topCurveHeight);
        cctx.bezierCurveTo(p.size / 2, 0, 0, 0, 0, topCurveHeight);
        cctx.fill();
      }

      cctx.restore();
    }

    requestAnimationFrame(renderConfetti);
  }
  renderConfetti();

  // =========================================================================
  // 4. ENVELOPE GATE (MAGICAL OPENING)
  // =========================================================================
  const envelopeBtn = document.getElementById('envelope-btn');
  const envelopeGate = document.getElementById('envelope-gate');

  if (envelopeBtn && envelopeGate) {
    const handleEnvelopeOpen = (e) => {
      e.preventDefault();
      sound.playSparkleChime();
      envelopeBtn.classList.add('open');

      const rect = envelopeBtn.getBoundingClientRect();
      fireConfetti(100, rect.left + rect.width / 2, rect.top + rect.height / 2);

      setTimeout(() => {
        envelopeGate.classList.add('opened');
        sound.startMusic();
      }, 950);
    };

    envelopeBtn.addEventListener('click', handleEnvelopeOpen);
    envelopeBtn.addEventListener('touchend', handleEnvelopeOpen, { passive: false });
  }

  // =========================================================================
  // 5. TOP BAR CONTROLS
  // =========================================================================
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicWave = document.getElementById('music-wave');
  const sfxToggleBtn = document.getElementById('sfx-toggle-btn');
  const sfxIcon = document.getElementById('sfx-icon');

  function updateMusicUI(isPlaying) {
    if (isPlaying) {
      musicToggleBtn?.classList.add('active');
      musicWave?.classList.remove('paused');
    } else {
      musicToggleBtn?.classList.remove('active');
      musicWave?.classList.add('paused');
    }
  }

  musicToggleBtn?.addEventListener('click', () => {
    sound.toggleMusic();
  });

  sfxToggleBtn?.addEventListener('click', () => {
    sound.sfxEnabled = !sound.sfxEnabled;
    if (sound.sfxEnabled) {
      sfxToggleBtn?.classList.add('active');
      sfxToggleBtn.querySelector('span:last-child').textContent = 'SFX: On';
      if (sfxIcon) sfxIcon.textContent = '🔔';
      sound.playTone(660, 'sine', 0.2);
    } else {
      sfxToggleBtn?.classList.remove('active');
      sfxToggleBtn.querySelector('span:last-child').textContent = 'SFX: Off';
      if (sfxIcon) sfxIcon.textContent = '🔕';
    }
  });

  // =========================================================================
  // 6. INTERACTIVE BIRTHDAY CAKE & CANDLES
  // =========================================================================
  const candles = document.querySelectorAll('.candle');
  const blowAllBtn = document.getElementById('blow-all-btn');
  const relightBtn = document.getElementById('relight-btn');
  const cakeStatusText = document.getElementById('cake-status-text');
  const cakeWishCard = document.getElementById('cake-wish-card');

  function checkCandles() {
    const blownCount = document.querySelectorAll('.candle.blown').length;
    if (blownCount === candles.length) {
      cakeStatusText.innerHTML = '🎉 <strong>Happy Birthday, My Love!</strong> All your candles are blown out! 💜';
      cakeWishCard.classList.add('visible');
      blowAllBtn.style.display = 'none';
      relightBtn.style.display = 'inline-flex';

      sound.playCelebration();
      const cakeRect = document.querySelector('.cake-stage').getBoundingClientRect();
      fireConfetti(120, cakeRect.left + cakeRect.width / 2, cakeRect.top + 60);
    } else {
      cakeStatusText.textContent = `✨ ${candles.length - blownCount} candle${candles.length - blownCount > 1 ? 's' : ''} left for you to blow!`;
    }
  }

  function blowSingleCandle(candle) {
    if (!candle.classList.contains('blown')) {
      candle.classList.add('blown');
      sound.playBlowSound();
      const rect = candle.getBoundingClientRect();
      fireConfetti(18, rect.left + rect.width / 2, rect.top);
      checkCandles();
    }
  }

  candles.forEach(candle => {
    candle.addEventListener('click', () => blowSingleCandle(candle));
    candle.addEventListener('touchend', (e) => {
      e.preventDefault();
      blowSingleCandle(candle);
    }, { passive: false });
  });

  blowAllBtn?.addEventListener('click', () => {
    candles.forEach((c, idx) => {
      setTimeout(() => blowSingleCandle(c), idx * 160);
    });
  });

  relightBtn?.addEventListener('click', () => {
    candles.forEach(c => c.classList.remove('blown'));
    cakeWishCard.classList.remove('visible');
    blowAllBtn.style.display = 'inline-flex';
    relightBtn.style.display = 'none';
    cakeStatusText.textContent = '✨ Tap each candle or the button to make your birthday wish!';
    sound.playSparkleChime();
  });

  // =========================================================================
  // 7. POLAROID MEMORY GALLERY
  // =========================================================================
  const polaroidCards = document.querySelectorAll('.polaroid-card');
  polaroidCards.forEach(card => {
    const index = card.getAttribute('data-index');
    const imgElem = card.querySelector('.polaroid-img');
    const savedImg = localStorage.getItem(`polaroid_img_${index}`);
    if (savedImg && imgElem) {
      imgElem.src = savedImg;
    }
  });

  // =========================================================================
  // 8. 3D FLIP CARDS (WHY I FELL IN LOVE WITH YOU)
  // =========================================================================
  const flipCards = document.querySelectorAll('.flip-card');
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      sound.playFlipSound();
    });
  });

  // =========================================================================
  // 9. VIRTUAL LOVE BUTTONS (FROM ME TO HER)
  // =========================================================================
  function spawnFloatingEmojis(emojis) {
    sound.playTone(880, 'sine', 0.4, 0.12);
    const count = isMobile ? 12 : 18;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'flying-emoji';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = `${Math.random() * 85 + 7}vw`;
        el.style.bottom = `${Math.random() * 20 + 40}px`;
        el.style.animationDuration = `${Math.random() * 1.0 + 1.6}s`;
        document.body.appendChild(el);

        setTimeout(() => el.remove(), 2400);
      }, i * 65);
    }
  }

  document.getElementById('send-hug-btn')?.addEventListener('click', () => {
    spawnFloatingEmojis(['🤗', '💜', '🫂', '🌸', '✨']);
    fireConfetti(35);
  });

  document.getElementById('send-kiss-btn')?.addEventListener('click', () => {
    spawnFloatingEmojis(['💋', '💖', '😘', '💜', '💐']);
    fireConfetti(35);
  });

  document.getElementById('send-sparkles-btn')?.addEventListener('click', () => {
    spawnFloatingEmojis(['✨', '🌸', '🌟', '💫', '💜']);
    fireConfetti(50);
  });

  document.getElementById('send-hearts-btn')?.addEventListener('click', () => {
    spawnFloatingEmojis(['💜', '💜', '🤍', '💖', '✨']);
    fireConfetti(60);
  });

  // =========================================================================
  // 10. LOAD PERSISTED DATA
  // =========================================================================
  const displayName = document.getElementById('display-name');
  const displaySubtitle = document.getElementById('display-subtitle');
  const gateCardName = document.getElementById('gate-card-name');
  const gateFromTag = document.getElementById('gate-from-tag');
  const letterRecipientName = document.getElementById('letter-recipient-name');
  const letterBodyContent = document.getElementById('letter-body-content');
  const letterSignature = document.getElementById('letter-signature');
  const cakeWishText = document.getElementById('cake-wish-text');

  function loadSavedData() {
    const name = localStorage.getItem('bday_name');
    const sender = localStorage.getItem('bday_sender');
    const subtitle = localStorage.getItem('bday_subtitle');
    const letter = localStorage.getItem('bday_letter');
    const wish = localStorage.getItem('bday_wish');

    if (name && displayName) displayName.textContent = name;
    if (name && gateCardName) gateCardName.textContent = `To ${name}`;
    if (sender && gateFromTag) gateFromTag.textContent = `With all my love, from ${sender}`;
    if (name && letterRecipientName) letterRecipientName.textContent = name;
    if (sender && letterSignature) letterSignature.textContent = `${sender} 💜`;
    if (subtitle && displaySubtitle) displaySubtitle.textContent = subtitle;
    if (letter && letterBodyContent) letterBodyContent.textContent = letter;
    if (wish && cakeWishText) cakeWishText.textContent = wish;
  }

  loadSavedData();
});

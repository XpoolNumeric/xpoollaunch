/**
 * MS FAMILY LAUNCH - PURE THEATER PRESENCE ENGINE
 * Triggers 5-4-3-2-1 Countdown on ENTER / Click,
 * Opens Curtains, and Displays Launch Image Fit to Screen with Pyrotechnics.
 */

(() => {
  'use strict';

  // Elements
  const stageWrapper = document.getElementById('stage-wrapper');
  const curtainsWrapper = document.getElementById('curtains-wrapper');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownNumber = document.getElementById('countdown-number');
  const ceremonyFlash = document.getElementById('ceremony-flash');
  const launchVideo = document.getElementById('launch-video');

  // Canvases
  const fireworksCanvas = document.getElementById('fireworks-canvas');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const fwCtx = fireworksCanvas.getContext('2d');
  const cfCtx = confettiCanvas.getContext('2d');

  // State
  let isRevealed = false;
  let isCountingDown = false;
  let audioCtx = null;
  let fireworksInterval = null;
  let animationFrameId = null;

  /* ==========================================================================
     CANVAS SIZING
     ========================================================================== */
  function resizeCanvases() {
    const dpr = window.devicePixelRatio || 1;
    fireworksCanvas.width = window.innerWidth * dpr;
    fireworksCanvas.height = window.innerHeight * dpr;
    confettiCanvas.width = window.innerWidth * dpr;
    confettiCanvas.height = window.innerHeight * dpr;
    fwCtx.scale(dpr, dpr);
    cfCtx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  /* ==========================================================================
     WEB AUDIO ENGINE (Heartbeat, Drumroll, Fanfare, Fireworks, Applause)
     ========================================================================== */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) {
        audioCtx = new AudioClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Heartbeat pulse for countdown
  function playHeartbeat(highPitch = false) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = highPitch ? 220 : 100;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.16);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Drumroll
  function playDrumroll(duration = 5.0, onComplete) {
    const ctx = getAudioContext();
    if (!ctx) {
      if (onComplete) setTimeout(onComplete, duration * 1000);
      return;
    }

    const now = ctx.currentTime;
    const totalHits = 60;
    const interval = duration / totalHits;

    for (let i = 0; i < totalHits; i++) {
      const hitTime = now + (i * interval);
      const intensity = 0.12 + Math.pow(i / totalHits, 1.6) * 0.88;

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130 + Math.random() * 25, hitTime);
      oscGain.gain.setValueAtTime(intensity * 0.35, hitTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.04);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(hitTime);
      osc.stop(hitTime + 0.045);

      const bSize = ctx.sampleRate * 0.035;
      const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let j = 0; j < bSize; j++) {
        d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.007));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = b;
      const nFilter = ctx.createBiquadFilter();
      nFilter.type = 'highpass';
      nFilter.frequency.setValueAtTime(1400, hitTime);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(intensity * 0.4, hitTime);
      nGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.035);
      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(hitTime);
    }

    setTimeout(() => {
      playCymbalCrash();
      if (onComplete) onComplete();
    }, duration * 1000);
  }

  function playCymbalCrash() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 1.8;
    const bSize = ctx.sampleRate * duration;
    const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let j = 0; j < bSize; j++) {
      d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.38));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = b;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4200, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  // Grand Regal Fanfare
  function playGrandFanfare() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { freq: 261.63, time: 0.0, dur: 0.22, vol: 0.40 },  // C4
      { freq: 329.63, time: 0.22, dur: 0.22, vol: 0.42 }, // E4
      { freq: 392.00, time: 0.44, dur: 0.28, vol: 0.46 }, // G4
      { freq: 523.25, time: 0.72, dur: 0.65, vol: 0.55 }, // C5
      { freq: 440.00, time: 1.40, dur: 0.18, vol: 0.40 }, // A4
      { freq: 493.88, time: 1.58, dur: 0.18, vol: 0.44 }, // B4
      { freq: 523.25, time: 1.76, dur: 0.95, vol: 0.60 }, // C5
    ];

    notes.forEach(n => {
      playBrassVoice(ctx, n.freq, now + n.time, n.dur, n.vol);
    });

    const chordTime = now + 2.7;
    const chordNotes = [261.63, 329.63, 392.00, 523.25, 659.25];
    chordNotes.forEach(freq => {
      playBrassVoice(ctx, freq, chordTime, 2.5, 0.36);
    });

    playApplauseCheers(now + 0.7, 6.0);
  }

  function playBrassVoice(ctx, freq, startTime, duration, vol) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 1.6, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 4.8, startTime + 0.07);
    filter.frequency.exponentialRampToValueAtTime(freq * 2.3, startTime + duration);

    oscGain.gain.setValueAtTime(0.001, startTime);
    oscGain.gain.exponentialRampToValueAtTime(vol, startTime + 0.04);
    oscGain.gain.setValueAtTime(vol * 0.85, startTime + duration * 0.7);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  // Crowd Applause
  function playApplauseCheers(startTime, duration = 5.0) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const bSize = ctx.sampleRate * duration;
    const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
    const d = b.getChannelData(0);

    for (let j = 0; j < bSize; j++) {
      const envelope = Math.sin((j / bSize) * Math.PI);
      const clapImpulse = (Math.random() > 0.955 ? (Math.random() * 2 - 1) * 2.6 : 0);
      d[j] = ((Math.random() * 2 - 1) * 0.28 + clapImpulse) * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = b;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1450, startTime);
    filter.Q.setValueAtTime(1.9, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.exponentialRampToValueAtTime(0.45, startTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(startTime);
  }

  // Firework Boom
  function playFireworkBoom() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.48);

    subGain.gain.setValueAtTime(0.75, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.48);

    const bSize = ctx.sampleRate * 0.65;
    const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let j = 0; j < bSize; j++) {
      d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.16));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = b;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2100, now + 0.05);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.32, now + 0.05);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now + 0.05);
  }

  /* ==========================================================================
     FIREWORKS & CONFETTI PARTICLES ENGINE
     ========================================================================== */
  const fireworks = [];
  const fwParticles = [];
  const confettiParticles = [];
  const FW_COLORS = ['#f59e0b', '#fbbf24', '#f43f5e', '#ec4899', '#06b6d4', '#3b82f6', '#10b981', '#ffffff'];
  const CONFETTI_COLORS = ['#f59e0b', '#fbbf24', '#fef08a', '#0ea5e9', '#ec4899', '#10b981', '#ffffff'];

  class FireworkRocket {
    constructor(startX, startY, targetX, targetY) {
      this.x = startX;
      this.y = startY;
      this.targetX = targetX;
      this.targetY = targetY;
      this.color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
      const angle = Math.atan2(targetY - startY, targetX - startX);
      const speed = 14 + Math.random() * 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.trail = [];
      this.dead = false;
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 7) this.trail.shift();
      this.x += this.vx;
      this.y += this.vy;
      const dist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
      if (dist < 18 || this.vy >= 0) {
        this.dead = true;
        explodeFirework(this.x, this.y, this.color);
      }
    }
    draw(ctx) {
      ctx.save();
      for (let i = 0; i < this.trail.length; i++) {
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = (i / this.trail.length) * 0.5;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.restore();
    }
  }

  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.friction = 0.96;
      this.gravity = 0.085;
      this.alpha = 1;
      this.decay = 0.012 + Math.random() * 0.015;
    }
    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }
    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function explodeFirework(x, y, color) {
    playFireworkBoom();
    for (let i = 0; i < 70; i++) {
      fwParticles.push(new FireworkParticle(x, y, color));
    }
  }

  function launchFirework() {
    const sx = window.innerWidth * (0.2 + Math.random() * 0.6);
    const sy = window.innerHeight;
    const tx = window.innerWidth * (0.15 + Math.random() * 0.7);
    const ty = window.innerHeight * (0.12 + Math.random() * 0.38);
    fireworks.push(new FireworkRocket(sx, sy, tx, ty));
  }

  class ConfettiPiece {
    constructor(x, y, vx, vy) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      this.size = 8 + Math.random() * 8;
      this.rotation = Math.random() * 360;
      this.spin = Math.random() * 8 - 4;
      this.gravity = 0.16;
      this.alpha = 1;
      this.decay = 0.003 + Math.random() * 0.003;
    }
    update() {
      this.vx *= 0.98;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.spin;
      this.alpha -= this.decay;
    }
    draw(ctx) {
      if (this.alpha <= 0 || this.y > window.innerHeight + 40) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
      ctx.restore();
    }
  }

  function triggerConfetti() {
    for (let i = 0; i < 100; i++) {
      // Left Cannon
      const a1 = (-55 + (Math.random() * 40 - 20)) * (Math.PI / 180);
      const s1 = 22 * (0.6 + Math.random() * 0.7);
      confettiParticles.push(new ConfettiPiece(20, window.innerHeight - 20, Math.cos(a1) * s1, Math.sin(a1) * s1));

      // Right Cannon
      const a2 = (-125 + (Math.random() * 40 - 20)) * (Math.PI / 180);
      const s2 = 22 * (0.6 + Math.random() * 0.7);
      confettiParticles.push(new ConfettiPiece(window.innerWidth - 20, window.innerHeight - 20, Math.cos(a2) * s2, Math.sin(a2) * s2));
    }
  }

  function animateLoop() {
    fwCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    cfCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].draw(fwCtx);
      if (fireworks[i].dead) fireworks.splice(i, 1);
    }

    for (let i = fwParticles.length - 1; i >= 0; i--) {
      fwParticles[i].update();
      fwParticles[i].draw(fwCtx);
      if (fwParticles[i].alpha <= 0) fwParticles.splice(i, 1);
    }

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      confettiParticles[i].update();
      confettiParticles[i].draw(cfCtx);
      if (confettiParticles[i].alpha <= 0 || confettiParticles[i].y > window.innerHeight + 50) {
        confettiParticles.splice(i, 1);
      }
    }

    animationFrameId = requestAnimationFrame(animateLoop);
  }
  animationFrameId = requestAnimationFrame(animateLoop);

  /* ==========================================================================
     CEREMONY LAUNCH LOGIC
     ========================================================================== */
  function startCeremony() {
    if (isRevealed || isCountingDown) return;
    isCountingDown = true;

    // Activate countdown overlay
    countdownOverlay.classList.add('active');

    let count = 5;
    countdownNumber.textContent = count;
    playHeartbeat(false);

    // Audio drumroll matching the 5-second countdown
    playDrumroll(5.0, () => {
      // Countdown complete
      countdownOverlay.classList.remove('active');
      isCountingDown = false;
      revealPoster();
    });

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.textContent = count;
        playHeartbeat(count <= 2);
      } else {
        countdownNumber.textContent = '🚀';
        clearInterval(timer);
      }
    }, 1000);
  }

  function revealPoster() {
    if (isRevealed) return;
    isRevealed = true;

    // Flash Effect
    ceremonyFlash.classList.add('flashing');
    setTimeout(() => ceremonyFlash.classList.remove('flashing'), 600);

    // Open Curtains
    curtainsWrapper.classList.add('opened');
    stageWrapper.classList.add('revealed');

    // Launch Video Playback (Seamless Loop)
    if (launchVideo) {
      launchVideo.currentTime = 0;
      const playPromise = launchVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          launchVideo.muted = true;
          launchVideo.play().catch(e => console.log('Video autoplay:', e));
        });
      }
    }

    // Royal Fanfare & Cheers
    playGrandFanfare();

    // Pyrotechnics
    triggerConfetti();
    setTimeout(triggerConfetti, 1200);

    for (let i = 0; i < 6; i++) {
      setTimeout(launchFirework, i * 350);
    }

    fireworksInterval = setInterval(() => {
      if (Math.random() > 0.4) launchFirework();
    }, 900);

    setTimeout(() => {
      if (fireworksInterval) clearInterval(fireworksInterval);
    }, 18000);
  }

  function resetCeremony() {
    if (fireworksInterval) clearInterval(fireworksInterval);
    isRevealed = false;
    isCountingDown = false;
    countdownOverlay.classList.remove('active');
    curtainsWrapper.classList.remove('opened');
    stageWrapper.classList.remove('revealed');
    if (launchVideo) {
      launchVideo.pause();
      launchVideo.currentTime = 0;
    }
    confettiParticles.length = 0;
    fireworks.length = 0;
    fwParticles.length = 0;
  }

  /* ==========================================================================
     USER INTERACTIONS (ENTER / CLICK / SHORTCUTS)
     ========================================================================== */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      if (!isRevealed && !isCountingDown) {
        startCeremony();
      } else if (isRevealed) {
        resetCeremony();
      }
      return;
    }

    if (e.key === 'r' || e.key === 'R') {
      resetCeremony();
      return;
    }

    if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
      return;
    }
  });

  // Clicking anywhere on the screen also triggers the ceremony if not started!
  window.addEventListener('click', () => {
    if (!isRevealed && !isCountingDown) {
      startCeremony();
    }
  });

  console.log('MS Family Stage Ready: Press ENTER to start 5-4-3-2-1 countdown.');
})();

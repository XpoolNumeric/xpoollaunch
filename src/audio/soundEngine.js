/**
 * XPOOL CEREMONY — PRODUCTION GRADE WEB AUDIO SYNTHESIZER
 * Zero external audio files required. Uses Web Audio API for
 * low-frequency atmospheric drone, heartbeat, drumroll, cymbal crash,
 * brass fanfare, crowd applause, firework booms, and party poppers.
 * Includes master volume, sound check, and audio context safety.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.volume = 0.85;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneGain = null;
  }

  getContext() {
    if (!this.ctx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) {
        this.ctx = new AudioClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  unlockAudio() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  getMasterDestination() {
    this.getContext();
    return this.masterGain || (this.ctx ? this.ctx.destination : null);
  }

  // Diagnostic Sound Check for live event audio technicians
  soundCheck() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dest = this.getMasterDestination();

    // Two-tone pleasant confirmation chime
    const tones = [
      { f: 523.25, t: 0.0, d: 0.25 }, // C5
      { f: 659.25, t: 0.15, d: 0.4 },  // E5
      { f: 783.99, t: 0.3, d: 0.6 },   // G5
    ];

    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.f, now + tone.t);
      gain.gain.setValueAtTime(0.001, now + tone.t);
      gain.gain.exponentialRampToValueAtTime(0.3, now + tone.t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + tone.t + tone.d);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + tone.t);
      osc.stop(now + tone.t + tone.d);
    });
  }

  // Scene 1: Low-Frequency Atmospheric Anticipation Drone
  playAtmosphericDrone() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    if (this.droneOsc1) return; // Already playing

    const now = ctx.currentTime;
    const dest = this.getMasterDestination();

    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.001, now);
    this.droneGain.gain.exponentialRampToValueAtTime(0.22, now + 2.5);

    this.droneOsc1 = ctx.createOscillator();
    this.droneOsc2 = ctx.createOscillator();

    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(55, now); // A1 sub-bass

    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(110, now); // A2 harmonic

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);

    this.droneOsc1.connect(filter);
    this.droneOsc2.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(dest);

    this.droneOsc1.start(now);
    this.droneOsc2.start(now);
  }

  stopAtmosphericDrone(fadeTime = 1.0) {
    if (!this.droneGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.001, now + fadeTime);
      setTimeout(() => {
        if (this.droneOsc1) {
          try { this.droneOsc1.stop(); } catch (e) {}
          this.droneOsc1 = null;
        }
        if (this.droneOsc2) {
          try { this.droneOsc2.stop(); } catch (e) {}
          this.droneOsc2 = null;
        }
        this.droneGain = null;
      }, fadeTime * 1000);
    } catch (e) {
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.droneGain = null;
    }
  }

  // Heartbeat pulse for countdown
  playHeartbeat(highPitch = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dest = this.getMasterDestination();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = highPitch ? 220 : 100;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.16);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Drumroll crescendo leading up to curtain reveal
  playDrumroll(duration = 5.0, onComplete) {
    if (this.isMuted) {
      if (onComplete) setTimeout(onComplete, duration * 1000);
      return;
    }
    const ctx = this.getContext();
    if (!ctx) {
      if (onComplete) setTimeout(onComplete, duration * 1000);
      return;
    }

    const now = ctx.currentTime;
    const totalHits = 60;
    const interval = duration / totalHits;
    const dest = this.getMasterDestination();

    for (let i = 0; i < totalHits; i++) {
      const hitTime = now + i * interval;
      const intensity = 0.12 + Math.pow(i / totalHits, 1.6) * 0.88;

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130 + Math.random() * 25, hitTime);
      oscGain.gain.setValueAtTime(intensity * 0.35, hitTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.04);
      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(hitTime);
      osc.stop(hitTime + 0.045);

      const bSize = Math.floor(ctx.sampleRate * 0.035);
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
      nGain.connect(dest);
      noise.start(hitTime);
    }

    setTimeout(() => {
      this.playCymbalCrash();
      if (onComplete) onComplete();
    }, duration * 1000);
  }

  // Cymbal crash at climax
  playCymbalCrash() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 1.8;
    const dest = this.getMasterDestination();

    const bSize = Math.floor(ctx.sampleRate * duration);
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
    gain.connect(dest);
    noise.start(now);
  }

  // Grand Regal Fanfare & Cheers
  playGrandFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { freq: 261.63, time: 0.0, dur: 0.22, vol: 0.4 }, // C4
      { freq: 329.63, time: 0.22, dur: 0.22, vol: 0.42 }, // E4
      { freq: 392.0, time: 0.44, dur: 0.28, vol: 0.46 }, // G4
      { freq: 523.25, time: 0.72, dur: 0.65, vol: 0.55 }, // C5
      { freq: 440.0, time: 1.4, dur: 0.18, vol: 0.4 }, // A4
      { freq: 493.88, time: 1.58, dur: 0.18, vol: 0.44 }, // B4
      { freq: 523.25, time: 1.76, dur: 0.95, vol: 0.6 } // C5
    ];

    notes.forEach((n) => {
      this.playBrassVoice(ctx, n.freq, now + n.time, n.dur, n.vol);
    });

    const chordTime = now + 2.7;
    const chordNotes = [261.63, 329.63, 392.0, 523.25, 659.25];
    chordNotes.forEach((freq) => {
      this.playBrassVoice(ctx, freq, chordTime, 2.5, 0.36);
    });

    this.playApplauseCheers(now + 0.7, 6.0);
  }

  playBrassVoice(ctx, freq, startTime, duration, vol) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const dest = this.getMasterDestination();

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
    oscGain.connect(dest);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  // Crowd applause & cheers
  playApplauseCheers(startTime, duration = 5.0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const dest = this.getMasterDestination();

    const bSize = Math.floor(ctx.sampleRate * duration);
    const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
    const d = b.getChannelData(0);

    for (let j = 0; j < bSize; j++) {
      const envelope = Math.sin((j / bSize) * Math.PI);
      const clapImpulse = Math.random() > 0.955 ? (Math.random() * 2 - 1) * 2.6 : 0;
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
    gain.connect(dest);

    noise.start(startTime);
  }

  // Firework boom
  playFireworkBoom() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dest = this.getMasterDestination();

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.48);

    subGain.gain.setValueAtTime(0.75, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);

    subOsc.connect(subGain);
    subGain.connect(dest);
    subOsc.start(now);
    subOsc.stop(now + 0.48);

    const bSize = Math.floor(ctx.sampleRate * 0.65);
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
    nGain.connect(dest);
    noise.start(now + 0.05);
  }

  // Synthesized Party Popper Pop Sound
  playPartyPopper() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dest = this.getMasterDestination();

    // Pitch pop drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.12);

    // Crackle noise burst
    const bSize = Math.floor(ctx.sampleRate * 0.25);
    const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = b;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(dest);
    noise.start(now);
  }
}

export const soundEngine = new SoundEngine();

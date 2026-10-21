import React, { useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundEngine';

const FW_COLORS = [
  '#f59e0b', '#fbbf24', '#fef08a', '#f43f5e', '#ec4899', 
  '#06b6d4', '#3b82f6', '#10b981', '#ffffff', '#a855f7'
];

const CONFETTI_COLORS = [
  { fill: '#f59e0b', foil: true },
  { fill: '#fbbf24', foil: true },
  { fill: '#fef08a', foil: true },
  { fill: '#ffffff', foil: true },
  { fill: '#ec4899', foil: false },
  { fill: '#0ea5e9', foil: false },
  { fill: '#10b981', foil: false },
  { fill: '#8b5cf6', foil: false },
  { fill: '#d97706', foil: true },
];

/**
 * Pyrotechnics — Ultra-Production Physics Particle Engine
 * Features:
 * - 3D Tumbling Metallic Foil Confetti with realistic light reflection
 * - Multi-stage exploding fireworks with sparkling contrails
 * - External manual trigger support (via triggerBlast count)
 */
export default function Pyrotechnics({ isActive, manualTriggerCount = 0 }) {
  const fwCanvasRef = useRef(null);
  const cfCanvasRef = useRef(null);
  const blastConfettiRef = useRef(null);

  // Manual trigger when user presses 'C' or clicks Confetti button
  useEffect(() => {
    if (manualTriggerCount > 0 && blastConfettiRef.current) {
      soundEngine.playPartyPopper();
      blastConfettiRef.current();
    }
  }, [manualTriggerCount]);

  useEffect(() => {
    if (!isActive) return;

    const fwCanvas = fwCanvasRef.current;
    const cfCanvas = cfCanvasRef.current;
    if (!fwCanvas || !cfCanvas) return;

    const fwCtx = fwCanvas.getContext('2d');
    const cfCtx = cfCanvas.getContext('2d');

    let animId = null;
    let fireworksInterval = null;

    const fireworks = [];
    const fwParticles = [];
    const confettiParticles = [];

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      fwCanvas.width = window.innerWidth * dpr;
      fwCanvas.height = window.innerHeight * dpr;
      cfCanvas.width = window.innerWidth * dpr;
      cfCanvas.height = window.innerHeight * dpr;
      fwCtx.scale(dpr, dpr);
      cfCtx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Rocket launching up to explode
    class FireworkRocket {
      constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
        const angle = Math.atan2(targetY - startY, targetX - startX);
        const speed = 15 + Math.random() * 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.trail = [];
        this.dead = false;
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        const dist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (dist < 20 || this.vy >= 0) {
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
          ctx.globalAlpha = (i / this.trail.length) * 0.55;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }
    }

    // Exploding star particles
    class FireworkParticle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.friction = 0.96;
        this.gravity = 0.088;
        this.alpha = 1;
        this.decay = 0.012 + Math.random() * 0.014;
        this.sparkle = Math.random() > 0.6;
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
        const displayAlpha = this.sparkle ? (Math.random() > 0.3 ? this.alpha : 0.2) : this.alpha;
        ctx.globalAlpha = displayAlpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }
    }

    function explodeFirework(x, y, color) {
      soundEngine.playFireworkBoom();
      const count = 75;
      for (let i = 0; i < count; i++) {
        fwParticles.push(new FireworkParticle(x, y, color));
      }
    }

    function launchRocket() {
      const sx = window.innerWidth * (0.2 + Math.random() * 0.6);
      const sy = window.innerHeight;
      const tx = window.innerWidth * (0.15 + Math.random() * 0.7);
      const ty = window.innerHeight * (0.12 + Math.random() * 0.38);
      fireworks.push(new FireworkRocket(sx, sy, tx, ty));
    }

    // 3D Tumbling Metallic Foil Confetti Piece
    class ConfettiPiece {
      constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        const colorConfig = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        this.color = colorConfig.fill;
        this.isFoil = colorConfig.foil;
        this.width = 9 + Math.random() * 9;
        this.height = 14 + Math.random() * 10;
        this.rotationX = Math.random() * 360;
        this.rotationY = Math.random() * 360;
        this.rotationZ = Math.random() * 360;
        this.spinX = Math.random() * 8 - 4;
        this.spinY = Math.random() * 10 - 5;
        this.spinZ = Math.random() * 4 - 2;
        this.gravity = 0.15;
        this.alpha = 1;
        this.decay = 0.0028 + Math.random() * 0.003;
      }
      update() {
        this.vx *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotationX += this.spinX;
        this.rotationY += this.spinY;
        this.rotationZ += this.spinZ;
        this.alpha -= this.decay;
      }
      draw(ctx) {
        if (this.alpha <= 0 || this.y > window.innerHeight + 50) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotationZ * Math.PI) / 180);

        // 3D projection flip calculation
        const scaleX = Math.cos((this.rotationX * Math.PI) / 180);
        const scaleY = Math.cos((this.rotationY * Math.PI) / 180);
        ctx.scale(scaleX, scaleY);

        ctx.globalAlpha = Math.max(0, this.alpha);

        // Shiny metallic sheen reflection when facing light
        if (this.isFoil && Math.abs(scaleX) > 0.8) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = this.color;
        }

        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
      }
    }

    function blastConfetti() {
      // Left Cannon
      for (let i = 0; i < 90; i++) {
        const a1 = (-55 + (Math.random() * 40 - 20)) * (Math.PI / 180);
        const s1 = 22 * (0.6 + Math.random() * 0.7);
        confettiParticles.push(
          new ConfettiPiece(20, window.innerHeight - 20, Math.cos(a1) * s1, Math.sin(a1) * s1)
        );
      }

      // Right Cannon
      for (let i = 0; i < 90; i++) {
        const a2 = (-125 + (Math.random() * 40 - 20)) * (Math.PI / 180);
        const s2 = 22 * (0.6 + Math.random() * 0.7);
        confettiParticles.push(
          new ConfettiPiece(window.innerWidth - 20, window.innerHeight - 20, Math.cos(a2) * s2, Math.sin(a2) * s2)
        );
      }

      // Center High Sky Burst
      for (let i = 0; i < 40; i++) {
        const a3 = (-90 + (Math.random() * 50 - 25)) * (Math.PI / 180);
        const s3 = 24 * (0.5 + Math.random() * 0.6);
        confettiParticles.push(
          new ConfettiPiece(window.innerWidth / 2, window.innerHeight - 10, Math.cos(a3) * s3, Math.sin(a3) * s3)
        );
      }
    }

    blastConfettiRef.current = blastConfetti;

    // Initial Pyrotechnics salvo
    blastConfetti();
    setTimeout(blastConfetti, 1400);

    for (let i = 0; i < 6; i++) {
      setTimeout(launchRocket, i * 360);
    }

    fireworksInterval = setInterval(() => {
      if (Math.random() > 0.38) launchRocket();
    }, 950);

    const animate = () => {
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
        if (confettiParticles[i].alpha <= 0 || confettiParticles[i].y > window.innerHeight + 60) {
          confettiParticles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (fireworksInterval) clearInterval(fireworksInterval);
      window.removeEventListener('resize', handleResize);
      blastConfettiRef.current = null;
    };
  }, [isActive]);

  return (
    <>
      <canvas ref={fwCanvasRef} className="pyro-canvas fw-canvas" />
      <canvas ref={cfCanvasRef} className="pyro-canvas cf-canvas" />
    </>
  );
}

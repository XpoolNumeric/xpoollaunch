import React from 'react';

/**
 * Cinematic Countdown Overlay — Ultra Production Edition
 * Features:
 * - Perfectly centered geometric dial assembly (Zero element overlapping)
 * - Dynamic stage telemetry messages for each count step (5, 4, 3, 2, 1)
 * - Clean 5-Step glowing progress telemetry indicator placed below the dial
 * - Expanding energy rings & shockwave blast pulse
 * - SVG progress arc ring with glowing gradient fill and smooth tick animation
 */
const COUNT_STAGES = {
  5: { tag: 'SYSTEM CHECK', sub: 'STAGE TELEMETRY NOMINAL' },
  4: { tag: 'THEATER STAGING', sub: 'ATMOSPHERIC LIGHTING SET' },
  3: { tag: 'PYROTECHNICS ARMED', sub: 'CONFETTI CANNONS READY' },
  2: { tag: 'CURTAIN CALL', sub: 'ROYAL DRAPES ENGAGED' },
  1: { tag: 'STANDBY FOR REVEAL', sub: 'ALL GUESTS ASSEMBLED' },
  0: { tag: 'WORLD PREMIERE', sub: 'LAUNCHING NOW!' },
};

export default function Countdown({ isActive, count }) {
  if (!isActive) return null;

  // SVG circle progress geometry (viewBox 360 x 360)
  const radius = 145;
  const circumference = 2 * Math.PI * radius;
  // 5 steps: each second drains 20%
  const progress = count > 0 ? count / 5 : 0;
  const dashOffset = circumference * (1 - progress);

  const currentStage = COUNT_STAGES[count] || COUNT_STAGES[0];

  return (
    <div className="countdown-overlay" aria-live="assertive">
      {/* Background Energy Grid */}
      <div className="countdown-bg-grid" aria-hidden="true" />

      {/* Main Unified Center Dial Container */}
      <div className="countdown-dial-container">
        {/* Shockwave Blast Wave triggered on each second */}
        <div key={`shockwave-${count}`} className="countdown-shockwave" />

        {/* Expanding Concentric Energy Rings */}
        <div className="countdown-rings" aria-hidden="true">
          <div className="ring-pulse ring-1" />
          <div className="ring-pulse ring-2" />
          <div className="ring-pulse ring-3" />
        </div>

        {/* SVG Progress Arc Ring */}
        <div className="countdown-progress-ring">
          <svg viewBox="0 0 360 360">
            <defs>
              <linearGradient id="goldGradientSVG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#facc15" />
                <stop offset="80%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <filter id="goldGlowSVG" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Inactive background track */}
            <circle
              className="countdown-progress-track"
              cx="180"
              cy="180"
              r={radius}
            />

            {/* Active animated progress arc */}
            <circle
              className="countdown-progress-fill"
              cx="180"
              cy="180"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              filter="url(#goldGlowSVG)"
            />
          </svg>
        </div>

        {/* Giant Numeral: Dead-center within the dial */}
        <div key={count} className="countdown-number">
          {count > 0 ? count : '🚀'}
        </div>
      </div>

      {/* 5-Step Telemetry Step Tracker — Positioned cleanly below the dial with zero overlap */}
      <div className="countdown-steps-tracker" aria-hidden="true">
        {[5, 4, 3, 2, 1].map((stepNum) => (
          <div
            key={stepNum}
            className={`step-tick ${count <= stepNum ? 'active' : ''} ${count === stepNum ? 'current' : ''}`}
          >
            <span className="step-tick-bar" />
            <span className="step-tick-num">{stepNum}</span>
          </div>
        ))}
      </div>

      {/* Dynamic Stage Info Tagline */}
      <div className="countdown-stage-info">
        <div className="countdown-stage-tag">{currentStage.tag}</div>
        <div className="countdown-stage-sub">{currentStage.sub}</div>
      </div>
    </div>
  );
}

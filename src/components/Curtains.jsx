import React, { useMemo } from 'react';

/**
 * Royal Velvet Theater Curtains — Ultra Production Edition
 * Features:
 * - Dual dynamic volumetric spotlight beams sweeping down the velvet
 * - Scalloped top valance swag with golden bullion fringe
 * - Realistic 3D perspective fold parting
 * - Golden stage cord tieback tassels on wings
 * - Ambient golden particles floating in stage atmosphere
 * - Stage floor warm reflection
 */
export default function Curtains({ isOpen }) {
  // Generate floating ambient particles for stage ambiance
  const particles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: `${4 + Math.random() * 92}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 8}s`,
      size: 2 + Math.random() * 3.5,
      opacity: 0.25 + Math.random() * 0.5,
    }));
  }, []);

  return (
    <>
      {/* Dynamic Volumetric Stage Spotlight Beams (Visible on closed stage) */}
      {!isOpen && (
        <div className="stage-spotlights" aria-hidden="true">
          <div className="spotlight-beam beam-left" />
          <div className="spotlight-beam beam-right" />
          <div className="stage-ambient-haze" />
        </div>
      )}

      {/* Floating golden ambient embers & dust particles */}
      {!isOpen && (
        <div className="ambient-particles" aria-hidden="true">
          {particles.map((p) => (
            <div
              key={p.id}
              className="ambient-particle"
              style={{
                '--x': p.x,
                '--delay': p.delay,
                '--duration': p.duration,
                '--max-opacity': p.opacity,
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Golden spotlight glow on stage floor and curtain bottom */}
      {!isOpen && <div className="curtain-spotlight" aria-hidden="true" />}

      {/* Curtains Assembly Wrapper */}
      <div
        className={`curtains-wrapper ${isOpen ? 'opened' : ''}`}
        aria-hidden={isOpen}
      >
        {/* Left Velvet Curtain Wing */}
        <div className="curtain-panel curtain-left">
          <div className="velvet-folds" />
          <div className="curtain-sheen" />
          <div className="curtain-gold-border">
            <div className="bullion-fringe" />
          </div>
          <div className="curtain-center-line" />
        </div>

        {/* Right Velvet Curtain Wing */}
        <div className="curtain-panel curtain-right">
          <div className="velvet-folds" />
          <div className="curtain-sheen" />
          <div className="curtain-gold-border">
            <div className="bullion-fringe" />
          </div>
          <div className="curtain-center-line" />
        </div>

        {/* Grand Scalloped Top Valance Swag Drape */}
        <div className="curtain-valance-assembly">
          <div className="valance-swag swag-left" />
          <div className="valance-swag swag-center" />
          <div className="valance-swag swag-right" />
          <div className="valance-gold-braid" />
        </div>

        {/* Gold Stage Cord Tieback Tassels (revealed when curtains gather at wings) */}
        <div className="curtain-tieback tieback-left">
          <div className="tieback-cord" />
          <div className="tieback-tassel" />
        </div>
        <div className="curtain-tieback tieback-right">
          <div className="tieback-cord" />
          <div className="tieback-tassel" />
        </div>
      </div>
    </>
  );
}

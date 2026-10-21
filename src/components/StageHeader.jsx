import React from 'react';

/**
 * StageHeader — Executive Broadcast Status Header
 * Shows live ceremony status, event branding, and key shortcuts.
 */
export default function StageHeader({ stageState, isVisible }) {
  const getStatusInfo = () => {
    switch (stageState) {
      case 'counting':
        return {
          dotClass: 'status-dot-counting',
          text: 'LAUNCH SEQUENCE ACTIVE',
        };
      case 'revealed':
        return {
          dotClass: 'status-dot-live',
          text: 'LIVE ON STAGE',
        };
      case 'ready':
      default:
        return {
          dotClass: 'status-dot-standby',
          text: 'STANDBY • CEREMONY READY',
        };
    }
  };

  const status = getStatusInfo();

  return (
    <header className={`stage-header ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="stage-header-inner">
        {/* Left: Broadcast Status Indicator */}
        <div className="header-status-pill">
          <span className={`status-dot ${status.dotClass}`} />
          <span className="status-label">{status.text}</span>
        </div>

        {/* Center: Stage Monogram Badge */}
        <div className="header-event-badge">
          <span className="header-brand-x">X</span>
          <span className="header-brand-pool">pool</span>
          <span className="header-event-divider">•</span>
          <span className="header-event-title">WORLD PREMIERE</span>
        </div>

        {/* Right: Keyboard Shortcut Hints */}
        <div className="header-shortcuts">
          <span className="shortcut-chip">
            <kbd>Space</kbd> {stageState === 'revealed' ? 'Reset' : 'Reveal'}
          </span>
          <span className="shortcut-chip">
            <kbd>C</kbd> Confetti
          </span>
          <span className="shortcut-chip">
            <kbd>F</kbd> Fullscreen
          </span>
          <span className="shortcut-chip">
            <kbd>P</kbd> Present
          </span>
        </div>
      </div>
    </header>
  );
}

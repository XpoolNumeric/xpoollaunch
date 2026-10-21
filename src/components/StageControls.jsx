import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Maximize, Minimize, Volume2, VolumeX, Sparkles, PartyPopper, Sliders, Eye, EyeOff } from 'lucide-react';

/**
 * StageControls — VisionOS Floating Liquid Glass Dock
 * Features:
 * - Dynamic primary ceremony action (Reveal / Reset / Counting)
 * - Confetti cannon trigger button
 * - Live animated audio equalizer indicator
 * - Fullscreen toggle
 * - Presentation mode toggle (P)
 * - Operator Console toggle (O)
 * - Hotkey indicator tooltips
 * - Smooth auto-hide on inactivity
 */
export default function StageControls({
  stageState,
  onStart,
  onReset,
  onBlastConfetti,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onToggleOperator,
  isPresentationMode,
  onTogglePresentationMode,
}) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide controls when idle during presentation
  useEffect(() => {
    let timer = null;

    const showAndScheduleHide = () => {
      setIsVisible(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (stageState === 'revealed') {
          setIsVisible(false);
        }
      }, 3500);
    };

    window.addEventListener('mousemove', showAndScheduleHide);
    window.addEventListener('touchstart', showAndScheduleHide);

    return () => {
      window.removeEventListener('mousemove', showAndScheduleHide);
      window.removeEventListener('touchstart', showAndScheduleHide);
      if (timer) clearTimeout(timer);
    };
  }, [stageState]);

  const handlePrimaryClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (stageState === 'revealed') {
        onReset();
      } else if (stageState === 'ready') {
        onStart();
      }
    },
    [stageState, onStart, onReset]
  );

  return (
    <nav
      className={`stage-controls-container ${isVisible ? 'visible' : 'hidden'}`}
      aria-label="Ceremony stage controls"
    >
      <div className="stage-controls-bar">
        {/* Primary Action Button */}
        {stageState !== 'counting' ? (
          <button
            id="btn-launch-ceremony"
            className="control-btn primary-launch-btn"
            onClick={handlePrimaryClick}
            title={stageState === 'revealed' ? 'Reset Curtains (R or Space)' : 'Start Grand Reveal (Space)'}
          >
            {stageState === 'revealed' ? (
              <>
                <RotateCcw size={16} strokeWidth={2.5} />
                <span>Reset</span>
                <span className="btn-hotkey-badge">R</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="sparkle-icon" strokeWidth={2.5} />
                <span>Launch</span>
                <span className="btn-hotkey-badge">Space</span>
              </>
            )}
          </button>
        ) : (
          <div className="control-btn counting-badge">
            <span className="countdown-mini-spinner" />
            <span>Launching...</span>
          </div>
        )}

        {/* Confetti Blast Trigger Button (Active during reveal or anytime) */}
        {stageState === 'revealed' && onBlastConfetti && (
          <button
            className="control-btn icon-btn celebration-btn"
            onClick={(e) => {
              e.stopPropagation();
              onBlastConfetti();
            }}
            title="Pop Confetti (C)"
          >
            <PartyPopper size={18} />
            <span className="btn-hotkey-badge">C</span>
          </button>
        )}

        {/* Audio Mute / Unmute Toggle */}
        <button
          className={`control-btn icon-btn ${!isMuted ? 'audio-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
        >
          {isMuted ? (
            <VolumeX size={17} />
          ) : (
            <div className="sound-active-wrap">
              <Volume2 size={17} />
              <span className="eq-bars">
                <span className="eq-bar bar-1" />
                <span className="eq-bar bar-2" />
                <span className="eq-bar bar-3" />
              </span>
            </div>
          )}
        </button>

        {/* Fullscreen Toggle */}
        <button
          className="control-btn icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFullscreen();
          }}
          title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
        >
          {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
        </button>

        {/* Presentation Mode Toggle (P) */}
        {onTogglePresentationMode && (
          <button
            className={`control-btn icon-btn ${isPresentationMode ? 'presentation-btn-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePresentationMode();
            }}
            title={isPresentationMode ? 'Exit Presentation Mode (P)' : 'Presentation Mode (P)'}
          >
            {isPresentationMode ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}

        {/* Operator Console Toggle */}
        {onToggleOperator && (
          <button
            className="control-btn icon-btn operator-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleOperator();
            }}
            title="Open Event Director Console (O)"
          >
            <Sliders size={17} />
          </button>
        )}
      </div>
    </nav>
  );
}

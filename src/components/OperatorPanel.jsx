import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Radio,
  RotateCcw,
  Maximize,
  Minimize,
  ShieldAlert,
  Sparkles,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

/**
 * OperatorPanel — Live Event Master Control Interface
 * Designed specifically for stage managers, audio engineers, and event directors.
 * Provides instant scene jumping, presentation mode toggle, audio telemetry,
 * sound check, emergency holding screen, and restart protection.
 */
export default function OperatorPanel({
  isOpen,
  onClose,
  stageState,
  onJumpToScene,
  isPaused,
  onTogglePause,
  onStart,
  onReset,
  onBlastConfetti,
  volume,
  onChangeVolume,
  isMuted,
  onToggleMute,
  onSoundCheck,
  isFullscreen,
  onToggleFullscreen,
  isPresentationMode,
  onTogglePresentationMode,
  isEmergencyHold,
  onToggleEmergencyHold,
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [soundCheckStatus, setSoundCheckStatus] = useState('');

  if (!isOpen) return null;

  const SCENES = [
    { id: 'standby', num: 1, label: 'Standby / Stage Ambiance' },
    { id: 'anticipation', num: 2, label: 'Atmospheric Buildup' },
    { id: 'counting', num: 3, label: '5-Second Countdown' },
    { id: 'revealed', num: 4, label: 'Curtain Part & Grand Climax' },
    { id: 'hold', num: 5, label: 'Hero Hold & Extended Display' },
  ];

  const handleSoundCheckClick = () => {
    onSoundCheck();
    setSoundCheckStatus('Signal Verified ✓');
    setTimeout(() => setSoundCheckStatus(''), 2500);
  };

  return (
    <div className="operator-modal-backdrop" onClick={onClose}>
      <aside
        className="operator-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Live Event Director Console"
      >
        {/* Header Bar */}
        <div className="operator-header">
          <div className="operator-title-wrap">
            <Sliders size={18} className="operator-title-icon" />
            <div>
              <h2 className="operator-title">EVENT DIRECTOR CONSOLE</h2>
              <p className="operator-subtitle">XPOOL LIVE CEREMONY TELEMETRY</p>
            </div>
          </div>

          <div className="operator-header-actions">
            <span className="operator-badge-status">
              STATE: <strong>{stageState.toUpperCase()}</strong>
            </span>
            <button
              className="operator-close-btn"
              onClick={onClose}
              title="Close Console (O or Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scene Navigation Timeline */}
        <section className="operator-section">
          <div className="operator-section-label">SCENE TIMELINE NAVIGATION</div>
          <div className="operator-scenes-grid">
            {SCENES.map((scene) => {
              const isActive = stageState === scene.id;
              return (
                <button
                  key={scene.id}
                  className={`operator-scene-card ${isActive ? 'active' : ''}`}
                  onClick={() => onJumpToScene(scene.id)}
                >
                  <span className="scene-card-num">0{scene.num}</span>
                  <div className="scene-card-info">
                    <span className="scene-card-name">{scene.label}</span>
                    <span className="scene-card-state">
                      {isActive ? '● CURRENT SCENE' : 'JUMP'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Master Playback & Emergency Controls */}
        <section className="operator-section">
          <div className="operator-section-label">CEREMONY SEQUENCE CONTROLS</div>
          <div className="operator-btn-row">
            {/* Start / Pause / Resume */}
            <button
              className="op-btn op-btn-primary"
              onClick={() => {
                if (stageState === 'standby' || stageState === 'ready') {
                  onStart();
                } else {
                  onTogglePause();
                }
              }}
            >
              {stageState === 'standby' || stageState === 'ready' ? (
                <>
                  <Play size={16} fill="currentColor" />
                  <span>START CEREMONY</span>
                </>
              ) : isPaused ? (
                <>
                  <Play size={16} fill="currentColor" />
                  <span>RESUME PLAYBACK</span>
                </>
              ) : (
                <>
                  <Pause size={16} />
                  <span>PAUSE SEQUENCE</span>
                </>
              )}
            </button>

            {/* Emergency Holding Screen */}
            <button
              className={`op-btn ${isEmergencyHold ? 'op-btn-danger-active' : 'op-btn-danger'}`}
              onClick={onToggleEmergencyHold}
              title="Black/Holding screen for stage emergencies (H)"
            >
              <ShieldAlert size={16} />
              <span>{isEmergencyHold ? 'EXIT HOLD SCREEN' : 'EMERGENCY HOLD (H)'}</span>
            </button>

            {/* Presentation Clean Screen Mode */}
            <button
              className={`op-btn ${isPresentationMode ? 'op-btn-active' : ''}`}
              onClick={onTogglePresentationMode}
              title="Hide all UI chrome for pristine audience viewing (P)"
            >
              {isPresentationMode ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{isPresentationMode ? 'EXIT PRESENTATION (P)' : 'PRESENTATION MODE (P)'}</span>
            </button>

            {/* Confetti Trigger */}
            <button
              className="op-btn op-btn-accent"
              onClick={onBlastConfetti}
              title="Manual Confetti Blast (C)"
            >
              <Sparkles size={16} />
              <span>POP CONFETTI (C)</span>
            </button>
          </div>
        </section>

        {/* Audio Telemetry & Sound Check */}
        <section className="operator-section">
          <div className="operator-section-label">AUDITORIUM AUDIO TELEMETRY</div>
          <div className="operator-audio-controls">
            <button
              className={`op-btn ${isMuted ? 'op-btn-danger' : ''}`}
              onClick={onToggleMute}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isMuted ? 'MUTED' : 'UNMUTED'}</span>
            </button>

            {/* Volume Slider */}
            <div className="operator-volume-slider-wrap">
              <span className="slider-label">MASTER GAIN: {Math.round(volume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                className="operator-volume-slider"
              />
            </div>

            {/* Sound Check Button */}
            <button
              className="op-btn op-btn-subtle"
              onClick={handleSoundCheckClick}
              title="Play test chime to verify auditorium acoustics"
            >
              <Radio size={16} />
              <span>SOUND CHECK</span>
            </button>
            {soundCheckStatus && (
              <span className="sound-check-feedback">
                <CheckCircle2 size={14} color="#10b981" />
                {soundCheckStatus}
              </span>
            )}
          </div>
        </section>

        {/* Safety Reset Ceremony Guard */}
        <section className="operator-section">
          <div className="operator-section-label">SAFETY & RESET</div>
          <div className="operator-reset-wrap">
            {!showResetConfirm ? (
              <button
                className="op-btn op-btn-warning"
                onClick={() => setShowResetConfirm(true)}
              >
                <RotateCcw size={16} />
                <span>RESET CEREMONY TO STANDBY</span>
              </button>
            ) : (
              <div className="reset-confirm-box">
                <span className="reset-confirm-msg">CONFIRM RESTART?</span>
                <button
                  className="op-btn op-btn-danger"
                  onClick={() => {
                    onReset();
                    setShowResetConfirm(false);
                    onClose();
                  }}
                >
                  YES, RESET
                </button>
                <button
                  className="op-btn op-btn-subtle"
                  onClick={() => setShowResetConfirm(false)}
                >
                  CANCEL
                </button>
              </div>
            )}

            <button
              className="op-btn op-btn-subtle"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              <span>{isFullscreen ? 'EXIT FULLSCREEN (F)' : 'FULLSCREEN (F)'}</span>
            </button>
          </div>
        </section>

        {/* Keyboard Shortcut Cheat-Sheet */}
        <footer className="operator-footer">
          <div className="operator-shortcuts-table">
            <span className="shortcut-tag"><kbd>Space</kbd> Start / Pause</span>
            <span className="shortcut-tag"><kbd>→</kbd> Next Scene</span>
            <span className="shortcut-tag"><kbd>←</kbd> Prev Scene</span>
            <span className="shortcut-tag"><kbd>C</kbd> Confetti</span>
            <span className="shortcut-tag"><kbd>M</kbd> Mute</span>
            <span className="shortcut-tag"><kbd>F</kbd> Fullscreen</span>
            <span className="shortcut-tag"><kbd>P</kbd> Presentation Mode</span>
            <span className="shortcut-tag"><kbd>H</kbd> Emergency Hold</span>
            <span className="shortcut-tag"><kbd>O</kbd> Toggle Console</span>
          </div>
        </footer>
      </aside>
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Eye } from 'lucide-react';
import StageHeader from './components/StageHeader';
import Curtains from './components/Curtains';
import Countdown from './components/Countdown';
import LaunchVideo from './components/LaunchVideo';
import Pyrotechnics from './components/Pyrotechnics';
import StageControls from './components/StageControls';
import OperatorPanel from './components/OperatorPanel';
import { soundEngine } from './audio/soundEngine';

/**
 * XPOOL CEREMONY — MASTER ORCHESTRATION STATE MACHINE
 * Scenes:
 * - 'standby': Theatrical Stage with closed royal velvet curtains & atmospheric lighting
 * - 'anticipation': 2.5s Cinematic audio-visual buildup with sub-bass drone
 * - 'counting': Drift-free high-precision 5-4-3-2-1 countdown with telemetry
 * - 'revealed': Royal curtains part, video loops seamlessly, fanfare & pyrotechnics fire
 * - 'hold': Stable hero hold composition for extended auditorium viewing
 */
export default function App() {
  const [stageState, setStageState] = useState('standby'); // 'standby' | 'anticipation' | 'counting' | 'revealed' | 'hold'
  const [count, setCount] = useState(5);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOperatorOpen, setIsOperatorOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationToast, setPresentationToast] = useState('');
  const [isEmergencyHold, setIsEmergencyHold] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [manualConfettiCount, setManualConfettiCount] = useState(0);
  const [isUiVisible, setIsUiVisible] = useState(true);

  // 3D perspective tilt for Xpool pill
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const countdownAnimFrameRef = useRef(null);
  const anticipationTimerRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Unlock audio on first user touch/click anywhere
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundEngine.unlockAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Auto-hide UI during revealed state when in normal or presentation mode
  useEffect(() => {
    let timer = null;

    const onUserActivity = () => {
      setIsUiVisible(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (stageState === 'revealed' || stageState === 'hold' || isPresentationMode) {
          setIsUiVisible(false);
        }
      }, 3500);
    };

    window.addEventListener('mousemove', onUserActivity);
    window.addEventListener('touchstart', onUserActivity);

    return () => {
      window.removeEventListener('mousemove', onUserActivity);
      window.removeEventListener('touchstart', onUserActivity);
      if (timer) clearTimeout(timer);
    };
  }, [stageState, isPresentationMode]);

  // Subtle 3D mouse parallax on stage hero pill
  const handleStageMouseMove = useCallback((e) => {
    if (stageState !== 'standby') return;
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const rotateY = ((clientX - centerX) / centerX) * 8; // max 8 deg
    const rotateX = -((clientY - centerY) / centerY) * 8;
    setTilt({ x: rotateX, y: rotateY });
  }, [stageState]);

  // Sync audio engine mute state
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  // Master volume control
  const handleChangeVolume = useCallback((val) => {
    setVolume(val);
    soundEngine.setVolume(val);
  }, []);

  // Diagnostic Sound Check
  const handleSoundCheck = useCallback(() => {
    soundEngine.soundCheck();
  }, []);

  // Fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Reveal stage and launch video
  const revealStage = useCallback(() => {
    setStageState('revealed');
    soundEngine.playGrandFanfare();
  }, []);

  // High-precision, drift-free countdown calculation using performance.now()
  const startCountdown = useCallback(() => {
    setStageState('counting');
    setCount(5);
    soundEngine.playHeartbeat(false);

    // Audio drumroll synchronized with 5-second duration
    soundEngine.playDrumroll(5.0, () => {
      revealStage();
    });

    const startTime = performance.now();
    const durationMs = 5000;
    let lastSecondReported = 5;

    const updateCountdown = () => {
      const elapsed = performance.now() - startTime;
      const remainingMs = Math.max(0, durationMs - elapsed);
      const currentSec = Math.ceil(remainingMs / 1000);

      if (currentSec !== lastSecondReported) {
        lastSecondReported = currentSec;
        if (currentSec > 0) {
          setCount(currentSec);
          soundEngine.playHeartbeat(currentSec <= 2);
        } else {
          setCount(0);
        }
      }

      if (elapsed < durationMs) {
        countdownAnimFrameRef.current = requestAnimationFrame(updateCountdown);
      } else {
        setCount(0);
      }
    };

    countdownAnimFrameRef.current = requestAnimationFrame(updateCountdown);
  }, [revealStage]);

  // Start Ceremony sequence (Scene 1 Anticipation -> Scene 2 Countdown)
  const startCeremony = useCallback(() => {
    if (stageState === 'counting' || stageState === 'revealed' || stageState === 'anticipation') return;

    // Begin Anticipation phase: atmospheric low drone
    setStageState('anticipation');
    soundEngine.playAtmosphericDrone();

    anticipationTimerRef.current = setTimeout(() => {
      soundEngine.stopAtmosphericDrone(0.5);
      startCountdown();
    }, 1800);
  }, [stageState, startCountdown]);

  // Reset stage to standby
  const resetStage = useCallback(() => {
    if (countdownAnimFrameRef.current) cancelAnimationFrame(countdownAnimFrameRef.current);
    if (anticipationTimerRef.current) clearTimeout(anticipationTimerRef.current);
    soundEngine.stopAtmosphericDrone(0.1);
    setStageState('standby');
    setCount(5);
    setIsPaused(false);
  }, []);

  // Jump to specific scene (for live event operators)
  const handleJumpToScene = useCallback(
    (sceneId) => {
      if (countdownAnimFrameRef.current) cancelAnimationFrame(countdownAnimFrameRef.current);
      if (anticipationTimerRef.current) clearTimeout(anticipationTimerRef.current);
      soundEngine.stopAtmosphericDrone(0.1);

      if (sceneId === 'standby') {
        resetStage();
      } else if (sceneId === 'anticipation') {
        setStageState('anticipation');
        soundEngine.playAtmosphericDrone();
      } else if (sceneId === 'counting') {
        startCountdown();
      } else if (sceneId === 'revealed' || sceneId === 'hold') {
        revealStage();
        if (sceneId === 'hold') setStageState('hold');
      }
    },
    [resetStage, startCountdown, revealStage]
  );

  // Blast extra confetti
  const handleBlastConfetti = useCallback(() => {
    setManualConfettiCount((prev) => prev + 1);
  }, []);

  // Toggle Pause
  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Toggle Presentation Mode (pristine view for LED audience display — key: P)
  const handleTogglePresentationMode = useCallback(() => {
    setIsPresentationMode((prev) => {
      const next = !prev;
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setPresentationToast(
        next
          ? 'PRESENTATION MODE ACTIVATED (Press P to exit)'
          : 'PRESENTATION MODE DEACTIVATED'
      );
      toastTimeoutRef.current = setTimeout(() => {
        setPresentationToast('');
      }, 2400);
      return next;
    });
  }, []);

  // Toggle Emergency Holding Screen
  const handleToggleEmergencyHold = useCallback(() => {
    setIsEmergencyHold((prev) => !prev);
  }, []);

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // Space: Start ceremony or Toggle Pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (stageState === 'standby') {
          startCeremony();
        } else if (stageState === 'revealed' || stageState === 'hold') {
          handleTogglePause();
        }
        return;
      }

      // Enter: Start ceremony
      if (e.key === 'Enter') {
        e.preventDefault();
        if (stageState === 'standby') startCeremony();
        return;
      }

      // Right Arrow: Advance Scene
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (stageState === 'standby') startCeremony();
        else if (stageState === 'anticipation') startCountdown();
        else if (stageState === 'counting') revealStage();
        return;
      }

      // Left Arrow: Previous Scene
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (stageState === 'revealed' || stageState === 'counting' || stageState === 'anticipation') {
          resetStage();
        }
        return;
      }

      // C: Confetti Blast
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleBlastConfetti();
        return;
      }

      // O: Operator Panel Toggle
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setIsOperatorOpen((prev) => !prev);
        return;
      }

      // H: Emergency Hold Screen Toggle
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleToggleEmergencyHold();
        return;
      }

      // P: Presentation Mode Toggle
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleTogglePresentationMode();
        return;
      }

      // R: Reset stage
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetStage();
        return;
      }

      // F: Fullscreen
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }

      // M: Mute
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      // Escape: Close Operator Panel if open
      if (e.key === 'Escape') {
        if (isOperatorOpen) {
          setIsOperatorOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    stageState,
    startCeremony,
    startCountdown,
    revealStage,
    resetStage,
    handleToggleFullscreen,
    handleToggleMute,
    handleBlastConfetti,
    handleTogglePause,
    handleToggleEmergencyHold,
    handleTogglePresentationMode,
    isOperatorOpen,
  ]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const isCurtainOpen = stageState === 'revealed' || stageState === 'hold';

  return (
    <div
      className={`stage-wrapper ${isPresentationMode ? 'presentation-mode' : ''}`}
      onMouseMove={handleStageMouseMove}
      onClick={() => {
        if (stageState === 'standby') {
          startCeremony();
        }
      }}
    >
      {/* Emergency Holding Screen (Active when Stage Manager presses H) */}
      {isEmergencyHold && (
        <div className="emergency-hold-overlay">
          <div className="emergency-hold-content">
            <div className="hero-logo-pill">
              <span className="hero-logo-x">X</span>
              <span className="hero-logo-pool">pool</span>
            </div>
            <div className="emergency-hold-sub">WORLD PREMIERE • CEREMONY ON HOLD</div>
          </div>
        </div>
      )}

      {/* Broadcast Status Header (Hidden in presentation mode or auto-hidden) */}
      {!isPresentationMode && (
        <StageHeader
          stageState={stageState}
          isVisible={isUiVisible}
        />
      )}

      {/* Hero Fullscreen Looping Video Layer */}
      <LaunchVideo
        isRevealed={isCurtainOpen}
        isMuted={isMuted}
      />

      {/* Pyrotechnics FX (Fireworks & Confetti) */}
      <Pyrotechnics
        isActive={isCurtainOpen}
        manualTriggerCount={manualConfettiCount}
      />

      {/* Royal Velvet Curtains + Volumetric Lights & Particles */}
      <Curtains isOpen={isCurtainOpen} />

      {/* Grand Hero Prompt — Visible only when curtains are closed in standby/anticipation */}
      {(stageState === 'standby' || stageState === 'anticipation') && (
        <div className={`stage-hero-prompt ${stageState === 'anticipation' ? 'anticipation-pulse' : ''}`}>
          <div
            className="hero-logo-pill"
            style={{
              transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
          >
            <span className="hero-logo-x">X</span>
            <span className="hero-logo-pool">pool</span>
          </div>

          <div className="hero-subtitle">Grand Opening Ceremony</div>

          {/* Interactive Play Ring Button */}
          <button
            className="hero-ring"
            aria-label="Start Grand Opening Ceremony"
            onClick={(e) => {
              e.stopPropagation();
              startCeremony();
            }}
          >
            <span className="hero-ring-ripple" />
            <div className="hero-ring-inner">
              <Play size={24} color="#0a0a0c" fill="#0a0a0c" />
            </div>
          </button>
        </div>
      )}

      {/* Dramatic 5-4-3-2-1 Countdown Overlay with unified geometric dial */}
      <Countdown
        isActive={stageState === 'counting'}
        count={count}
      />

      {/* Presentation Mode Toast Notification */}
      {presentationToast && (
        <div className="presentation-toast" role="status">
          <Eye size={16} />
          <span>{presentationToast}</span>
        </div>
      )}

      {/* Stage Control Dock (Hidden in presentation mode) */}
      {!isPresentationMode && (
        <StageControls
          stageState={stageState}
          onStart={startCeremony}
          onReset={resetStage}
          onBlastConfetti={handleBlastConfetti}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleOperator={() => setIsOperatorOpen(true)}
          isPresentationMode={isPresentationMode}
          onTogglePresentationMode={handleTogglePresentationMode}
        />
      )}

      {/* Live Event Operator Director Console */}
      <OperatorPanel
        isOpen={isOperatorOpen}
        onClose={() => setIsOperatorOpen(false)}
        stageState={stageState}
        onJumpToScene={handleJumpToScene}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onStart={startCeremony}
        onReset={resetStage}
        onBlastConfetti={handleBlastConfetti}
        volume={volume}
        onChangeVolume={handleChangeVolume}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onSoundCheck={handleSoundCheck}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={handleTogglePresentationMode}
        isEmergencyHold={isEmergencyHold}
        onToggleEmergencyHold={handleToggleEmergencyHold}
      />
    </div>
  );
}

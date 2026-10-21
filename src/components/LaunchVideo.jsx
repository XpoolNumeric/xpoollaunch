import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

/**
 * Hero Launch Video Component — Production Edition
 * Features:
 * - Dynamic theater ambient backlight glow (Ambilight effect)
 * - Seamless looping of VN20261021_214849.mp4
 * - Automatic celebratory lower-third broadcast banner
 * - Butter-smooth fade and scale-in reveal
 */
export default function LaunchVideo({ isRevealed, isMuted }) {
  const videoRef = useRef(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isRevealed) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to muted playback if browser autoplay policy requires it
          video.muted = true;
          video.play().catch(console.error);
        });
      }

      // Display lower-third banner and auto-fade after 6.5 seconds
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 6500);

      return () => clearTimeout(timer);
    } else {
      video.pause();
      video.currentTime = 0;
      setShowBanner(false);
    }
  }, [isRevealed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className={`video-container ${isRevealed ? 'revealed' : ''}`}>
      {/* Cinematic Theater Ambient Backlight Aura (Ambilight) */}
      <div className="ambient-video-glow" aria-hidden="true" />

      {/* Main Fullscreen Video */}
      <video
        ref={videoRef}
        id="launch-video"
        className="fullscreen-launch-video"
        src="/VN20261021_214849.mp4"
        loop
        playsInline
        preload="auto"
        muted={isMuted}
        poster="/ms_family_launch.png"
      />

      {/* Celebratory Broadcast Lower-Third Banner */}
      {isRevealed && (
        <div className={`launch-lower-third ${showBanner ? 'visible' : 'hidden'}`}>
          <div className="lower-third-pill">
            <div className="lower-third-badge">
              <Sparkles size={16} className="sparkle-gold-icon" />
              <span>OFFICIAL LAUNCH</span>
            </div>
            <div className="lower-third-content">
              <span className="lower-third-brand-x">X</span>
              <span className="lower-third-brand-pool">pool</span>
              <span className="lower-third-sub">Grand Opening Ceremony</span>
            </div>
            <button
              className="lower-third-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowBanner(false);
              }}
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

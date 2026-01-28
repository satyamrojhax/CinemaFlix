import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to manage device vibration.
 *
 * @returns {object} - Contains functions to start, stop, and manage vibration patterns.
 */
const useDeviceVibration = () => {
  const [isVibrating, setIsVibrating] = useState(false);
  const [hasUserInteraction, setHasUserInteraction] = useState(false);
  const hasVibrated = useRef(false);

  const isVibrationSupported = () => "vibrate" in navigator;

  // Track user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasUserInteraction) {
        setHasUserInteraction(true);
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'keydown', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [hasUserInteraction]);

  /**
   * Start device vibration with a given pattern.
   * @param {number | number[]} pattern - Single number or array of numbers defining the vibration pattern.
   */
  const startVibration = (pattern: VibratePattern) => {
    if (!isVibrationSupported()) {
      console.warn("Vibration API is not supported in this browser.");
      return;
    }

    // Only allow vibration after user interaction
    if (!hasUserInteraction) {
      console.warn("Vibration blocked: User interaction required first.");
      return;
    }

    // Prevent spamming vibration
    if (hasVibrated.current) {
      return;
    }

    try {
      navigator.vibrate(pattern);
      setIsVibrating(true);
      hasVibrated.current = true;
      
      // Reset vibration flag after pattern completes
      const patternDuration = Array.isArray(pattern) 
        ? pattern.reduce((sum, val) => sum + val, 0)
        : pattern;
      
      setTimeout(() => {
        setIsVibrating(false);
        hasVibrated.current = false;
      }, patternDuration);
    } catch (error) {
      console.warn("Vibration failed:", error);
    }
  };

  /**
   * Stop the current vibration.
   */
  const stopVibration = () => {
    if (!isVibrationSupported() || !hasUserInteraction) {
      return;
    }
    
    if (isVibrating) {
      navigator.vibrate(0);
      setIsVibrating(false);
      hasVibrated.current = false;
    }
  };

  useEffect(() => {
    return () => {
      stopVibration();
    };
  }, []);

  return {
    isVibrating,
    startVibration,
    stopVibration,
    isVibrationSupported,
    hasUserInteraction,
  };
};

export default useDeviceVibration;

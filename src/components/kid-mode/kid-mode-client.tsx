"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { heartbeat, endKidSession } from "@/app/actions/sessions";
import { HEARTBEAT_INTERVAL_SECONDS, IDLE_TIMEOUT_SECONDS, TIME_WARNING_MINUTES } from "@/lib/constants";
import { KidChat } from "@/components/kid-mode/kid-chat";

interface Props {
  kidName: string;
  kidAge: number;
  kidGrade: string;
  kidProfileId: string;
  sessionId: string;
  timeLimitMinutes: number | null;
  initialUsedSeconds: number;
}

export function KidModeClient({
  kidName,
  kidAge,
  kidGrade,
  kidProfileId,
  sessionId,
  timeLimitMinutes,
  initialUsedSeconds,
}: Props) {
  const [usedSeconds, setUsedSeconds] = useState(initialUsedSeconds);
  const [timeExceeded, setTimeExceeded] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exiting, setExiting] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const isVisibleRef = useRef(true);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Activity detection
  useEffect(() => {
    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    const throttledHandler = (() => {
      let timeout: ReturnType<typeof setTimeout> | null = null;
      return () => {
        if (timeout) return;
        timeout = setTimeout(() => {
          handleActivity();
          timeout = null;
        }, 1000);
      };
    })();

    events.forEach((event) => document.addEventListener(event, throttledHandler));

    const handleVisibility = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      events.forEach((event) => document.removeEventListener(event, throttledHandler));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [handleActivity]);

  // Heartbeat
  useEffect(() => {
    const interval = setInterval(async () => {
      const idleMs = Date.now() - lastActivityRef.current;
      const isIdle = idleMs > IDLE_TIMEOUT_SECONDS * 1000;

      if (!isVisibleRef.current || isIdle) return;

      const result = await heartbeat(sessionId);

      if (result.error === "session_ended") {
        setTimeExceeded(true);
        return;
      }

      if (result.activeSeconds !== undefined) {
        setUsedSeconds(result.activeSeconds);
      }

      if (result.exceeded) {
        setTimeExceeded(true);
      }

      // Show warning at 5 minutes remaining
      if (
        result.warningMinutes !== null &&
        result.warningMinutes !== undefined &&
        result.warningMinutes <= TIME_WARNING_MINUTES &&
        result.warningMinutes > 0 &&
        !warningDismissed
      ) {
        setShowWarning(true);
      }
    }, HEARTBEAT_INTERVAL_SECONDS * 1000);

    return () => clearInterval(interval);
  }, [sessionId, warningDismissed]);

  async function handleExit() {
    setExiting(true);
    await endKidSession(sessionId);
  }

  // Time's up screen
  if (timeExceeded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl">&#9200;</div>
          <h1 className="text-2xl font-bold">Time&apos;s up!</h1>
          <p className="text-muted max-w-sm">
            You&apos;ve used all your screen time for today. Ask your parent or guardian
            if you have any questions.
          </p>
          <button
            onClick={handleExit}
            disabled={exiting}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {exiting ? "Returning..." : "Return to parent"}
          </button>
        </div>
      </div>
    );
  }

  const usedMinutes = Math.floor(usedSeconds / 60);

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-40">
      {/* Kid Mode Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-green-600 text-white">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">Bound</span>
          <span className="text-sm opacity-90">Hi, {kidName}!</span>
        </div>
        <div className="flex items-center gap-4">
          {timeLimitMinutes && (
            <span className="text-sm opacity-90">
              {usedMinutes} / {timeLimitMinutes} min
            </span>
          )}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
          >
            Exit Kid Mode
          </button>
        </div>
      </header>

      {/* Warning */}
      {showWarning && !warningDismissed && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            You have about {timeLimitMinutes ? timeLimitMinutes - usedMinutes : TIME_WARNING_MINUTES} minutes
            of screen time left today.
          </span>
          <button
            onClick={() => setWarningDismissed(true)}
            className="text-xs text-yellow-600 hover:text-yellow-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <KidChat
          kidProfileId={kidProfileId}
          sessionId={sessionId}
          kidName={kidName}
          kidAge={kidAge}
          kidGrade={kidGrade}
          disabled={timeExceeded}
        />
      </div>

      {/* Exit Confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-sm mx-4 space-y-4">
            <h2 className="font-semibold text-lg">Exit Kid Mode?</h2>
            <p className="text-sm text-muted">
              This will end the current session and return to the parent dashboard.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExit}
                disabled={exiting}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {exiting ? "Exiting..." : "Yes, exit"}
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
              >
                Stay in Kid Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

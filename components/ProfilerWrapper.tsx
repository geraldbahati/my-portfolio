"use client";

import React, { Profiler, ProfilerOnRenderCallback, ReactNode } from "react";

// Type for the render information
interface RenderInfo {
  id: string;
  phase: "mount" | "update" | "nested-update";
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

// Store for tracking renders across components
const renderLog: RenderInfo[] = [];

/**
 * ProfilerWrapper - A development tool for measuring React component re-renders.
 *
 * Usage:
 * ```tsx
 * <ProfilerWrapper id="SectionName">
 *   <YourComponent />
 * </ProfilerWrapper>
 * ```
 *
 * View results in console or call `window.__getProfilerData()` in the browser console.
 */
export function ProfilerWrapper({
  id,
  children,
  logToConsole = true,
  showVisualIndicator = true,
}: {
  id: string;
  children: ReactNode;
  logToConsole?: boolean;
  showVisualIndicator?: boolean;
}) {
  const onRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  ) => {
    const renderInfo: RenderInfo = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    };

    // Store in the render log
    renderLog.push(renderInfo);

    if (logToConsole) {
      const emoji = phase === "mount" ? "🟢" : "🔄";
      const durationColor =
        actualDuration > 16
          ? "color: red"
          : actualDuration > 8
            ? "color: orange"
            : "color: green";

      console.groupCollapsed(
        `%c${emoji} [Profiler] ${id} - ${phase}`,
        "font-weight: bold",
      );
      console.log(
        `%cActual Duration: ${actualDuration.toFixed(2)}ms`,
        durationColor,
      );
      console.log(`Base Duration: ${baseDuration.toFixed(2)}ms`);
      console.log(`Start Time: ${startTime.toFixed(2)}ms`);
      console.log(`Commit Time: ${commitTime.toFixed(2)}ms`);
      console.groupEnd();
    }
  };

  // Make render data available globally for easy access
  if (typeof window !== "undefined") {
    (
      window as unknown as { __getProfilerData: () => RenderInfo[] }
    ).__getProfilerData = () => renderLog;
    (
      window as unknown as { __clearProfilerData: () => void }
    ).__clearProfilerData = () => {
      renderLog.length = 0;
      console.log("Profiler data cleared");
    };
    (
      window as unknown as { __getProfilerSummary: () => void }
    ).__getProfilerSummary = () => {
      const summary: Record<
        string,
        { mounts: number; updates: number; totalTime: number; avgTime: number }
      > = {};

      renderLog.forEach((info) => {
        if (!summary[info.id]) {
          summary[info.id] = {
            mounts: 0,
            updates: 0,
            totalTime: 0,
            avgTime: 0,
          };
        }

        if (info.phase === "mount") {
          summary[info.id].mounts++;
        } else {
          summary[info.id].updates++;
        }
        summary[info.id].totalTime += info.actualDuration;
      });

      // Calculate averages
      Object.keys(summary).forEach((key) => {
        const total = summary[key].mounts + summary[key].updates;
        summary[key].avgTime = total > 0 ? summary[key].totalTime / total : 0;
      });

      console.table(summary);
      return summary;
    };
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {showVisualIndicator && process.env.NODE_ENV === "development" && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: "4px",
            right: "4px",
          }}
        >
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
            Profiling: {id}
          </div>
        </div>
      )}
      {children}
    </Profiler>
  );
}

/**
 * HomePageProfiler - Specifically designed to wrap the homepage content
 * and track all section re-renders.
 */
export function HomePageProfiler({ children }: { children: ReactNode }) {
  return (
    <ProfilerWrapper id="HomePage" showVisualIndicator={false}>
      {children}
    </ProfilerWrapper>
  );
}

export default ProfilerWrapper;

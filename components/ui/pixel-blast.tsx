"use client";

import React, { Suspense } from 'react';
import dynamicImport from 'next/dynamic';

type PixelBlastVariant = 'square' | 'circle' | 'triangle' | 'diamond';

type PixelBlastProps = {
  variant?: PixelBlastVariant;
  pixelSize?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  antialias?: boolean;
  patternScale?: number;
  patternDensity?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleIntensityScale?: number;
  rippleThickness?: number;
  rippleSpeed?: number;
  liquidWobbleSpeed?: number;
  autoPauseOffscreen?: boolean;
  speed?: number;
  transparent?: boolean;
  edgeFade?: number;
  noiseAmount?: number;
};

// Lightweight fallback component (no dependencies, minimal bundle size)
const PixelBlastFallback: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div
    className={`w-full h-full relative overflow-hidden ${className ?? ''}`}
    style={style}
    aria-hidden="true"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse" />
  </div>
);

// Dynamically import the heavy THREE.js component
// This prevents THREE.js (~600KB) from being included in the initial bundle
const PixelBlastCore = dynamicImport(
  () => import('./pixel-blast-core').then((mod) => ({ default: mod.PixelBlastCore })),
  {
    ssr: false, // Disable SSR for WebGL component
    loading: () => <PixelBlastFallback />,
  }
);

// Optimized wrapper component using React 19 and Next.js 15 best practices
// Benefits:
// - THREE.js bundle (~600KB) only loaded when component is used
// - No SSR overhead for WebGL components
// - Lightweight fallback during loading
// - Better code splitting and lazy loading
const PixelBlast: React.FC<PixelBlastProps> = (props) => {
  return (
    <Suspense fallback={<PixelBlastFallback className={props.className} style={props.style} />}>
      <PixelBlastCore {...props} />
    </Suspense>
  );
};

export default PixelBlast;

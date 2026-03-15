/**
 * @file FullscreenPattern.tsx
 * @description Renders the generated pattern in full viewport sizing, optimized for immersive viewing.
 * Distinct from PatternPreview as it aims to fill the entire physical screen space directly.
 */

import React, { useRef, useState, useEffect, useMemo } from "react";
import { GeneratedPattern } from "../helpers/patternConfig";
import { PatternSvgRenderer } from "./PatternSvgRenderer";
import styles from "./FullscreenPattern.module.css";

/**
 * Props for the FullscreenPattern component.
 */
interface FullscreenPatternProps {
  /** The generated geometry and layout metadata */
  pattern: GeneratedPattern;
  /** Canvas background color */
  backgroundColor: string;
  /** Flag for kaleidoscope rendering */
  kaleidoscope?: boolean;
  /** Rendering parameter for kaleidoscope slices */
  kaleidoscopeSegments?: number;
  /** Toggle reflection */
  kaleidoscopeMirror?: boolean;
  /** Radial angle */
  kaleidoscopeRotation?: number;
  /** Alpha blending mode */
  kaleidoscopeBlend?: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
  /** Center offset X */
  kaleidoscopeCenterX?: number;
  /** Center offset Y */
  kaleidoscopeCenterY?: number;
  /** Tiling multiplier */
  kaleidoscopeTiling?: number;
  /** Bounding mask shape */
  kaleidoscopeTileShape?: "square" | "hexagon" | "diamond" | "triangle" | "circle" | "ogee";
  /** Allows overlapping paths past boundary */
  kaleidoscopeTileOverflow?: boolean;
}

/**
 * Fullscreen Pattern viewer.
 * Differs from PatternPreview by overriding the typical dynamic zoom-centered logic and instead expanding
 * the viewBox directly to pixel coordinates mapping 1:1 with the viewport's physical bounding rect.
 */
export const FullscreenPattern = React.memo(({
  pattern,
  backgroundColor,
  kaleidoscope = false,
  kaleidoscopeSegments = 12,
  kaleidoscopeMirror = true,
  kaleidoscopeRotation = 0,
  kaleidoscopeBlend = "normal",
  kaleidoscopeCenterX = 0,
  kaleidoscopeCenterY = 0,
  kaleidoscopeTiling = 1,
  kaleidoscopeTileShape = "square",
  kaleidoscopeTileOverflow = false,
}: FullscreenPatternProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track fullscreen container size
  const [containerSize, setContainerSize] = useState({ width: 1920, height: 1080 });
  const lastSizeRef = useRef({ width: 1920, height: 1080 });

  // Throttled ResizeObserver - only update if dimensions changed by more than 1px
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const lastSize = lastSizeRef.current;
        
        // Only update if dimensions changed significantly (> 1px)
        if (Math.abs(width - lastSize.width) > 1 || Math.abs(height - lastSize.height) > 1) {
          lastSizeRef.current = { width, height };
          setContainerSize({ width, height });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const tilingN = kaleidoscopeTiling || 1;
  const useDirectTileRendering = kaleidoscope && tilingN > 1 && kaleidoscopeTileOverflow;
  const useExplicitTilePositions = !kaleidoscope && !pattern.useSimpleTiling;

  // Memoize viewBox for direct rendering mapping 1-to-1 pixels to the container
  const directViewBox = useMemo(() => {
    if (!useDirectTileRendering) return undefined;
    return `0 0 ${containerSize.width} ${containerSize.height}`;
  }, [useDirectTileRendering, containerSize.width, containerSize.height]);

  const viewBox = useDirectTileRendering 
    ? directViewBox 
    : (useExplicitTilePositions ? `0 0 ${pattern.width} ${pattern.height}` : undefined);
    
  const preserveAspectRatio = useDirectTileRendering ? "xMidYMid slice" : undefined;

  return (
    <div ref={containerRef} className={styles.container}>
      <PatternSvgRenderer
        pattern={pattern}
        backgroundColor={backgroundColor}
        idPrefix="fs"
        containerSize={containerSize}
        viewBox={viewBox}
        preserveAspectRatio={preserveAspectRatio}
        svgClassName={styles.svg}
        kaleidoscope={kaleidoscope}
        kaleidoscopeSegments={kaleidoscopeSegments}
        kaleidoscopeMirror={kaleidoscopeMirror}
        kaleidoscopeRotation={kaleidoscopeRotation}
        kaleidoscopeBlend={kaleidoscopeBlend}
        kaleidoscopeCenterX={kaleidoscopeCenterX}
        kaleidoscopeCenterY={kaleidoscopeCenterY}
        kaleidoscopeTiling={kaleidoscopeTiling}
        kaleidoscopeTileShape={kaleidoscopeTileShape}
        kaleidoscopeTileOverflow={kaleidoscopeTileOverflow}
      />
    </div>
  );
});

FullscreenPattern.displayName = 'FullscreenPattern';
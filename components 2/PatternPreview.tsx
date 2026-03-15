/**
 * @file PatternPreview.tsx
 * @description Component to render the generated SVG pattern in an interactive preview pane.
 * Handles automatic resizing via ResizeObserver and complex viewBox logic to center the pattern.
 */

import React, { useRef, useState, useEffect, useMemo } from "react";
import { GeneratedPattern } from "../helpers/patternConfig";
import { PatternSvgRenderer } from "./PatternSvgRenderer";
import styles from "./PatternPreview.module.css";

/**
 * Props for the PatternPreview component.
 */
interface PatternPreviewProps {
  /** The generated pattern geometry and metadata */
  pattern: GeneratedPattern;
  /** Optional override for the background color */
  backgroundColor?: string;
  /** Optional custom CSS classes */
  className?: string;
  /** Zoom level scalar (e.g., 1.0 is 100%) */
  zoom?: number;
  /** Whether kaleidoscope mode is enabled */
  kaleidoscope?: boolean;
  /** Segments for kaleidoscope mode */
  kaleidoscopeSegments?: number;
  /** Toggle mirroring in kaleidoscope */
  kaleidoscopeMirror?: boolean;
  /** Base rotation angle for kaleidoscope */
  kaleidoscopeRotation?: number;
  /** SVG blend mode for kaleidoscope elements */
  kaleidoscopeBlend?: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
  /** Center X offset for kaleidoscope */
  kaleidoscopeCenterX?: number;
  /** Center Y offset for kaleidoscope */
  kaleidoscopeCenterY?: number;
  /** Repeated instances of the kaleidoscope */
  kaleidoscopeTiling?: number;
  /** Mask shape for kaleidoscope repetition */
  kaleidoscopeTileShape?: "square" | "hexagon" | "diamond" | "triangle" | "circle" | "ogee";
  /** Whether overflow past tile bounds is permitted */
  kaleidoscopeTileOverflow?: boolean;
}

/**
 * Renders an SVG representation of the generated pattern inside a responsive wrapper.
 * Adapts to container size changes and adjusts viewBox boundaries continuously.
 */
export const PatternPreview = React.memo(({
  pattern,
  backgroundColor,
  className,
  zoom = 1,
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
}: PatternPreviewProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track container pixel dimensions to inform the SVG renderer
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const lastSizeRef = useRef({ width: 800, height: 600 });

  // ─── RESIZE OBSERVER ───
  // A throttled ResizeObserver to watch the container's bounds.
  // It only triggers a state update if dimensions change by more than 1px to prevent infinite loops.
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
  
  // ─── VIEWBOX CALCULATION ───
  // Memoize viewBox calculation based on mathematical limits of the pattern and physical container limits.
  // This logic ensures the generated motif remains centered and fully fits the aspect ratio of the bounding box.
  const expandedViewBox = useMemo(() => {
    const contentWidth = kaleidoscope && tilingN > 1 ? pattern.width * tilingN : pattern.width;
    const contentHeight = kaleidoscope && tilingN > 1 ? pattern.height * tilingN : pattern.height;
    
    const containerAspect = containerSize.width / containerSize.height;
    const contentAspect = contentWidth / contentHeight;
    
    let viewBoxWidth = contentWidth;
    let viewBoxHeight = contentHeight;
    let viewBoxX = 0;
    let viewBoxY = 0;
    
    // Adjust boundaries to enforce letterboxing mathematically via the viewBox
    if (containerAspect > contentAspect) {
      viewBoxWidth = contentHeight * containerAspect;
      viewBoxX = -(viewBoxWidth - contentWidth) / 2;
    } else {
      viewBoxHeight = contentWidth / containerAspect;
      viewBoxY = -(viewBoxHeight - contentHeight) / 2;
    }
    
    return { viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight, contentWidth, contentHeight };
  }, [kaleidoscope, tilingN, pattern.width, pattern.height, containerSize.width, containerSize.height]);

  const { viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight } = expandedViewBox;
  const expandedViewBoxString = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div ref={containerRef} className={styles.canvasWrapper}>
        <PatternSvgRenderer
          ref={svgRef}
          pattern={pattern}
          backgroundColor={backgroundColor || pattern.backgroundColor || "var(--surface)"}
          idPrefix="preview"
          containerSize={containerSize}
          viewBox={expandedViewBoxString}
          preserveAspectRatio="xMidYMid slice"
          svgClassName={styles.svg}
          svgStyle={{
            // Handle logical zoom independent of SVG scale
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.3s ease-out",
          }}
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
    </div>
  );
});

PatternPreview.displayName = 'PatternPreview';
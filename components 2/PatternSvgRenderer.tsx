/**
 * @file PatternSvgRenderer.tsx
 * @description Core SVG rendering component that unifies the drawing logic of the Moroccan Pattern Generator.
 * Abstracts all complex rendering branches into a single reusable layer: direct tile mapping (overflow mode),
 * explicit `<use>` element layouts (wallpaper patterns), and SVG `<pattern>` implementations for simple/kaleidoscope repeats.
 */

import React, { useMemo, forwardRef } from "react";
import { GeneratedPattern, Shape, KaleidoscopeTileShape } from "../helpers/patternConfig";
import {
  getKaleidoscopeTransforms,
  buildSegmentTransformString,
  getKaleidoscopeWedgeClipPath,
  computeKaleidoscopeTileLayout,
} from "../helpers/kaleidoscopeGeometry";
import styles from "./PatternSvgRenderer.module.css";

/**
 * Props for the PatternSvgRenderer component.
 */
interface PatternSvgRendererProps {
  /** The generated pattern data to render */
  pattern: GeneratedPattern;
  /** The background color for the SVG canvas */
  backgroundColor: string;
  /** A unique prefix for SVG element IDs to prevent DOM clashes */
  idPrefix: string;
  /** The physical pixel dimensions of the rendering container */
  containerSize: { width: number; height: number };
  /** The SVG viewBox string to control zoom and pan */
  viewBox?: string;
  /** The SVG preserveAspectRatio attribute */
  preserveAspectRatio?: string;
  /** Additional CSS styles for the SVG element */
  svgStyle?: React.CSSProperties;
  /** Additional CSS classes for the SVG element */
  svgClassName?: string;
  /** The width attribute of the SVG */
  width?: string | number;
  /** The height attribute of the SVG */
  height?: string | number;

  // Kaleidoscope specific props
  /** Whether kaleidoscope rendering is enabled */
  kaleidoscope?: boolean;
  /** The number of radial segments for the kaleidoscope */
  kaleidoscopeSegments?: number;
  /** Whether adjacent kaleidoscope segments should mirror each other */
  kaleidoscopeMirror?: boolean;
  /** The base rotation angle of the kaleidoscope mask */
  kaleidoscopeRotation?: number;
  /** The SVG mix-blend-mode to apply to overlapping segments */
  kaleidoscopeBlend?: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
  /** The relative X center of the kaleidoscope focal point */
  kaleidoscopeCenterX?: number;
  /** The relative Y center of the kaleidoscope focal point */
  kaleidoscopeCenterY?: number;
  /** The number of times the kaleidoscope tile is repeated */
  kaleidoscopeTiling?: number;
  /** The geometric shape of the kaleidoscope tile mask */
  kaleidoscopeTileShape?: KaleidoscopeTileShape;
  /** Whether kaleidoscope vectors can overflow their tile boundaries */
  kaleidoscopeTileOverflow?: boolean;
}

/**
 * Internal helper component for iteratively rendering a list of generic shapes.
 * Handles both SVG `<path>` definitions and `<polygon>` coordinate arrays seamlessly.
 * Applies clip-paths if specified.
 * 
 * @param props - The shape rendering properties
 * @param props.shapes - The array of shape definitions to draw
 * @param props.idPrefix - Unique prefix for keys and IDs
 * @param props.clipPathPrefix - Prefix for referencing defined clip-paths
 */
const ShapeRenderer = React.memo(({
  shapes,
  idPrefix,
  clipPathPrefix
}: {
  shapes: Shape[];
  idPrefix: string;
  clipPathPrefix: string;
}) => {
  return (
    <>
      {shapes.map((shape, index) => {
        // Construct the base visual element (path or polygon)
        const element = shape.path ? (
          <path
            d={shape.path}
            fill={shape.color}
            stroke={shape.stroke || "none"}
            strokeWidth={shape.strokeWidth || 0}
          />
        ) : (
          <polygon
            points={shape.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={shape.color}
            stroke={shape.stroke || "none"}
            strokeWidth={shape.strokeWidth || 0}
          />
        );

        // Wrap in a group if a clip-path applies to this specific shape
        if (shape.clipPath && clipPathPrefix !== "none") {
          return (
            <g key={`${idPrefix}-shape-${index}`} clipPath={`url(#${clipPathPrefix}-${index})`}>
              {element}
            </g>
          );
        }

        return <React.Fragment key={`${idPrefix}-shape-${index}`}>{element}</React.Fragment>;
      })}
    </>
  );
});

ShapeRenderer.displayName = "ShapeRenderer";

/**
 * Main SVG Renderer Component.
 * Supports three primary rendering modes:
 * 1. Normal Tiling: Uses SVG `<pattern>` to infinitely repeat a single canonical tile.
 * 2. Wallpaper Tiling: Uses explicit `<use>` elements to place transformed instances of a `<symbol>`.
 * 3. Kaleidoscope Tiling: Creates a complex radial mirror effect using repeating groups and clip-paths.
 */
export const PatternSvgRenderer = React.memo(forwardRef<SVGSVGElement, PatternSvgRendererProps>(({
  pattern,
  backgroundColor,
  idPrefix,
  containerSize,
  viewBox,
  preserveAspectRatio,
  svgStyle,
  svgClassName,
  width = "100%",
  height = "100%",
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
}, ref) => {
  const tilingN = kaleidoscopeTiling || 1;

  // ─── MEMOIZATION STRATEGY ───
  // We use useMemo heavily here to avoid recalculating mathematical segments, transforms,
  // and SVG paths on every minor re-render, especially since SVG layout operations can be costly.

  // Memoize kaleidoscope focal center based on physical dimensions and user offset
  const kaleidoscopeCenter = useMemo(() => {
    const baseCx = pattern.width / 2;
    const baseCy = pattern.height / 2;
    const offsetCx = baseCx + (kaleidoscopeCenterX * pattern.width);
    const offsetCy = baseCy + (kaleidoscopeCenterY * pattern.height);
    return { offsetCx, offsetCy };
  }, [pattern.width, pattern.height, kaleidoscopeCenterX, kaleidoscopeCenterY]);

  // Memoize the array of transforms needed for each radial segment
  const segmentTransforms = useMemo(() => {
    if (!kaleidoscope) return [];
    return getKaleidoscopeTransforms({
      kaleidoscope: true,
      kaleidoscopeSegments,
      kaleidoscopeMirror,
      kaleidoscopeRotation,
    } as any);
  }, [kaleidoscope, kaleidoscopeSegments, kaleidoscopeMirror, kaleidoscopeRotation]);

  // Memoize the triangular "wedge" clip-path that defines a single slice of the kaleidoscope
  const wedgeClipPath = useMemo(() => {
    if (!kaleidoscope) return "";
    const wedgeRadius = Math.max(pattern.width, pattern.height) * 1.5;
    return getKaleidoscopeWedgeClipPath(
      kaleidoscopeCenter.offsetCx,
      kaleidoscopeCenter.offsetCy,
      wedgeRadius,
      kaleidoscopeSegments
    );
  }, [kaleidoscope, pattern.width, pattern.height, kaleidoscopeCenter.offsetCx, kaleidoscopeCenter.offsetCy, kaleidoscopeSegments]);

  // Memoize tile layout logic for repeating kaleidoscope patterns (e.g., honeycomb hexagons)
  const tileLayout = useMemo(() => {
    if (kaleidoscope && tilingN > 1) {
      return computeKaleidoscopeTileLayout(
        kaleidoscopeTileShape,
        pattern.width,
        pattern.height,
        tilingN
      );
    }
    return null;
  }, [kaleidoscope, tilingN, kaleidoscopeTileShape, pattern.width, pattern.height]);

  // Determine if we should use direct tile rendering (overflow mode overrides SVG patterns)
  const useDirectTileRendering = kaleidoscope && tilingN > 1 && kaleidoscopeTileOverflow;

  // Memoize positions for explicit direct tile rendering when patterns aren't sufficient
  const directRenderTiles = useMemo(() => {
    if (!useDirectTileRendering || !tileLayout) return [];
    
    const tiles: Array<{ x: number; y: number; clipPathD: string }> = [];
    const repeatCols = Math.ceil(containerSize.width / tileLayout.repeatWidth) + 2;
    const repeatRows = Math.ceil(containerSize.height / tileLayout.repeatHeight) + 2;
    
    for (let row = -1; row < repeatRows; row++) {
      for (let col = -1; col < repeatCols; col++) {
        for (const repeatTile of tileLayout.repeatTiles) {
          tiles.push({
            x: col * tileLayout.repeatWidth + repeatTile.x,
            y: row * tileLayout.repeatHeight + repeatTile.y,
            clipPathD: repeatTile.clipPathD,
          });
        }
      }
    }
    
    return tiles;
  }, [useDirectTileRendering, tileLayout, containerSize.width, containerSize.height]);

  // Explicit positioning is used for mathematical symmetry groups that rotate/flip tiles complexly
  const useExplicitTilePositions = !kaleidoscope && !pattern.useSimpleTiling;

  // Parse viewbox coordinates to determine safe infinite-background bounds
  const vbArray = viewBox?.split(" ").map(Number) || [0, 0, containerSize.width || 1000, containerSize.height || 1000];
  const [vx, vy, vw, vh] = vbArray.length === 4 && !vbArray.includes(NaN) ? vbArray : [0, 0, containerSize.width || 1000, containerSize.height || 1000];

  return (
    <svg
      ref={ref}
      className={`${styles.svg} ${svgClassName || ""}`}
      style={svgStyle}
      width={width}
      height={height}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
    >
      {/* ─── SVG STRUCTURE: DEFINITIONS ─── */}
      <defs>
        {/* Clip paths for normal tile shapes */}
        {pattern.tileShapes.map((shape, index) =>
          shape.clipPath ? (
            <clipPath key={`${idPrefix}-tile-clip-def-${index}`} id={`${idPrefix}-tile-clip-${index}`}>
              <path d={shape.clipPath} />
            </clipPath>
          ) : null
        )}

        {/* Clip paths for full shapes (used in kaleidoscope) */}
        {kaleidoscope && pattern.shapes.map((shape, index) =>
          shape.clipPath ? (
            <clipPath key={`${idPrefix}-all-clip-def-${index}`} id={`${idPrefix}-all-clip-${index}`}>
              <path d={shape.clipPath} />
            </clipPath>
          ) : null
        )}

        {/* Kaleidoscope wedge clip path */}
        {kaleidoscope && (
          <clipPath id={`${idPrefix}-wedge-clip`}>
            <path d={wedgeClipPath} />
          </clipPath>
        )}

        {/* Mode 1: Normal pattern (SVG infinite tiling) */}
        {!useDirectTileRendering && !kaleidoscope && !useExplicitTilePositions && (
          <pattern
            id={`${idPrefix}-normal-pattern`}
            x="0"
            y="0"
            width={pattern.tileSize}
            height={pattern.tileSize}
            patternUnits="userSpaceOnUse"
          >
            <ShapeRenderer shapes={pattern.tileShapes} idPrefix={`${idPrefix}-normal`} clipPathPrefix={`${idPrefix}-tile-clip`} />
          </pattern>
        )}

        {/* Mode 3: Kaleidoscope repeating pattern */}
        {!useDirectTileRendering && kaleidoscope && (
          tilingN > 1 && tileLayout ? (
            <pattern
              id={`${idPrefix}-kaleidoscope-pattern`}
              x="0"
              y="0"
              width={tileLayout.repeatWidth}
              height={tileLayout.repeatHeight}
              patternUnits="userSpaceOnUse"
            >
              {tileLayout.repeatTiles.map((tile, tileIndex) => (
                <g key={`repeat-tile-${tileIndex}`}>
                  <defs>
                    <clipPath id={`${idPrefix}-kaleid-tile-clip-${tileIndex}`}>
                      <path d={tile.clipPathD} />
                    </clipPath>
                  </defs>
                  <g transform={`translate(${tile.x},${tile.y})`}>
                    <g clipPath={`url(#${idPrefix}-kaleid-tile-clip-${tileIndex})`}>
                      {segmentTransforms.map((transform) => (
                        <g
                          key={`seg-${transform.index}`}
                          transform={buildSegmentTransformString(transform, kaleidoscopeCenter.offsetCx, kaleidoscopeCenter.offsetCy)}
                          style={{ mixBlendMode: kaleidoscopeBlend }}
                        >
                          <g clipPath={`url(#${idPrefix}-wedge-clip)`}>
                            <rect
                              x={-pattern.width}
                              y={-pattern.height}
                              width={pattern.width * 3}
                              height={pattern.height * 3}
                              fill={backgroundColor}
                            />
                            <ShapeRenderer shapes={pattern.shapes} idPrefix={`${idPrefix}-t${tileIndex}-s${transform.index}`} clipPathPrefix={`${idPrefix}-all-clip`} />
                          </g>
                        </g>
                      ))}
                    </g>
                  </g>
                </g>
              ))}
            </pattern>
          ) : (
            <pattern
              id={`${idPrefix}-kaleidoscope-pattern`}
              x="0"
              y="0"
              width={pattern.width}
              height={pattern.height}
              patternUnits="userSpaceOnUse"
            >
              {segmentTransforms.map((transform) => (
                <g
                  key={`seg-${transform.index}`}
                  transform={buildSegmentTransformString(transform, kaleidoscopeCenter.offsetCx, kaleidoscopeCenter.offsetCy)}
                  style={{ mixBlendMode: kaleidoscopeBlend }}
                >
                  <g clipPath={`url(#${idPrefix}-wedge-clip)`}>
                    <rect
                      x={-pattern.width}
                      y={-pattern.height}
                      width={pattern.width * 3}
                      height={pattern.height * 3}
                      fill={backgroundColor}
                    />
                    <ShapeRenderer shapes={pattern.shapes} idPrefix={`${idPrefix}-s${transform.index}`} clipPathPrefix={`${idPrefix}-all-clip`} />
                  </g>
                </g>
              ))}
            </pattern>
          )
        )}

        {/* Mode 2: Wallpaper explicit tile symbol definition */}
        {useExplicitTilePositions && (
          <symbol id={`${idPrefix}-tile-symbol`} viewBox={`0 0 ${pattern.tileSize} ${pattern.tileSize}`}>
            <ShapeRenderer shapes={pattern.tileShapes} idPrefix={`${idPrefix}-symbol`} clipPathPrefix={`${idPrefix}-tile-clip`} />
          </symbol>
        )}
      </defs>

      {/* ─── SVG STRUCTURE: RENDERED CONTENT ─── */}

      {/* Base Background - safe coverage across zoomed viewport to prevent blank edges */}
      <rect
        x={vx - vw}
        y={vy - vh}
        width={vw * 3}
        height={vh * 3}
        fill={backgroundColor}
      />

      {/* Overlay Paths depending on the active rendering mode */}
      {useDirectTileRendering ? (
        // Rendering direct tiles using nested transforms (Used for overflow modes)
        directRenderTiles.map((tile, tileIndex) => (
          <g key={`direct-tile-${tileIndex}`} transform={`translate(${tile.x},${tile.y})`}>
            {segmentTransforms.map((transform) => (
              <g
                key={`direct-segment-${transform.index}`}
                transform={buildSegmentTransformString(transform, kaleidoscopeCenter.offsetCx, kaleidoscopeCenter.offsetCy)}
                style={{ mixBlendMode: kaleidoscopeBlend }}
              >
                <g clipPath={`url(#${idPrefix}-wedge-clip)`}>
                  <ShapeRenderer shapes={pattern.shapes} idPrefix={`${idPrefix}-dir-${tileIndex}-${transform.index}`} clipPathPrefix={`${idPrefix}-all-clip`} />
                </g>
              </g>
            ))}
          </g>
        ))
      ) : useExplicitTilePositions ? (
        // Explicit wallpaper tiling (<use> referencing <symbol> with transformations)
        pattern.tilePositions?.map((pos, posIndex) => {
          const scaleX = pos.scaleX ?? 1;
          const scaleY = pos.scaleY ?? 1;
          const rotation = pos.rotation ?? 0;
          
          const centerX = pattern.centerOffset ? pattern.tileSize / 2 : 0;
          const centerY = pattern.centerOffset ? pattern.tileSize / 2 : 0;
          
          let transformStr = `translate(${pos.x - centerX},${pos.y - centerY})`;
          if (rotation !== 0) {
            transformStr += ` translate(${pattern.tileSize / 2},${pattern.tileSize / 2}) rotate(${rotation}) translate(${-pattern.tileSize / 2},${-pattern.tileSize / 2})`;
          }
          if (scaleX !== 1 || scaleY !== 1) {
            transformStr += ` translate(${pattern.tileSize / 2},${pattern.tileSize / 2}) scale(${scaleX},${scaleY}) translate(${-pattern.tileSize / 2},${-pattern.tileSize / 2})`;
          }
          
          return (
            <use
              key={`tile-pos-${posIndex}`}
              href={`#${idPrefix}-tile-symbol`}
              width={pattern.tileSize}
              height={pattern.tileSize}
              transform={transformStr}
            />
          );
        })
      ) : kaleidoscope ? (
        // Render Kaleidoscope using full-viewport <rect> filled with <pattern>
        <rect
          x={vx - vw}
          y={vy - vh}
          width={vw * 3}
          height={vh * 3}
          fill={`url(#${idPrefix}-kaleidoscope-pattern)`}
        />
      ) : (
        // Render Normal infinite pattern + optional structural interstices (gaps)
        <>
          <rect
            x={vx - vw}
            y={vy - vh}
            width={vw * 3}
            height={vh * 3}
            fill={`url(#${idPrefix}-normal-pattern)`}
          />
          {pattern.intersticePositions?.map((pos, i) => (
            <g key={`interstice-${i}`} transform={`translate(${pos.x},${pos.y})`}>
              <ShapeRenderer shapes={pattern.intersticeShapes || []} idPrefix={`${idPrefix}-interstice-${i}`} clipPathPrefix="none" />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}));

PatternSvgRenderer.displayName = "PatternSvgRenderer";
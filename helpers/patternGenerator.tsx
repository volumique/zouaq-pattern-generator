/**
 * @file patternGenerator.tsx
 * @description Main orchestration engine for pattern generation.
 * This is the key entry point: it combines unit generation of a tile
 * (via patternTileFactory) with tiling and interstice algorithms
 * to produce the complete final result ready to be rendered.
 */

import { Point } from "./geometryUtils";
import { calculateTilePosition, calculateGridDimensions, calculateIntersticePositions, calculateWallpaperTilePositions, TilePosition } from "./tilingCalculator";
import { computeAdvancedTiling } from "./advancedTiling";
import { generateIntersticeShape } from "./intersticeGenerator";
import { PatternConfig, GeneratedPattern, Shape } from "./patternConfig";
import { normalizeConfig } from "./patternDefaults";
import { generateTileShapes } from "./patternTileFactory";

export type { PatternConfig, GeneratedPattern, Shape } from "./patternConfig";
export { COLOR_PRESETS, DEFAULT_CONFIG } from "./patternConfig";

/**
 * Master function (Orchestrator) to generate the entirety of an Islamic geometric pattern.
 * 
 * @param config `PatternConfig` object (potentially incomplete) representing the form state.
 * @returns `GeneratedPattern` object containing all SVG geometries ready to be injected into the DOM.
 */
export function generatePattern(config: PatternConfig): GeneratedPattern {
  const c = normalizeConfig(config);

  const tileSize = 200;
  const effectiveTileSize = tileSize * (1 + c.tileSpacing);
  const shapes: Shape[] = [];

  // ─── PHASE 1 : BASE TILE GENERATION (Tile Generation) ───
  
  // Asks the Factory to produce the base shape at local coordinate (0,0).
  const { rawTileShapes } = generateTileShapes(c, tileSize);

  // Normalization of raw shapes to the universal Shape interface used by the UI.
  const tileShapes: Shape[] = rawTileShapes.map(s => ({
    points: s.points || [],
    color: s.fill,
    stroke: s.stroke,
    strokeWidth: s.strokeWidth,
    zIndex: s.zIndex,
    path: s.path,
    clipPath: s.clipPath
  }));

  // Canvas size initialization
  let totalWidth = c.tiling * effectiveTileSize;
  let totalHeight = c.tiling * effectiveTileSize;

  let tilePositions: TilePosition[] = [];
  let rows = 0;
  let cols = 0;

  // ─── PHASE 2 : TILING COMPUTATION (Tiling Computation) ───

  if (c.useAdvancedTiling) {
    // Advanced geometric tessellation mathematics (Penrose, Rice Pentagons)
    const advancedResult = computeAdvancedTiling(
      c.advancedTilingMode,
      tileSize,
      c.tiling,
      c.tileSpacing,
      c.pentagonalSubType
    );
    
    // Conversion to standard positioning structure
    tilePositions = advancedResult.positions.map(p => ({
      x: p.x,
      y: p.y,
      rotation: p.rotation,
      scaleX: p.scaleX,
      scaleY: p.scaleY,
    }));
    
    // Advanced tiling can dynamically redefine frame limits
    totalWidth = advancedResult.totalWidth;
    totalHeight = advancedResult.totalHeight;
  } else if (c.useWallpaperGroups) {
    // The 17 planar symmetry groups (p4m, p6m, etc.)
    tilePositions = calculateWallpaperTilePositions(
      totalWidth,
      totalHeight,
      tileSize,
      c.wallpaperGroup,
      c.tileSpacing
    );
  } else {
    // Legacy simple tiling mode (Grid, Diagonal, Brick, Hexagonal)
    const gridDims = calculateGridDimensions(
      totalWidth,
      totalHeight,
      effectiveTileSize,
      c.tilingMode
    );
    rows = gridDims.rows;
    cols = gridDims.cols;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const position = calculateTilePosition(row, col, {
          mode: c.tilingMode,
          tileSize,
          tilingOffset: c.tilingOffset,
          tilingRotation: c.tilingRotation,
          spacing: c.tileSpacing,
        });
        tilePositions.push(position);
      }
    }
  }

  // ─── PERFORMANCE OPTIMIZATION ───
  // If we are in a mode using modern React UI SVG symbol/use, 
  // we can skip expanding every vector point in JavaScript memory.
  const kaleidoscope = c.kaleidoscope ?? false;
  const shouldSkipShapesExpansion = !kaleidoscope && (c.useAdvancedTiling || c.useWallpaperGroups);

  // ─── PHASE 3 : LEGACY SHAPE EXPANSION (Legacy Shape Expansion) ───
  
  // Applies transformations (translations, rotations, scales) mathematically 
  // to each vector to fill the classic `shapes` array.
  if (!shouldSkipShapesExpansion) {
    tilePositions.forEach((position) => {
    const translatedShapes = rawTileShapes.map((shape) => {
      // Scale and mirror
      const scaleX = position.scaleX ?? 1;
      const scaleY = position.scaleY ?? 1;

      // 1. Transformation of point clouds (polygons)
      let transformedPoints = (shape.points || []).map((p) => {
        let px = p.x;
        let py = p.y;
        
        // Mirror around local center
        if (scaleX !== 1 || scaleY !== 1) {
          const cx = tileSize / 2;
          const cy = tileSize / 2;
          px = cx + (px - cx) * scaleX;
          py = cy + (py - cy) * scaleY;
        }

        // Rotation around local center
        if (position.rotation !== 0) {
          const cx = tileSize / 2;
          const cy = tileSize / 2;
          const angle = (position.rotation * Math.PI) / 180;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const dx = px - cx;
          const dy = py - cy;
          px = cos * dx - sin * dy + cx;
          py = sin * dx + cos * dy + cy;
        }

        // Global translation in the complete plane
        // Mathematical groups calculate relative to center, classic relative to origin point
        const centerX = (c.useWallpaperGroups || c.useAdvancedTiling) ? tileSize / 2 : 0;
        const centerY = (c.useWallpaperGroups || c.useAdvancedTiling) ? tileSize / 2 : 0;
        
        return {
          x: px + position.x - centerX,
          y: py + position.y - centerY,
        };
      });

      // 2. Transformation of SVG "Path" strings via Regex (e.g., Zouaq curves)
      let transformedPath = undefined;
      if (shape.path) {
        transformedPath = shape.path.replace(/([0-9.-]+),([0-9.-]+)/g, (match: string, x: string, y: string) => {
          let px = parseFloat(x);
          let py = parseFloat(y);

          if (scaleX !== 1 || scaleY !== 1) {
            const cx = tileSize / 2;
            const cy = tileSize / 2;
            px = cx + (px - cx) * scaleX;
            py = cy + (py - cy) * scaleY;
          }

          if (position.rotation !== 0) {
            const cx = tileSize / 2;
            const cy = tileSize / 2;
            const angle = (position.rotation * Math.PI) / 180;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const dx = px - cx;
            const dy = py - cy;
            px = cos * dx - sin * dy + cx;
            py = sin * dx + cos * dy + cy;
          }

          const centerX = (c.useWallpaperGroups || c.useAdvancedTiling) ? tileSize / 2 : 0;
          const centerY = (c.useWallpaperGroups || c.useAdvancedTiling) ? tileSize / 2 : 0;
          return `${px + position.x - centerX},${py + position.y - centerY}`;
        });
      }

      // 3. Transformation of SVG clipping masks
      let transformedClipPath = undefined;
      if (shape.clipPath) {
        transformedClipPath = shape.clipPath.replace(/([0-9.-]+),([0-9.-]+)/g, (match: string, x: string, y: string) => {
          let px = parseFloat(x);
          let py = parseFloat(y);

          if (scaleX !== 1 || scaleY !== 1) {
            const cx = tileSize / 2;
            const cy = tileSize / 2;
            px = cx + (px - cx) * scaleX;
            py = cy + (py - cy) * scaleY;
          }

          if (position.rotation !== 0) {
            const cx = tileSize / 2;
            const cy = tileSize / 2;
            const angle = (position.rotation * Math.PI) / 180;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const dx = px - cx;
            const dy = py - cy;
            px = cos * dx - sin * dy + cx;
            py = sin * dx + cos * dy + cy;
          }

          const centerX = (c.useWallpaperGroups || c.useAdvancedTiling) ? tileSize / 2 : 0;
          const centerY = (c.useWallpaperGroups || c.useAdvancedTiling) ? tileSize / 2 : 0;
          return `${px + position.x - centerX},${py + position.y - centerY}`;
        });
      }

      return {
        points: transformedPoints,
        path: transformedPath,
        color: shape.fill,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        zIndex: shape.zIndex || 1,
        clipPath: transformedClipPath,
      };
    });

      shapes.push(...translatedShapes);
    });
  }

  // ─── PHASE 4 : GAPS/INTERSTICES GENERATION (Gaps/Interstices Generation) ───
  
  let intersticeShapes: Shape[] = [];
  let intersticePositions: Point[] = [];
  
  // "Traditional" interstices only make sense in classic grid tiling
  if (c.showInterstices && !c.useWallpaperGroups && !c.useAdvancedTiling && rows > 0 && cols > 0) {
    intersticePositions = calculateIntersticePositions(
      rows,
      cols,
      effectiveTileSize,
      c.tilingMode
    );

    const intersticeSize = tileSize * c.intersticeScale;

    // Prepares a canonical (centered) interstice shape for the new rendering engine
    if (c.intersticeType === "same") {
      // Fractal effect: shrinks the parent tile itself (self-similar)
      const cx = tileSize / 2;
      const cy = tileSize / 2;
      const s = c.intersticeScale;
      
      intersticeShapes = rawTileShapes.map((shape) => {
         const scaledPoints = (shape.points || []).map((p) => ({
          x: cx + (p.x - cx) * s,
          y: cy + (p.y - cy) * s,
        }));
        
        let scaledPath = undefined;
        if (shape.path) {
          scaledPath = shape.path.replace(
            /([0-9.-]+),([0-9.-]+)/g,
            (match: string, x: string, y: string) => {
              const px = parseFloat(x);
              const py = parseFloat(y);
              const scaledX = cx + (px - cx) * s;
              const scaledY = cy + (py - cy) * s;
              return `${scaledX},${scaledY}`;
            }
          );
        }

        let scaledClipPath = undefined;
        if (shape.clipPath) {
          scaledClipPath = shape.clipPath.replace(
            /([0-9.-]+),([0-9.-]+)/g,
            (match: string, x: string, y: string) => {
              const px = parseFloat(x);
              const py = parseFloat(y);
              const scaledX = cx + (px - cx) * s;
              const scaledY = cy + (py - cy) * s;
              return `${scaledX},${scaledY}`;
            }
          );
        }

        return {
          points: scaledPoints,
          path: scaledPath,
          color: shape.fill,
          stroke: shape.stroke,
          strokeWidth: shape.strokeWidth * s,
          zIndex: 2,
          clipPath: scaledClipPath,
        };
      });
    } else {
      // Generates a distinct shape (star, cross, diamond) at origin (0,0)
      const rawInterstices = generateIntersticeShape(
        0, 
        0,
        intersticeSize,
        c.intersticeType,
        c.colors,
        c.lineWidth,
        c.rotation + c.tilingRotation
      );
      
      intersticeShapes = rawInterstices.map((shape) => ({
        points: shape.points,
        color: shape.fill,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        zIndex: 2,
      }));
    }

    // Backward compatibility (fills the expanded shapes array)
    intersticePositions.forEach((pos) => {
      if (c.intersticeType === "same") {
        const cx = tileSize / 2;
        const cy = tileSize / 2;
        const s = c.intersticeScale;

        const scaledAndTranslatedShapes = rawTileShapes.map((shape) => {
          const scaledPoints = (shape.points || []).map((p) => ({
            x: cx + (p.x - cx) * s,
            y: cy + (p.y - cy) * s,
          }));

          const translatedPoints = scaledPoints.map((p) => ({
            x: p.x - cx + pos.x,
            y: p.y - cy + pos.y,
          }));

          let scaledPath = undefined;
          if (shape.path) {
            scaledPath = shape.path.replace(
              /([0-9.-]+),([0-9.-]+)/g,
              (match: string, x: string, y: string) => {
                const px = parseFloat(x);
                const py = parseFloat(y);
                const scaledX = cx + (px - cx) * s;
                const scaledY = cy + (py - cy) * s;
                const finalX = scaledX - cx + pos.x;
                const finalY = scaledY - cy + pos.y;
                return `${finalX},${finalY}`;
              }
            );
          }

          let scaledClipPath = undefined;
          if (shape.clipPath) {
            scaledClipPath = shape.clipPath.replace(
              /([0-9.-]+),([0-9.-]+)/g,
              (match: string, x: string, y: string) => {
                const px = parseFloat(x);
                const py = parseFloat(y);
                const scaledX = cx + (px - cx) * s;
                const scaledY = cy + (py - cy) * s;
                const finalX = scaledX - cx + pos.x;
                const finalY = scaledY - cy + pos.y;
                return `${finalX},${finalY}`;
              }
            );
          }

          return {
            points: translatedPoints,
            path: scaledPath,
            color: shape.fill,
            stroke: shape.stroke,
            strokeWidth: shape.strokeWidth * s,
            zIndex: 2,
            clipPath: scaledClipPath,
          };
        });

        shapes.push(...scaledAndTranslatedShapes);
      } else {
        const intersticeShapesData = generateIntersticeShape(
          pos.x,
          pos.y,
          intersticeSize,
          c.intersticeType,
          c.colors,
          c.lineWidth,
          c.rotation + c.tilingRotation
        );

        const translatedInterstices = intersticeShapesData.map((shape) => ({
          points: shape.points,
          color: shape.fill,
          stroke: shape.stroke,
          strokeWidth: shape.strokeWidth,
          zIndex: 2,
        }));

        shapes.push(...translatedInterstices);
      }
    });
  }

  // ─── PHASE 5 : RESULT ASSEMBLY (Result Assembly) ───

  // Explicit insertion of solid background as first element (lowest z-index)
  shapes.unshift({
    points: [
      { x: 0, y: 0 },
      { x: totalWidth, y: 0 },
      { x: totalWidth, y: totalHeight },
      { x: 0, y: totalHeight },
    ],
    color: c.colors.background,
    stroke: undefined,
    strokeWidth: 0,
    zIndex: 0,
  });

  // Cleanup: avoids graphics crashes if a mathematical calculation produces `NaN` or `Infinity`
  const validatedShapes = shapes.filter((shape) => {
    if (shape.path) return true;

    return (shape.points || []).every(
      (p) => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
    );
  });

  return {
    shapes: validatedShapes.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
    width: totalWidth,
    height: totalHeight,
    viewBox: `0 0 ${totalWidth} ${totalHeight}`,
    tileShapes: tileShapes.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
    tilePositions,
    tileSize,
    centerOffset: c.useWallpaperGroups || c.useAdvancedTiling,
    useSimpleTiling: !c.useWallpaperGroups && !c.useAdvancedTiling,
    backgroundColor: c.colors.background,
    intersticeShapes: intersticeShapes.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
    intersticePositions,
    intersticeScale: c.intersticeScale,
    skipLegacyShapes: shouldSkipShapesExpansion,
  };
}
/**
 * @file kaleidoscopeGeometry.tsx
 * @description Transformation engine for infinite mirror visual renders.
 * 
 * ─── WEDGE-BASED APPROACH (Wedge-based Approach) ───
 * Rather than redrawing all pattern vectors, this method is much
 * more performant: it uses pure SVG. It cuts out a triangular portion ("Wedge")
 * and clones this group (g) N times with affine transformations.
 * 
 * ASCII Wedge Diagram:
 *        * Center (cx, cy)
 *       / \ 
 *      /   \ 
 *     /_____\  <- Wedge (ClipPath)
 * 
 * The Transform Chain applied to each clone is:
 * 1. translate(cx, cy)   -> Moves origin to center
 * 2. rotate(angle)       -> Rotates according to segment (e.g., 30°, 60°, etc.)
 * 3. scale(sx, sy)       -> Performs mirroring (-1, 1) if necessary
 * 4. translate(-cx, -cy) -> Replaces pivot point
 */

import { PatternConfig, KaleidoscopeTileShape } from "./patternConfig";

export interface KaleidoscopeTransform {
  /** Rotation angle for this segment. */
  rotation: number;
  /** -1 to create optical mirror effect, 1 for normal. */
  scaleX: number;
  /** Always 1, reflection is on X axis. */
  scaleY: number;
  /** Segment identifier from 0 to N-1. */
  index: number;
}

/**
 * Generates the 1D matrix of all transformations
 * required to cover the 360 degrees of the kaleidoscope.
 * 
 * @param config Configuration containing the number of segments and mirror state
 * @returns An array of transformation definitions `KaleidoscopeTransform[]`
 */
export function getKaleidoscopeTransforms(config: PatternConfig): KaleidoscopeTransform[] {
  const transforms: KaleidoscopeTransform[] = [];
  
  if (!config.kaleidoscope) {
    return [];
  }

  const segments = config.kaleidoscopeSegments || 12;
  const baseRotation = config.kaleidoscopeRotation || 0;
  const mirror = config.kaleidoscopeMirror ?? true;

  const angleStep = 360 / segments;

  for (let i = 0; i < segments; i++) {
    const currentRotation = (i * angleStep) + baseRotation;
    
    // Inverts signs to create optical accordion effect (mirror)
    const isOdd = i % 2 !== 0;
    const shouldMirror = mirror && isOdd;

    transforms.push({
      index: i,
      rotation: currentRotation,
      scaleX: shouldMirror ? -1 : 1,
      scaleY: 1,
    });
  }

  return transforms;
}

/**
 * Calculates the SVG path limiting the visible space of a base segment.
 * Mathematically an infinite "pizza slice".
 * 
 * @param cx Vanishing center X
 * @param cy Vanishing center Y
 * @param radius Radius covering screen diagonal
 * @param segments Resolution (number of slices)
 * @returns String `d` for an SVG `<path>`.
 */
export function getKaleidoscopeWedgeClipPath(
  cx: number,
  cy: number,
  radius: number,
  segments: number
): string {
  const wedgeAngle = 360 / segments;
  
  // Angle 0 points east (right) in standard trigonometric coordinate system
  const angle1Rad = 0;
  const angle2Rad = (wedgeAngle * Math.PI) / 180;
  
  const x1 = cx + radius * Math.cos(angle1Rad);
  const y1 = cy + radius * Math.sin(angle1Rad);
  
  const x2 = cx + radius * Math.cos(angle2Rad);
  const y2 = cy + radius * Math.sin(angle2Rad);
  
  return `M ${cx},${cy} L ${x1},${y1} L ${x2},${y2} Z`;
}

/**
 * Converts the transformation metadata object to strict SVG "transform" attribute.
 * 
 * @param transform Data from `getKaleidoscopeTransforms`
 * @param cx Pivot X
 * @param cy Pivot Y
 * @returns Ex: "translate(100,100) rotate(45) scale(-1, 1) translate(-100,-100)"
 */
export function buildSegmentTransformString(
  transform: KaleidoscopeTransform,
  cx: number,
  cy: number
): string {
  const { rotation, scaleX, scaleY } = transform;
  
  return `translate(${cx},${cy}) rotate(${rotation}) scale(${scaleX}, ${scaleY}) translate(${-cx},${-cy})`;
}

/** Local geometric placement information for a repetition. */
export interface KaleidoscopeTileInfo {
  x: number;
  y: number;  
  clipPathD: string;
}

/** Definition of the giant grid (Pattern Tiling). */
export interface KaleidoscopeTileLayout {
  tiles: KaleidoscopeTileInfo[];
  totalWidth: number;
  totalHeight: number;
  repeatWidth: number;
  repeatHeight: number;
  repeatTiles: KaleidoscopeTileInfo[];
}

/**
 * Calculates the layout logic to repeat the kaleidoscopic star in a continuous grid
 * according to different shapes (square, honeycomb hexagon, diamond).
 * 
 * @param shape Chosen option ("square", "hexagon", "ogee", etc.)
 * @param patternWidth Base X dimension
 * @param patternHeight Base Y dimension
 * @param gridCount Repetition limit `N`
 */
export function computeKaleidoscopeTileLayout(
  shape: KaleidoscopeTileShape,
  patternWidth: number,
  patternHeight: number,
  gridCount: number
): KaleidoscopeTileLayout {
  const w = patternWidth;
  const h = patternHeight;
  const N = gridCount;

  switch (shape) {
    case "square": {
      const tiles: KaleidoscopeTileInfo[] = [];
      for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
          tiles.push({
            x: col * w,
            y: row * h,
            clipPathD: `M0,0 L${w},0 L${w},${h} L0,${h} Z`,
          });
        }
      }
      return {
        tiles,
        totalWidth: w * N,
        totalHeight: h * N,
        repeatWidth: w,
        repeatHeight: h,
        repeatTiles: [{ x: 0, y: 0, clipPathD: `M0,0 L${w},0 L${w},${h} L0,${h} Z` }],
      };
    }

    case "hexagon": {
      const R = Math.min(w, h) * 0.5;
      const hexW = Math.sqrt(3) * R;
      const hexH = 2 * R;
      const colSpacing = hexW;
      const rowSpacing = 1.5 * R;
      const totalWidth = N * w;
      const totalHeight = N * h;
      
      const angles = [-90, -30, 30, 90, 150, 210];
      const hexPoints = angles.map(angle => {
        const rad = (angle * Math.PI) / 180;
        return {
          x: w / 2 + R * Math.cos(rad),
          y: h / 2 + R * Math.sin(rad),
        };
      });
      const hexClipPath = `M${hexPoints.map(p => `${p.x},${p.y}`).join(" L")} Z`;
      
      const neededCols = Math.ceil(totalWidth / colSpacing) + 2;
      const neededRows = Math.ceil(totalHeight / rowSpacing) + 2;
      
      const tiles: KaleidoscopeTileInfo[] = [];
      for (let row = -1; row <= neededRows; row++) {
        const isOddRow = ((row % 2) + 2) % 2 === 1;
        const xOffset = isOddRow ? hexW / 2 : 0;
        
        for (let col = -1; col <= neededCols; col++) {
          tiles.push({
            x: col * colSpacing + xOffset,
            y: row * rowSpacing,
            clipPathD: hexClipPath,
          });
        }
      }
      
      return {
        tiles,
        totalWidth,
        totalHeight,
        repeatWidth: hexW,
        repeatHeight: 3 * R,
        repeatTiles: [
          { x: 0, y: 0, clipPathD: hexClipPath },
          { x: hexW / 2, y: 1.5 * R, clipPathD: hexClipPath },
        ],
      };
    }

    case "diamond": {
      const diamondClipPath = `M${w/2},0 L${w},${h/2} L${w/2},${h} L0,${h/2} Z`;
      const rowSpacing = h / 2;
      const totalWidth = N * w;
      const totalHeight = N * h;
      
      const neededRows = Math.ceil(totalHeight / rowSpacing) + 2;
      
      const tiles: KaleidoscopeTileInfo[] = [];
      for (let row = -1; row <= neededRows; row++) {
        const isOddRow = ((row % 2) + 2) % 2 === 1;
        const xOffset = isOddRow ? w / 2 : 0;
        const numCols = N + 2;
        
        for (let col = -1; col < numCols; col++) {
          tiles.push({
            x: col * w + xOffset,
            y: row * rowSpacing,
            clipPathD: diamondClipPath,
          });
        }
      }
      
      return {
        tiles,
        totalWidth,
        totalHeight,
        repeatWidth: w,
        repeatHeight: h,
        repeatTiles: [
          { x: 0, y: 0, clipPathD: diamondClipPath },
          { x: w / 2, y: h / 2, clipPathD: diamondClipPath },
        ],
      };
    }

    case "triangle": {
      const upTriangleClip = `M${w/2},0 L${w},${h} L0,${h} Z`;
      const downTriangleClip = `M0,0 L${w},0 L${w/2},${h} Z`;
      
      const tiles: KaleidoscopeTileInfo[] = [];
      for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
          const isUp = (row + col) % 2 === 0;
          tiles.push({
            x: col * w,
            y: row * h,
            clipPathD: isUp ? upTriangleClip : downTriangleClip,
          });
        }
      }
      
      return {
        tiles,
        totalWidth: N * w,
        totalHeight: N * h,
        repeatWidth: w,
        repeatHeight: h,
        repeatTiles: [
          { x: 0, y: 0, clipPathD: upTriangleClip },
          { x: w / 2, y: 0, clipPathD: downTriangleClip },
        ],
      };
    }

    case "circle": {
      const r = Math.min(w, h) / 2;
      const circleClipPath = `M${w/2-r},${h/2} A${r},${r} 0 1,1 ${w/2+r},${h/2} A${r},${r} 0 1,1 ${w/2-r},${h/2} Z`;
      
      const tiles: KaleidoscopeTileInfo[] = [];
      for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
          tiles.push({
            x: col * w,
            y: row * h,
            clipPathD: circleClipPath,
          });
        }
      }
      
      return {
        tiles,
        totalWidth: w * N,
        totalHeight: h * N,
        repeatWidth: w,
        repeatHeight: h,
        repeatTiles: [{ x: 0, y: 0, clipPathD: circleClipPath }],
      };
    }

    case "ogee": {
      // Moroccan arch via cubic beziers
      const ogeeClipPath = `M${w/2},0 C${w*0.85},${h*0.15} ${w},${h*0.5} ${w/2},${h} C0,${h*0.5} ${w*0.15},${h*0.15} ${w/2},0 Z`;
      
      const tiles: KaleidoscopeTileInfo[] = [];
      for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
          tiles.push({
            x: col * w,
            y: row * h,
            clipPathD: ogeeClipPath,
          });
        }
      }
      
      return {
        tiles,
        totalWidth: w * N,
        totalHeight: h * N,
        repeatWidth: w,
        repeatHeight: h,
        repeatTiles: [{ x: 0, y: 0, clipPathD: ogeeClipPath }],
      };
    }

    default:
      const tiles: KaleidoscopeTileInfo[] = [];
      for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
          tiles.push({
            x: col * w,
            y: row * h,
            clipPathD: `M0,0 L${w},0 L${w},${h} L0,${h} Z`,
          });
        }
      }
      return {
        tiles,
        totalWidth: w * N,
        totalHeight: h * N,
        repeatWidth: w,
        repeatHeight: h,
        repeatTiles: [{ x: 0, y: 0, clipPathD: `M0,0 L${w},0 L${w},${h} L0,${h} Z` }],
      };
  }
}
/**
 * @file tawriqPattern.tsx
 * @description Helper for generating the "Tawriq" (Foliage/Arabesque) pattern.
 * 
 * Tawriq is the biomorphic, vegetal branch of Islamic art. It utilizes spiraling, 
 * undulating vines and stylized leaves (palmettes, half-palmettes, and pinecones) 
 * to represent the infinite, life-giving nature of creation. 
 * This module uses recursive bezier curves to simulate the organic, flowing 
 * stems of traditional arabesques.
 */

import { Point, polarToCartesian } from "./geometryUtils";

export interface TawriqOptions {
  tawriqMotif: "arabesque" | "palmette" | "pinecone" | "mixed";
  tawriqDensity: number;
  tawriqCurvature: number;
  tawriqSymmetry: "none" | "x" | "y" | "xy" | "radial";
  tawriqFillLeaves: boolean;
  tawriqShowSpirals: boolean;
  tawriqStrokeVariation: number;
  tawriqStrokeMax: number;
}

const DEFAULT_OPTIONS: TawriqOptions = {
  tawriqMotif: "mixed",
  tawriqDensity: 5,
  tawriqCurvature: 0.7,
  tawriqSymmetry: "xy",
  tawriqFillLeaves: true,
  tawriqShowSpirals: true,
  tawriqStrokeVariation: 0.5,
  tawriqStrokeMax: 3,
};

/**
 * Linear interpolation helper
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Sample a point on a quadratic Bezier curve at parameter t
 */
function sampleQuadraticBezier(
  start: Point,
  control: Point,
  end: Point,
  t: number
): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x,
    y: mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y,
  };
}

/**
 * Get tangent vector on a quadratic Bezier curve at parameter t
 */
function getTangentQuadraticBezier(
  start: Point,
  control: Point,
  end: Point,
  t: number
): Point {
  const mt = 1 - t;
  return {
    x: 2 * mt * (control.x - start.x) + 2 * t * (end.x - control.x),
    y: 2 * mt * (control.y - start.y) + 2 * t * (end.y - control.y),
  };
}

/**
 * Normalize a vector
 */
function normalize(v: Point): Point {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len < 0.0001) return { x: 0, y: 1 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * Convert a sequence of points into a smooth SVG path using Catmull-Rom spline logic converted to Cubic Bezier
 */
function smoothPathFromPoints(points: Point[]): string {
  if (points.length < 2) return "";

  // Duplicate start and end points to handle open curves correctly with Catmull-Rom logic
  // Or handle endpoints specifically. A simpler approach for smoothing polygon points:
  // We treat it as a sequence of segments.

  // Using a simplified Catmull-Rom to Cubic Bezier conversion
  // For segment P1 -> P2, we use P0 and P3 as control guides.
  // P0 -> P1 -> P2 -> P3
  
  let d = "";

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    if (i === 0) {
      d += `M ${p1.x},${p1.y}`;
    }

    // Catmull-Rom to Cubic Bezier conversion matrix constants
    // CP1 = P1 + (P2 - P0) / 6
    // CP2 = P2 - (P3 - P1) / 6
    
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return d;
}

/**
 * Create a calligraphic stroke path with variable thickness.
 * Converts a quadratic bezier curve into a filled outline with thickness
 * varying based on the tangent angle (thick when vertical, thin when horizontal).
 */
function createCalligraphicStroke(
  start: Point,
  control: Point,
  end: Point,
  minWidth: number,
  maxWidth: number,
  variation: number,
  fillColor: string
): {
  path: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
} {
  const segments = 20; // Increased segments for smoother sampling
  const leftPoints: Point[] = [];
  const rightPoints: Point[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = sampleQuadraticBezier(start, control, end, t);
    const tangent = getTangentQuadraticBezier(start, control, end, t);
    const tangentAngle = Math.atan2(tangent.y, tangent.x);

    // Calculate thickness factor based on tangent angle
    // abs(sin(angle)) gives 1 when vertical (thick), 0 when horizontal (thin)
    const thicknessFactor = lerp(
      1.0,
      Math.abs(Math.sin(tangentAngle)),
      variation
    );
    const localThickness = lerp(minWidth, maxWidth, thicknessFactor);

    // Calculate normal (perpendicular to tangent)
    const norm = normalize(tangent);
    const normal = { x: -norm.y, y: norm.x };

    // Offset points on both sides
    const halfThickness = localThickness / 2;
    leftPoints.push({
      x: point.x + normal.x * halfThickness,
      y: point.y + normal.y * halfThickness,
    });
    rightPoints.push({
      x: point.x - normal.x * halfThickness,
      y: point.y - normal.y * halfThickness,
    });
  }

  // Build the closed path using smooth curves
  // Left side: start to end
  const leftPath = smoothPathFromPoints(leftPoints);
  
  // Right side: end to start (reverse points)
  const rightPointsReversed = [...rightPoints].reverse();
  const rightPath = smoothPathFromPoints(rightPointsReversed);
  
  // Extract just the curve commands from rightPath (remove the initial M)
  const rightPathCmds = rightPath.replace(/^M [^C]+/, " L"); 
  // Note: we use L to connect the end of left path to start of right path, then curves.
  // Actually smoothPathFromPoints starts with M. We want to connect them.
  // The end of leftPath is the last point of leftPoints.
  // The start of rightPath is the last point of rightPoints (which is first in reversed array).
  // We can construct manually to be safe.

  let pathData = leftPath;
  
  // Connect to the start of the return path
  // The `smoothPathFromPoints` generates "M p1 C ...". We want "L p1 C ..." effectively for the second part.
  // But we need to use the curve logic.
  
  // Let's reuse the logic inside but append
  const rightPointsRev = [...rightPoints].reverse();
  
  for (let i = 0; i < rightPointsRev.length - 1; i++) {
    const p0 = rightPointsRev[Math.max(0, i - 1)];
    const p1 = rightPointsRev[i];
    const p2 = rightPointsRev[i + 1];
    const p3 = rightPointsRev[Math.min(rightPointsRev.length - 1, i + 2)];

    if (i === 0) {
      // Connect to the first point of the return path
      pathData += ` L ${p1.x},${p1.y}`;
    }

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathData += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  pathData += " Z";

  return {
    path: pathData,
    fill: fillColor,
    stroke: "none",
    strokeWidth: 0,
  };
}

/**
 * Calculate average stroke width for decorative elements based on angle
 */
function calculateDecorativeStrokeWidth(
  angle: number,
  minWidth: number,
  maxWidth: number,
  variation: number
): number {
  const rad = (angle * Math.PI) / 180;
  const thicknessFactor = lerp(1.0, Math.abs(Math.sin(rad)), variation);
  return lerp(minWidth, maxWidth, thicknessFactor);
}

/**
 * Generates a "Tawriq" (Floral/Vegetal) pattern tile.
 * Features flowing arabesques, palmettes, and pinecone motifs.
 */
export function generateTawriqTile(
  size: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: Partial<TawriqOptions> = {}
): Array<{
  points?: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
}> {
  const {
    tawriqMotif,
    tawriqDensity,
    tawriqCurvature,
    tawriqSymmetry,
    tawriqFillLeaves,
    tawriqShowSpirals,
    tawriqStrokeVariation,
    tawriqStrokeMax,
  } = { ...DEFAULT_OPTIONS, ...options };

  const shapes: Array<{
    points?: Point[];
    fill: string;
    stroke: string;
    strokeWidth: number;
    path?: string;
  }> = [];

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.45;

  // Calculate calligraphic stroke parameters
  const useCalligraphicStroke = tawriqStrokeVariation > 0;
  const minStrokeWidth = lineWidth * 0.3;
  const maxStrokeWidth = tawriqStrokeMax;

  // --- Helper Functions ---

  // Generate a cubic bezier curve string
  const curveTo = (cp1: Point, cp2: Point, end: Point) => {
    return `C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end.x},${end.y}`;
  };

  // Generate a quadratic bezier curve string
  const quadTo = (cp: Point, end: Point) => {
    return `Q ${cp.x},${cp.y} ${end.x},${end.y}`;
  };

  // Create a leaf/palmette shape
  const createPalmette = (
    x: number,
    y: number,
    scale: number,
    angle: number,
    color: string
  ) => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const transform = (px: number, py: number) => {
      const rx = px * cos - py * sin;
      const ry = px * sin + py * cos;
      return { x: x + rx, y: y + ry };
    };

    // Re-implementing with transformed points for the path
    const p0 = transform(0, 0);
    const p1 = transform(scale * 0.5, -scale * 0.2);
    const p2 = transform(scale * 0.8, -scale * 0.1);
    const p3 = transform(scale, 0);
    const p4 = transform(scale * 0.8, scale * 0.1);
    const p5 = transform(scale * 0.5, scale * 0.2);

    // Side lobe top
    const s1_start = transform(scale * 0.2, 0);
    const s1_cp1 = transform(scale * 0.4, -scale * 0.4);
    const s1_cp2 = transform(scale * 0.6, -scale * 0.5);
    const s1_end = transform(scale * 0.7, -scale * 0.3);
    const s1_ret_cp1 = transform(scale * 0.5, -scale * 0.2);
    const s1_ret_cp2 = transform(scale * 0.3, -scale * 0.1);

    // Side lobe bottom
    const s2_start = transform(scale * 0.2, 0);
    const s2_cp1 = transform(scale * 0.4, scale * 0.4);
    const s2_cp2 = transform(scale * 0.6, scale * 0.5);
    const s2_end = transform(scale * 0.7, scale * 0.3);
    const s2_ret_cp1 = transform(scale * 0.5, scale * 0.2);
    const s2_ret_cp2 = transform(scale * 0.3, scale * 0.1);

    let d = `M ${p0.x},${p0.y} ${curveTo(p1, p2, p3)} ${curveTo(p4, p5, p0.x === p0.x ? p0 : p0)}`; // Main leaf
    d += ` M ${s1_start.x},${s1_start.y} ${curveTo(s1_cp1, s1_cp2, s1_end)} ${curveTo(s1_ret_cp1, s1_ret_cp2, s1_start)}`; // Top lobe
    d += ` M ${s2_start.x},${s2_start.y} ${curveTo(s2_cp1, s2_cp2, s2_end)} ${curveTo(s2_ret_cp1, s2_ret_cp2, s2_start)}`; // Bottom lobe

    // Calculate stroke width for decoration based on angle
    const decorativeStrokeWidth = useCalligraphicStroke
      ? calculateDecorativeStrokeWidth(
          angle,
          minStrokeWidth,
          maxStrokeWidth,
          tawriqStrokeVariation
        )
      : lineWidth;

    shapes.push({
      path: d,
      fill: tawriqFillLeaves ? color : "none",
      stroke: colors.line,
      strokeWidth: decorativeStrokeWidth,
    });
  };

  // Create a pinecone/teardrop shape
  const createPinecone = (
    x: number,
    y: number,
    scale: number,
    angle: number,
    color: string
  ) => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const transform = (px: number, py: number) => {
      const rx = px * cos - py * sin;
      const ry = px * sin + py * cos;
      return { x: x + rx, y: y + ry };
    };

    const pBase = transform(0, 0);
    const pTip = transform(scale, 0);
    const pTopCp = transform(scale * 0.5, -scale * 0.4);
    const pBotCp = transform(scale * 0.5, scale * 0.4);

    // Inner details (scales)
    const pInnerBase = transform(scale * 0.2, 0);
    const pInnerTip = transform(scale * 0.8, 0);
    const pInnerTopCp = transform(scale * 0.5, -scale * 0.2);
    const pInnerBotCp = transform(scale * 0.5, scale * 0.2);

    let d = `M ${pBase.x},${pBase.y} ${quadTo(pTopCp, pTip)} ${quadTo(pBotCp, pBase)}`;

    // Add inner detail if filled
    if (tawriqFillLeaves) {
      d += ` M ${pInnerBase.x},${pInnerBase.y} ${quadTo(pInnerTopCp, pInnerTip)} ${quadTo(pInnerBotCp, pInnerBase)}`;
    }

    // Calculate stroke width for decoration based on angle
    const decorativeStrokeWidth = useCalligraphicStroke
      ? calculateDecorativeStrokeWidth(
          angle,
          minStrokeWidth,
          maxStrokeWidth,
          tawriqStrokeVariation
        )
      : lineWidth;

    shapes.push({
      path: d,
      fill: tawriqFillLeaves ? color : "none",
      stroke: colors.line,
      strokeWidth: decorativeStrokeWidth,
    });
  };

  // --- Main Generation Logic ---

  const generateSector = (
    rotationOffset: number,
    mirrorX: boolean,
    mirrorY: boolean
  ) => {
    // Base transformation for symmetry
    const transformPoint = (p: Point): Point => {
      let x = p.x;
      let y = p.y;

      if (mirrorX) x = centerX - (x - centerX);
      if (mirrorY) y = centerY - (y - centerY);

      return { x, y };
    };

    // We generate one "branch" of the arabesque
    // Start from near center
    const startX = centerX;
    const startY = centerY;

    // Initial angle depends on sector
    const baseAngle = rotationOffset;

    // Generate the vine structure
    const queue: Array<{
      x: number;
      y: number;
      len: number;
      ang: number;
      d: number;
    }> = [
      {
        x: startX,
        y: startY,
        len: radius * 0.5,
        ang: baseAngle,
        d: Math.min(tawriqDensity, 5),
      },
    ];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.d <= 0) continue;

      const rad = (curr.ang * Math.PI) / 180;

      // Calculate curve points in local space
      const endX = curr.x + Math.cos(rad) * curr.len;
      const endY = curr.y + Math.sin(rad) * curr.len;

      // Control point
      const cpDist = curr.len * tawriqCurvature;
      // Alternate curve direction based on depth for S-curve effect
      const curveDir = curr.d % 2 === 0 ? 1 : -1;
      const cpAngle = rad + curveDir * (Math.PI / 3); // 60 degrees

      const cpX = curr.x + Math.cos(cpAngle) * cpDist;
      const cpY = curr.y + Math.sin(cpAngle) * cpDist;

      // Transform points for symmetry
      const pStart = transformPoint({ x: curr.x, y: curr.y });
      const pEnd = transformPoint({ x: endX, y: endY });
      const pCp = transformPoint({ x: cpX, y: cpY });

      // Add vine segment with calligraphic stroke if enabled
      if (useCalligraphicStroke) {
        const calligraphicShape = createCalligraphicStroke(
          pStart,
          pCp,
          pEnd,
          minStrokeWidth,
          maxStrokeWidth,
          tawriqStrokeVariation,
          colors.line
        );
        shapes.push(calligraphicShape);
      } else {
        shapes.push({
          path: `M ${pStart.x},${pStart.y} Q ${pCp.x},${pCp.y} ${pEnd.x},${pEnd.y}`,
          fill: "none",
          stroke: colors.line,
          strokeWidth: lineWidth,
        });
      }

      // Add decoration at end
      const motifType =
        tawriqMotif === "mixed"
          ? curr.d % 2 === 0
            ? "palmette"
            : "pinecone"
          : tawriqMotif;

      // Calculate rotation for decoration
      const dx = pEnd.x - pStart.x;
      const dy = pEnd.y - pStart.y;
      const trueAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

      if (motifType === "palmette") {
        createPalmette(pEnd.x, pEnd.y, curr.len * 0.4, trueAngle, colors.primary);
      } else if (motifType === "pinecone") {
        createPinecone(pEnd.x, pEnd.y, curr.len * 0.4, trueAngle, colors.secondary);
      } else if (motifType === "arabesque") {
        // Just a small leaf for pure arabesque
        createPalmette(pEnd.x, pEnd.y, curr.len * 0.2, trueAngle, colors.accent);
      }

      // Branch out
      if (curr.d > 1) {
        const newLen = curr.len * 0.75;
        // Branch angles relative to current direction
        queue.push({
          x: endX,
          y: endY,
          len: newLen,
          ang: curr.ang + 45,
          d: curr.d - 1,
        });

        if (tawriqShowSpirals) {
          queue.push({
            x: endX,
            y: endY,
            len: newLen * 0.8,
            ang: curr.ang - 60,
            d: curr.d - 1,
          });
        }
      }
    }
  };

  // --- Apply Symmetry ---

  if (tawriqSymmetry === "none") {
    generateSector(45, false, false);
  } else if (tawriqSymmetry === "x") {
    generateSector(45, false, false);
    generateSector(45, true, false); // Mirror X
  } else if (tawriqSymmetry === "y") {
    generateSector(45, false, false);
    generateSector(45, false, true); // Mirror Y
  } else if (tawriqSymmetry === "xy") {
    generateSector(45, false, false);
    generateSector(45, true, false);
    generateSector(45, false, true);
    generateSector(45, true, true);
  } else if (tawriqSymmetry === "radial") {
    const sectors = 6;
    for (let i = 0; i < sectors; i++) {
      const angleOffset = (i * 360) / sectors;

      const queue: Array<{
        x: number;
        y: number;
        len: number;
        ang: number;
        d: number;
      }> = [
        {
          x: centerX,
          y: centerY,
          len: radius * 0.5,
          ang: angleOffset,
          d: Math.min(tawriqDensity, 4),
        },
      ];

      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (curr.d <= 0) continue;

        const rad = (curr.ang * Math.PI) / 180;
        const endX = curr.x + Math.cos(rad) * curr.len;
        const endY = curr.y + Math.sin(rad) * curr.len;

        const cpDist = curr.len * tawriqCurvature;
        const curveDir = curr.d % 2 === 0 ? 1 : -1;
        const cpAngle = rad + curveDir * (Math.PI / 3);

        const cpX = curr.x + Math.cos(cpAngle) * cpDist;
        const cpY = curr.y + Math.sin(cpAngle) * cpDist;

        // Add vine segment with calligraphic stroke if enabled
        if (useCalligraphicStroke) {
          const calligraphicShape = createCalligraphicStroke(
            { x: curr.x, y: curr.y },
            { x: cpX, y: cpY },
            { x: endX, y: endY },
            minStrokeWidth,
            maxStrokeWidth,
            tawriqStrokeVariation,
            colors.line
          );
          shapes.push(calligraphicShape);
        } else {
          shapes.push({
            path: `M ${curr.x},${curr.y} Q ${cpX},${cpY} ${endX},${endY}`,
            fill: "none",
            stroke: colors.line,
            strokeWidth: lineWidth,
          });
        }

        const motifType =
          tawriqMotif === "mixed"
            ? curr.d % 2 === 0
              ? "palmette"
              : "pinecone"
            : tawriqMotif;

        if (motifType === "palmette") {
          createPalmette(endX, endY, curr.len * 0.4, curr.ang, colors.primary);
        } else if (motifType === "pinecone") {
          createPinecone(endX, endY, curr.len * 0.4, curr.ang, colors.secondary);
        } else if (motifType === "arabesque") {
          createPalmette(endX, endY, curr.len * 0.2, curr.ang, colors.accent);
        }

        if (curr.d > 1) {
          const newLen = curr.len * 0.75;
          queue.push({
            x: endX,
            y: endY,
            len: newLen,
            ang: curr.ang + 45,
            d: curr.d - 1,
          });
          if (tawriqShowSpirals) {
            queue.push({
              x: endX,
              y: endY,
              len: newLen * 0.8,
              ang: curr.ang - 60,
              d: curr.d - 1,
            });
          }
        }
      }
    }
  }

  return shapes;
}
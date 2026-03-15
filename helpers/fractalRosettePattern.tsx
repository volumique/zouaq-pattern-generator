/**
 * @file fractalRosettePattern.tsx
 * @description Helper for generating recursive fractal rosette patterns.
 * 
 * This module implements a recursive geometric algorithm where smaller rosettes 
 * are placed at the tips of a larger parent rosette. 
 * 
 * It employs a painter's algorithm z-ordering approach: deeper (smaller) levels 
 * of the recursion are drawn first (lower z-index), allowing the main, larger 
 * parent structures to overlay them cleanly without being occluded.
 */

import { Point, polarToCartesian, createRoundedPolygonPath } from "./geometryUtils";

export interface FractalRosetteOptions {
  size: number;
  branches: number;
  depth: number;
  scaleFactor: number;
  innerRadiusRatio: number;
  rotation: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  };
  lineWidth: number;
  starRounding?: number;
}

interface ShapeWithDepth {
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
  depth: number;
}

/**
 * Generates a fractal rosette pattern where smaller rosettes are recursively placed at the tips of the parent rosette.
 *
 * @param size - Total size of the tile (width/height)
 * @param branches - Number of branches for the star/rosette (N)
 * @param depth - Recursion depth (1-4). 1 means just the central star.
 * @param scaleFactor - Scaling factor for child rosettes (e.g. 0.5 means half size)
 * @param innerRadiusRatio - Ratio of inner radius to outer radius for the star shape (0-1)
 * @param rotation - Base rotation angle in degrees
 * @param colors - Color palette
 * @param lineWidth - Stroke width for the shapes
 * @param starRounding - Optional rounding factor (0-1) for the star corners
 * @returns Array of shape objects sorted by z-index (deeper levels first)
 */
export function generateFractalRosetteTile(
  size: number,
  branches: number,
  depth: number,
  scaleFactor: number,
  innerRadiusRatio: number,
  rotation: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  starRounding: number = 0
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
}> {
  const allShapes: ShapeWithDepth[] = [];
  const center = { x: size / 2, y: size / 2 };

  // Calculate initial radius.
  // We want the entire fractal to fit within 'size'.
  // A geometric series approximation suggests that if scale < 1, the limit is finite.
  // For scale=0.5, the total extent is roughly R * (1 + 0.5 + 0.25...) = 2R.
  // So R should be roughly size / 4 to be safe and centered with margin.
  // However, to maximize usage of space, we can be a bit more aggressive.
  // Let's use size * 0.25 as the base radius.
  const initialRadius = size * 0.25;

  // Color palette for cycling through depths
  const palette = [colors.primary, colors.secondary, colors.accent, colors.background];

  /**
   * Recursive function to generate rosettes
   * @param cx Center X
   * @param cy Center Y
   * @param r Current radius (outer radius of the star)
   * @param currentDepth Current recursion depth (0-indexed)
   * @param currentRotation Rotation for this star
   */
  function recurse(
    cx: number,
    cy: number,
    r: number,
    currentDepth: number,
    currentRotation: number
  ) {
    if (currentDepth >= depth) return;

    // 1. Generate the star points for the current level
    const starPoints: Point[] = [];
    const angleStep = 360 / branches;
    const innerRadius = r * innerRadiusRatio;

    // We generate points manually here instead of using generateStarShape
    // because we need the raw points guaranteed, and we need to know the tip positions exactly.
    for (let i = 0; i < branches; i++) {
      // Outer point (Tip)
      const outerAngle = i * angleStep + currentRotation;
      starPoints.push(polarToCartesian(cx, cy, r, outerAngle));

      // Inner point (Valley)
      const innerAngle = (i + 0.5) * angleStep + currentRotation;
      starPoints.push(polarToCartesian(cx, cy, innerRadius, innerAngle));
    }

    // 2. Create the shape object
    let path: string | undefined;
    if (starRounding > 0) {
      path = createRoundedPolygonPath(starPoints, starRounding);
    }

    allShapes.push({
      points: starPoints,
      path: path,
      fill: palette[currentDepth % palette.length],
      stroke: colors.line,
      strokeWidth: lineWidth,
      depth: currentDepth,
    });

    // 3. Recurse for children
    // Children are placed at the tips (even indices of starPoints)
    for (let i = 0; i < branches; i++) {
      // The tip is the 2*i-th point in our starPoints array
      const tipIndex = i * 2;
      const tipPoint = starPoints[tipIndex];

      // Calculate rotation for the child.
      // To create a radial "snowflake" effect, the child should be oriented
      // along the radial vector. The tip angle is exactly that vector's angle.
      // So we pass the tip's angle as the new base rotation.
      const tipAngle = i * angleStep + currentRotation;

      recurse(
        tipPoint.x,
        tipPoint.y,
        r * scaleFactor,
        currentDepth + 1,
        tipAngle
      );
    }
  }

  // Start recursion
  recurse(center.x, center.y, initialRadius, 0, rotation);

  // Sort shapes by depth descending (deeper levels first)
  // This means the smallest stars (highest depth) are drawn first (at the bottom),
  // and the largest central star (depth 0) is drawn last (on top).
  allShapes.sort((a, b) => b.depth - a.depth);

  // Return shapes without the internal 'depth' property
  return allShapes.map(({ depth: _, ...shape }) => shape);
}
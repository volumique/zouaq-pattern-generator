/**
 * @file starShapeGenerator.tsx
 * @description Primitive generator for Islamic star polygons and rosettes.
 * 
 * There is a geometric distinction between:
 * - Star Shapes: Defined by alternating inner (valleys) and outer (peaks) radii, 
 *   forming a single continuous spiky polygon.
 * - Rosette Shapes: Defined by distinct, often abutting or slightly overlapping 
 *   "petals" that radiate from a center point.
 */

import { Point, polarToCartesian, createRoundedPolygonPath } from "./geometryUtils";

export interface StarShapeResult {
  points?: Point[];
  path?: string;
}

/**
 * Generates a proper star polygon with alternating outer and inner radii.
 * This creates a true star shape with points and valleys, not triangular petals.
 * 
 * @param centerX - X coordinate of center
 * @param centerY - Y coordinate of center
 * @param outerRadius - Radius to the star points (peaks)
 * @param innerRadius - Radius to the valleys between points
 * @param points - Number of star points (branches)
 * @param rotationOffset - Rotation offset in degrees
 * @param rounding - Rounding factor (0-1): 0 = sharp, 1 = fully rounded
 * @returns Object with either points array or SVG path string
 */
export function generateStarShape(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  points: number,
  rotationOffset: number = 0,
  rounding: number = 0
): StarShapeResult {
  const starPoints: Point[] = [];
  const angleStep = 360 / points;

  for (let i = 0; i < points; i++) {
    // Outer point (peak)
    const outerAngle = i * angleStep + rotationOffset;
    starPoints.push(
      polarToCartesian(centerX, centerY, outerRadius, outerAngle)
    );

    // Inner point (valley)
    const innerAngle = (i + 0.5) * angleStep + rotationOffset;
    starPoints.push(
      polarToCartesian(centerX, centerY, innerRadius, innerAngle)
    );
  }

  // If no rounding, return points as before
  if (rounding === 0) {
    return { points: starPoints };
  }

  // Use universal rounding function with finer control
  const roundedPath = createRoundedPolygonPath(starPoints, rounding);
  return { path: roundedPath };
}

/**
 * Generates a rosette pattern (petal-style star) with colored segments
 * This is the traditional Zellige/Zouaq style with radiating petals
 * 
 * @param centerX - X coordinate of center
 * @param centerY - Y coordinate of center
 * @param radius - Radius of the rosette
 * @param petals - Number of petals
 * @param colors - Array of colors to cycle through
 * @param rotationOffset - Rotation offset in degrees
 * @returns Array of petal shapes with colors
 */
export function generateRosetteShape(
  centerX: number,
  centerY: number,
  radius: number,
  petals: number,
  colors: string[],
  rotationOffset: number = 0
): Array<{ points: Point[]; color: string }> {
  const shapes: Array<{ points: Point[]; color: string }> = [];
  const angleStep = 360 / petals;

  for (let i = 0; i < petals; i++) {
    const angle1 = i * angleStep + rotationOffset;
    const angle2 = (i + 1) * angleStep + rotationOffset;
    
    const p1 = polarToCartesian(centerX, centerY, radius, angle1);
    const p2 = polarToCartesian(centerX, centerY, radius, angle2);
    
    shapes.push({
      points: [
        { x: centerX, y: centerY },
        p1,
        p2,
      ],
      color: colors[i % colors.length],
    });
  }

  return shapes;
}
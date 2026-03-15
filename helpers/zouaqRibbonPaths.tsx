/**
 * @file zouaqRibbonPaths.tsx
 * @description Ribbon and interlace path generation.
 * 
 * This module is responsible for converting 1D mathematical line segments into 
 * 2D visual ribbons or straps. These ribbons are the building blocks of the 
 * over-under interlace effect seen in Zouaq painted wood patterns.
 */

import { Point } from "./geometryUtils";

export type ZouaqRibbonEnd = "flat" | "rounded" | "pointed" | "circle";

/**
 * Converts a line segment into a ribbon with the specified end style.
 * Returns either points (for flat) or a path string (for other styles).
 */
export function lineToRibbonPath(
  p1: Point,
  p2: Point,
  width: number,
  ribbonEnd: ZouaqRibbonEnd
): { points?: Point[]; path?: string } {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    // For zero-length ribbons, return a circle if needed
    if (ribbonEnd === "circle") {
      const radius = width / 2;
      return {
        path: `M ${p1.x - radius},${p1.y} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0 Z`
      };
    }
    return { points: [p1, p1, p1, p1] };
  }

  const nx = -dy / length;
  const ny = dx / length;
  const halfW = width / 2;

  // Base rectangle corners
  const corner1 = { x: p1.x + nx * halfW, y: p1.y + ny * halfW };
  const corner2 = { x: p2.x + nx * halfW, y: p2.y + ny * halfW };
  const corner3 = { x: p2.x - nx * halfW, y: p2.y - ny * halfW };
  const corner4 = { x: p1.x - nx * halfW, y: p1.y - ny * halfW };

  if (ribbonEnd === "flat") {
    return {
      points: [corner1, corner2, corner3, corner4]
    };
  }

  if (ribbonEnd === "rounded") {
    // Rectangle with semicircular ends
    const radius = halfW;
    
    // Calculate the direction vector (unit)
    const ux = dx / length;
    const uy = dy / length;
    
    // Start cap center (moved inward by radius)
    const startCapCenter = { x: p1.x + ux * radius, y: p1.y + uy * radius };
    // End cap center (moved inward by radius)
    const endCapCenter = { x: p2.x - ux * radius, y: p2.y - uy * radius };
    
    // Rectangle corners (adjusted for cap inset)
    const rect1 = { x: startCapCenter.x + nx * halfW, y: startCapCenter.y + ny * halfW };
    const rect2 = { x: endCapCenter.x + nx * halfW, y: endCapCenter.y + ny * halfW };
    const rect3 = { x: endCapCenter.x - nx * halfW, y: endCapCenter.y - ny * halfW };
    const rect4 = { x: startCapCenter.x - nx * halfW, y: startCapCenter.y - ny * halfW };
    
    // Angle of the ribbon direction in degrees
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Start cap: semicircle on the p1 side
    // We want the arc from rect4 to rect1 going around p1
    const startArcSweep = 1; // Sweep flag for the outer arc
    
    // End cap: semicircle on the p2 side
    // We want the arc from rect2 to rect3 going around p2
    const endArcSweep = 1;
    
    return {
      path: `M ${rect4.x},${rect4.y} ` +
            `A ${radius},${radius} 0 0,${startArcSweep} ${rect1.x},${rect1.y} ` +
            `L ${rect2.x},${rect2.y} ` +
            `A ${radius},${radius} 0 0,${endArcSweep} ${rect3.x},${rect3.y} ` +
            `L ${rect4.x},${rect4.y} Z`
    };
  }

  if (ribbonEnd === "pointed") {
    // Rectangle with triangular pointed ends
    const ux = dx / length;
    const uy = dy / length;
    
    // Points extend by halfW in the direction of the line
    const p1Tip = { x: p1.x - ux * halfW, y: p1.y - uy * halfW };
    const p2Tip = { x: p2.x + ux * halfW, y: p2.y + uy * halfW };
    
    return {
      path: `M ${p1Tip.x},${p1Tip.y} ` +
            `L ${corner1.x},${corner1.y} ` +
            `L ${corner2.x},${corner2.y} ` +
            `L ${p2Tip.x},${p2Tip.y} ` +
            `L ${corner3.x},${corner3.y} ` +
            `L ${corner4.x},${corner4.y} ` +
            `Z`
    };
  }

  if (ribbonEnd === "circle") {
    // Circles at both ends connected by a rectangle
    const radius = halfW;
    
    // Move the rectangle inward by radius on each side
    const ux = dx / length;
    const uy = dy / length;
    
    const startCircleCenter = p1;
    const endCircleCenter = p2;
    
    // Rectangle connecting the circles
    const rect1 = { x: p1.x + nx * halfW, y: p1.y + ny * halfW };
    const rect2 = { x: p2.x + nx * halfW, y: p2.y + ny * halfW };
    const rect3 = { x: p2.x - nx * halfW, y: p2.y - ny * halfW };
    const rect4 = { x: p1.x - nx * halfW, y: p1.y - ny * halfW };
    
    // Two circles + rectangle
    // Start circle
    const startCirclePath = `M ${startCircleCenter.x - radius},${startCircleCenter.y} ` +
                           `a ${radius},${radius} 0 1,0 ${radius * 2},0 ` +
                           `a ${radius},${radius} 0 1,0 -${radius * 2},0 Z`;
    
    // End circle  
    const endCirclePath = `M ${endCircleCenter.x - radius},${endCircleCenter.y} ` +
                         `a ${radius},${radius} 0 1,0 ${radius * 2},0 ` +
                         `a ${radius},${radius} 0 1,0 -${radius * 2},0 Z`;
    
    // Rectangle
    const rectPath = `M ${rect1.x},${rect1.y} ` +
                    `L ${rect2.x},${rect2.y} ` +
                    `L ${rect3.x},${rect3.y} ` +
                    `L ${rect4.x},${rect4.y} Z`;
    
    // Combine all three shapes
    return {
      path: `${rectPath} ${startCirclePath} ${endCirclePath}`
    };
  }

  // Fallback to flat
  return {
    points: [corner1, corner2, corner3, corner4]
  };
}
/**
 * @file intersticeGenerator.tsx
 * @description Generates decorative fill shapes for pattern interstices.
 * 
 * In geometric tessellations, repeating a primary motif (like an octagon) 
 * often leaves secondary empty spaces (interstices or 'gaps') between them.
 * This module provides specific, scaled secondary shapes (like an 8-pointed star, 
 * diamond, or cross) designed perfectly to plug these negative spaces, 
 * completing the seamless tiling.
 */

import { Point } from "./geometryUtils";
import { polarToCartesian } from "./geometryUtils";

export type IntersticeType = "same" | "star8" | "star12" | "diamond" | "cross";

export interface IntersticeShape {
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
}

/**
 * Generates a simple star shape for interstices
 */
function generateSimpleStar(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  branches: number,
  rotation: number
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < branches * 2; i++) {
    const angle = (i * 360) / (branches * 2) + rotation;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push(polarToCartesian(centerX, centerY, radius, angle));
  }
  return points;
}

/**
 * Generates a diamond shape
 */
function generateDiamond(
  centerX: number,
  centerY: number,
  size: number,
  rotation: number
): Point[] {
  return [
    polarToCartesian(centerX, centerY, size, 270 + rotation),
    polarToCartesian(centerX, centerY, size, 0 + rotation),
    polarToCartesian(centerX, centerY, size, 90 + rotation),
    polarToCartesian(centerX, centerY, size, 180 + rotation),
  ];
}

/**
 * Generates a cross shape
 */
function generateCross(
  centerX: number,
  centerY: number,
  size: number,
  rotation: number
): Point[] {
  const thickness = size * 0.3;
  const halfSize = size;
  const halfThickness = thickness / 2;

  // Create cross by defining 12 points
  const points: Point[] = [
    { x: centerX - halfThickness, y: centerY - halfSize },
    { x: centerX + halfThickness, y: centerY - halfSize },
    { x: centerX + halfThickness, y: centerY - halfThickness },
    { x: centerX + halfSize, y: centerY - halfThickness },
    { x: centerX + halfSize, y: centerY + halfThickness },
    { x: centerX + halfThickness, y: centerY + halfThickness },
    { x: centerX + halfThickness, y: centerY + halfSize },
    { x: centerX - halfThickness, y: centerY + halfSize },
    { x: centerX - halfThickness, y: centerY + halfThickness },
    { x: centerX - halfSize, y: centerY + halfThickness },
    { x: centerX - halfSize, y: centerY - halfThickness },
    { x: centerX - halfThickness, y: centerY - halfThickness },
  ];

  // Apply rotation if needed
  if (rotation !== 0) {
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return points.map((p) => {
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      return {
        x: centerX + dx * cos - dy * sin,
        y: centerY + dx * sin + dy * cos,
      };
    });
  }

  return points;
}

/**
 * Generates an interstice shape based on type
 */
export function generateIntersticeShape(
  centerX: number,
  centerY: number,
  size: number,
  type: IntersticeType,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    line: string;
  },
  lineWidth: number,
  rotation: number = 0
): IntersticeShape[] {
  const shapes: IntersticeShape[] = [];

  switch (type) {
    case "star8": {
      const points = generateSimpleStar(
        centerX,
        centerY,
        size,
        size * 0.4,
        8,
        rotation
      );
      shapes.push({
        points,
        fill: colors.accent,
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
      break;
    }

    case "star12": {
      const points = generateSimpleStar(
        centerX,
        centerY,
        size,
        size * 0.4,
        12,
        rotation
      );
      shapes.push({
        points,
        fill: colors.secondary,
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
      break;
    }

    case "diamond": {
      const points = generateDiamond(centerX, centerY, size, rotation);
      shapes.push({
        points,
        fill: colors.accent,
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
      break;
    }

    case "cross": {
      const points = generateCross(centerX, centerY, size, rotation);
      shapes.push({
        points,
        fill: colors.primary,
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
      break;
    }

    case "same":
      // This case is handled by the caller using the main pattern
      break;
  }

  return shapes;
}
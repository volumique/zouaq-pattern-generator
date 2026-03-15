/**
 * @file rosettePattern.tsx
 * @description Helper for generating concentric rosette patterns.
 * 
 * A rosette is a central motif in Islamic geometry characterized by 
 * strong radial symmetry. This pattern is constructed using concentric 
 * circles that are divided into overlapping or abutting petals radiating 
 * from the center, creating a stylized floral or sunburst effect.
 */

import { Point, polarToCartesian } from "./geometryUtils";

/**
 * Generates a concentric rosette pattern tile using radial symmetry
 * 
 * @param size - Size of the tile
 * @param numPoints - Number of radial symmetry points (8 to 48)
 * @param layers - Number of concentric layers (2 to 6)
 * @param openingAngle - Opening angle ratio for petals (0.3 to 0.8)
 * @param clipSquare - Whether to clip to square bounds for tiling
 * @param colors - Color palette
 * @param lineWidth - Stroke width
 */
export function generateConcentricRosetteTile(
  size: number,
  numPoints: number,
  layers: number,
  openingAngle: number,
  clipSquare: boolean,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
}> {
  const shapes: Array<{
    points: Point[];
    fill: string;
    stroke: string;
    strokeWidth: number;
  }> = [];

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.45; // Leave some margin
  
  const sectorAngle = (2 * Math.PI) / numPoints;
  
  // Calculate concentric radii
  const radii: number[] = [];
  for (let i = 0; i <= layers; i++) {
    radii.push(maxRadius * (i + 1) / (layers + 1));
  }
  
  // Color cycle for layers
  const colorCycle = [colors.primary, colors.secondary, colors.accent];
  
  // Generate shapes for each layer (annulus)
  for (let layer = 0; layer < layers; layer++) {
    const innerR = radii[layer];
    const outerR = radii[layer + 1];
    const layerColor = colorCycle[layer % colorCycle.length];
    
    // For each sector
    for (let sector = 0; sector < numPoints; sector++) {
      const baseAngle = sector * sectorAngle;
      
      // Create a "petal" or "diamond" shape
      // The shape extends from innerR to outerR and spans part of the sector
      
      // Center points at base and tip
      const innerCenter = polarToCartesian(centerX, centerY, innerR, (baseAngle * 180) / Math.PI);
      const outerCenter = polarToCartesian(centerX, centerY, outerR, (baseAngle * 180) / Math.PI);
      
      // Calculate side points using opening angle
      const halfOpening = (sectorAngle * openingAngle) / 2;
      
      const innerLeft = polarToCartesian(
        centerX,
        centerY,
        innerR,
        ((baseAngle - halfOpening) * 180) / Math.PI
      );
      
      const innerRight = polarToCartesian(
        centerX,
        centerY,
        innerR,
        ((baseAngle + halfOpening) * 180) / Math.PI
      );
      
      const outerLeft = polarToCartesian(
        centerX,
        centerY,
        outerR,
        ((baseAngle - halfOpening) * 180) / Math.PI
      );
      
      const outerRight = polarToCartesian(
        centerX,
        centerY,
        outerR,
        ((baseAngle + halfOpening) * 180) / Math.PI
      );
      
      // Create diamond/petal shape
      // Pattern: inner-left -> outer-left -> outer-right -> inner-right
      const petalPoints: Point[] = [
        innerLeft,
        outerLeft,
        outerRight,
        innerRight,
      ];
      
      shapes.push({
        points: petalPoints,
        fill: layerColor,
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
    }
  }
  
  // Add center circle/star for visual completeness
  const centerRadius = radii[0] * 0.6;
  const centerPoints: Point[] = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    centerPoints.push(
      polarToCartesian(centerX, centerY, centerRadius, (angle * 180) / Math.PI)
    );
  }
  
  shapes.push({
    points: centerPoints,
    fill: colors.accent,
    stroke: colors.line,
    strokeWidth: lineWidth,
  });
  
  // Optional: clip to square for seamless tiling
  if (clipSquare) {
    return shapes.map(shape => {
      const clippedPoints = shape.points.filter(
        p => p.x >= 0 && p.x <= size && p.y >= 0 && p.y <= size
      );
      
      // Only return shapes that have at least 3 points after clipping
      if (clippedPoints.length >= 3) {
        return { ...shape, points: clippedPoints };
      }
      
      return shape; // Keep original if clipping would remove too many points
    });
  }
  
  return shapes;
}
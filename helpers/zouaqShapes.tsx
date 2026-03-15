/**
 * @file zouaqShapes.tsx
 * @description Helper functions for generating different Zouaq strapwork base shapes.
 * 
 * This module provides functions to generate specific pattern geometries 
 * (stars, spirals, grids, arcs) that serve as the foundation for Zouaq strapwork.
 */

import { Point, polarToCartesian } from "./geometryUtils";
import { ZouaqShape, ZouaqColors } from "./zouaqStrapwork";
import { ZouaqRibbonEnd, lineToRibbonPath } from "./zouaqRibbonPaths";

/**
 * Helper functions for generating different Zouaq strapwork shapes.
 * Each function generates the shapes for a specific pattern type.
 */



/**
 * Generates a star pattern with straight radiating ribbons
 */
export function generateStarShape(
  size: number,
  branches: number,
  strapWidth: number,
  showInterlace: boolean,
  colors: ZouaqColors,
  lineWidth: number,
  ribbonEnd: ZouaqRibbonEnd = "flat"
): ZouaqShape[] {
  const shapes: ZouaqShape[] = [];
  const center = { x: size / 2, y: size / 2 };
  const maxRadius = (size / 2) * 1.2;
  const innerRadius = size * 0.15;
  
  const sectorAngle = 360 / branches;

  // Generate radiating ribbons
  for (let i = 0; i < branches; i++) {
    const angle = i * sectorAngle;
    const innerPoint = polarToCartesian(center.x, center.y, innerRadius, angle);
    const outerPoint = polarToCartesian(center.x, center.y, maxRadius, angle);
    
    const ribbonData = lineToRibbonPath(innerPoint, outerPoint, strapWidth, ribbonEnd);
    
    shapes.push({
      points: ribbonData.points || [],
      path: ribbonData.path,
      fill: colors.strap,
      stroke: colors.strapBorder,
      strokeWidth: lineWidth,
      isStrap: true,
      zIndex: showInterlace && i % 2 === 0 ? 10 : 12,
    });
  }

  // Central star
  const centralStarPoints: Point[] = [];
  for (let i = 0; i < branches; i++) {
    const angle = i * sectorAngle;
    const tip = polarToCartesian(center.x, center.y, innerRadius - strapWidth * 0.5, angle);
    const valley = polarToCartesian(center.x, center.y, innerRadius * 0.5, angle + sectorAngle / 2);
    centralStarPoints.push(tip);
    centralStarPoints.push(valley);
  }
  
  shapes.push({
    points: centralStarPoints,
    fill: colors.primary,
    stroke: colors.strapBorder,
    strokeWidth: lineWidth,
    isStrap: false,
    zIndex: 5,
  });

  // Fill shapes between ribbons
  for (let i = 0; i < branches; i++) {
    const angle = i * sectorAngle;
    const nextAngle = (i + 1) * sectorAngle;
    
    const p1 = polarToCartesian(center.x, center.y, innerRadius, angle);
    const p2 = polarToCartesian(center.x, center.y, maxRadius * 0.6, angle);
    const p3 = polarToCartesian(center.x, center.y, maxRadius * 0.6, nextAngle);
    const p4 = polarToCartesian(center.x, center.y, innerRadius, nextAngle);
    
    shapes.push({
      points: [p1, p2, p3, p4],
      fill: i % 2 === 0 ? colors.secondary : colors.accent,
      stroke: "none",
      strokeWidth: 0,
      isStrap: false,
      zIndex: 1,
    });
  }

  return shapes;
}

/**
 * Generates a spiral pattern with ribbons spiraling from center
 */
export function generateSpiralShape(
  size: number,
  branches: number,
  strapWidth: number,
  showInterlace: boolean,
  colors: ZouaqColors,
  lineWidth: number,
  ribbonEnd: ZouaqRibbonEnd = "flat"
): ZouaqShape[] {
  const shapes: ZouaqShape[] = [];
  const center = { x: size / 2, y: size / 2 };
  const maxRadius = (size / 2) * 1.2;
  const turns = 3; // Number of spiral turns
  
  // Generate spiral ribbons
  for (let i = 0; i < branches; i++) {
    const baseAngle = (i * 360) / branches;
    const points: Point[] = [];
    const steps = 50;
    
    // Generate spiral path
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const radius = t * maxRadius;
      const angle = baseAngle + t * 360 * turns;
      points.push(polarToCartesian(center.x, center.y, radius, angle));
    }
    
    // Convert spiral path to ribbon segments
    for (let j = 0; j < points.length - 1; j++) {
      const ribbonData = lineToRibbonPath(points[j], points[j + 1], strapWidth, ribbonEnd);
      shapes.push({
        points: ribbonData.points || [],
        path: ribbonData.path,
        fill: colors.strap,
        stroke: colors.strapBorder,
        strokeWidth: lineWidth,
        isStrap: true,
        zIndex: showInterlace && i % 2 === 0 ? 10 : 12,
      });
    }
  }

  // Central circle
  const centralPoints: Point[] = [];
  const circleSteps = 32;
  for (let i = 0; i < circleSteps; i++) {
    const angle = (i * 360) / circleSteps;
    centralPoints.push(polarToCartesian(center.x, center.y, strapWidth, angle));
  }
  
  shapes.push({
    points: centralPoints,
    fill: colors.primary,
    stroke: colors.strapBorder,
    strokeWidth: lineWidth,
    isStrap: false,
    zIndex: 5,
  });

  return shapes;
}

/**
 * Generates a grid pattern with interlaced horizontal and vertical ribbons
 */
export function generateGridShape(
  size: number,
  branches: number,
  strapWidth: number,
  showInterlace: boolean,
  colors: ZouaqColors,
  lineWidth: number,
  ribbonEnd: ZouaqRibbonEnd = "flat"
): ZouaqShape[] {
  const shapes: ZouaqShape[] = [];
  const gridCount = Math.max(4, Math.floor(branches / 2)); // Number of grid lines
  const spacing = size / (gridCount + 1);
  
  // Horizontal ribbons
  for (let i = 1; i <= gridCount; i++) {
    const y = i * spacing;
    const ribbonData = lineToRibbonPath(
      { x: 0, y },
      { x: size, y },
      strapWidth,
      ribbonEnd
    );
    
    shapes.push({
      points: ribbonData.points || [],
      path: ribbonData.path,
      fill: colors.strap,
      stroke: colors.strapBorder,
      strokeWidth: lineWidth,
      isStrap: true,
      zIndex: showInterlace && i % 2 === 0 ? 10 : 12,
    });
  }
  
  // Vertical ribbons
  for (let i = 1; i <= gridCount; i++) {
    const x = i * spacing;
    const ribbonData = lineToRibbonPath(
      { x, y: 0 },
      { x, y: size },
      strapWidth,
      ribbonEnd
    );
    
    shapes.push({
      points: ribbonData.points || [],
      path: ribbonData.path,
      fill: colors.strap,
      stroke: colors.strapBorder,
      strokeWidth: lineWidth,
      isStrap: true,
      zIndex: showInterlace && i % 2 === 1 ? 10 : 12,
    });
  }
  
  // Fill squares
  for (let row = 0; row <= gridCount; row++) {
    for (let col = 0; col <= gridCount; col++) {
      const x1 = col * spacing;
      const y1 = row * spacing;
      const x2 = (col + 1) * spacing;
      const y2 = (row + 1) * spacing;
      
      // Skip edge squares that go beyond bounds
      if (x2 > size || y2 > size) continue;
      
      shapes.push({
        points: [
          { x: x1, y: y1 },
          { x: x2, y: y1 },
          { x: x2, y: y2 },
          { x: x1, y: y2 },
        ],
        fill: (row + col) % 2 === 0 ? colors.secondary : colors.accent,
        stroke: "none",
        strokeWidth: 0,
        isStrap: false,
        zIndex: 1,
      });
    }
  }

  return shapes;
}

/**
 * Generates concentric arcs pattern with interlaced ribbons
 */
export function generateArcsShape(
  size: number,
  branches: number,
  strapWidth: number,
  showInterlace: boolean,
  colors: ZouaqColors,
  lineWidth: number,
  ribbonEnd: ZouaqRibbonEnd = "flat"
): ZouaqShape[] {
  const shapes: ZouaqShape[] = [];
  const center = { x: size / 2, y: size / 2 };
  const layers = Math.max(3, Math.floor(branches / 4)); // Number of concentric layers
  const maxRadius = (size / 2) * 1.2;
  
  const sectorAngle = 360 / branches;

  // Generate concentric arc ribbons
  for (let layer = 1; layer <= layers; layer++) {
    const radius = (layer / layers) * maxRadius;
    
    for (let i = 0; i < branches; i++) {
      const startAngle = i * sectorAngle;
      const endAngle = startAngle + sectorAngle * 0.8; // Leave gaps
      
      // Generate arc points
      const arcPoints: Point[] = [];
      const steps = 20;
      for (let step = 0; step <= steps; step++) {
        const angle = startAngle + (endAngle - startAngle) * (step / steps);
        arcPoints.push(polarToCartesian(center.x, center.y, radius, angle));
      }
      
      // Convert arc to ribbon segments
      for (let j = 0; j < arcPoints.length - 1; j++) {
        const ribbonData = lineToRibbonPath(arcPoints[j], arcPoints[j + 1], strapWidth, ribbonEnd);
        shapes.push({
          points: ribbonData.points || [],
          path: ribbonData.path,
          fill: colors.strap,
          stroke: colors.strapBorder,
          strokeWidth: lineWidth,
          isStrap: true,
          zIndex: showInterlace && (layer + i) % 2 === 0 ? 10 : 12,
        });
      }
    }
  }

  // Radial connecting ribbons
  for (let i = 0; i < branches; i++) {
    const angle = i * sectorAngle + sectorAngle / 2;
    const innerPoint = polarToCartesian(center.x, center.y, maxRadius / layers, angle);
    const outerPoint = polarToCartesian(center.x, center.y, maxRadius, angle);
    
    const ribbonData = lineToRibbonPath(innerPoint, outerPoint, strapWidth * 0.7, ribbonEnd);
    shapes.push({
      points: ribbonData.points || [],
      path: ribbonData.path,
      fill: colors.strap,
      stroke: colors.strapBorder,
      strokeWidth: lineWidth,
      isStrap: true,
      zIndex: showInterlace && i % 2 === 1 ? 10 : 12,
    });
  }

  // Central star
  const centralStarPoints: Point[] = [];
  for (let i = 0; i < branches; i++) {
    const angle = i * sectorAngle;
    const tip = polarToCartesian(center.x, center.y, maxRadius / layers - strapWidth, angle);
    const valley = polarToCartesian(center.x, center.y, (maxRadius / layers) * 0.5, angle + sectorAngle / 2);
    centralStarPoints.push(tip);
    centralStarPoints.push(valley);
  }
  
  shapes.push({
    points: centralStarPoints,
    fill: colors.primary,
    stroke: colors.strapBorder,
    strokeWidth: lineWidth,
    isStrap: false,
    zIndex: 5,
  });

  return shapes;
}
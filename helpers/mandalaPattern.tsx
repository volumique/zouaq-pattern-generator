/**
 * @file mandalaPattern.tsx
 * @description Helper for generating layered Arabic Mandala/Medallion patterns.
 * 
 * This module constructs complex layered medallions through radial symmetry.
 * Construction typically follows these layers from inside out:
 * 1. Central Star (the core)
 * 2. Satellites (small stars/shapes around the center)
 * 3. Connecting Pentagons/Kites (filling the inner gaps)
 * 4. Outer Decorative Ring (elongated hexagons forming the tips)
 * 5. Interstitial Diamonds (filling the outermost gaps)
 */

import { Point, polarToCartesian, createRoundedPolygonPath, rotatePoint, getPolygonPoints } from "./geometryUtils";
import { generateStarShape } from "./starShapeGenerator";

export interface MandalaOptions {
  branches: number;
  layers: number;
  innerStarScale: number;
  outerReach: number;
  showShadow: boolean;
  rotation: number;
  starRounding: number;
}

const DEFAULT_OPTIONS: MandalaOptions = {
  branches: 8,
  layers: 3,
  innerStarScale: 0.2,
  outerReach: 0.9,
  showShadow: true,
  rotation: 0,
  starRounding: 0,
};

/**
 * Generates an Arabic Mandala/Medallion pattern.
 * This pattern is constructed using concentric layers of geometric shapes
 * radiating from a central star, typical of Islamic rosettes.
 */
export function generateMandalaTile(
  size: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: Partial<MandalaOptions> = {}
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
  shadow?: boolean;
}> {
  const {
    branches,
    layers,
    innerStarScale,
    outerReach,
    showShadow,
    rotation,
    starRounding,
  } = { ...DEFAULT_OPTIONS, ...options };

  const shapes: Array<{
    points: Point[];
    fill: string;
    stroke: string;
    strokeWidth: number;
    path?: string;
    shadow?: boolean;
  }> = [];

  const center = { x: size / 2, y: size / 2 };
  const maxRadius = (size / 2) * outerReach;
  
  // Helper to add a shape with optional shadow
  const addShape = (
    points: Point[],
    fill: string,
    zIndex: number = 0 // Used for sorting if needed, though we push in order
  ) => {
    const path = createRoundedPolygonPath(points, starRounding);
    
    // Add shadow shape first (offset and darker) if enabled
    if (showShadow) {
      const shadowOffset = size * 0.008;
      const shadowPoints = points.map(p => ({
        x: p.x + shadowOffset,
        y: p.y + shadowOffset
      }));
      const shadowPath = createRoundedPolygonPath(shadowPoints, starRounding);
      
      shapes.push({
        points: shadowPoints,
        path: shadowPath || undefined,
        fill: "rgba(0,0,0,0.2)",
        stroke: "none",
        strokeWidth: 0,
        shadow: true
      });
    }

    shapes.push({
      points,
      path: path || undefined,
      fill,
      stroke: colors.line,
      strokeWidth: lineWidth,
    });
  };

  // --- Layer 0: Central Star ---
  // The core of the mandala
  const centerStarRadius = maxRadius * innerStarScale;
  const centerStarInnerRadius = centerStarRadius * 0.5; // Standard star ratio
  
  const centerStar = generateStarShape(
    center.x,
    center.y,
    centerStarRadius,
    centerStarInnerRadius,
    branches,
    rotation,
    starRounding
  );

  // We'll draw the center star last so it's on top, but calculate it now
  const drawCenterStar = () => {
    if (centerStar.points) {
      addShape(centerStar.points, colors.primary, 10);
    }
  };

  // --- Layer 1: Ring of small stars/shapes around center ---
  // Positioned at the valleys of the central star
  if (layers >= 2) {
    const layer1Radius = centerStarRadius * 1.6;
    const smallStarSize = centerStarRadius * 0.5;
    
    for (let i = 0; i < branches; i++) {
      const angle = (i * 360) / branches + rotation + (180 / branches); // Offset to align with valleys
      const pos = polarToCartesian(center.x, center.y, layer1Radius, angle);
      
      // Create a 5 or 6 pointed star or pentagon depending on branch count for variety
      // Let's use a simple 5-pointed star for visual interest
      const smallStarPoints = generateStarShape(
        pos.x,
        pos.y,
        smallStarSize,
        smallStarSize * 0.5,
        5, // Fixed 5 points looks nice as a satellite
        angle + 180, // Point inward
        starRounding
      ).points;

      if (smallStarPoints) {
        addShape(smallStarPoints, colors.secondary, 5);
      }
    }
  }

  // --- Layer 2: Connecting Pentagons/Kites ---
  // These fill the gaps between the central star points
  if (layers >= 3) {
    const innerDist = centerStarRadius * 0.9;
    const outerDist = centerStarRadius * 2.2;
    
    for (let i = 0; i < branches; i++) {
      const angle = (i * 360) / branches + rotation;
      
      // Define a kite/shield shape
      // Tip touching the central star tip
      const p1 = polarToCartesian(center.x, center.y, innerDist, angle);
      
      // Wide points
      const angleWidth = 360 / branches / 2.5;
      const p2 = polarToCartesian(center.x, center.y, (innerDist + outerDist) / 2, angle - angleWidth);
      const p4 = polarToCartesian(center.x, center.y, (innerDist + outerDist) / 2, angle + angleWidth);
      
      // Outer point
      const p3 = polarToCartesian(center.x, center.y, outerDist, angle);
      
      addShape([p1, p4, p3, p2], colors.accent, 4);
    }
  }

  // --- Layer 3: Outer Decorative Ring (Elongated Hexagons) ---
  // The "tips" of the mandala
  if (layers >= 4) {
    const startDist = centerStarRadius * 2.3;
    const endDist = maxRadius;
    const width = (endDist - startDist) * 0.4;
    
    for (let i = 0; i < branches; i++) {
      const angle = (i * 360) / branches + rotation;
      
      // Elongated hexagon
      const centerDist = (startDist + endDist) / 2;
      const centerPos = polarToCartesian(center.x, center.y, centerDist, angle);
      
      // We construct it manually to orient it radially
      const p1 = polarToCartesian(center.x, center.y, startDist, angle); // Inner tip
      const p4 = polarToCartesian(center.x, center.y, endDist, angle);   // Outer tip
      
      // Side points need to be perpendicular to the radius
      // Vector from center to p4 is (cos(a), sin(a))
      // Perpendicular is (-sin(a), cos(a))
      const rad = (angle * Math.PI) / 180;
      const perpX = -Math.sin(rad) * width;
      const perpY = Math.cos(rad) * width;
      
      // Inner shoulders
      const p2 = { 
        x: centerPos.x + perpX * 0.8 - (Math.cos(rad) * width * 0.5), 
        y: centerPos.y + perpY * 0.8 - (Math.sin(rad) * width * 0.5) 
      };
      const p6 = { 
        x: centerPos.x - perpX * 0.8 - (Math.cos(rad) * width * 0.5), 
        y: centerPos.y - perpY * 0.8 - (Math.sin(rad) * width * 0.5) 
      };
      
      // Outer shoulders
      const p3 = { 
        x: centerPos.x + perpX * 0.8 + (Math.cos(rad) * width * 0.5), 
        y: centerPos.y + perpY * 0.8 + (Math.sin(rad) * width * 0.5) 
      };
      const p5 = { 
        x: centerPos.x - perpX * 0.8 + (Math.cos(rad) * width * 0.5), 
        y: centerPos.y - perpY * 0.8 + (Math.sin(rad) * width * 0.5) 
      };

      // Simplified to a diamond-like hexagon for cleaner look
      // Let's use a 6-point shape: Tip, Shoulder, Side, Tip, Side, Shoulder
      // Actually, let's stick to the reference style: an elongated shape with a hole or detail often
      // We'll make a nice elongated hexagon
      
      const hexPoints = [
        p1,
        { x: centerPos.x + perpX, y: centerPos.y },
        p4,
        { x: centerPos.x - perpX, y: centerPos.y }
      ];
      
      // Let's make it more complex: a "gem" shape
      const gemPoints = [
        p1,
        polarToCartesian(center.x, center.y, centerDist, angle - (360/branches/4)),
        p4,
        polarToCartesian(center.x, center.y, centerDist, angle + (360/branches/4))
      ];

      addShape(gemPoints, colors.primary, 3);
    }
  }

  // --- Layer 4: Interstitial Diamonds ---
  // Filling the outer gaps
  if (layers >= 5) {
    const dist = centerStarRadius * 2.0;
    const size = centerStarRadius * 0.4;
    
    for (let i = 0; i < branches; i++) {
      const angle = (i * 360) / branches + rotation + (180 / branches); // Between main branches
      const pos = polarToCartesian(center.x, center.y, dist, angle);
      
      const diamondPoints = getPolygonPoints(pos.x, pos.y, size, 4, angle);
      addShape(diamondPoints, colors.secondary, 2);
    }
  }

  // Draw center star last to be on top
  drawCenterStar();

  return shapes;
}
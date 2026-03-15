/**
 * @file shamsaPattern.tsx
 * @description Helper for generating the "Shamsa" (Sun) pattern.
 * 
 * The Shamsa (from Arabic for 'sun') is a classic illuminating rosette often 
 * found in the frontispieces of illuminated manuscripts. It features a central 
 * golden rosette surrounded by an intricate orbit of smaller satellite rosettes, 
 * symbolizing light, divine illumination, and the cosmos.
 */

import { Point, polarToCartesian, createRoundedPolygonPath, getPolygonPoints } from "./geometryUtils";

export interface ShamsaOptions {
  centralPetals: number;
  satelliteCount: number;
  satellitePetals: number;
  showPentagons: boolean;
  showSquareConnectors: boolean;
  satelliteScale: number;
  innerRingRadius: number;
  outerRingRadius: number;
}

const DEFAULT_OPTIONS: ShamsaOptions = {
  centralPetals: 12,
  satelliteCount: 8,
  satellitePetals: 12,
  showPentagons: true,
  showSquareConnectors: true,
  satelliteScale: 0.35,
  innerRingRadius: 0.3,
  outerRingRadius: 0.5,
};

/**
 * Generates a "Shamsa" (Sun) pattern tile based on the reference image.
 * Features a central rosette, rings of pentagons, and satellite rosettes.
 */
export function generateShamsaTile(
  size: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: Partial<ShamsaOptions> = {}
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
}> {
  const {
    centralPetals,
    satelliteCount,
    satellitePetals,
    showPentagons,
    showSquareConnectors,
    satelliteScale,
    innerRingRadius,
    outerRingRadius,
  } = { ...DEFAULT_OPTIONS, ...options };

  const shapes: Array<{
    points: Point[];
    fill: string;
    stroke: string;
    strokeWidth: number;
    path?: string;
  }> = [];

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.45;

  // --- Helper to add shapes ---
  const addShape = (points: Point[], fill: string) => {
    shapes.push({
      points,
      fill,
      stroke: colors.line,
      strokeWidth: lineWidth,
      path: createRoundedPolygonPath(points, 0), // Sharp corners for this style
    });
  };

  // --- 1. Central Rosette ---
  // Center dot
  const centerDotRadius = maxRadius * 0.05;
  const centerDotPoints = getPolygonPoints(centerX, centerY, centerDotRadius, centralPetals);
  addShape(centerDotPoints, "#800000"); // Dark red/maroon center

  // Petals
  const petalInnerRadius = centerDotRadius;
  const petalOuterRadius = maxRadius * innerRingRadius;
  const petalWidthAngle = (360 / centralPetals) * 0.6; // 60% of sector width

  for (let i = 0; i < centralPetals; i++) {
    const angle = (i * 360) / centralPetals;
    
    // Create elongated petal shape
    const p1 = polarToCartesian(centerX, centerY, petalInnerRadius, angle);
    const p2 = polarToCartesian(centerX, centerY, petalOuterRadius * 0.6, angle - petalWidthAngle / 2);
    const p3 = polarToCartesian(centerX, centerY, petalOuterRadius, angle);
    const p4 = polarToCartesian(centerX, centerY, petalOuterRadius * 0.6, angle + petalWidthAngle / 2);

    addShape([p1, p4, p3, p2], "#B8860B"); // Olive/Gold
  }

  // --- 2. Inner Pentagon Ring ---
  if (showPentagons) {
    const pentagonDist = maxRadius * (innerRingRadius + 0.05);
    const pentagonSize = maxRadius * 0.08;

    for (let i = 0; i < centralPetals; i++) {
      const angle = (i * 360) / centralPetals + (180 / centralPetals); // Offset to be between petals
      const center = polarToCartesian(centerX, centerY, pentagonDist, angle);
      
      // Irregular pentagon pointing inward
      const p1 = polarToCartesian(center.x, center.y, pentagonSize, angle + 180); // Tip pointing in
      const p2 = polarToCartesian(center.x, center.y, pentagonSize * 0.8, angle + 180 + 72);
      const p3 = polarToCartesian(center.x, center.y, pentagonSize * 0.6, angle + 180 + 144);
      const p4 = polarToCartesian(center.x, center.y, pentagonSize * 0.6, angle + 180 + 216);
      const p5 = polarToCartesian(center.x, center.y, pentagonSize * 0.8, angle + 180 + 288);

      addShape([p1, p2, p3, p4, p5], "#5D1919"); // Dark Maroon
    }
  }

  // --- 3. Outer Pentagon Ring ---
  if (showPentagons) {
    const outerPentDist = maxRadius * outerRingRadius;
    const outerPentSize = maxRadius * 0.1;

    for (let i = 0; i < centralPetals; i++) {
      const angle = (i * 360) / centralPetals; // Aligned with petals
      const center = polarToCartesian(centerX, centerY, outerPentDist, angle);
      
      // Kite-like pentagon pointing outward
      const p1 = polarToCartesian(center.x, center.y, outerPentSize, angle); // Tip pointing out
      const p2 = polarToCartesian(center.x, center.y, outerPentSize * 0.7, angle + 80);
      const p3 = polarToCartesian(center.x, center.y, outerPentSize * 0.4, angle + 150);
      const p4 = polarToCartesian(center.x, center.y, outerPentSize * 0.4, angle + 210);
      const p5 = polarToCartesian(center.x, center.y, outerPentSize * 0.7, angle + 280);

      addShape([p1, p2, p3, p4, p5], "#D2691E"); // Chocolate/Orange
    }
  }

  // --- 4. Satellite Rosettes ---
  const satelliteDist = maxRadius * 0.85;
  const satelliteRadius = maxRadius * satelliteScale;

  for (let i = 0; i < satelliteCount; i++) {
    const angle = (i * 360) / satelliteCount;
    const satCenter = polarToCartesian(centerX, centerY, satelliteDist, angle);

    // Satellite Center
    const satCenterRadius = satelliteRadius * 0.15;
    const satCenterPoints = getPolygonPoints(satCenter.x, satCenter.y, satCenterRadius, satellitePetals);
    addShape(satCenterPoints, "#8B4513"); // SaddleBrown

    // Satellite Petals
    const satPetalInner = satCenterRadius;
    const satPetalOuter = satelliteRadius;
    const satPetalWidthAngle = (360 / satellitePetals) * 0.7;

    for (let j = 0; j < satellitePetals; j++) {
      const pAngle = (j * 360) / satellitePetals + angle; // Rotate with satellite position
      
      const p1 = polarToCartesian(satCenter.x, satCenter.y, satPetalInner, pAngle);
      const p2 = polarToCartesian(satCenter.x, satCenter.y, satPetalOuter * 0.6, pAngle - satPetalWidthAngle / 2);
      const p3 = polarToCartesian(satCenter.x, satCenter.y, satPetalOuter, pAngle);
      const p4 = polarToCartesian(satCenter.x, satCenter.y, satPetalOuter * 0.6, pAngle + satPetalWidthAngle / 2);

      // Alternate colors for petals like in reference (Cyan / Dark Blue)
      const petalColor = j % 2 === 0 ? "#008B8B" : "#4682B4"; // DarkCyan vs SteelBlue
      addShape([p1, p4, p3, p2], petalColor);
    }
  }

  // --- 5. Square Connectors ---
  if (showSquareConnectors) {
    const connectorDist = satelliteDist; // Same distance ring as satellites
    const connectorSize = maxRadius * 0.06;

    for (let i = 0; i < satelliteCount; i++) {
      const angle = (i * 360) / satelliteCount + (180 / satelliteCount); // Between satellites
      const center = polarToCartesian(centerX, centerY, connectorDist * 0.9, angle); // Slightly pulled in
      
      // Diamond/Square shape
      const points = getPolygonPoints(center.x, center.y, connectorSize, 4, angle);
      
      // Add small squares
      addShape(points, "#DAA520"); // GoldenRod
      
      // Add smaller squares further out for rhythm
      const outerCenter = polarToCartesian(centerX, centerY, connectorDist * 1.05, angle);
      const outerPoints = getPolygonPoints(outerCenter.x, outerCenter.y, connectorSize * 0.6, 4, angle + 45);
      addShape(outerPoints, "#DAA520");
    }
  }

  return shapes;
}
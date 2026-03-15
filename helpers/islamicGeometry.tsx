/**
 * @file islamicGeometry.tsx
 * @description Helper functions for authentic Islamic geometric pattern construction.
 * 
 * Islamic geometric patterns often utilize the "Hasba" (measure/proportion) construction 
 * method, where patterns are built from the intersection of n radial lines originating 
 * from a central point. These patterns heavily feature star polygons and rosettes.
 * 
 * Zellige is a traditional Moroccan tile mosaic art form where geometric shapes 
 * are chiseled from fired clay. This module provides functions to construct 
 * the base geometries for these Zellige tiles.
 */

import { Point, polarToCartesian, createRoundedPolygonPath, rotatePoint, getPolygonPoints } from "./geometryUtils";
import { generateStarShape, generateRosetteShape } from "./starShapeGenerator";

import { generateConcentricRosetteTile } from "./rosettePattern";
import { generateFractalRosetteTile } from "./fractalRosettePattern";
import { generateMandalaTile } from "./mandalaPattern";
import { generateAmazighTile } from "./amazighPattern";

export interface GeometryOptions {
  innerRadiusRatio: number;
  starScale: number;
  rotation: number;
  showFillers: boolean;
  fillerScale: number;
  starRounding: number;
}

const DEFAULT_OPTIONS: GeometryOptions = {
  innerRadiusRatio: 0.4,
  starScale: 0.35,
  rotation: 0,
  showFillers: true,
  fillerScale: 1.0,
  starRounding: 0,
};

/**
 * Generates a star polygon by connecting vertices with a skip count
 * @param centerX - X coordinate of center
 * @param centerY - Y coordinate of center
 * @param radius - Radius of the circle containing the star points
 * @param points - Number of points in the star
 * @param skip - How many vertices to skip when connecting (creates the star effect)
 * @returns Array of points forming the star polygon
 */
export function starPolygon(
  centerX: number,
  centerY: number,
  radius: number,
  points: number,
  skip: number
): Point[] {
  const vertices: Point[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    vertices.push(polarToCartesian(centerX, centerY, radius, angle));
  }

  const starPoints: Point[] = [];
  let currentIndex = 0;
  for (let i = 0; i < points; i++) {
    starPoints.push(vertices[currentIndex]);
    currentIndex = (currentIndex + skip) % points;
  }

  return starPoints;
}

/**
 * Generates a Zellige pattern with customizable branch count
 * Uses proper star shape with inner/outer radii and decorative filler shapes
 */
export function generateZelligePattern(
  size: number,
  branches: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: GeometryOptions = DEFAULT_OPTIONS
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
}> {
  const shapes: Array<{
    points: Point[];
    fill: string;
    stroke: string;
    strokeWidth: number;
    path?: string;
  }> = [];
  
  const { innerRadiusRatio, starScale, rotation, showFillers, fillerScale, starRounding } = { ...DEFAULT_OPTIONS, ...options };
  
  const center = { x: size / 2, y: size / 2 };
  const outerRadius = size * starScale;
  const innerRadius = outerRadius * innerRadiusRatio;

  // Main star shape (single polygon with peaks and valleys)
  const starResult = generateStarShape(
    center.x,
    center.y,
    outerRadius,
    innerRadius,
    branches,
    rotation,
    starRounding
  );

  shapes.push({
    points: starResult.points || [],
    path: starResult.path,
    fill: colors.primary,
    stroke: colors.line,
    strokeWidth: lineWidth,
  });

  if (showFillers) {
    // Add small decorative stars at corners
    const cornerPositions = [
      { x: 0, y: 0 },
      { x: size, y: 0 },
      { x: size, y: size },
      { x: 0, y: size },
    ];

    cornerPositions.forEach((pos) => {
      const smallStarSize = size * 0.08 * fillerScale;
      const smallStarResult = generateStarShape(
        pos.x,
        pos.y,
        smallStarSize,
        smallStarSize * 0.4,
        branches / 2,
        rotation,
        starRounding
      );
      shapes.push({
        points: smallStarResult.points || [],
        path: smallStarResult.path,
        fill: colors.accent,
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
    });

    // Add connecting shapes between main star and edges (WITH ROUNDING)
    const numConnectors = branches;
    for (let i = 0; i < numConnectors; i++) {
      const angle = (i * 360) / numConnectors + rotation;
      const starTip = polarToCartesian(center.x, center.y, outerRadius, angle);
      const edgePoint = polarToCartesian(center.x, center.y, size * 0.49, angle);
      
      const nextAngle = ((i + 1) * 360) / numConnectors + rotation;
      const prevAngle = ((i - 1) * 360) / numConnectors + rotation;
      
      const side1 = polarToCartesian(center.x, center.y, size * 0.49, (angle + nextAngle) / 2);
      const side2 = polarToCartesian(center.x, center.y, size * 0.49, (angle + prevAngle) / 2);

      const connectorPoints = [starTip, side1, edgePoint, side2];
      const roundedPath = createRoundedPolygonPath(connectorPoints, starRounding);

      shapes.push({
        points: connectorPoints,
        path: roundedPath || undefined,
        fill: i % 3 === 0 ? colors.secondary : i % 3 === 1 ? colors.accent : colors.primary,
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
    }

    // Add small diamonds at edge midpoints (WITH ROUNDING)
    const diamondSize = size * 0.05 * fillerScale;
    for (let i = 0; i < 4; i++) {
      const angle = 45 + i * 90 + rotation;
      const pos = polarToCartesian(center.x, center.y, size * 0.48, angle);
      
      const dPoints = [
        polarToCartesian(pos.x, pos.y, diamondSize, 270 + rotation),
        polarToCartesian(pos.x, pos.y, diamondSize, 0 + rotation),
        polarToCartesian(pos.x, pos.y, diamondSize, 90 + rotation),
        polarToCartesian(pos.x, pos.y, diamondSize, 180 + rotation),
      ];

      const roundedPath = createRoundedPolygonPath(dPoints, starRounding);

      shapes.push({
        points: dPoints,
        path: roundedPath || undefined,
        fill: colors.line,
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
    }
  }

  return shapes;
}

/**
 * Generates a concentric rosette pattern tile
 */
export function generateRosettePattern(
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
  return generateConcentricRosetteTile(
    size,
    numPoints,
    layers,
    openingAngle,
    clipSquare,
    colors,
    lineWidth
  );
}



/**
 * Generates a Zouaq pattern (rosette style with colored petals)
 */
export function generateZouaqPattern(
  size: number,
  branches: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: GeometryOptions = DEFAULT_OPTIONS
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
}> {
  const shapes: Array<{
    points: Point[];
    fill: string;
    stroke: string;
    strokeWidth: number;
    path?: string;
  }> = [];
  
  const { starScale, rotation, showFillers, fillerScale, starRounding } = { ...DEFAULT_OPTIONS, ...options };
  
  const center = { x: size / 2, y: size / 2 };
  const rosetteRadius = size * starScale;

  // Generate rosette with colored petals (WITH ROUNDING)
  const colorCycle = [colors.primary, colors.secondary, colors.accent];
  const rosettePetals = generateRosetteShape(
    center.x,
    center.y,
    rosetteRadius,
    branches,
    colorCycle,
    rotation
  );

  rosettePetals.forEach((petal) => {
    const roundedPath = createRoundedPolygonPath(petal.points, starRounding);
    shapes.push({
      points: petal.points,
      path: roundedPath || undefined,
      fill: petal.color,
      stroke: colors.line,
      strokeWidth: lineWidth,
    });
  });

  if (showFillers) {
    // Add decorative elements around the rosette (WITH ROUNDING)
    const numDecorations = branches;
    for (let i = 0; i < numDecorations; i++) {
      const angle = (i * 360) / numDecorations + rotation;
      const innerPoint = polarToCartesian(center.x, center.y, rosetteRadius * 0.6, angle);
      const outerPoint = polarToCartesian(center.x, center.y, size * 0.48, angle);
      
      const nextAngle = ((i + 1) * 360) / numDecorations + rotation;
      const prevAngle = ((i - 1) * 360) / numDecorations + rotation;
      
      const outerSide1 = polarToCartesian(center.x, center.y, size * 0.48, (angle + nextAngle) / 2);
      const outerSide2 = polarToCartesian(center.x, center.y, size * 0.48, (angle + prevAngle) / 2);

      const decorationPoints = [innerPoint, outerSide1, outerPoint, outerSide2];
      const roundedPath = createRoundedPolygonPath(decorationPoints, starRounding);

      shapes.push({
        points: decorationPoints,
        path: roundedPath || undefined,
        fill: colorCycle[i % colorCycle.length],
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
    }

    // Add corner decorations (WITH ROUNDING)
    const cornerSize = size * 0.06 * fillerScale;
    const cornerPositions = [
      { x: cornerSize, y: cornerSize },
      { x: size - cornerSize, y: cornerSize },
      { x: size - cornerSize, y: size - cornerSize },
      { x: cornerSize, y: size - cornerSize },
    ];

    cornerPositions.forEach((pos, idx) => {
      const cornerPoints = [
        { x: pos.x - cornerSize, y: pos.y },
        { x: pos.x, y: pos.y - cornerSize },
        { x: pos.x + cornerSize, y: pos.y },
        { x: pos.x, y: pos.y + cornerSize },
      ];
      const roundedPath = createRoundedPolygonPath(cornerPoints, starRounding);

      shapes.push({
        points: cornerPoints,
        path: roundedPath || undefined,
        fill: colors.accent,
        stroke: colors.line,
        strokeWidth: lineWidth,
      });
    });
  }

  return shapes;
}

/**
 * Generates an 8-pointed star pattern tile (classic Zellige preset)
 */
export function generateStar8Pattern(
  size: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: GeometryOptions = DEFAULT_OPTIONS
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
}> {
  return generateZelligePattern(size, 8, colors, lineWidth, options);
}

/**
 * Generates a 12-pointed rosette pattern tile
 */
export function generateStar12Pattern(
  size: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: GeometryOptions = DEFAULT_OPTIONS
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
}> {
  return generateZelligePattern(size, 12, colors, lineWidth, options);
}

/**
 * Generates a 16-pointed rosette pattern tile
 */
export function generateStar16Pattern(
  size: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: GeometryOptions = DEFAULT_OPTIONS
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
}> {
  return generateZelligePattern(size, 16, colors, lineWidth, options);
}

/**
 * Generates a mandala pattern tile (alias for generateMandalaTile for API consistency)
 */
export const generateMandalaPattern = generateMandalaTile;

/**
 * Generates an amazigh pattern tile (alias for generateAmazighTile for API consistency)
 */
export const generateAmazighPattern = generateAmazighTile;

/**
 * Generates a fractal rosette pattern tile
 */
export function generateFractalRosettePattern(
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
  return generateFractalRosetteTile(
    size,
    branches,
    depth,
    scaleFactor,
    innerRadiusRatio,
    rotation,
    colors,
    lineWidth,
    starRounding
  );
}

// generateInterlacePattern removed as InterlaceShape is no longer supported
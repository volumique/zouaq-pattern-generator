/**
 * @file zouaqStrapwork.tsx
 * @description Helper for generating authentic Zouaq patterns using the Strapwork method.
 * 
 * While Zellige refers to tile mosaic (discrete cut pieces fitted together),
 * Zouaq is the art of painting on wood. A key characteristic of Zouaq is its 
 * strapwork or interlace patterns, where continuous ribbons or bands weave 
 * over and under each other.
 * 
 * This module implements a skeleton-based algorithm to trace these ribbons 
 * along paths (zigzag, star, spiral, etc.) and gives them thickness and interlacing 
 * (z-indexing) to simulate the over-under effect.
 */

import { Point, polarToCartesian, getIntersection } from "./geometryUtils";
import { generateStarShape, generateSpiralShape, generateGridShape, generateArcsShape } from "./zouaqShapes";
import { ZouaqRibbonEnd, lineToRibbonPath } from "./zouaqRibbonPaths";

export interface ZouaqColors {
  strap: string;
  strapBorder: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface ZouaqShape {
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  isStrap: boolean;
  zIndex: number;
  path?: string; // For curved paths
}

export interface ZouaqResult {
  shapes: ZouaqShape[];
  useClipPath: boolean;
  clipPath?: string;
}

export type ZouaqShapeType = "zigzag" | "star" | "spiral" | "grid" | "arcs";

export type ZouaqTileShape = "square" | "circle" | "hexagon" | "octagon" | "diamond";

// Re-export for convenience
export type { ZouaqRibbonEnd } from "./zouaqRibbonPaths";

/**
 * Calculates a point on a quadratic Bezier curve
 */
function getQuadraticBezierPoint(t: number, p0: Point, p1: Point, p2: Point): Point {
  const oneMinusT = 1 - t;
  return {
    x: oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
    y: oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
  };
}

/**
 * Converts a line segment into a ribbon (rectangle) polygon
 */
function lineToRibbon(p1: Point, p2: Point, width: number): Point[] {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return [p1, p1, p1, p1];

  const nx = -dy / length;
  const ny = dx / length;

  const halfW = width / 2;

  return [
    { x: p1.x + nx * halfW, y: p1.y + ny * halfW },
    { x: p2.x + nx * halfW, y: p2.y + ny * halfW },
    { x: p2.x - nx * halfW, y: p2.y - ny * halfW },
    { x: p1.x - nx * halfW, y: p1.y - ny * halfW },
  ];
}

/**
 * Generates a curved ribbon path string
 */
function curveToRibbonPath(p1: Point, control: Point, p2: Point, width: number): string {
  // Approximate normals at start and end
  // Start normal
  const dx1 = control.x - p1.x;
  const dy1 = control.y - p1.y;
  const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const nx1 = -dy1 / len1;
  const ny1 = dx1 / len1;

  // End normal
  const dx2 = p2.x - control.x;
  const dy2 = p2.y - control.y;
  const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  const nx2 = -dy2 / len2;
  const ny2 = dx2 / len2;

  // Control normal (average)
  const nxC = (nx1 + nx2) / 2;
  const nyC = (ny1 + ny2) / 2;
  const lenC = Math.sqrt(nxC * nxC + nyC * nyC);
  const normNxC = nxC / lenC;
  const normNyC = nyC / lenC;

  const halfW = width / 2;

  // Outer curve points
  const outerStart = { x: p1.x + nx1 * halfW, y: p1.y + ny1 * halfW };
  const outerControl = { x: control.x + normNxC * halfW, y: control.y + normNyC * halfW };
  const outerEnd = { x: p2.x + nx2 * halfW, y: p2.y + ny2 * halfW };

  // Inner curve points
  const innerStart = { x: p1.x - nx1 * halfW, y: p1.y - ny1 * halfW };
  const innerControl = { x: control.x - normNxC * halfW, y: control.y - normNyC * halfW };
  const innerEnd = { x: p2.x - nx2 * halfW, y: p2.y - ny2 * halfW };

  return `M ${outerStart.x},${outerStart.y} Q ${outerControl.x},${outerControl.y} ${outerEnd.x},${outerEnd.y} L ${innerEnd.x},${innerEnd.y} Q ${innerControl.x},${innerControl.y} ${innerStart.x},${innerStart.y} Z`;
}

/**
 * Generates a SVG path string for the clipping mask based on the tile shape.
 */
function generateClipPath(size: number, shape: ZouaqTileShape): string {
  const center = size / 2;
  const radius = size / 2;

  switch (shape) {
    case "circle":
      // SVG arc command for a full circle
      return `M ${center},${center} m -${radius},0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    
    case "hexagon": {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 + 30) * Math.PI / 180; // Start at 30 deg for flat top/bottom? Or 0 for pointy top? Let's do flat top (30deg start)
        // Actually usually hexagons in patterns are pointy top (0 deg start) or flat top.
        // Let's try 0 deg start (pointy top).
        const px = center + radius * Math.sin(i * 60 * Math.PI / 180);
        const py = center - radius * Math.cos(i * 60 * Math.PI / 180);
        points.push(`${px},${py}`);
      }
      return `M ${points.join(" L ")} Z`;
    }

    case "octagon": {
      const points = [];
      // Octagon usually rotated by 22.5 deg to have flat sides
      const offset = 22.5;
      for (let i = 0; i < 8; i++) {
        const angle = (i * 45 + offset) * Math.PI / 180;
        const px = center + radius * Math.cos(angle);
        const py = center + radius * Math.sin(angle);
        points.push(`${px},${py}`);
      }
      return `M ${points.join(" L ")} Z`;
    }

    case "diamond":
      return `M ${center},0 L ${size},${center} L ${center},${size} L 0,${center} Z`;
    
    case "square":
    default:
      return ""; // No clip needed for square (it fills the viewbox)
  }
}

/**
 * Generates authentic Zouaq patterns using the Strapwork method.
 * 
 * @param size - Size of the square canvas
 * @param branches - Number of rosette branches (e.g., 8, 12, 16)
 * @param strapWidth - Width of the wooden straps
 * @param showInterlace - Whether to simulate over/under weaving (visual effect)
 * @param curvedStyle - Whether to use curved lines (floral) or straight (geometric)
 * @param colors - Color palette
 * @param lineWidth - Stroke width for borders
 * @param shape - Base shape pattern type
 * @param tileShape - The shape of the tile itself (square, circle, etc.)
 * @param ribbonEnd - Style of ribbon ends (flat, rounded, pointed, circle)
 */
export function generateZouaqStrapwork(
  size: number,
  branches: number,
  strapWidth: number,
  showInterlace: boolean,
  curvedStyle: boolean,
  colors: ZouaqColors,
  lineWidth: number,
  shape: ZouaqShapeType = "zigzag",
  tileShape: ZouaqTileShape = "square",
  ribbonEnd: ZouaqRibbonEnd = "flat",
  curveIntensity: number = 0.2
): ZouaqResult {
  let shapes: ZouaqShape[] = [];
  
  // Handle different shape types
  if (shape === "star") {
    shapes = generateStarShape(size, branches, strapWidth, showInterlace, colors, lineWidth, ribbonEnd);
  } else if (shape === "spiral") {
    shapes = generateSpiralShape(size, branches, strapWidth, showInterlace, colors, lineWidth, ribbonEnd);
  } else if (shape === "grid") {
    shapes = generateGridShape(size, branches, strapWidth, showInterlace, colors, lineWidth, ribbonEnd);
  } else if (shape === "arcs") {
    shapes = generateArcsShape(size, branches, strapWidth, showInterlace, colors, lineWidth, ribbonEnd);
  } else {
    // Default zigzag pattern
    shapes = generateZigzagShape(size, branches, strapWidth, showInterlace, curvedStyle, colors, lineWidth, ribbonEnd, curveIntensity);
  }
  // Add background square to ensure no gaps at edges
  shapes.unshift({
    points: [
      { x: 0, y: 0 },
      { x: size, y: 0 },
      { x: size, y: size },
      { x: 0, y: size }
    ],
    fill: colors.background,
    stroke: "none",
    strokeWidth: 0,
    isStrap: false,
    zIndex: 0
  });

  const clipPath = generateClipPath(size, tileShape);

  return {
    shapes: shapes.sort((a, b) => a.zIndex - b.zIndex),
    useClipPath: !!clipPath,
    clipPath
  };
}

/**
 * Generates the original zigzag radial pattern
 */
function generateZigzagShape(
  size: number,
  branches: number,
  strapWidth: number,
  showInterlace: boolean,
  curvedStyle: boolean,
  colors: ZouaqColors,
  lineWidth: number,
  ribbonEnd: ZouaqRibbonEnd,
  curveIntensity: number
): ZouaqShape[] {
  const shapes: ZouaqShape[] = [];
  const center = { x: size / 2, y: size / 2 };
  
  // Radii for the skeleton structure
  // Adjusted to fit within the square but extend to corners
  const maxRadius = (size / 2) * 1.42; // Reach corners
  const radii = [
    0,
    size * 0.12, // Inner star radius
    size * 0.25, // First zigzag turn
    size * 0.38, // Second zigzag turn
    size * 0.55, // Third zigzag turn
    size * 0.75, // Outer reach
    maxRadius    // Edge
  ];

  const sectorAngle = 360 / branches;
  const halfSector = sectorAngle / 2;

  // --- 1. Generate Skeleton & Straps ---
  
  // We generate one sector and rotate it
  for (let i = 0; i < branches; i++) {
    const baseAngle = i * sectorAngle;
    
    // Define key points for the zigzag path
    // P0: Center (or close to it)
    // P1: Inner star tip
    // P2: Valley between stars
    // P3: Outer star tip
    // P4: Outer valley
    
    // Zigzag path points (alternating between ray angle and ray angle + half sector)
    const p0 = polarToCartesian(center.x, center.y, radii[0], baseAngle);
    const p1 = polarToCartesian(center.x, center.y, radii[1], baseAngle);
    const p2 = polarToCartesian(center.x, center.y, radii[2], baseAngle + halfSector);
    const p3 = polarToCartesian(center.x, center.y, radii[3], baseAngle);
    const p4 = polarToCartesian(center.x, center.y, radii[4], baseAngle + halfSector);
    const p5 = polarToCartesian(center.x, center.y, radii[5], baseAngle);
    
    // Also generate the mirrored path for the other side of the petal
    const m2 = polarToCartesian(center.x, center.y, radii[2], baseAngle - halfSector);
    const m4 = polarToCartesian(center.x, center.y, radii[4], baseAngle - halfSector);

    // Segments to draw as straps
    const segments = [
      { start: p1, end: p2, type: 'inner' },
      { start: p2, end: p3, type: 'mid' },
      { start: p3, end: p4, type: 'outer' },
      { start: p4, end: p5, type: 'edge' }
    ];

    segments.forEach((seg, idx) => {
      // Determine z-index for interlace effect
      // Simple heuristic: alternate z-index based on segment index
      // For real weaving, we'd need a graph traversal, but this visual approximation works for radial symmetry
      let zIndex = 10;
      if (showInterlace) {
        zIndex = idx % 2 === 0 ? 10 : 12;
      }

      if (curvedStyle) {
        // For curved style, we need control points
        // We approximate a curve by pulling the midpoint towards the center or outward
        const midX = (seg.start.x + seg.end.x) / 2;
        const midY = (seg.start.y + seg.end.y) / 2;
        
        // Simple control point logic: offset midpoint perpendicular to line
        // This creates the "floral" bulge
        const dx = seg.end.x - seg.start.x;
        const dy = seg.end.y - seg.start.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len;
        const ny = dx / len;
        
        // Direction depends on which "zig" or "zag" we are on
        const curveFactor = idx % 2 === 0 ? curveIntensity : -curveIntensity;
        const control = {
          x: midX + nx * len * curveFactor,
          y: midY + ny * len * curveFactor
        };

        const pathData = curveToRibbonPath(seg.start, control, seg.end, strapWidth);
        
        shapes.push({
          points: [], // Path based
          path: pathData,
          fill: colors.strap,
          stroke: colors.strapBorder,
          strokeWidth: lineWidth,
          isStrap: true,
          zIndex: zIndex
        });
      } else {
        // Straight geometric style
        const ribbonData = lineToRibbonPath(seg.start, seg.end, strapWidth, ribbonEnd);
        
        shapes.push({
          points: ribbonData.points || [],
          path: ribbonData.path,
          fill: colors.strap,
          stroke: colors.strapBorder,
          strokeWidth: lineWidth,
          isStrap: true,
          zIndex: zIndex
        });
      }
    });
  }

  // --- 2. Generate Fill Shapes (Negative Space) ---
  
  // Central Star
  const centralStarPoints: Point[] = [];
  for (let i = 0; i < branches; i++) {
    const angle = i * sectorAngle;
    // Inner radius slightly reduced to account for strap width
    const rInner = radii[1] - strapWidth * 0.6; 
    // Valley radius
    const rValley = radii[1] * 0.6; 
    
    centralStarPoints.push(polarToCartesian(center.x, center.y, rInner, angle));
    centralStarPoints.push(polarToCartesian(center.x, center.y, rValley, angle + halfSector));
  }
  
  shapes.push({
    points: centralStarPoints,
    fill: colors.primary,
    stroke: colors.strapBorder,
    strokeWidth: lineWidth,
    isStrap: false,
    zIndex: 5
  });

  // Petals / Diamonds between straps
  for (let i = 0; i < branches; i++) {
    const angle = i * sectorAngle;
    
    // 1. First ring of shapes (between p1-p2 and p2-p3)
    // These are usually diamond-like or kite-like shapes
    // We construct them by finding the "void" centers
    
    // Center of the void is roughly at angle + halfSector, radius between r1 and r2
    const voidAngle = angle + halfSector;
    
    // Inner Diamond (between first zigzags)
    if (!curvedStyle) {
      // Geometric fill
      const d1 = polarToCartesian(center.x, center.y, radii[1] + strapWidth, angle); // Tip near center
      const d2 = polarToCartesian(center.x, center.y, radii[2] - strapWidth*0.8, voidAngle); // Tip near valley
      const d3 = polarToCartesian(center.x, center.y, radii[3] - strapWidth, angle + sectorAngle); // Tip near next peak
      const d4 = polarToCartesian(center.x, center.y, radii[2] + strapWidth*0.8, voidAngle); // Outer tip
      
      // This logic is tricky because the straps overlap. 
      // A simpler approach for fills in this specific "skeleton" method is to define polygons 
      // that connect the skeleton nodes, then rely on the straps (drawn on top) to cover the edges.
      
      // Let's try the "Underlay" approach: Draw shapes connecting the skeleton nodes, 
      // but draw them with a lower Z-index so straps cover the messy joints.
      
      // Shape 1: The "Kite" in the valley (Radius 2)
      const k1 = polarToCartesian(center.x, center.y, radii[1], angle);
      const k2 = polarToCartesian(center.x, center.y, radii[2], angle + halfSector);
      const k3 = polarToCartesian(center.x, center.y, radii[1], angle + sectorAngle);
      const k4 = polarToCartesian(center.x, center.y, radii[0], angle + halfSector); // Center-ish
      
      // Actually, the pattern usually has a specific shape here.
      // Let's define a shape between the "V" of two adjacent rays.
      
      // Mid-layer petals (between radii 2 and 3)
      const m1 = polarToCartesian(center.x, center.y, radii[2], angle + halfSector);
      const m2 = polarToCartesian(center.x, center.y, radii[3], angle);
      const m3 = polarToCartesian(center.x, center.y, radii[2], angle - halfSector);
      const m4 = polarToCartesian(center.x, center.y, radii[1], angle);
      
      shapes.push({
        points: [m1, m2, m3, m4],
        fill: i % 2 === 0 ? colors.secondary : colors.accent,
        stroke: "none", // No stroke for fills, let straps handle borders
        strokeWidth: 0,
        isStrap: false,
        zIndex: 1 // Below straps
      });
      
      // Outer-layer petals (between radii 3 and 4)
      const o1 = polarToCartesian(center.x, center.y, radii[3], angle);
      const o2 = polarToCartesian(center.x, center.y, radii[4], angle + halfSector);
      const o3 = polarToCartesian(center.x, center.y, radii[5], angle);
      const o4 = polarToCartesian(center.x, center.y, radii[4], angle - halfSector);
      
      shapes.push({
        points: [o1, o2, o3, o4],
        fill: i % 2 === 0 ? colors.accent : colors.secondary,
        stroke: "none",
        strokeWidth: 0,
        isStrap: false,
        zIndex: 1
      });
    } else {
      // Curved fills - approximate with polygons for now, or use paths if we want to be precise.
      // Since straps are on top, polygons connecting the nodes work reasonably well visually.
      
      // Mid-layer
      const m1 = polarToCartesian(center.x, center.y, radii[2], angle + halfSector);
      const m2 = polarToCartesian(center.x, center.y, radii[3], angle);
      const m3 = polarToCartesian(center.x, center.y, radii[2], angle - halfSector);
      const m4 = polarToCartesian(center.x, center.y, radii[1], angle);
      
      shapes.push({
        points: [m1, m2, m3, m4],
        fill: i % 2 === 0 ? colors.secondary : colors.accent,
        stroke: "none",
        strokeWidth: 0,
        isStrap: false,
        zIndex: 1
      });
      
      // Outer-layer
      const o1 = polarToCartesian(center.x, center.y, radii[3], angle);
      const o2 = polarToCartesian(center.x, center.y, radii[4], angle + halfSector);
      const o3 = polarToCartesian(center.x, center.y, radii[5], angle);
      const o4 = polarToCartesian(center.x, center.y, radii[4], angle - halfSector);
      
      shapes.push({
        points: [o1, o2, o3, o4],
        fill: i % 2 === 0 ? colors.accent : colors.secondary,
        stroke: "none",
        strokeWidth: 0,
        isStrap: false,
        zIndex: 1
      });
    }
  }

  return shapes;
}
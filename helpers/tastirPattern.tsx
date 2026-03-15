/**
 * @file tastirPattern.tsx
 * @description Helper for generating the "Tastir" (Geometric Tessellation) pattern.
 * 
 * Tastir refers to the rigid, straight-line geometric frameworks in Moorish 
 * and Islamic architecture. It focuses on the mathematical interlacing of 
 * polygons on a grid. This module generates components like Khatam (8/12/16-pointed stars),
 * Maqrouts (diamonds), Kuhat (small contrast squares), and geometric Kufi calligraphy.
 */

import { Point, polarToCartesian, createRoundedPolygonPath, rotatePoint, getPolygonPoints } from "./geometryUtils";
import { generateStarShape } from "./starShapeGenerator";

export interface TastirOptions {
  tastirElement: "khatam" | "maqrouts" | "kuhat" | "kufi" | "zellige";
  tastirBranches: number;
  tastirDensity: number;
  tastirShowKuhat: boolean;
  tastirShowMaqrouts: boolean;
  tastirKufiText: "allah" | "bismillah" | "geometric";
}

const DEFAULT_OPTIONS: TastirOptions = {
  tastirElement: "zellige",
  tastirBranches: 8,
  tastirDensity: 3,
  tastirShowKuhat: true,
  tastirShowMaqrouts: true,
  tastirKufiText: "geometric",
};

/**
 * Generates a Tastir (Geometric) pattern tile based on traditional construction methods.
 * Includes Khatam (stars), Maqrouts (diamonds), Kuhat (cubes), and Kufi (geometric calligraphy).
 */
export function generateTastirTile(
  size: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: Partial<TastirOptions> = {}
): Array<{
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
}> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const shapes: Array<{
    points: Point[];
    fill: string;
    stroke: string;
    strokeWidth: number;
    path?: string;
  }> = [];

  const {
    tastirElement,
    tastirBranches,
    tastirDensity,
    tastirShowKuhat,
    tastirShowMaqrouts,
    tastirKufiText,
  } = config;

    // Use a function to check element type to avoid TypeScript narrowing issues
  const isElement = (types: string[]): boolean => types.includes(tastirElement);

  // Grid setup
  const cellSize = size / tastirDensity;
  const halfCell = cellSize / 2;

  // Helper to add a shape
  const addShape = (points: Point[], fill: string, strokeWidth: number = lineWidth) => {
    shapes.push({
      points,
      fill,
      stroke: colors.line,
      strokeWidth,
      path: createRoundedPolygonPath(points, 0), // Tastir is usually sharp
    });
  };

  // 1. Kufi Generation (Geometric Calligraphy)
  if (tastirElement === "kufi") {
    // Simplified geometric Kufi representation using a grid system
    // We'll create a band of text repeated vertically
    const rows = tastirDensity;
    const rowHeight = size / rows;
    
    for (let r = 0; r < rows; r++) {
      const yOffset = r * rowHeight;
      const centerY = yOffset + rowHeight / 2;
      
      // Draw a decorative border line top and bottom
      addShape([
        { x: 0, y: yOffset + rowHeight * 0.1 },
        { x: size, y: yOffset + rowHeight * 0.1 },
        { x: size, y: yOffset + rowHeight * 0.15 },
        { x: 0, y: yOffset + rowHeight * 0.15 }
      ], colors.secondary);

      addShape([
        { x: 0, y: yOffset + rowHeight * 0.85 },
        { x: size, y: yOffset + rowHeight * 0.85 },
        { x: size, y: yOffset + rowHeight * 0.9 },
        { x: 0, y: yOffset + rowHeight * 0.9 }
      ], colors.secondary);

      // Generate "text" blocks based on the selected word style
      // This is an abstract geometric representation
      const unitWidth = size / (tastirKufiText === "allah" ? 4 : tastirKufiText === "bismillah" ? 6 : 8);
      const blockHeight = rowHeight * 0.6;
      const blockY = centerY - blockHeight / 2;

      const numUnits = Math.floor(size / unitWidth);
      
      for (let i = 0; i < numUnits; i++) {
        const x = i * unitWidth;
        
        // Create vertical strokes (alifs/lams)
        if (i % 2 === 0) {
          addShape([
            { x: x + unitWidth * 0.2, y: blockY },
            { x: x + unitWidth * 0.4, y: blockY },
            { x: x + unitWidth * 0.4, y: blockY + blockHeight },
            { x: x + unitWidth * 0.2, y: blockY + blockHeight }
          ], colors.primary);
        } 
        // Create horizontal connectors or dots
        else {
           // Horizontal base
           addShape([
            { x: x, y: blockY + blockHeight * 0.8 },
            { x: x + unitWidth, y: blockY + blockHeight * 0.8 },
            { x: x + unitWidth, y: blockY + blockHeight },
            { x: x, y: blockY + blockHeight }
          ], colors.accent);

          // Decorative square/dot (Kuhat style)
          if (tastirShowKuhat) {
             const dotSize = unitWidth * 0.3;
             addShape([
               { x: x + unitWidth/2 - dotSize/2, y: blockY + blockHeight * 0.3 },
               { x: x + unitWidth/2 + dotSize/2, y: blockY + blockHeight * 0.3 },
               { x: x + unitWidth/2 + dotSize/2, y: blockY + blockHeight * 0.3 + dotSize },
               { x: x + unitWidth/2 - dotSize/2, y: blockY + blockHeight * 0.3 + dotSize }
             ], colors.line); // Dark/Black usually
          }
        }
      }
    }
    return shapes;
  }

  // 2. Grid-based Geometric Patterns (Khatam, Maqrouts, Kuhat, Zellige)
  
  // Iterate through the grid
  for (let row = 0; row < tastirDensity; row++) {
    for (let col = 0; col < tastirDensity; col++) {
      const cx = col * cellSize + halfCell;
      const cy = row * cellSize + halfCell;
      
      // Determine if we should draw specific elements based on checkerboard or all cells
      // For dense patterns, we usually fill every cell
      
      // --- KHATAM (Star) ---
      if (isElement(["khatam", "zellige"])) {
        const starRadius = halfCell * 0.9;
        const innerRadius = starRadius * 0.45; // Classic proportion
        
        // Main Star
        const star = generateStarShape(
          cx, cy, 
          starRadius, 
          innerRadius, 
          tastirBranches, 
          0, // rotation
          0  // rounding (sharp)
        );
        
        if (star.points) {
          addShape(star.points, colors.primary);
        }

        // Star Center (often a smaller star or polygon)
        const centerSize = innerRadius * 0.6;
        const centerPoly = getPolygonPoints(cx, cy, centerSize, tastirBranches);
        addShape(centerPoly, colors.accent);
      }

      // --- MAQROUTS (Diamonds) ---
      // Usually placed in corners or between stars
      if (isElement(["maqrouts"]) || (isElement(["zellige"]) && tastirShowMaqrouts)) {
        // Place diamonds at the corners of the cell
        const cornerOffset = halfCell;
        const diamondSize = cellSize * 0.15;
        
        // 4 corners of the cell
        const corners = [
          { x: cx - cornerOffset, y: cy - cornerOffset },
          { x: cx + cornerOffset, y: cy - cornerOffset },
          { x: cx + cornerOffset, y: cy + cornerOffset },
          { x: cx - cornerOffset, y: cy + cornerOffset },
        ];

        corners.forEach(corner => {
          // Only draw if within bounds or if we want tiling continuity (which we do)
          // Simple diamond shape
          const diamond = [
            { x: corner.x, y: corner.y - diamondSize },
            { x: corner.x + diamondSize, y: corner.y },
            { x: corner.x, y: corner.y + diamondSize },
            { x: corner.x - diamondSize, y: corner.y },
          ];
          addShape(diamond, colors.secondary);
        });
        
        // If only Maqrouts selected, maybe fill the center too
        if (isElement(["maqrouts"])) {
           const centerDiamond = [
            { x: cx, y: cy - halfCell * 0.5 },
            { x: cx + halfCell * 0.5, y: cy },
            { x: cx, y: cy + halfCell * 0.5 },
            { x: cx - halfCell * 0.5, y: cy },
          ];
          addShape(centerDiamond, colors.primary);
        }
      }

      // --- KUHAT (Small Cubes/Squares) ---
      // Usually at vertices of the star or grid intersections
      if (isElement(["kuhat"]) || (isElement(["zellige"]) && tastirShowKuhat)) {
        const kuhatSize = cellSize * 0.05;
        
        // Place at star tips if star exists
        if (isElement(["khatam", "zellige"])) {
          const starRadius = halfCell * 0.9;
          for (let i = 0; i < tastirBranches; i++) {
            const angle = (i * 360) / tastirBranches;
            const tip = polarToCartesian(cx, cy, starRadius, angle);
            
            // Small square at tip
            const square = getPolygonPoints(tip.x, tip.y, kuhatSize, 4, 45); // 45 deg for square aligned with axes
            addShape(square, colors.line); // Dark color usually
          }
        }
        
        // If just Kuhat, make a grid of them
        if (isElement(["kuhat"])) {
           // Grid of squares
           const square = getPolygonPoints(cx, cy, halfCell * 0.5, 4, 45);
           addShape(square, colors.accent);
           
           // Inner dark square
           const innerSquare = getPolygonPoints(cx, cy, halfCell * 0.2, 4, 45);
           addShape(innerSquare, colors.line);
        }
      }
    }
  }

  return shapes;
}
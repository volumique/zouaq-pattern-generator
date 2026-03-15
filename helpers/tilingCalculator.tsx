/**
 * @file tilingCalculator.tsx
 * @description Helper for calculating tile positions in different tiling modes for Moroccan pattern generation.
 * 
 * Supports 3 main tiling systems:
 * 1. Simple Grid: Standard square grid where tiles are placed side-by-side.
 * 2. Offset Grids: Diagonal (45° shift), Brick (staggered rows), Hexagonal (honeycomb offset).
 * 3. Wallpaper Groups: The 17 mathematical symmetry groups for 2D plane tiling.
 * 
 * ASCII Diagrams for Offset Grids:
 * 
 * Brick Offset Pattern:
 * Row 0: [Tile][Tile][Tile]
 * Row 1:   [Tile][Tile][Tile]
 * Row 2: [Tile][Tile][Tile]
 * 
 * Hexagonal Layout:
 * Row 0:  / \ / \ / \
 *        |   |   |   |
 * Row 1:  \ / \ / \ /
 *          |   |   |
 */

import { Point } from "./geometryUtils";

/**
 * Basic non-symmetry based tiling modes.
 */
export type TilingMode = "grid" | "diagonal" | "brick" | "hexagonal";

/**
 * The 17 Wallpaper Groups.
 * These are the ONLY 17 mathematically possible ways to tile a 2D plane.
 * 
 * Symmetry Properties:
 * p1: Translation only.
 * p2: 180° rotation.
 * p3: 120° rotation (triangular).
 * p4: 90° rotation (square).
 * p6: 60° rotation (hexagonal).
 * pm: Mirror (vertical axis).
 * pg: Glide reflection.
 * cm: Mirror + glide reflection.
 * pmm: Mirrors on 2 axes.
 * pmg: Mirror + glide perpendicular.
 * pgg: 2 perpendicular glide reflections.
 * cmm: Mirrors on 2 axes + 180° rotation.
 * p4m: Square with mirrors through corners (8-fold symmetry, common in Zellige).
 * p4g: Square with mirrors through edges.
 * p3m1: Triangular with mirrors through vertices.
 * p31m: Triangular with mirrors through edges.
 * p6m: Hexagonal with mirrors (12-fold symmetry, common in Alhambra).
 */
export type WallpaperGroup = 
  | "p1" | "p2" | "p3" | "p4" | "p6"
  | "pm" | "pg" | "cm" | "pmm" | "pmg" | "pgg" | "cmm"
  | "p4m" | "p4g" | "p3m1" | "p31m" | "p6m";

/**
 * Represents the position and transformation of a placed tile.
 */
export interface TilePosition {
  x: number;
  y: number;
  rotation: number;
  scaleX?: number; // -1 for mirror reflection across Y axis
  scaleY?: number; // -1 for mirror reflection across X axis
}

/**
 * Interface for a transformation within a fundamental domain.
 * Used internally for Wallpaper Group calculations.
 */
interface Transformation {
  x: number;
  y: number;
  rotation: number;
  scaleX: number; // -1 for mirror
  scaleY: number; // -1 for mirror
}

/**
 * Options for calculating tile positions in basic modes.
 */
export interface TilingCalculatorOptions {
  mode: TilingMode;
  tileSize: number;
  tilingOffset: number;
  tilingRotation: number;
  spacing: number;
}

// ============================================================================
// BASIC TILING SYSTEM
// ============================================================================

/**
 * Calculates the position and rotation for a tile in the grid based on the tiling mode.
 * 
 * @param row The current row index.
 * @param col The current column index.
 * @param options Configuration options including mode, size, and offsets.
 * @returns The calculated TilePosition.
 */
export function calculateTilePosition(
  row: number,
  col: number,
  options: TilingCalculatorOptions
): TilePosition {
  const { mode, tileSize, tilingOffset, tilingRotation, spacing } = options;

  // Calculate the effective size including the spacing ratio
  const effectiveTileSize = tileSize * (1 + (spacing || 0));
  let x = 0;
  let y = 0;
  const rotation = tilingRotation;

  switch (mode) {
    case "grid":
      // Standard layout
      x = col * effectiveTileSize;
      y = row * effectiveTileSize;
      break;

    case "diagonal":
      // Modified diagonal grid (alternating shift) to avoid overlap
      // Shift every even row by half a tile size
      x = col * effectiveTileSize;
      if (row % 2 === 0) {
        x += effectiveTileSize / 2;
      }
      y = row * effectiveTileSize * 0.707; // sin(45°) approximation
      break;

    case "brick":
      // Brick pattern: offset every other row (odd rows)
      x = col * effectiveTileSize;
      if (row % 2 === 1) {
        x += effectiveTileSize * tilingOffset;
      }
      y = row * effectiveTileSize;
      break;

    case "hexagonal":
      // Hexagonal grid: stagger odd rows and compress vertically
      x = col * effectiveTileSize;
      if (row % 2 === 1) {
        x += effectiveTileSize / 2;
      }
      y = row * effectiveTileSize * 0.866; // sin(60°) for perfect nesting
      break;
  }

  return { x, y, rotation };
}

/**
 * Calculates grid dimensions needed to cover a canvas with the given tiling mode.
 * 
 * @param canvasWidth Total canvas width.
 * @param canvasHeight Total canvas height.
 * @param tileSize Base size of a tile.
 * @param mode The tiling layout mode.
 * @returns Object containing the number of rows and cols required.
 */
export function calculateGridDimensions(
  canvasWidth: number,
  canvasHeight: number,
  tileSize: number,
  mode: TilingMode
): { rows: number; cols: number } {
  let cols = Math.ceil(canvasWidth / tileSize);
  let rows = Math.ceil(canvasHeight / tileSize);

  // Add extra tiles to account for diagonal and hexagonal pattern compression and shifting
  if (mode === "diagonal") {
    cols = Math.ceil(canvasWidth / tileSize) + 1;
    rows = Math.ceil(canvasHeight / (tileSize * 0.707)) + 1;
  } else if (mode === "hexagonal") {
    cols += 1;
    rows = Math.ceil(canvasHeight / (tileSize * 0.866)) + 1;
  } else if (mode === "brick") {
    cols += 1; // Extra column to cover the brick offset gap on edges
  }

  return { rows, cols };
}

/**
 * Calculates positions for interstice shapes (gaps) between tiles.
 * 
 * @param rows Total number of rows.
 * @param cols Total number of columns.
 * @param tileSize Effective tile size (including spacing).
 * @param mode Tiling mode to calculate gaps for.
 * @returns Array of Points where interstices should be placed.
 */
export function calculateIntersticePositions(
  rows: number,
  cols: number,
  tileSize: number,
  mode: TilingMode
): Point[] {
  const positions: Point[] = [];

  switch (mode) {
    case "grid":
      // Interstices at corners (between 4 tiles)
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          positions.push({
            x: (col + 1) * tileSize,
            y: (row + 1) * tileSize,
          });
        }
      }
      break;

    case "brick":
      // Interstices in the gaps created by brick pattern staggered joints
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols; col++) {
          const offset = row % 2 === 0 ? 0.5 : 0;
          positions.push({
            x: (col + offset) * tileSize,
            y: (row + 0.5) * tileSize,
          });
        }
      }
      break;

    case "diagonal":
      // Interstices in diagonal gaps
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols; col++) {
          const offset = row % 2 === 1 ? 0.5 : 0;
          positions.push({
            x: (col + offset) * tileSize,
            y: (row + 0.5) * tileSize * 0.707,
          });
        }
      }
      break;

    case "hexagonal":
      // Interstices in hexagonal gaps
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const offset = row % 2 === 1 ? 0.5 : 0;
          positions.push({
            x: (col + offset + 0.5) * tileSize,
            y: (row + 0.5) * tileSize * 0.866,
          });
        }
      }
      break;
  }

  return positions;
}

// ============================================================================
// WALLPAPER GROUP SYSTEM
// ============================================================================

/**
 * Gets the fundamental domain transformations for a wallpaper group.
 * These define how a single tile is transformed to create the full pattern within one cell.
 * Returns transformations relative to the cell center (0,0).
 * 
 * @param group The mathematical wallpaper group to simulate.
 * @param cellWidth Cell bounding width.
 * @param cellHeight Cell bounding height.
 * @returns Array of Transformations indicating translation, rotation, and reflection.
 */
export function getWallpaperTransformations(
  group: WallpaperGroup,
  cellWidth: number,
  cellHeight: number
): Transformation[] {
  // NOTE: Transformations are defined relative to (0,0) as the center.
  // This ensures proper centering and rotation around the tile's midpoint.
  const transformations: Transformation[] = [];

  switch (group) {
    case "p1":
      // Translation only - no symmetry
      transformations.push({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
      break;

    case "p2":
      // 180° rotation about center
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: 1, scaleY: 1 }
      );
      break;

    case "p3":
      // 120° rotation (triangular symmetry)
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 120, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 240, scaleX: 1, scaleY: 1 }
      );
      break;

    case "p4":
      // 90° rotation (square symmetry)
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 90, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 270, scaleX: 1, scaleY: 1 }
      );
      break;

    case "p6":
      // 60° rotation (hexagonal symmetry)
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 60, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 120, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 240, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 300, scaleX: 1, scaleY: 1 }
      );
      break;

    case "pm":
      // Mirror (vertical axis)
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 0, scaleX: -1, scaleY: 1 }
      );
      break;

    case "pg":
      // Glide reflection (translate + reflect)
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: cellHeight / 2, rotation: 0, scaleX: -1, scaleY: 1 }
      );
      break;

    case "cm":
      // Mirror + glide (diagonal mirror)
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 0, scaleX: -1, scaleY: 1 },
        { x: cellWidth / 2, y: cellHeight / 2, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: cellWidth / 2, y: cellHeight / 2, rotation: 0, scaleX: -1, scaleY: 1 }
      );
      break;

    case "pmm":
      // Mirror on 2 perpendicular axes
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 0, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: -1 },
        { x: 0, y: 0, rotation: 0, scaleX: -1, scaleY: -1 }
      );
      break;

    case "pmg":
      // Mirror + glide perpendicular
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 0, scaleX: -1, scaleY: 1 },
        { x: cellWidth / 2, y: cellHeight / 2, rotation: 180, scaleX: 1, scaleY: 1 },
        { x: cellWidth / 2, y: cellHeight / 2, rotation: 180, scaleX: -1, scaleY: 1 }
      );
      break;

    case "pgg":
      // 2 perpendicular glide reflections
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: cellWidth / 2, y: 0, rotation: 0, scaleX: -1, scaleY: 1 },
        { x: 0, y: cellHeight / 2, rotation: 0, scaleX: 1, scaleY: -1 },
        { x: cellWidth / 2, y: cellHeight / 2, rotation: 0, scaleX: -1, scaleY: -1 }
      );
      break;

    case "cmm":
      // Mirror on 2 axes + 180° rotation (rhombic)
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 0, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: -1, scaleY: 1 }
      );
      break;

    case "p4m":
      // Square with mirrors through corners (8-fold symmetry)
      // This is the most common in Zellige patterns
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 90, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 270, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 0, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 90, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 270, scaleX: -1, scaleY: 1 }
      );
      break;

    case "p4g":
      // Square with mirrors through edges
      // Offset by 1/4 cell dimensions for glide reflections
      const qx = cellWidth / 4;
      const qy = cellHeight / 4;
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 90, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 270, scaleX: 1, scaleY: 1 },
        // These glides are offset from the center
        { x: qx, y: qy, rotation: 45, scaleX: -1, scaleY: 1 },
        { x: qx, y: qy, rotation: 135, scaleX: -1, scaleY: 1 },
        { x: qx, y: qy, rotation: 225, scaleX: -1, scaleY: 1 },
        { x: qx, y: qy, rotation: 315, scaleX: -1, scaleY: 1 }
      );
      break;

    case "p3m1":
      // Triangular with mirrors through vertices (6-fold symmetry)
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 120, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 240, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 0, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 120, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 240, scaleX: -1, scaleY: 1 }
      );
      break;

    case "p31m":
      // Triangular with mirrors through edges
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 120, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 240, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 60, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 300, scaleX: -1, scaleY: 1 }
      );
      break;

    case "p6m":
      // Hexagonal with mirrors (12-fold symmetry)
      // This is common in Alhambra patterns
      transformations.push(
        { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 60, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 120, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 240, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 300, scaleX: 1, scaleY: 1 },
        { x: 0, y: 0, rotation: 0, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 60, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 120, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 180, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 240, scaleX: -1, scaleY: 1 },
        { x: 0, y: 0, rotation: 300, scaleX: -1, scaleY: 1 }
      );
      break;
  }

  return transformations;
}

/**
 * Calculates tile positions for a wallpaper group.
 * Returns positions with proper transformations (translation, rotation, reflection) applied to a grid of fundamental cells.
 * 
 * @param canvasWidth Width of the drawing area.
 * @param canvasHeight Height of the drawing area.
 * @param tileSize Base size of the tile.
 * @param group The wallpaper group to apply.
 * @param spacing Optional spacing ratio between tiles.
 * @returns Array of TilePositions indicating exactly where and how to render each instance of the base tile.
 */
export function calculateWallpaperTilePositions(
  canvasWidth: number,
  canvasHeight: number,
  tileSize: number,
  group: WallpaperGroup,
  spacing: number = 0
): TilePosition[] {
  const positions: TilePosition[] = [];

  // Determine effective tile size with spacing
  const effectiveTileSize = tileSize * (1 + spacing);

  // Determine cell dimensions based on wallpaper group symmetries
  let cellWidth = effectiveTileSize;
  let cellHeight = effectiveTileSize;

  // Adjust cell dimensions for specific groups that pack differently
  if (group === "p3" || group === "p3m1" || group === "p31m") {
    // Triangular groups need taller cells to maintain proper side lengths
    cellHeight = effectiveTileSize * Math.sqrt(3);
  } else if (group === "p6" || group === "p6m") {
    // Hexagonal groups need adjusted height for correct packing
    cellHeight = (effectiveTileSize * Math.sqrt(3)) / 2;
  }

  // Calculate how many fundamental cells we need to cover the canvas
  const cols = Math.ceil(canvasWidth / cellWidth) + 1;
  const rows = Math.ceil(canvasHeight / cellHeight) + 1;

  // Get fundamental transformations for this wallpaper group
  const transformations = getWallpaperTransformations(group, cellWidth, cellHeight);

  // Generate positions for each fundamental cell across the grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellX = col * cellWidth;
      const cellY = row * cellHeight;

      // For hexagonal groups, offset every other row to allow nesting
      const offsetX = (group === "p6" || group === "p6m") && row % 2 === 1 
        ? cellWidth / 2 
        : 0;

      // Apply each transformation within this cell
      // Since transformations are relative to center (0,0), we add cellWidth/2 and cellHeight/2
      // to center the tile within its local grid cell.
      transformations.forEach((transform) => {
        positions.push({
          x: cellX + cellWidth / 2 + transform.x + offsetX,
          y: cellY + cellHeight / 2 + transform.y,
          rotation: transform.rotation,
          scaleX: transform.scaleX,
          scaleY: transform.scaleY,
        });
      });
    }
  }

  return positions;
}
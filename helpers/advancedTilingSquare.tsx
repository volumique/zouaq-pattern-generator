/**
 * @file advancedTilingSquare.tsx
 * @description Implements Square-based advanced tilings: Truncated Square (Archimedean 4.8.8) and Quadrilateral (p2 rotation).
 */

import { AdvancedTilingResult, AdvancedTilePosition } from "./advancedTilingUtils";

// =============================================================================
// 2. Truncated Square Tiling (4.8.8)
// =============================================================================

/**
 * Generates an Archimedean tiling where every vertex connects one square and two octagons (4.8.8).
 * Primary tiles act as octagons placed on a standard grid.
 * Secondary tiles act as squares placed at the diagonal interstices, scaled down and rotated 45°.
 * 
 * @param tileSize Base size representing the primary octagon.
 * @param tiling Grid dimension.
 * @param spacing Spacing ratio.
 * @returns Raw generated tile positions.
 */
export function computeTruncatedSquareTiling(
  tileSize: number,
  tiling: number,
  spacing: number
): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  const effectiveSize = tileSize * (1 + spacing);
  
  // Grid bounds with overflow
  const overflow = 1;
  const rows = tiling + overflow;
  const cols = tiling + overflow;

  for (let r = -overflow; r < rows; r++) {
    for (let c = -overflow; c < cols; c++) {
      const cx = c * effectiveSize;
      const cy = r * effectiveSize;

      // 1. Place the Octagon (Main primary tile) centered in the grid cell
      positions.push({
        x: cx + effectiveSize / 2,
        y: cy + effectiveSize / 2,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        tileType: "octagon",
      });

      // 2. Place the Square (Secondary interstitial tile) at the bottom-right corner of the cell.
      // The side length ratio of square to octagon in 4.8.8 is 1 / (1 + sqrt(2)) ~ 0.414.
      const scaleRatio = 1 / (1 + Math.SQRT2);

      positions.push({
        x: cx + effectiveSize, 
        y: cy + effectiveSize, 
        rotation: 45, // Rotate 45° to fit the truncated corners
        scaleX: scaleRatio,
        scaleY: scaleRatio,
        tileType: "square",
      });
    }
  }

  return {
    positions,
    totalWidth: cols * effectiveSize,
    totalHeight: rows * effectiveSize,
  };
}

// =============================================================================
// 3. Quadrilateral Tiling (Rotation around midpoints)
// =============================================================================

/**
 * Simulates a p2 symmetry tiling of general quadrilaterals.
 * Creates 2x2 "macro-cells" (fundamental domains) where tiles are placed and rotated 180° 
 * to create a woven, locked appearance.
 * 
 * @param tileSize Base side length.
 * @param tiling Generation count.
 * @param spacing Space ratio.
 * @returns Raw generated tile positions.
 */
export function computeQuadrilateralTiling(
  tileSize: number,
  tiling: number,
  spacing: number
): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  const effectiveSize = tileSize * (1 + spacing);
  
  const overflow = 1;
  const rows = tiling + overflow;
  const cols = tiling + overflow;

  // Iterate in large "macro-cells", each taking 2x2 the area of a base tile
  for (let r = -overflow; r < rows; r++) {
    for (let c = -overflow; c < cols; c++) {
      const bx = c * effectiveSize * 2;
      const by = r * effectiveSize * 2;

      // Tile 1: Top-left of the macro-cell
      positions.push({
        x: bx + effectiveSize / 2,
        y: by + effectiveSize / 2,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        tileType: "A",
      });

      // Tile 2: Center (effectively bottom-right of inner 2x2), rotated 180°
      positions.push({
        x: bx + effectiveSize,
        y: by + effectiveSize,
        rotation: 180,
        scaleX: 1,
        scaleY: 1,
        tileType: "B",
      });
      
      // Tile 3: Top-Right of the macro-cell
      positions.push({
        x: bx + effectiveSize * 1.5,
        y: by + effectiveSize / 2,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        tileType: "A",
      });

      // Tile 4: Bottom-Left of the macro-cell, rotated 180°
      positions.push({
        x: bx + effectiveSize / 2,
        y: by + effectiveSize * 1.5,
        rotation: 180,
        scaleX: 1,
        scaleY: 1,
        tileType: "B",
      });
    }
  }

  return {
    positions,
    totalWidth: cols * effectiveSize * 2,
    totalHeight: rows * effectiveSize * 2,
  };
}
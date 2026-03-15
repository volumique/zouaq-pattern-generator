/**
 * @file advancedTilingTriangular.tsx
 * @description Implements the Triangular (3.3.3.3.3.3) Tiling.
 * Maps tiles to a regular grid of equilateral triangles, where 6 triangles meet at every vertex.
 */

import { AdvancedTilingResult, AdvancedTilePosition } from "./advancedTilingUtils";

// =============================================================================
// 1. Triangular Tiling (3.3.3.3.3.3)
// =============================================================================

/**
 * Computes a grid of equilateral triangles.
 * To interlock properly, the pattern alternates between "upright" (0°) triangles
 * and "inverted" (180°) triangles. Odd rows are offset horizontally to align vertices.
 * 
 * @param tileSize Base side length of the triangle tile.
 * @param tiling Generation count (grid dimension).
 * @param spacing Space ratio between tiles.
 * @returns Unnormalized AdvancedTilingResult containing the up/down positions.
 */
export function computeTriangularTiling(
  tileSize: number,
  tiling: number,
  spacing: number
): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  const effectiveSize = tileSize * (1 + spacing);
  
  // Height of a perfect equilateral triangle given its base (effectiveSize)
  // h = a * (sqrt(3) / 2)
  const triHeight = (effectiveSize * Math.sqrt(3)) / 2;
  
  // Generate extra tiles (overflow) to ensure coverage after rotation/cropping in normalization
  const overflow = 1;
  const cols = tiling + 1 + overflow;
  const rows = tiling + 1 + overflow;

  for (let r = -overflow; r < rows; r++) {
    for (let c = -overflow; c < cols; c++) {
      // Calculate center y-position for this row
      const y = r * triHeight;
      // Base x-position for this column
      let x = c * effectiveSize;
      
      // Shift odd rows by half a width to interlock the bases of the triangles
      // Modulo math with negatives needs caution in JS, so we check parity
      if (Math.abs(r % 2) === 1) {
        x += effectiveSize / 2;
      }

      // 1. Place the "Up" pointing triangle
      positions.push({
        x: x + effectiveSize / 2,
        y: y + triHeight / 2,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        tileType: "up",
      });

      // 2. Place the "Down" pointing triangle (the interstitial space)
      positions.push({
        x: x + effectiveSize,
        y: y + triHeight / 2,
        rotation: 180,
        scaleX: 1,
        scaleY: 1,
        tileType: "down",
      });
    }
  }

  // Dimensions returned here are raw bounds for the unshifted generation;
  // they will be overridden by the dispatcher's normalizeToSquare.
  return {
    positions,
    totalWidth: cols * effectiveSize,
    totalHeight: rows * triHeight,
  };
}
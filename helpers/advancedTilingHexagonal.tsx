/**
 * @file advancedTilingHexagonal.tsx
 * @description Implements true Hexagonal Honeycomb packing.
 */

import { AdvancedTilingResult, AdvancedTilePosition } from "./advancedTilingUtils";

// =============================================================================
// 5. Hexagonal Honeycomb (True Hex Packing)
// =============================================================================

/**
 * Implements a true mathematical hexagonal honeycomb layout.
 * Unlike the basic offset grid, this uses exact apothem/radius math (sqrt(3))
 * to pack perfectly. It also alternatingly rotates tiles by 30° across columns 
 * to create varied 6-way symmetric visual effects.
 * 
 * Column X increment: 1.5 * Radius
 * Row Y increment: sqrt(3) * Radius
 * 
 * @param tileSize Base size of the hexagon's bounds.
 * @param tiling Generation dimension.
 * @param spacing Space ratio.
 * @returns Raw generated tile positions.
 */
export function computeHexagonalHoneycomb(
  tileSize: number,
  tiling: number,
  spacing: number
): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  
  const effectiveSize = tileSize * (1 + spacing);
  
  // Derivation of hexagon radius from total width
  const hexRadius = effectiveSize / 1.7; 
  
  const overflow = 1;
  const cols = tiling + 1 + overflow;
  const rows = tiling + 1 + overflow;

  for (let c = -overflow; c < cols; c++) {
    for (let r = -overflow; r < rows; r++) {
      // Offset logic for true honeycomb nesting
      // X steps by 1.5R (since hexagons share vertical edges)
      const xOffset = c * (hexRadius * 1.5); 
      // Y steps by the full height (sqrt(3)*R), and odd columns shift down by half height
      const yOffset = r * (hexRadius * Math.sqrt(3)) + (Math.abs(c % 2)) * (hexRadius * Math.sqrt(3) / 2);

      // Rotate tiles based on column to create 6-way symmetry feel.
      // Use positive modulo math to avoid negative results on c < 0
      const colIndexForRotation = ((c % 2) + 2) % 2; 
      const rotation = colIndexForRotation === 0 ? 0 : 30;

      positions.push({
        x: xOffset + effectiveSize/2, 
        y: yOffset + effectiveSize/2,
        rotation: rotation,
        scaleX: 1,
        scaleY: 1,
        tileType: "hex",
      });
    }
  }

  const maxX = cols * (hexRadius * 1.5) + effectiveSize;
  const maxY = rows * (hexRadius * Math.sqrt(3)) + effectiveSize;

  return {
    positions,
    totalWidth: maxX,
    totalHeight: maxY,
  };
}
/**
 * @file advancedTilingPenrose.tsx
 * @description Implements a radial star pattern approximation of the Penrose P3 Tiling.
 */

import { AdvancedTilingResult, AdvancedTilePosition } from "./advancedTilingUtils";

// =============================================================================
// 4. Penrose Tiling (Star Pattern Approximation)
// =============================================================================

/**
 * Generates an approximation of non-periodic Penrose P3 tilings.
 * Instead of a true recursive deflation algorithm, this generates a radial 
 * expanding star with 5-fold and 10-fold symmetry rings.
 * Tiles alternate scales based on the Golden Ratio (Phi) to simulate the "Fat" and "Thin" rhombs.
 * 
 * @param tileSize Base scale.
 * @param tiling Generation depth (number of concentric rings).
 * @param spacing Spacing ratio.
 * @returns Raw radially generated positions centered around (0,0).
 */
export function computePenroseTiling(
  tileSize: number,
  tiling: number,
  spacing: number
): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  const effectiveSize = tileSize * (1 + spacing);
  
  // The Golden Ratio, fundamental to 5-fold symmetry and Penrose math.
  const PHI = (1 + Math.sqrt(5)) / 2;
  
  // Place the central focal tile
  positions.push({
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    tileType: "center",
  });

  // Generate concentric rings expanding outward.
  // Multiply tiling by 2 to ensure we generate enough bounds to fill the canvas.
  const numRings = Math.max(2, tiling * 2); 
  
  for (let ring = 1; ring <= numRings; ring++) {
    // Each ring expands its radius proportionally
    const radius = ring * effectiveSize * 0.8; 
    
    // Number of tiles increases by 5 each ring to maintain uniform density
    const tilesInRing = ring * 5; 
    
    for (let i = 0; i < tilesInRing; i++) {
      const angleDeg = (i / tilesInRing) * 360;
      const angleRad = (angleDeg * Math.PI) / 180;
      
      // Convert polar coordinates to Cartesian for the tile center
      const px = Math.cos(angleRad) * radius;
      const py = Math.sin(angleRad) * radius;
      
      // Orient the tile tangent to the ring, offsetting every other ring by half a step (36°)
      const rotation = angleDeg + 90 + (ring % 2 === 0 ? 36 : 0);

      // Alternate tiles between "fat" (scale=1) and "thin" (scale=1/Phi)
      const isFat = (i + ring) % 2 === 0;
      const scale = isFat ? 1 : 1 / PHI;

      positions.push({
        x: px,
        y: py,
        rotation: rotation,
        scaleX: scale,
        scaleY: scale,
        tileType: isFat ? "fat" : "thin",
      });
    }
  }
  
  // The normalization step in the dispatcher will shift these negative/positive coords
  // into a proper (0,0) bounding box.
  const totalRadius = numRings * effectiveSize * 0.8 + effectiveSize;
  const width = totalRadius * 2;
  const height = totalRadius * 2;
  
  return {
    positions,
    totalWidth: width,
    totalHeight: height,
  };
}
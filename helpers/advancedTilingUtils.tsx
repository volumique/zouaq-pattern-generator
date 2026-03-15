/**
 * @file advancedTilingUtils.tsx
 * @description Shared utilities, types, and bounding normalization logic for advanced tiling algorithms.
 */

/**
 * Union of supported advanced tiling modes.
 */
export type AdvancedTilingMode =
  | "triangular" // 6 equilateral triangles per vertex (3.3.3.3.3.3)
  | "truncatedSquare" // 4.8.8 Archimedean: octagons + squares
  | "quadrilateral" // Any quad rotated around midpoints to simulate p2 symmetry
  | "penrose" // Non-periodic Penrose P3 approximation (Golden ratio radii)
  | "hexagonalHoneycomb" // Proper honeycomb with true hex rotation/fit
  | "pentagonal"; // Convex pentagonal tilings (Reinhardt & Rice discoveries)

/**
 * Known sub-types of convex pentagonal tilings that can tile the plane.
 */
export type PentagonalSubType = "type1" | "type2" | "type4" | "type5" | "type9Rice";

/**
 * Details a single placed tile in an advanced tessellation.
 */
export interface AdvancedTilePosition {
  x: number; // Translation X coordinate (center of the tile)
  y: number; // Translation Y coordinate (center of the tile)
  rotation: number; // Rotation in degrees
  scaleX: number; // Scale X (used for reflections [-1] or relative sizing)
  scaleY: number; // Scale Y (used for reflections [-1] or relative sizing)
  tileType?: string; // Optional metadata identifying the tile's structural role (e.g. "octagon", "kite")
  opacity?: number; // Optional visual property for layered/faded effects
}

/**
 * The full output of an advanced tiling generation step.
 */
export interface AdvancedTilingResult {
  positions: AdvancedTilePosition[]; // All tiles placed within bounds
  totalWidth: number; // Target bounding box width
  totalHeight: number; // Target bounding box height
}

// ============================================================================
// NORMALIZATION UTILITIES
// ============================================================================

/**
 * Normalizes a set of tile positions to fit centrally within a target square canvas.
 * Advanced algorithms often generate positions centered around (0,0) or in an arbitrary bounding box.
 * This function calculates the actual bounds, shifts all tiles to positive coordinates,
 * and crops tiles falling completely outside a comfortable margin.
 * 
 * @param positions The raw generated tile positions from a sub-module.
 * @param tileSize Base tile size used for margin calculation.
 * @param tiling The repetition scale factor.
 * @param spacing The spacing ratio.
 * @returns A normalized AdvancedTilingResult fitted into a strict square.
 */
export function normalizeToSquare(
  positions: AdvancedTilePosition[],
  tileSize: number,
  tiling: number,
  spacing: number
): AdvancedTilingResult {
  if (positions.length === 0) {
    return { positions: [], totalWidth: 0, totalHeight: 0 };
  }

  // Target square size based on user's tiling parameter.
  // We want a square canvas that scales roughly linearly with the "tiling" count.
  const targetSide = tiling * tileSize * (1 + spacing);

  // Filter positions: keep tiles that are relevant to the target square.
  // We use a generous margin (2x tile size) to ensure tiles partially on screen are not clipped.
  const margin = tileSize * 2;
  const filtered: AdvancedTilePosition[] = [];

  // 1. Determine bounds of the generated positions to find their true center.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of positions) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  const generatedWidth = maxX - minX;
  const generatedHeight = maxY - minY;

  // 2. Calculate offsets to center the generated bounding box within the target square.
  // This shifts the pattern from whatever arbitrary coordinates it used into [0, targetSide].
  const offsetX = (targetSide - generatedWidth) / 2 - minX;
  const offsetY = (targetSide - generatedHeight) / 2 - minY;

  // 3. Apply offsets and crop out-of-bounds tiles.
  for (const p of positions) {
    const nx = p.x + offsetX;
    const ny = p.y + offsetY;
    
    // Keep if the tile is within the visible area plus margin
    // This effectively crops the "infinite" pattern to our finite square viewport.
    if (
      nx >= -margin &&
      nx <= targetSide + margin &&
      ny >= -margin &&
      ny <= targetSide + margin
    ) {
      filtered.push({ ...p, x: nx, y: ny });
    }
  }

  return {
    positions: filtered,
    totalWidth: targetSide,
    totalHeight: targetSide,
  };
}
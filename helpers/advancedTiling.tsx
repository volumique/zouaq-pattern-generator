/**
 * @file advancedTiling.tsx
 * @description Advanced Tiling Algorithms Dispatcher.
 *
 * This module acts as the central orchestrator for complex mathematical tiling patterns.
 * It delegates specific geometric tessellations and non-periodic tilings to specialized
 * sub-modules, gathering their results and normalizing them.
 * 
 * Sub-modules:
 * - Triangular: 3.3.3.3.3.3 equilateral tiling.
 * - Square/Truncated: Archimedean 4.8.8 and quadrilateral mid-point rotation.
 * - Penrose: Non-periodic star approximation.
 * - Hexagonal: Proper honeycomb packing.
 * - Pentagonal: Reinhardt & Rice convex pentagon types.
 */

import { 
  AdvancedTilingMode, 
  PentagonalSubType, 
  AdvancedTilingResult, 
  normalizeToSquare 
} from "./advancedTilingUtils";

import { computeTriangularTiling } from "./advancedTilingTriangular";
import { computeTruncatedSquareTiling, computeQuadrilateralTiling } from "./advancedTilingSquare";
import { computePenroseTiling } from "./advancedTilingPenrose";
import { computeHexagonalHoneycomb } from "./advancedTilingHexagonal";
import { computePentagonalTiling } from "./advancedTilingPentagonal";

export type { AdvancedTilingMode, PentagonalSubType, AdvancedTilePosition, AdvancedTilingResult } from "./advancedTilingUtils";

// ============================================================================
// MAIN DISPATCHER
// ============================================================================

/**
 * Computes positions for advanced tiling modes by delegating to the appropriate algorithm.
 * Automatically normalizes the infinite generated plane to a bounded square canvas.
 *
 * @param mode The advanced tiling algorithm to use (e.g., "penrose", "pentagonal").
 * @param tileSize The base size of a single tile/fundamental unit.
 * @param tiling Repetition count (dictates the scale/generations of the pattern).
 * @param spacing Spacing ratio between tiles (0 = no gap, 1 = 100% gap).
 * @param pentagonalSubType Optional sub-type, required only if mode is "pentagonal".
 * @returns An AdvancedTilingResult containing the bounded tile positions and canvas dimensions.
 */
export function computeAdvancedTiling(
  mode: AdvancedTilingMode,
  tileSize: number,
  tiling: number,
  spacing: number,
  pentagonalSubType?: PentagonalSubType
): AdvancedTilingResult {
  let rawResult: AdvancedTilingResult;

  // Dispatch to the specialized math module based on mode
  switch (mode) {
    case "triangular":
      rawResult = computeTriangularTiling(tileSize, tiling, spacing);
      break;
    case "truncatedSquare":
      rawResult = computeTruncatedSquareTiling(tileSize, tiling, spacing);
      break;
    case "quadrilateral":
      rawResult = computeQuadrilateralTiling(tileSize, tiling, spacing);
      break;
    case "penrose":
      rawResult = computePenroseTiling(tileSize, tiling, spacing);
      break;
    case "hexagonalHoneycomb":
      rawResult = computeHexagonalHoneycomb(tileSize, tiling, spacing);
      break;
    case "pentagonal":
      rawResult = computePentagonalTiling(tileSize, tiling, spacing, pentagonalSubType ?? "type1");
      break;
    default:
      rawResult = { positions: [], totalWidth: 0, totalHeight: 0 };
  }

  // Normalize all raw, potentially offset/infinite results to a centered square canvas
  return normalizeToSquare(rawResult.positions, tileSize, tiling, spacing);
}
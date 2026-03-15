/**
 * @file advancedTilingPentagonal.tsx
 * @description Implements Convex Pentagonal Tilings discovered by Reinhardt (1918) and Marjorie Rice (1977).
 */

import { AdvancedTilingResult, AdvancedTilePosition, PentagonalSubType } from "./advancedTilingUtils";

// =============================================================================
// 6. Pentagonal Tilings (Reinhardt & Rice)
// =============================================================================

/**
 * Dispatcher for the 5 supported sub-types of convex pentagonal tilings.
 * Pentagons cannot generally tile the plane, but 15 specific classes can.
 * This implements 5 of those distinct mathematical configurations.
 * 
 * @param tileSize Base size.
 * @param tiling Generation scale.
 * @param spacing Spacing ratio.
 * @param subType The specific pentagonal class to simulate.
 * @returns Raw generated tile positions.
 */
export function computePentagonalTiling(
  tileSize: number,
  tiling: number,
  spacing: number,
  subType: PentagonalSubType
): AdvancedTilingResult {
  switch (subType) {
    case "type1":
      return computePentType1(tileSize, tiling, spacing);
    case "type2":
      return computePentType2(tileSize, tiling, spacing);
    case "type4":
      return computePentType4(tileSize, tiling, spacing);
    case "type5":
      return computePentType5(tileSize, tiling, spacing);
    case "type9Rice":
      return computePentType9(tileSize, tiling, spacing);
    default:
      return computePentType1(tileSize, tiling, spacing);
  }
}

/**
 * Type 1 (Reinhardt, 1918): Constraint A + B + C = 360°.
 * Forms a parallelogram fundamental domain containing 2 tiles.
 */
function computePentType1(tileSize: number, tiling: number, spacing: number): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  const effectiveSize = tileSize * (1 + spacing);

  // The local tiles within one repeating fundamental block
  const fundamentalDomain = [
    { dx: 0, dy: 0, rotation: 0, scaleX: 1, scaleY: 1, tileType: "A" },
    { dx: effectiveSize * 0.6, dy: effectiveSize * 0.4, rotation: 180, scaleX: 1, scaleY: 1, tileType: "B" },
  ];

  // The translation vectors for repeating the block across the plane
  const T1 = { x: effectiveSize * 1.2, y: 0 };
  const T2 = { x: effectiveSize * 0.6, y: effectiveSize * 1.0 };

  const overflow = 1;
  const gridSize = tiling + 1 + overflow;
  
  for (let i = -overflow; i < gridSize; i++) {
    for (let j = -overflow; j < gridSize; j++) {
      const baseX = i * T1.x + j * T2.x;
      const baseY = i * T1.y + j * T2.y;

      fundamentalDomain.forEach((tile) => {
        positions.push({
          x: baseX + tile.dx,
          y: baseY + tile.dy,
          rotation: tile.rotation,
          scaleX: tile.scaleX,
          scaleY: tile.scaleY,
          tileType: tile.tileType,
        });
      });
    }
  }

  const totalWidth = gridSize * T1.x + effectiveSize;
  const totalHeight = gridSize * T2.y + effectiveSize;

  return { positions, totalWidth, totalHeight };
}

/**
 * Type 2 (Reinhardt, 1918): Constraint A + B + D = 360°.
 * Similar parallelogram block, but different internal rotations.
 */
function computePentType2(tileSize: number, tiling: number, spacing: number): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  const effectiveSize = tileSize * (1 + spacing);

  const fundamentalDomain = [
    { dx: 0, dy: 0, rotation: 0, scaleX: 1, scaleY: 1, tileType: "A" },
    { dx: effectiveSize * 0.5, dy: effectiveSize * 0.5, rotation: 120, scaleX: 1, scaleY: 1, tileType: "B" },
  ];

  const T1 = { x: effectiveSize * 1.3, y: 0 };
  const T2 = { x: effectiveSize * 0.4, y: effectiveSize * 0.95 };

  const overflow = 1;
  const gridSize = tiling + 1 + overflow;

  for (let i = -overflow; i < gridSize; i++) {
    for (let j = -overflow; j < gridSize; j++) {
      const baseX = i * T1.x + j * T2.x;
      const baseY = i * T1.y + j * T2.y;

      fundamentalDomain.forEach((tile) => {
        positions.push({
          x: baseX + tile.dx,
          y: baseY + tile.dy,
          rotation: tile.rotation,
          scaleX: tile.scaleX,
          scaleY: tile.scaleY,
          tileType: tile.tileType,
        });
      });
    }
  }

  const totalWidth = gridSize * T1.x + effectiveSize;
  const totalHeight = gridSize * T2.y + effectiveSize;

  return { positions, totalWidth, totalHeight };
}

/**
 * Type 4 (Reinhardt, 1918): Constraint A = C = 90°.
 * Creates distinct rectangular blocks made of 4 interacting tiles.
 */
function computePentType4(tileSize: number, tiling: number, spacing: number): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  const effectiveSize = tileSize * (1 + spacing);

  const fundamentalDomain = [
    { dx: 0, dy: 0, rotation: 0, scaleX: 1, scaleY: 1, tileType: "A" },
    { dx: effectiveSize * 0.5, dy: 0, rotation: 90, scaleX: 1, scaleY: 1, tileType: "B" },
    { dx: 0, dy: effectiveSize * 0.5, rotation: 270, scaleX: 1, scaleY: 1, tileType: "C" },
    { dx: effectiveSize * 0.5, dy: effectiveSize * 0.5, rotation: 180, scaleX: 1, scaleY: 1, tileType: "D" },
  ];

  const T1 = { x: effectiveSize, y: 0 };
  const T2 = { x: 0, y: effectiveSize };

  const overflow = 1;
  const gridSize = tiling + 1 + overflow;

  for (let i = -overflow; i < gridSize; i++) {
    for (let j = -overflow; j < gridSize; j++) {
      const baseX = i * T1.x + j * T2.x;
      const baseY = i * T1.y + j * T2.y;

      fundamentalDomain.forEach((tile) => {
        positions.push({
          x: baseX + tile.dx,
          y: baseY + tile.dy,
          rotation: tile.rotation,
          scaleX: tile.scaleX,
          scaleY: tile.scaleY,
          tileType: tile.tileType,
        });
      });
    }
  }

  const totalWidth = gridSize * effectiveSize;
  const totalHeight = gridSize * effectiveSize;

  return { positions, totalWidth, totalHeight };
}

/**
 * Type 5 (Reinhardt, 1918): Hexagonal symmetry.
 * 6 tiles meet at every primary vertex, creating a hexagonal macro-lattice.
 */
function computePentType5(tileSize: number, tiling: number, spacing: number): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  const effectiveSize = tileSize * (1 + spacing);

  const fundamentalDomain: Array<{ dx: number; dy: number; rotation: number; scaleX: number; scaleY: number; tileType: string }> = [];
  
  const hexRadius = effectiveSize * 0.5;
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180;
    fundamentalDomain.push({
      dx: Math.cos(angle) * hexRadius,
      dy: Math.sin(angle) * hexRadius,
      rotation: i * 60,
      scaleX: 1,
      scaleY: 1,
      tileType: `hex${i}`,
    });
  }

  const T1 = { x: effectiveSize * 1.5, y: 0 };
  const T2 = { x: effectiveSize * 0.75, y: effectiveSize * Math.sqrt(3) * 0.75 };

  const overflow = 1;
  const gridSize = tiling + 1 + overflow;

  for (let i = -overflow; i < gridSize; i++) {
    for (let j = -overflow; j < gridSize; j++) {
      const baseX = i * T1.x + j * T2.x;
      const baseY = i * T1.y + j * T2.y;

      fundamentalDomain.forEach((tile) => {
        positions.push({
          x: baseX + tile.dx,
          y: baseY + tile.dy,
          rotation: tile.rotation,
          scaleX: tile.scaleX,
          scaleY: tile.scaleY,
          tileType: tile.tileType,
        });
      });
    }
  }

  const totalWidth = gridSize * T1.x + effectiveSize;
  const totalHeight = gridSize * T2.y + effectiveSize;

  return { positions, totalWidth, totalHeight };
}

/**
 * Type 9 (Marjorie Rice, 1977): 2-isohedral.
 * Discovered by an amateur mathematician, forms beautiful flower/pinwheel motifs.
 */
function computePentType9(tileSize: number, tiling: number, spacing: number): AdvancedTilingResult {
  const positions: AdvancedTilePosition[] = [];
  const effectiveSize = tileSize * (1 + spacing);

  const fundamentalDomain = [
    { dx: 0, dy: 0, rotation: 0, scaleX: 1, scaleY: 1, tileType: "A" },
    { dx: effectiveSize * 0.5, dy: effectiveSize * 0.3, rotation: 72, scaleX: 1, scaleY: 1, tileType: "B" },
    { dx: effectiveSize * 0.3, dy: effectiveSize * 0.8, rotation: 144, scaleX: 1, scaleY: 1, tileType: "A" },
    { dx: effectiveSize * 0.8, dy: effectiveSize * 0.6, rotation: 216, scaleX: 1, scaleY: 1, tileType: "B" },
  ];

  const T1 = { x: effectiveSize * 1.1, y: effectiveSize * 0.2 };
  const T2 = { x: effectiveSize * 0.3, y: effectiveSize * 1.1 };

  const overflow = 1;
  const gridSize = tiling + 1 + overflow;

  for (let i = -overflow; i < gridSize; i++) {
    for (let j = -overflow; j < gridSize; j++) {
      const baseX = i * T1.x + j * T2.x;
      const baseY = i * T1.y + j * T2.y;

      fundamentalDomain.forEach((tile) => {
        positions.push({
          x: baseX + tile.dx,
          y: baseY + tile.dy,
          rotation: tile.rotation,
          scaleX: tile.scaleX,
          scaleY: tile.scaleY,
          tileType: tile.tileType,
        });
      });
    }
  }

  const totalWidth = gridSize * T1.x + effectiveSize * 2;
  const totalHeight = gridSize * T2.y + effectiveSize * 2;

  return { positions, totalWidth, totalHeight };
}
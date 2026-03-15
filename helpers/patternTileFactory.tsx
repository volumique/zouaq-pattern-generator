/**
 * @file patternTileFactory.tsx
 * @description Factory design pattern isolating the logic
 * of generating a single geometric "tile" (Single Tile).
 * Depending on the requested pattern `type`, the flow delegates the work to
 * the appropriate mathematical generators (Zellige, Zouaq, Mandala, etc.).
 */

import { Point } from "./geometryUtils";
import { generateZouaqStrapwork } from "./zouaqStrapwork";
import {
  generateZelligePattern,
  generateRosettePattern,
  generateFractalRosettePattern,
} from "./islamicGeometry";
import { generateMandalaTile } from "./mandalaPattern";
import { generateAmazighTile } from "./amazighPattern";
import { generateShamsaTile } from "./shamsaPattern";
import { generateTawriqTile } from "./tawriqPattern";
import { generateTastirTile } from "./tastirPattern";
import { generateCachemireTile } from "./cachemirePattern";
import { NormalizedPatternConfig } from "./patternDefaults";

/**
 * Represents the standardized raw output of a sub-pattern generator.
 * The interface is similar to `Shape` but adapted for the Factory's internal data.
 */
export interface RawTileShape {
  /** Polygon vertices, if any. */
  points?: Point[];
  /** Fill color. */
  fill: string;
  /** Stroke color. */
  stroke: string;
  /** Stroke thickness. */
  strokeWidth: number;
  /** SVG path string. Takes priority over `points` if defined. */
  path?: string;
  /** SVG clipping path applicable to this shape. */
  clipPath?: string;
  /** Z-depth index. */
  zIndex?: number;
}

/**
 * Generates the base geometric shapes for a SINGLE tile according to the configuration.
 * Acts as the main router (Factory) to specialized algorithms.
 * 
 * | Pattern Type | Target Function |
 * | ------------ | ----------------|
 * | zellige      | generateZelligePattern |
 * | zouaq        | generateZouaqStrapwork |
 * | rosette      | generateRosettePattern |
 * | fractalRosette | generateFractalRosettePattern |
 * | mandala      | generateMandalaTile |
 * | amazigh      | generateAmazighTile |
 * | shamsa       | generateShamsaTile |
 * | tawriq       | generateTawriqTile |
 * | tastir       | generateTastirTile |
 * | cachemire    | generateCachemireTile |
 * 
 * @param config Secure and normalized configuration without `undefined`.
 * @param tileSize Base tile dimension (e.g., 200px).
 * @returns Object containing the `rawTileShapes` array and a potential global `clipPath` (used notably by Zouaq).
 */
export function generateTileShapes(
  config: NormalizedPatternConfig,
  tileSize: number
): { rawTileShapes: RawTileShape[]; clipPath?: string } {
  let rawTileShapes: RawTileShape[] = [];
  let globalClipPath: string | undefined = undefined;

  // ─── PATTERN ROUTING (Pattern Routing) ───

  switch (config.type) {
    case "zellige":
      rawTileShapes = generateZelligePattern(
        tileSize,
        config.branches,
        config.colors,
        config.lineWidth,
        {
          innerRadiusRatio: config.innerRadiusRatio,
          starScale: config.starScale,
          rotation: config.rotation,
          showFillers: config.showFillers,
          fillerScale: config.fillerScale,
          starRounding: config.starRounding,
        }
      );
      break;

    case "zouaq":
      const zouaqResult = generateZouaqStrapwork(
        tileSize,
        config.branches,
        config.zouaqStrapWidth || 20,
        config.zouaqInterlace,
        config.zouaqCurvedStyle,
        {
          strap: config.colors.line,
          strapBorder: config.colors.line, 
          primary: config.colors.primary,
          secondary: config.colors.secondary,
          accent: config.colors.accent,
          background: config.colors.background,
        },
        config.lineWidth,
        config.zouaqShape,
        config.zouaqTileShape,
        config.zouaqRibbonEnd,
        config.zouaqCurveIntensity
      );
      rawTileShapes = zouaqResult.shapes.map((s) => ({
        ...s,
        clipPath: zouaqResult.clipPath,
      }));
      globalClipPath = zouaqResult.clipPath;
      break;

    case "rosette":
      rawTileShapes = generateRosettePattern(
        tileSize,
        config.rosettePoints,
        config.rosetteLayers,
        config.rosetteOpeningAngle,
        config.rosetteClipSquare,
        config.colors,
        config.lineWidth
      );
      break;

    case "fractalRosette":
      rawTileShapes = generateFractalRosettePattern(
        tileSize,
        config.branches,
        config.fractalDepth,
        config.fractalScaleFactor,
        config.innerRadiusRatio,
        config.rotation,
        config.colors,
        config.lineWidth,
        config.starRounding
      );
      break;

    case "mandala":
      rawTileShapes = generateMandalaTile(tileSize, config.colors, config.lineWidth, {
        branches: config.branches,
        layers: config.mandalaLayers,
        innerStarScale: config.starScale,
        outerReach: config.mandalaOuterReach,
        showShadow: config.mandalaShowShadow,
        rotation: config.rotation,
        starRounding: config.starRounding,
      });
      break;

    case "amazigh":
      rawTileShapes = generateAmazighTile(tileSize, config.colors, config.lineWidth, {
        amazighMotif: config.amazighMotif,
        gridDensity: config.amazighGridDensity,
        symmetryMode: config.amazighSymmetry,
        fillShapes: config.amazighFillShapes,
        rounding: config.starRounding,
      });
      break;

    case "shamsa":
      rawTileShapes = generateShamsaTile(tileSize, config.colors, config.lineWidth, {
        centralPetals: config.shamsaCentralPetals,
        satelliteCount: config.shamsaSatelliteCount,
        satellitePetals: config.shamsaSatellitePetals,
        satelliteScale: config.shamsaSatelliteScale,
        showPentagons: config.shamsaShowPentagons,
        showSquareConnectors: config.shamsaShowSquareConnectors,
      });
      break;

    case "tawriq":
      rawTileShapes = generateTawriqTile(tileSize, config.colors, config.lineWidth, {
        tawriqMotif: config.tawriqMotif,
        tawriqDensity: config.tawriqDensity,
        tawriqCurvature: config.tawriqCurvature,
        tawriqSymmetry: config.tawriqSymmetry,
        tawriqFillLeaves: config.tawriqFillLeaves,
        tawriqShowSpirals: config.tawriqShowSpirals,
        tawriqStrokeVariation: config.tawriqStrokeVariation,
        tawriqStrokeMax: config.tawriqStrokeMax,
      });
      break;

    case "tastir":
      rawTileShapes = generateTastirTile(tileSize, config.colors, config.lineWidth, {
        tastirElement: config.tastirElement,
        tastirBranches: config.tastirBranches,
        tastirDensity: config.tastirDensity,
        tastirShowKuhat: config.tastirShowKuhat,
        tastirShowMaqrouts: config.tastirShowMaqrouts,
        tastirKufiText: config.tastirKufiText,
      });
      break;

    case "cachemire":
      rawTileShapes = generateCachemireTile(tileSize, config.colors, config.lineWidth, {
        cachemireDensity: config.cachemireDensity,
        cachemireCurvature: config.cachemireCurvature,
        cachemireFillInterior: config.cachemireFillInterior,
        cachemirePetalCount: config.cachemirePetalCount,
        cachemireShowDots: config.cachemireShowDots,
        cachemireScale: config.cachemireScale,
      });
      break;
  }

  return { rawTileShapes, clipPath: globalClipPath };
}
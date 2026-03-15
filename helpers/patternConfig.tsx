/**
 * @file patternConfig.tsx
 * @description Definitions of the main configurations for the rendering engine.
 * This file contains the interfaces and types that control the generation
 * of Islamic geometric patterns (Zellige, Zouaq, etc.), as well as
 * default constants and color palettes.
 */

import { ZouaqTileShape } from "./zouaqStrapwork";
import { Point } from "./geometryUtils";
import { TilingMode, WallpaperGroup, TilePosition } from "./tilingCalculator";
import { IntersticeType } from "./intersticeGenerator";
import { AmazighMotif, AmazighSymmetry } from "./amazighPattern";
import { AdvancedTilingMode, PentagonalSubType } from "./advancedTiling";

/** Possible tile shapes for kaleidoscopic tiling. */
export type KaleidoscopeTileShape = "square" | "hexagon" | "diamond" | "triangle" | "circle" | "ogee";

/** Pattern families available in the generator. */
export type PatternType = "zellige" | "zouaq" | "rosette" | "fractalRosette" | "mandala" | "amazigh" | "shamsa" | "tawriq" | "tastir" | "cachemire";

/**
 * Complete configuration to generate a geometric pattern.
 * Groups all possible parameters, from basic geometry to advanced tiling options.
 */
export interface PatternConfig {
  // ─── GENERAL PARAMETERS (General Parameters) ───
  
  /** Main type of the pattern to generate. */
  type: PatternType;
  /** Number of branches/petals of the central star (e.g., 8, 12, 16). Mostly for Zellige and Zouaq. */
  branches?: number;
  /** Color palette to use for rendering. */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  };
  /** Number of repetitions (NxN) for classic tiling. */
  tiling: number; // 1 to 6
  /** Thickness of the outline strokes (stroke). */
  lineWidth: number; // 0.5 to 3

  // ─── ZOUAQ SPECIFICS (Zouaq Specifics) ───
  
  zouaqStrapWidth?: number;
  zouaqInterlace?: boolean;
  zouaqCurvedStyle?: boolean;
  zouaqShape?: "zigzag" | "star" | "spiral" | "grid" | "arcs";
  zouaqTileShape?: ZouaqTileShape;
  zouaqRibbonEnd?: "flat" | "rounded" | "pointed" | "circle";
  zouaqCurveIntensity?: number; // 0.1 to 0.6

  // ─── TILING OPTIONS (Tiling Options) ───
  
  /** Traditional tiling mode. */
  tilingMode?: TilingMode; // "grid" | "diagonal" | "brick" | "hexagonal"
  /** Enable mathematical transformations of wallpaper groups. */
  useWallpaperGroups?: boolean;
  /** The symmetry group (one of the 17 Wallpaper Groups) to apply. */
  wallpaperGroup?: WallpaperGroup;
  /** Enable advanced geometric tiling. */
  useAdvancedTiling?: boolean;
  /** Advanced tiling algorithm to use (e.g., Penrose, triangular). */
  advancedTilingMode?: AdvancedTilingMode;
  /** Specific sub-type for pentagonal tiling. */
  pentagonalSubType?: PentagonalSubType;
  /** Show patterns in the interstices (the gaps between tiles). */
  showInterstices?: boolean;
  /** Scale of the interstice shapes. */
  intersticeScale?: number; // 0.2 to 0.5
  /** Type of shape to place in the interstice. */
  intersticeType?: IntersticeType; // "same" | "star8" | "star12" | "diamond" | "cross"
  /** Offset for "brick" mode. */
  tilingOffset?: number; // 0 to 0.5
  /** Global rotation of the tiling (in degrees). */
  tilingRotation?: number; // 0, 45, 90
  /** Spacing between tiles (ratio of tile size). */
  tileSpacing?: number; // 0 to 0.5
  /** Global zoom on the rendered pattern. */
  patternZoom?: number; // 0.5 to 3.0

  // ─── KALEIDOSCOPE PARAMETERS (Kaleidoscope Parameters) ───
  
  /** Enable kaleidoscope mode. */
  kaleidoscope?: boolean;
  /** Number of radial segments of the kaleidoscope. */
  kaleidoscopeSegments?: number; // 2 to 24 (default 6)
  /** Apply a mirror effect every other time. */
  kaleidoscopeMirror?: boolean;
  /** Base rotation of the kaleidoscopic mask. */
  kaleidoscopeRotation?: number; // 0 to 360
  /** SVG blend mode for overlapping segments. */
  kaleidoscopeBlend?: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
  /** Offset of the kaleidoscope's X center (-0.5 to 0.5). */
  kaleidoscopeCenterX?: number;
  /** Offset of the kaleidoscope's Y center (-0.5 to 0.5). */
  kaleidoscopeCenterY?: number;
  /** Repetitions (NxN grid) of the complete kaleidoscopic pattern. */
  kaleidoscopeTiling?: number; // 1 to 5
  /** Shape of the cutout for each repeated kaleidoscopic tile. */
  kaleidoscopeTileShape?: KaleidoscopeTileShape;
  /** Allow the pattern to overflow beyond the tile shape. */
  kaleidoscopeTileOverflow?: boolean;

  // ─── COMMON GEOMETRIC PARAMETERS (New Geometric Parameters) ───
  
  /** Ratio defining the inner radius of the star relative to the outer. */
  innerRadiusRatio?: number; // 0.2 to 0.6
  /** Scale of the star relative to the tile size. */
  starScale?: number; // 0.3 to 0.6
  /** Base rotation of the internal pattern. */
  rotation?: number; // 0 to 360
  /** Show filler elements in the corners. */
  showFillers?: boolean;
  /** Scale of the filler elements. */
  fillerScale?: number; // 0.5 to 1.5
  /** Rounding factor of the star corners (0 = sharp, 1 = round). */
  starRounding?: number; // 0 to 1
  
  // ─── ROSETTE (Rosette-specific) ───
  rosettePoints?: number; // 8 to 48
  rosetteLayers?: number; // 2 to 6
  rosetteOpeningAngle?: number; // 0.3 to 0.8
  rosetteClipSquare?: boolean;

  // ─── FRACTAL ROSETTE (Fractal Rosette-specific) ───
  fractalDepth?: number; // 1 to 4
  fractalScaleFactor?: number; // 0.3 to 0.6

  // ─── MANDALA (Mandala-specific) ───
  mandalaLayers?: number; // 2 to 5
  mandalaOuterReach?: number; // 0.8 to 1.5
  mandalaShowShadow?: boolean;

  // ─── AMAZIGH (Amazigh-specific) ───
  amazighMotif?: AmazighMotif;
  amazighGridDensity?: number; // 3 to 10
  amazighSymmetry?: AmazighSymmetry;
  amazighFillShapes?: boolean;

  // ─── SHAMSA (Shamsa-specific) ───
  shamsaCentralPetals?: number;
  shamsaSatelliteCount?: number;
  shamsaSatellitePetals?: number;
  shamsaSatelliteScale?: number;
  shamsaShowPentagons?: boolean;
  shamsaShowSquareConnectors?: boolean;

  // ─── TAWRIQ (Tawriq-specific) ───
  tawriqMotif?: "arabesque" | "palmette" | "pinecone" | "mixed";
  tawriqDensity?: number; // 3 to 8
  tawriqCurvature?: number; // 0.3 to 1.0
  tawriqSymmetry?: "none" | "x" | "y" | "xy" | "radial";
  tawriqFillLeaves?: boolean;
  tawriqShowSpirals?: boolean;
  tawriqStrokeVariation?: number; // 0 to 1
  tawriqStrokeMax?: number; // 1 to 8

  // ─── TASTIR (Tastir-specific) ───
  tastirElement?: "khatam" | "maqrouts" | "kuhat" | "kufi" | "zellige";
  tastirBranches?: number; // 8, 12, 16, 24, 32
  tastirDensity?: number; // 2 to 6
  tastirShowKuhat?: boolean;
  tastirShowMaqrouts?: boolean;
  tastirKufiText?: "allah" | "bismillah" | "geometric";

  // ─── CACHEMIRE (Cachemire-specific) ───
  cachemireDensity?: number; // 2 to 6
  cachemireCurvature?: number; // 0.3 to 1.0
  cachemireFillInterior?: boolean;
  cachemirePetalCount?: number; // 5 to 12
  cachemireShowDots?: boolean;
  cachemireScale?: number; // 0.5 to 1.0
}

/**
 * Represents an individual polygonal or drawn (SVG) shape.
 */
export interface Shape {
  /** Points of the polygon (if not based on an SVG path). */
  points: Point[];
  /** Fill color (fill). */
  color: string;
  /** Stroke color (stroke). */
  stroke?: string;
  /** Thickness of the stroke. */
  strokeWidth?: number;
  /** Display order (z-index). */
  zIndex?: number;
  /** SVG path definition string (e.g., "M 0 0 L 10 10..."). Overrides `points` if provided. */
  path?: string;
  /** SVG clip-path definition. Useful to limit the drawing to an area. */
  clipPath?: string; 
  /** (Internal use) Geometrically translated path for tiling. */
  translatedPath?: string;
}

/**
 * Final result generated by the rendering engine, ready to be drawn.
 */
export interface GeneratedPattern {
  /** Complete (flattened) list of shapes to draw. This array can be heavy if optimizations are disabled. */
  shapes: Shape[];
  /** Global width of the generated pattern. */
  width: number;
  /** Global height of the generated pattern. */
  height: number;
  /** SVG framing (viewBox) for proper display. */
  viewBox: string;
  
  // ─── RAW DATA FOR OPTIMIZED RENDERING (Raw data for optimized rendering) ───
  
  /** The shapes constituting a SINGLE tile. Lighter than flattening all tiles. */
  tileShapes: Shape[];
  /** Positions where the base tile should be repeated. */
  tilePositions: TilePosition[];
  /** Dimension of the base tile. */
  tileSize: number;
  /** Indicates if the tile center should serve as anchor point (useful for WallpaperGroups). */
  centerOffset: boolean;
  /** Indicates if using simple tiling (grid, brick) without complex transformations. */
  useSimpleTiling: boolean;
  /** Background color of the complete canvas. */
  backgroundColor: string;
  
  // ─── GAPS DATA (Gaps data) ───
  
  /** Precalculated decorative shapes to fill holes (interstices). */
  intersticeShapes?: Shape[];
  /** Positions of the interstices in the grid. */
  intersticePositions?: Point[];
  /** Relative scale of the interstices. */
  intersticeScale?: number;
  
  // ─── OPTIMIZATION FLAG ───
  
  /** 
   * If true, the `shapes` array contains only the background.
   * This is a performance optimization: the UI should use `tileShapes` + `tilePositions` instead.
   */
  skipLegacyShapes: boolean;
}

/**
 * Traditional color palettes inspired by Moroccan Zellige.
 * Colors are named after their historical inspirations.
 */
export const COLOR_PRESETS = {
  traditional: {
    primary: "#1E4D8C", // Fez Blue
    secondary: "#046307", // Emerald Green
    accent: "#E4A010", // Saffron Yellow
    background: "#F5F0E6", // White/Cream
    line: "#1a1a1a", // Black/Zouaq outline
  },
  warm: {
    primary: "#C35831", // Terracotta / Red clay
    secondary: "#E4A010", // Saffron Yellow
    accent: "#1E4D8C", // Blue
    background: "#F5F0E6", // White/Cream
    line: "#1a1a1a", // Black
  },
  cool: {
    primary: "#1E4D8C", // Fez Blue
    secondary: "#046307", // Emerald Green
    accent: "#F5F0E6", // White
    background: "#1a1a1a", // Black
    line: "#E4A010", // Gold/Brass
  },
  emerald: {
    primary: "#046307", // Emerald Green
    secondary: "#1E4D8C", // Blue
    accent: "#C35831", // Terracotta
    background: "#F5F0E6", // White/Cream
    line: "#1a1a1a", // Black
  },
};

/** Safe default values covering all possible parameters. */
export const DEFAULT_CONFIG: PatternConfig = {
  type: "zellige",
  branches: 8,
  colors: COLOR_PRESETS.warm,
  tiling: 3,
  lineWidth: 2,
  innerRadiusRatio: 0.4,
  starScale: 0.35, 
  rotation: 0,
  showFillers: true,
  fillerScale: 1.0,
  starRounding: 0,
  rosettePoints: 16,
  rosetteLayers: 3,
  rosetteOpeningAngle: 0.5,
  rosetteClipSquare: true,
  fractalDepth: 2,
  fractalScaleFactor: 0.4,
  mandalaLayers: 3,
  mandalaOuterReach: 1.2,
  mandalaShowShadow: true,
  amazighMotif: "mixed",
  amazighGridDensity: 5,
  amazighSymmetry: "xy",
  amazighFillShapes: true,
  shamsaCentralPetals: 12,
  shamsaSatelliteCount: 8,
  shamsaSatellitePetals: 12,
  shamsaSatelliteScale: 0.35,
  shamsaShowPentagons: true,
  shamsaShowSquareConnectors: true,
  tilingMode: "grid",
  useWallpaperGroups: false,
  wallpaperGroup: "p4m",
  useAdvancedTiling: false,
  advancedTilingMode: "triangular",
  pentagonalSubType: "type1",
  showInterstices: false,
  intersticeScale: 0.3,
  intersticeType: "same",
  tilingOffset: 0.5,
  tilingRotation: 0,
  tileSpacing: 0,
  patternZoom: 1,
  kaleidoscope: false,
  kaleidoscopeSegments: 12,
  kaleidoscopeMirror: true,
  kaleidoscopeRotation: 0,

  kaleidoscopeBlend: "normal",
  kaleidoscopeCenterX: 0,
  kaleidoscopeCenterY: 0,
  kaleidoscopeTiling: 1,
  kaleidoscopeTileShape: "square",
  kaleidoscopeTileOverflow: false,
  zouaqStrapWidth: 2,
  zouaqInterlace: true,
  zouaqCurvedStyle: false,
  zouaqShape: "zigzag",
  zouaqTileShape: "square",
  zouaqRibbonEnd: "flat",
  zouaqCurveIntensity: 0.2,
  tawriqMotif: "mixed",
  tawriqDensity: 5,
  tawriqCurvature: 0.7,
  tawriqSymmetry: "xy",
  tawriqFillLeaves: true,
  tawriqShowSpirals: true,
  tawriqStrokeVariation: 0.5,
  tawriqStrokeMax: 3,
  tastirElement: "zellige",
  tastirBranches: 8,
  tastirDensity: 3,
  tastirShowKuhat: true,
  tastirShowMaqrouts: true,
  tastirKufiText: "geometric",
  cachemireDensity: 4,
  cachemireCurvature: 0.7,
  cachemireFillInterior: true,
  cachemirePetalCount: 8,
  cachemireShowDots: true,
  cachemireScale: 0.8,
};
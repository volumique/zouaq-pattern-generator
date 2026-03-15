/**
 * @file patternDefaults.tsx
 * @description Normalization utility for pattern configurations.
 * This layer prevents the rendering engine from crashing by ensuring that
 * every configuration property has a coherent default value.
 */

import { PatternConfig, DEFAULT_CONFIG } from "./patternConfig";

/** Type alias guaranteeing that all optional properties are present. */
export type NormalizedPatternConfig = Required<PatternConfig>;

/**
 * Normalizes a partial configuration by merging it with `DEFAULT_CONFIG`.
 * 
 * Strategy:
 * Eliminates the need to write `config.field ?? DEFAULT_CONFIG.field` (coalescing operators)
 * repeatedly throughout the business code (patternGenerator, patternTileFactory).
 *
 * @param config The configuration object potentially coming from the user interface.
 * @returns A `NormalizedPatternConfig` configuration without any `undefined`.
 * 
 * @example
 * const safeConfig = normalizeConfig({ type: "zellige", tiling: 2 });
 * console.log(safeConfig.branches); // Outputs 8 (the default value)
 */
export function normalizeConfig(config: PatternConfig): NormalizedPatternConfig {
  // Extract only the defined properties from the incoming config
  // Filters keys that explicitly have the value `undefined` to force the use of the default.
  const cleanConfig = Object.fromEntries(
    Object.entries(config).filter(([_, value]) => value !== undefined)
  );
  
  return {
    ...DEFAULT_CONFIG,
    ...cleanConfig,
  } as NormalizedPatternConfig;
}
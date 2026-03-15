import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Slider } from "./Slider";
import { Switch } from "./Switch";
import { PatternConfig } from "../helpers/patternGenerator";
import { KaleidoscopeTileShape } from "../helpers/patternConfig";
import { TilingMode, WallpaperGroup } from "../helpers/tilingCalculator";
import { IntersticeType } from "../helpers/intersticeGenerator";
import { AdvancedTilingMode, PentagonalSubType } from "../helpers/advancedTiling";
import styles from "./GeneratorControlsTiling.module.css";

interface GeneratorControlsTilingProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsTiling = ({
  config,
  onChange,
}: GeneratorControlsTilingProps) => {
  const showBrickOffset = (config.tilingMode ?? "grid") === "brick";
  const useWallpaper = config.useWallpaperGroups ?? false;
  const useAdvancedTiling = config.useAdvancedTiling ?? false;

  return (
    <div className={styles.sectionGroup}>
      {/* Kaleidoscope Mode */}
      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="kaleidoscope-toggle">
            Kaleidoscope Effect
          </label>
          <Switch
            id="kaleidoscope-toggle"
            checked={config.kaleidoscope ?? false}
            onCheckedChange={(val) => onChange("kaleidoscope", val)}
          />
        </div>
      </div>

      {(config.kaleidoscope ?? false) && (
        <>
          <div className={styles.section}>
            <label className={styles.label}>
              Segments ({config.kaleidoscopeSegments ?? 12})
            </label>
            <Slider
              value={[config.kaleidoscopeSegments ?? 12]}
              min={2}
              max={24}
              step={1}
              onValueChange={(vals) =>
                onChange("kaleidoscopeSegments", vals[0])
              }
            />
          </div>

          <div className={styles.section}>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="kaleidoscope-mirror">
                Mirror Reflections
              </label>
              <Switch
                id="kaleidoscope-mirror"
                checked={config.kaleidoscopeMirror ?? true}
                onCheckedChange={(val) => onChange("kaleidoscopeMirror", val)}
              />
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>
              Base Rotation ({config.kaleidoscopeRotation ?? 0}°)
            </label>
            <Slider
              value={[config.kaleidoscopeRotation ?? 0]}
              min={0}
              max={360}
              step={5}
              onValueChange={(vals) =>
                onChange("kaleidoscopeRotation", vals[0])
              }
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Blend Mode</label>
            <Select
              value={config.kaleidoscopeBlend ?? "multiply"}
              onValueChange={(val) => onChange("kaleidoscopeBlend", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="multiply">Multiply</SelectItem>
                <SelectItem value="screen">Screen</SelectItem>
                <SelectItem value="overlay">Overlay</SelectItem>
                <SelectItem value="darken">Darken</SelectItem>
                <SelectItem value="lighten">Lighten</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>
              Center X Offset ({(config.kaleidoscopeCenterX ?? 0).toFixed(2)})
            </label>
            <Slider
              value={[config.kaleidoscopeCenterX ?? 0]}
              min={-0.5}
              max={0.5}
              step={0.05}
              onValueChange={(vals) => onChange("kaleidoscopeCenterX", vals[0])}
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>
              Center Y Offset ({(config.kaleidoscopeCenterY ?? 0).toFixed(2)})
            </label>
            <Slider
              value={[config.kaleidoscopeCenterY ?? 0]}
              min={-0.5}
              max={0.5}
              step={0.05}
              onValueChange={(vals) => onChange("kaleidoscopeCenterY", vals[0])}
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>
              Grid Tiling ({config.kaleidoscopeTiling ?? 1}x{config.kaleidoscopeTiling ?? 1})
            </label>
            <Slider
              value={[config.kaleidoscopeTiling ?? 1]}
              min={1}
              max={5}
              step={1}
              onValueChange={(vals) => onChange("kaleidoscopeTiling", vals[0])}
            />
          </div>

          {(config.kaleidoscopeTiling ?? 1) > 1 && (
            <div className={styles.section}>
              <label className={styles.label}>Tile Shape</label>
              <Select
                value={config.kaleidoscopeTileShape ?? "square"}
                onValueChange={(val) =>
                  onChange("kaleidoscopeTileShape", val as KaleidoscopeTileShape)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="hexagon">Hexagonal</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="ogee">Ogee (Moroccan Arch)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(config.kaleidoscopeTiling ?? 1) > 1 && (
            <div className={styles.section}>
              <div className={styles.row}>
                <label className={styles.label} htmlFor="kaleidoscope-overflow">
                  Shapes Overflow
                </label>
                <Switch
                  id="kaleidoscope-overflow"
                  checked={config.kaleidoscopeTileOverflow ?? false}
                  onCheckedChange={(val) =>
                    onChange("kaleidoscopeTileOverflow", val)
                  }
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Toggle for advanced tiling */}
      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="use-advanced-tiling">
            Advanced Geometric Tiling
          </label>
          <Switch
            id="use-advanced-tiling"
            checked={useAdvancedTiling}
            onCheckedChange={(val) => onChange("useAdvancedTiling", val)}
          />
        </div>
      </div>

      {/* Advanced tiling mode selector */}
      {useAdvancedTiling && (
        <>
          <div className={styles.section}>
            <label className={styles.label}>Advanced Tiling Mode</label>
            <Select
              value={config.advancedTilingMode ?? "triangular"}
              onValueChange={(val) =>
                onChange("advancedTilingMode", val as AdvancedTilingMode)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="triangular">Triangular (3.3.3.3.3.3)</SelectItem>
                <SelectItem value="truncatedSquare">Truncated Square (4.8.8)</SelectItem>
                <SelectItem value="quadrilateral">Quadrilateral Rotation</SelectItem>
                <SelectItem value="penrose">Penrose (Quasi-Periodic)</SelectItem>
                <SelectItem value="hexagonalHoneycomb">Hexagonal Honeycomb</SelectItem>
                <SelectItem value="pentagonal">Pentagonal (Reinhardt / Rice)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pentagonal sub-type selector */}
          {(config.advancedTilingMode ?? "triangular") === "pentagonal" && (
            <div className={styles.section}>
              <label className={styles.label}>Pentagonal Sub-Type</label>
              <Select
                value={config.pentagonalSubType ?? "type1"}
                onValueChange={(val) =>
                  onChange("pentagonalSubType", val as PentagonalSubType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type1">Type 1 — Reinhardt (A+B+C=360°)</SelectItem>
                  <SelectItem value="type2">Type 2 — Reinhardt (A+B+D=360°)</SelectItem>
                  <SelectItem value="type4">Type 4 — Reinhardt (A=C=90°)</SelectItem>
                  <SelectItem value="type5">Type 5 — Reinhardt (A=60°, C=120°)</SelectItem>
                  <SelectItem value="type9Rice">Type 9 — Marjorie Rice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* Toggle for wallpaper groups (hidden when advanced tiling is on) */}
      {!useAdvancedTiling && (
      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="use-wallpaper">
            Mathematical Symmetry Groups
          </label>
          <Switch
            id="use-wallpaper"
            checked={useWallpaper}
            onCheckedChange={(val) => onChange("useWallpaperGroups", val)}
          />
        </div>
      </div>
      )}

      {/* Wallpaper group selector OR Traditional tiling mode (hidden when advanced tiling is on) */}
      {!useAdvancedTiling && useWallpaper ? (
        <div className={styles.section}>
          <label className={styles.label}>Symmetry Group</label>
          <Select
            value={config.wallpaperGroup ?? "p4m"}
            onValueChange={(val) =>
              onChange("wallpaperGroup", val as WallpaperGroup)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p1">p1 - No symmetry</SelectItem>
              <SelectItem value="p2">p2 - Rotation 180°</SelectItem>
              <SelectItem value="p3">
                p3 - Rotation 120° (triangular)
              </SelectItem>
              <SelectItem value="p4">p4 - Rotation 90° (square)</SelectItem>
              <SelectItem value="p6">p6 - Rotation 60° (hexagonal)</SelectItem>
              <SelectItem value="pm">pm - Vertical mirror</SelectItem>
              <SelectItem value="pg">pg - Glide</SelectItem>
              <SelectItem value="cm">cm - Mirror + glide</SelectItem>
              <SelectItem value="pmm">pmm - Double mirror</SelectItem>
              <SelectItem value="pmg">
                pmg - Mirror + perpendicular glide
              </SelectItem>
              <SelectItem value="pgg">pgg - Double glide</SelectItem>
              <SelectItem value="cmm">cmm - Double mirror + rotation</SelectItem>
              <SelectItem value="p4m">
                p4m - Square + mirrors (Classic Zellige)
              </SelectItem>
              <SelectItem value="p4g">
                p4g - Square + diagonal mirrors
              </SelectItem>
              <SelectItem value="p3m1">
                p3m1 - Triangular + mirrors (vertices)
              </SelectItem>
              <SelectItem value="p31m">
                p31m - Triangular + mirrors (edges)
              </SelectItem>
              <SelectItem value="p6m">
                p6m - Hexagonal + mirrors (Alhambra)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : !useAdvancedTiling ? (
        <div className={styles.section}>
          <label className={styles.label}>Tiling Mode</label>
          <Select
            value={config.tilingMode ?? "grid"}
            onValueChange={(val) => onChange("tilingMode", val as TilingMode)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Square Grid</SelectItem>
              <SelectItem value="diagonal">Diagonal (45°)</SelectItem>
              <SelectItem value="brick">Staggered (Brick)</SelectItem>
              <SelectItem value="hexagonal">Hexagonal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* ALWAYS VISIBLE: Repetition and Spacing */}
      <div className={styles.section}>
        <label className={styles.label}>Repetition ({config.tiling}x)</label>
        <Slider
          value={[config.tiling]}
          min={1}
          max={6}
          step={1}
          onValueChange={(vals) => onChange("tiling", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Spacing ({Math.round((config.tileSpacing ?? 0) * 100)}%)
        </label>
        <Slider
          value={[config.tileSpacing ?? 0]}
          min={-1}
          max={1}
          step={0.05}
          onValueChange={(vals) => onChange("tileSpacing", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Pattern Zoom ({(config.patternZoom ?? 1).toFixed(1)}x)
        </label>
        <Slider
          value={[config.patternZoom ?? 1]}
          min={0.5}
          max={3}
          step={0.1}
          onValueChange={(vals) => onChange("patternZoom", vals[0])}
        />
      </div>

      {/* Traditional tiling specific options (hidden when advanced tiling is on) */}
      {!useAdvancedTiling && !useWallpaper && (
        <>
          {showBrickOffset && (
            <div className={styles.section}>
              <label className={styles.label}>
                Brick Offset ({(config.tilingOffset ?? 0.5).toFixed(2)})
              </label>
              <Slider
                value={[config.tilingOffset ?? 0.5]}
                min={0}
                max={0.5}
                step={0.05}
                onValueChange={(vals) => onChange("tilingOffset", vals[0])}
              />
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="show-interstices">
                Interstice Patterns
              </label>
              <Switch
                id="show-interstices"
                checked={config.showInterstices ?? false}
                onCheckedChange={(val) => onChange("showInterstices", val)}
              />
            </div>
          </div>

          {(config.showInterstices ?? false) && (
            <>
              <div className={styles.section}>
                <label className={styles.label}>Interstice Type</label>
                <Select
                  value={config.intersticeType ?? "same"}
                  onValueChange={(val) =>
                    onChange("intersticeType", val as IntersticeType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Same pattern</SelectItem>
                    <SelectItem value="star8">8-branch Star</SelectItem>
                    <SelectItem value="star12">12-branch Star</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="cross">Cross</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.section}>
                <label className={styles.label}>
                  Interstice Size ({(config.intersticeScale ?? 0.3).toFixed(2)})
                </label>
                <Slider
                  value={[config.intersticeScale ?? 0.3]}
                  min={0.2}
                  max={0.5}
                  step={0.05}
                  onValueChange={(vals) => onChange("intersticeScale", vals[0])}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
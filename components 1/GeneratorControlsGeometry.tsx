import React from "react";
import { Slider } from "./Slider";
import { Switch } from "./Switch";
import { PatternConfig } from "../helpers/patternGenerator";
import styles from "./GeneratorControls.module.css";

interface GeneratorControlsGeometryProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

// Pattern types that support star rounding
const STAR_ROUNDING_PATTERNS: PatternConfig["type"][] = [
  "zellige",
];

export const GeneratorControlsGeometry = ({
  config,
  onChange,
}: GeneratorControlsGeometryProps) => {
  const supportsRounding = STAR_ROUNDING_PATTERNS.includes(config.type);

  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>
          Inner Ratio ({(config.innerRadiusRatio ?? 0.4).toFixed(2)})
        </label>
        <Slider
          value={[config.innerRadiusRatio ?? 0.4]}
          min={0.2}
          max={0.7}
          step={0.01}
          onValueChange={(vals) => onChange("innerRadiusRatio", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Star Size ({(config.starScale ?? 0.35).toFixed(2)})
        </label>
        <Slider
          value={[config.starScale ?? 0.35]}
          min={0.2}
          max={0.6}
          step={0.01}
          onValueChange={(vals) => onChange("starScale", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Rotation ({Math.round(config.rotation ?? 0)}°)
        </label>
        <Slider
          value={[config.rotation ?? 0]}
          min={0}
          max={360}
          step={5}
          onValueChange={(vals) => onChange("rotation", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="show-fillers">
            Show Fillers
          </label>
          <Switch
            id="show-fillers"
            checked={config.showFillers ?? true}
            onCheckedChange={(val) => onChange("showFillers", val)}
          />
        </div>
      </div>

      {(config.showFillers ?? true) && (
        <div className={styles.section}>
          <label className={styles.label}>
            Filler Size ({(config.fillerScale ?? 1).toFixed(1)}x)
          </label>
          <Slider
            value={[config.fillerScale ?? 1]}
            min={0.5}
            max={1.5}
            step={0.1}
            onValueChange={(vals) => onChange("fillerScale", vals[0])}
          />
        </div>
      )}

      {supportsRounding && (
        <div className={styles.section}>
          <label className={styles.label}>
            Point Rounding ({(config.starRounding ?? 0).toFixed(2)})
          </label>
          <Slider
            value={[config.starRounding ?? 0]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(vals) => onChange("starRounding", vals[0])}
          />
        </div>
      )}
    </div>
  );
};
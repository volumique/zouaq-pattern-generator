import React from "react";
import { Slider } from "./Slider";
import { PatternConfig } from "../helpers/patternGenerator";
import styles from "./GeneratorControls.module.css";

interface GeneratorControlsFractalProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsFractal = ({
  config,
  onChange,
}: GeneratorControlsFractalProps) => {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>
          Fractal Depth ({config.fractalDepth ?? 2})
        </label>
        <Slider
          value={[config.fractalDepth ?? 2]}
          min={1}
          max={4}
          step={1}
          onValueChange={(vals) => onChange("fractalDepth", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Scale Factor ({(config.fractalScaleFactor ?? 0.4).toFixed(2)})
        </label>
        <Slider
          value={[config.fractalScaleFactor ?? 0.4]}
          min={0.2}
          max={0.7}
          step={0.05}
          onValueChange={(vals) => onChange("fractalScaleFactor", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Inner Radius Ratio ({(config.innerRadiusRatio ?? 0.4).toFixed(2)})
        </label>
        <Slider
          value={[config.innerRadiusRatio ?? 0.4]}
          min={0.2}
          max={0.6}
          step={0.05}
          onValueChange={(vals) => onChange("innerRadiusRatio", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Point Rounding ({(config.starRounding ?? 0).toFixed(2)})
        </label>
        <Slider
          value={[config.starRounding ?? 0]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(vals) => onChange("starRounding", vals[0])}
        />
      </div>
    </div>
  );
};
import React from "react";
import { Slider } from "./Slider";
import { Switch } from "./Switch";
import { PatternConfig } from "../helpers/patternConfig";
import styles from "./GeneratorControls.module.css";

interface GeneratorControlsCachemireProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsCachemire = ({
  config,
  onChange,
}: GeneratorControlsCachemireProps) => {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>
          Density ({config.cachemireDensity ?? 4})
        </label>
        <Slider
          value={[config.cachemireDensity ?? 4]}
          min={2}
          max={6}
          step={1}
          onValueChange={(vals) => onChange("cachemireDensity", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Curvature ({(config.cachemireCurvature ?? 0.7).toFixed(2)})
        </label>
        <Slider
          value={[config.cachemireCurvature ?? 0.7]}
          min={0.3}
          max={1.0}
          step={0.05}
          onValueChange={(vals) => onChange("cachemireCurvature", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Petal Count ({config.cachemirePetalCount ?? 8})
        </label>
        <Slider
          value={[config.cachemirePetalCount ?? 8]}
          min={5}
          max={12}
          step={1}
          onValueChange={(vals) => onChange("cachemirePetalCount", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Scale ({(config.cachemireScale ?? 0.8).toFixed(2)})
        </label>
        <Slider
          value={[config.cachemireScale ?? 0.8]}
          min={0.5}
          max={1.0}
          step={0.05}
          onValueChange={(vals) => onChange("cachemireScale", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="cachemire-fill">
            Fill Interior
          </label>
          <Switch
            id="cachemire-fill"
            checked={config.cachemireFillInterior ?? true}
            onCheckedChange={(val) => onChange("cachemireFillInterior", val)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="cachemire-dots">
            Show Dots
          </label>
          <Switch
            id="cachemire-dots"
            checked={config.cachemireShowDots ?? true}
            onCheckedChange={(val) => onChange("cachemireShowDots", val)}
          />
        </div>
      </div>
    </div>
  );
};
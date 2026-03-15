import React from "react";
import { Slider } from "./Slider";
import { Switch } from "./Switch";
import { PatternConfig } from "../helpers/patternGenerator";
import styles from "./GeneratorControls.module.css";

interface GeneratorControlsMandalaProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsMandala = ({
  config,
  onChange,
}: GeneratorControlsMandalaProps) => {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>
          Layers ({config.mandalaLayers ?? 3})
        </label>
        <Slider
          value={[config.mandalaLayers ?? 3]}
          min={2}
          max={5}
          step={1}
          onValueChange={(vals) => onChange("mandalaLayers", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Extension ({(config.mandalaOuterReach ?? 1.2).toFixed(1)})
        </label>
        <Slider
          value={[config.mandalaOuterReach ?? 1.2]}
          min={0.8}
          max={1.5}
          step={0.1}
          onValueChange={(vals) => onChange("mandalaOuterReach", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="mandala-shadow">
            3D Shadow Effect
          </label>
          <Switch
            id="mandala-shadow"
            checked={config.mandalaShowShadow ?? true}
            onCheckedChange={(val) => onChange("mandalaShowShadow", val)}
          />
        </div>
      </div>
    </div>
  );
};
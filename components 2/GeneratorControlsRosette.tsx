import React from "react";
import { Slider } from "./Slider";
import { Switch } from "./Switch";
import { PatternConfig } from "../helpers/patternGenerator";
import styles from "./GeneratorControls.module.css";

interface GeneratorControlsRosetteProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsRosette = ({
  config,
  onChange,
}: GeneratorControlsRosetteProps) => {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>
          Number of Branches ({config.rosettePoints ?? 16})
        </label>
        <Slider
          value={[config.rosettePoints ?? 16]}
          min={8}
          max={48}
          step={2}
          onValueChange={(vals) => onChange("rosettePoints", vals[0])}
        />
      </div>
      <div className={styles.section}>
        <label className={styles.label}>
          Concentric Layers ({config.rosetteLayers ?? 3})
        </label>
        <Slider
          value={[config.rosetteLayers ?? 3]}
          min={2}
          max={6}
          step={1}
          onValueChange={(vals) => onChange("rosetteLayers", vals[0])}
        />
      </div>
      <div className={styles.section}>
        <label className={styles.label}>
          Opening Angle ({(config.rosetteOpeningAngle ?? 0.5).toFixed(2)})
        </label>
        <Slider
          value={[config.rosetteOpeningAngle ?? 0.5]}
          min={0.3}
          max={0.8}
          step={0.05}
          onValueChange={(vals) => onChange("rosetteOpeningAngle", vals[0])}
        />
      </div>
      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="rosette-clip">
            Square Clipping (tiling)
          </label>
          <Switch
            id="rosette-clip"
            checked={config.rosetteClipSquare ?? true}
            onCheckedChange={(val) => onChange("rosetteClipSquare", val)}
          />
        </div>
      </div>
    </div>
  );
};
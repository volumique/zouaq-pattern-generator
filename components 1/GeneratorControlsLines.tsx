import React from "react";
import { Slider } from "./Slider";
import { PatternConfig } from "../helpers/patternGenerator";
import styles from "./GeneratorControls.module.css";

interface GeneratorControlsLinesProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsLines = ({
  config,
  onChange,
}: GeneratorControlsLinesProps) => {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>
          Line Thickness ({config.lineWidth.toFixed(1)})
        </label>
        <Slider
          value={[config.lineWidth]}
                    min={0}
          max={3}
          step={0.1}
          onValueChange={(vals) => onChange("lineWidth", vals[0])}
        />
      </div>
    </div>
  );
};
import React from "react";
import { Slider } from "./Slider";
import { Switch } from "./Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { PatternConfig } from "../helpers/patternGenerator";
import { AmazighMotif, AmazighSymmetry } from "../helpers/amazighPattern";
import styles from "./GeneratorControls.module.css";

interface GeneratorControlsAmazighProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsAmazigh = ({
  config,
  onChange,
}: GeneratorControlsAmazighProps) => {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>Pattern</label>
        <Select
          value={config.amazighMotif ?? "mixed"}
          onValueChange={(val) =>
            onChange("amazighMotif", val as AmazighMotif)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diamond">Diamond / Eye</SelectItem>
            <SelectItem value="zigzag">Zigzag</SelectItem>
            <SelectItem value="chevron">Chevron</SelectItem>
            <SelectItem value="cross">Cross / Fibula</SelectItem>
            <SelectItem value="yaz">Yaz (ⵣ)</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Grid Density ({config.amazighGridDensity ?? 5})
        </label>
        <Slider
          value={[config.amazighGridDensity ?? 5]}
          min={3}
          max={8}
          step={1}
          onValueChange={(vals) => onChange("amazighGridDensity", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Symmetry</label>
        <Select
          value={config.amazighSymmetry ?? "xy"}
          onValueChange={(val) =>
            onChange("amazighSymmetry", val as AmazighSymmetry)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="x">X Axis</SelectItem>
            <SelectItem value="y">Y Axis</SelectItem>
            <SelectItem value="xy">XY (Mirror)</SelectItem>
            <SelectItem value="radial4">Radial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="amazigh-fill">
            Fill Shapes
          </label>
          <Switch
            id="amazigh-fill"
            checked={config.amazighFillShapes ?? true}
            onCheckedChange={(val) => onChange("amazighFillShapes", val)}
          />
        </div>
      </div>
    </div>
  );
};
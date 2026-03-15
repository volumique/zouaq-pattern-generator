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
import styles from "./GeneratorControlsTawriq.module.css";

interface GeneratorControlsTawriqProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsTawriq = ({
  config,
  onChange,
}: GeneratorControlsTawriqProps) => {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>Main Pattern</label>
        <Select
          value={config.tawriqMotif ?? "mixed"}
          onValueChange={(val) => onChange("tawriqMotif", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a pattern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mixed">Mixed (Classic)</SelectItem>
            <SelectItem value="arabesque">Arabesque (Lines)</SelectItem>
            <SelectItem value="palmette">Palmette (Leaves)</SelectItem>
            <SelectItem value="pinecone">Pinecone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Density / Depth ({config.tawriqDensity ?? 5})
        </label>
        <Slider
          value={[config.tawriqDensity ?? 5]}
          min={3}
          max={8}
          step={1}
          onValueChange={(vals) => onChange("tawriqDensity", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Stem Curvature ({(config.tawriqCurvature ?? 0.7).toFixed(1)})
        </label>
        <Slider
          value={[config.tawriqCurvature ?? 0.7]}
          min={0.3}
          max={1.0}
          step={0.1}
          onValueChange={(vals) => onChange("tawriqCurvature", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Thick/Thin Variation ({(config.tawriqStrokeVariation ?? 0.5).toFixed(2)})
        </label>
        <Slider
          value={[config.tawriqStrokeVariation ?? 0.5]}
          min={0}
          max={1.0}
          step={0.05}
          onValueChange={(vals) => onChange("tawriqStrokeVariation", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Max Thickness ({(config.tawriqStrokeMax ?? 3).toFixed(1)})
        </label>
        <Slider
          value={[config.tawriqStrokeMax ?? 3]}
          min={1}
          max={8}
          step={0.5}
          onValueChange={(vals) => onChange("tawriqStrokeMax", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Symmetry</label>
        <Select
          value={config.tawriqSymmetry ?? "xy"}
          onValueChange={(val) => onChange("tawriqSymmetry", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose symmetry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Organic)</SelectItem>
            <SelectItem value="x">X Axis (Horizontal Mirror)</SelectItem>
            <SelectItem value="y">Y Axis (Vertical Mirror)</SelectItem>
            <SelectItem value="xy">XY (Quadruple)</SelectItem>
            <SelectItem value="radial">Radial (Rosette 6)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="tawriq-fill">
            Fill Leaves
          </label>
          <Switch
            id="tawriq-fill"
            checked={config.tawriqFillLeaves ?? true}
            onCheckedChange={(val) => onChange("tawriqFillLeaves", val)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="tawriq-spirals">
            Show Secondary Spirals
          </label>
          <Switch
            id="tawriq-spirals"
            checked={config.tawriqShowSpirals ?? true}
            onCheckedChange={(val) => onChange("tawriqShowSpirals", val)}
          />
        </div>
      </div>
    </div>
  );
};
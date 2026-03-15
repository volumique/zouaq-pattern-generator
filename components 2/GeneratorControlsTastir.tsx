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
import { PatternConfig } from "../helpers/patternConfig"; // Assuming this type exists or is inferred
import styles from "./GeneratorControlsTastir.module.css";

interface GeneratorControlsTastirProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsTastir = ({
  config,
  onChange,
}: GeneratorControlsTastirProps) => {
  const element = config.tastirElement || "zellige";
  const isKufi = element === "kufi";
  const isGeometric = element === "khatam" || element === "zellige";

  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>Main Element</label>
        <Select
          value={element}
          onValueChange={(val) => onChange("tastirElement", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an element" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zellige">Zellige (Mixed)</SelectItem>
            <SelectItem value="khatam">Khatam (Stars)</SelectItem>
            <SelectItem value="maqrouts">Maqrouts (Diamonds)</SelectItem>
            <SelectItem value="kuhat">Kuhat (Cubes)</SelectItem>
            <SelectItem value="kufi">Kufi (Calligraphy)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Density ({config.tastirDensity || 3})
        </label>
        <Slider
          value={[config.tastirDensity || 3]}
          min={1}
          max={8}
          step={1}
          onValueChange={(vals) => onChange("tastirDensity", vals[0])}
        />
      </div>

      {isGeometric && (
        <div className={styles.section}>
          <label className={styles.label}>Star Branches</label>
          <Select
            value={(config.tastirBranches || 8).toString()}
            onValueChange={(val) => onChange("tastirBranches", parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Number of branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8 Branches</SelectItem>
              <SelectItem value="12">12 Branches</SelectItem>
              <SelectItem value="16">16 Branches</SelectItem>
              <SelectItem value="24">24 Branches</SelectItem>
              <SelectItem value="32">32 Branches</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isKufi && (
        <div className={styles.section}>
          <label className={styles.label}>Kufi Style</label>
          <Select
            value={config.tastirKufiText || "geometric"}
            onValueChange={(val) => onChange("tastirKufiText", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Text style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geometric">Abstract Geometric</SelectItem>
              <SelectItem value="allah">"Allah" Pattern</SelectItem>
              <SelectItem value="bismillah">"Bismillah" Pattern</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {!isKufi && (
        <>
          <div className={styles.section}>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="tastir-kuhat">
                Show Kuhat (Cubes)
              </label>
              <Switch
                id="tastir-kuhat"
                checked={config.tastirShowKuhat ?? true}
                onCheckedChange={(val) => onChange("tastirShowKuhat", val)}
              />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="tastir-maqrouts">
                Show Maqrouts (Diamonds)
              </label>
              <Switch
                id="tastir-maqrouts"
                checked={config.tastirShowMaqrouts ?? true}
                onCheckedChange={(val) => onChange("tastirShowMaqrouts", val)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
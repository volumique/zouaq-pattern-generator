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
import styles from "./GeneratorControls.module.css";

interface GeneratorControlsZouaqProps {
  config: PatternConfig;
  onChange: (key: keyof PatternConfig, value: any) => void;
}

export const GeneratorControlsZouaq = ({
  config,
  onChange,
}: GeneratorControlsZouaqProps) => {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>Base Shape</label>
        <Select
          value={config.zouaqShape ?? "zigzag"}
          onValueChange={(val) =>
            onChange(
              "zouaqShape",
              val as "zigzag" | "star" | "spiral" | "grid" | "arcs"
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zigzag">Radial Zigzag</SelectItem>
            <SelectItem value="star">Star</SelectItem>
            <SelectItem value="spiral">Spiral</SelectItem>
            <SelectItem value="grid">Lattice</SelectItem>
            <SelectItem value="arcs">Arcs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Tile Shape</label>
        <Select
          value={config.zouaqTileShape ?? "square"}
          onValueChange={(val) =>
            onChange(
              "zouaqTileShape",
              val
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="hexagon">Hexagon</SelectItem>
            <SelectItem value="octagon">Octagon</SelectItem>
            <SelectItem value="diamond">Diamond</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>End Style</label>
        <Select
          value={config.zouaqRibbonEnd ?? "flat"}
          onValueChange={(val) =>
            onChange(
              "zouaqRibbonEnd",
              val as "flat" | "rounded" | "pointed" | "circle"
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat</SelectItem>
            <SelectItem value="rounded">Rounded</SelectItem>
            <SelectItem value="pointed">Pointed</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
                    Ribbon Thickness ({config.zouaqStrapWidth ?? 10}px)
        </label>
        <Slider
                    value={[config.zouaqStrapWidth ?? 10]}
          min={0}
          max={20}
          step={1}
          onValueChange={(vals) => onChange("zouaqStrapWidth", vals[0])}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="zouaq-interlace">
            Interlacing (over/under)
          </label>
          <Switch
            id="zouaq-interlace"
            checked={config.zouaqInterlace ?? true}
            onCheckedChange={(val) => onChange("zouaqInterlace", val)}
          />
        </div>
      </div>

      {(config.zouaqShape ?? "zigzag") === "zigzag" && (
        <div className={styles.section}>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="zouaq-curved">
              Curved Style (Floral)
            </label>
            <Switch
              id="zouaq-curved"
              checked={config.zouaqCurvedStyle ?? false}
              onCheckedChange={(val) => onChange("zouaqCurvedStyle", val)}
            />
          </div>
        </div>
      )}

      {(config.zouaqShape ?? "zigzag") === "zigzag" &&
        (config.zouaqCurvedStyle ?? false) && (
          <div className={styles.section}>
            <label className={styles.label}>
              Curve Intensity (
              {Math.round((config.zouaqCurveIntensity ?? 0.2) * 100)}%)
            </label>
            <Slider
              value={[config.zouaqCurveIntensity ?? 0.2]}
              min={0.1}
              max={1.0}
              step={0.05}
              onValueChange={(vals) => onChange("zouaqCurveIntensity", vals[0])}
            />
          </div>
        )}
    </div>
  );
};
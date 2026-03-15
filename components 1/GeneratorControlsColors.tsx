import React from "react";
import { PatternConfig, COLOR_PRESETS } from "../helpers/patternGenerator";
import styles from "./GeneratorControls.module.css";

interface GeneratorControlsColorsProps {
  config: PatternConfig;
  onChange: (newConfig: PatternConfig) => void;
}

export const GeneratorControlsColors = ({
  config,
  onChange,
}: GeneratorControlsColorsProps) => {
  const updateColor = (key: keyof typeof config.colors, value: string) => {
    onChange({
      ...config,
      colors: { ...config.colors, [key]: value },
    });
  };

  const applyPreset = (presetName: keyof typeof COLOR_PRESETS) => {
    onChange({
      ...config,
      colors: COLOR_PRESETS[presetName],
    });
  };

  return (
    <div className={styles.sectionGroup}>
      <div className={styles.section}>
        <label className={styles.label}>Color Preset</label>
        <div className={styles.presetGrid}>
          <button
            className={styles.presetButton}
            onClick={() => applyPreset("traditional")}
          >
            <div className={styles.presetSwatch}>
              <div
                style={{ backgroundColor: COLOR_PRESETS.traditional.primary }}
              />
              <div
                style={{ backgroundColor: COLOR_PRESETS.traditional.secondary }}
              />
              <div
                style={{ backgroundColor: COLOR_PRESETS.traditional.accent }}
              />
            </div>
            <span>Traditional</span>
          </button>
          <button
            className={styles.presetButton}
            onClick={() => applyPreset("warm")}
          >
            <div className={styles.presetSwatch}>
              <div style={{ backgroundColor: COLOR_PRESETS.warm.primary }} />
              <div style={{ backgroundColor: COLOR_PRESETS.warm.secondary }} />
              <div style={{ backgroundColor: COLOR_PRESETS.warm.accent }} />
            </div>
            <span>Warm</span>
          </button>
          <button
            className={styles.presetButton}
            onClick={() => applyPreset("cool")}
          >
            <div className={styles.presetSwatch}>
              <div style={{ backgroundColor: COLOR_PRESETS.cool.primary }} />
              <div style={{ backgroundColor: COLOR_PRESETS.cool.secondary }} />
              <div style={{ backgroundColor: COLOR_PRESETS.cool.accent }} />
            </div>
            <span>Cool</span>
          </button>
          <button
            className={styles.presetButton}
            onClick={() => applyPreset("emerald")}
          >
            <div className={styles.presetSwatch}>
              <div style={{ backgroundColor: COLOR_PRESETS.emerald.primary }} />
              <div style={{ backgroundColor: COLOR_PRESETS.emerald.secondary }} />
              <div style={{ backgroundColor: COLOR_PRESETS.emerald.accent }} />
            </div>
            <span>Emerald</span>
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Custom Colors</label>
        <div className={styles.colorGrid}>
          <div className={styles.colorInputGroup}>
            <label>Primary</label>
            <input
              type="color"
              value={config.colors.primary}
              onChange={(e) => updateColor("primary", e.target.value)}
              className={styles.colorInput}
            />
          </div>
          <div className={styles.colorInputGroup}>
            <label>Secondary</label>
            <input
              type="color"
              value={config.colors.secondary}
              onChange={(e) => updateColor("secondary", e.target.value)}
              className={styles.colorInput}
            />
          </div>
          <div className={styles.colorInputGroup}>
            <label>Accent</label>
            <input
              type="color"
              value={config.colors.accent}
              onChange={(e) => updateColor("accent", e.target.value)}
              className={styles.colorInput}
            />
          </div>
          <div className={styles.colorInputGroup}>
            <label>Background</label>
            <input
              type="color"
              value={config.colors.background}
              onChange={(e) => updateColor("background", e.target.value)}
              className={styles.colorInput}
            />
          </div>
          <div className={styles.colorInputGroup}>
            <label>Lines</label>
            <input
              type="color"
              value={config.colors.line}
              onChange={(e) => updateColor("line", e.target.value)}
              className={styles.colorInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * @file GeneratorControls.tsx
 * @description Sidebar component for controlling authentic Zellige pattern generation parameters.
 * Houses the UI controls (sliders, toggles, dropdowns) separated by logical accordion sections.
 */

import React from "react";
import { PatternConfig } from "../helpers/patternConfig";
import { Accordion } from "./Accordion";
import { Button } from "./Button";
import { GeneratorControlsPattern } from "./GeneratorControlsPattern";
import { GeneratorControlsGeometry } from "./GeneratorControlsGeometry";
import { GeneratorControlsColors } from "./GeneratorControlsColors";
import { GeneratorControlsLines } from "./GeneratorControlsLines";
import { GeneratorControlsTiling } from "./GeneratorControlsTiling";
import { GeneratorControlsSection } from "./GeneratorControlsSection";

import { GeneratorControlsRosette } from "./GeneratorControlsRosette";
import { GeneratorControlsFractal } from "./GeneratorControlsFractal";
import { GeneratorControlsZouaq } from "./GeneratorControlsZouaq";
import { GeneratorControlsMandala } from "./GeneratorControlsMandala";
import { GeneratorControlsAmazigh } from "./GeneratorControlsAmazigh";
import { GeneratorControlsShamsa } from "./GeneratorControlsShamsa";
import { GeneratorControlsTawriq } from "./GeneratorControlsTawriq";
import { GeneratorControlsTastir } from "./GeneratorControlsTastir";
import { GeneratorControlsCachemire } from "./GeneratorControlsCachemire";

import { Download, RotateCcw } from "lucide-react";
import styles from "./GeneratorControls.module.css";

/**
 * Props for the GeneratorControls component.
 */
interface GeneratorControlsProps {
  /** The current state configuration defining the generator output */
  config: PatternConfig;
  /** Callback fired whenever any internal control alters a property */
  onChange: (newConfig: PatternConfig) => void;
  /** Callback to trigger SVG file export generation */
  onExport: () => void;
  /** Callback to reset the generator back to initial factory values */
  onReset: () => void;
  /** Display value for the total number of SVG shapes active */
  shapesCount: number;
}

/**
 * Renders the main sidebar configuration panel.
 * Uses a tabbed accordion structure to group related settings. Based on the `config.type` selected,
 * it dynamically dispatches rendering out to specific, specialized sub-components (like `GeneratorControlsRosette` 
 * or `GeneratorControlsZouaq`) so that irrelevant inputs are hidden.
 */
export const GeneratorControls = ({
  config,
  onChange,
  onExport,
  onReset,
  shapesCount,
}: GeneratorControlsProps) => {
  // Generic helper for single-key updates to the configuration object
  const updateConfig = (key: keyof PatternConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  // Determine visibility states for specialized panels based on the pattern type
  const showZouaqControls = config.type === "zouaq";
  const showRosetteControls = config.type === "rosette";
  const showFractalControls = config.type === "fractalRosette";
  const showMandalaControls = config.type === "mandala";
  const showAmazighControls = config.type === "amazigh";
  const showShamsaControls = config.type === "shamsa";
  const showTawriqControls = config.type === "tawriq";
  const showTastirControls = config.type === "tastir";
  const showCachemireControls = config.type === "cachemire";

  // Hide standard geometry controls for types that have their own specialized geometry panels
  // or don't use the standard star/polygons logic.
  const hideGeometryControls = [
    "amazigh",
    "tawriq",
    "tastir",
    "cachemire",
  ].includes(config.type);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Generator</h2>
        <p className={styles.subtitle}>Zellige & Geometry</p>
      </div>

      <div className={styles.scrollArea}>
        {/* The main tabbed control structure */}
        <Accordion type="multiple" defaultValue={["motif"]}>
          <GeneratorControlsSection value="motif" title="Pattern">
            <GeneratorControlsPattern
              config={config}
              onChange={updateConfig}
            />
          </GeneratorControlsSection>

          {/* Contextual control rendering - only loads specific panels when relevant */}
          {showZouaqControls && (
            <GeneratorControlsSection value="zouaq" title="Zouaq Settings">
              <GeneratorControlsZouaq config={config} onChange={updateConfig} />
            </GeneratorControlsSection>
          )}

          {showRosetteControls && (
            <GeneratorControlsSection value="rosette" title="Rosette">
              <GeneratorControlsRosette
                config={config}
                onChange={updateConfig}
              />
            </GeneratorControlsSection>
          )}

          {showFractalControls && (
            <GeneratorControlsSection value="fractal" title="Fractal">
              <GeneratorControlsFractal
                config={config}
                onChange={updateConfig}
              />
            </GeneratorControlsSection>
          )}

          {showMandalaControls && (
            <GeneratorControlsSection value="mandala" title="Mandala">
              <GeneratorControlsMandala
                config={config}
                onChange={updateConfig}
              />
            </GeneratorControlsSection>
          )}

          {showAmazighControls && (
            <GeneratorControlsSection value="amazigh" title="Amazigh">
              <GeneratorControlsAmazigh
                config={config}
                onChange={updateConfig}
              />
            </GeneratorControlsSection>
          )}

          {showShamsaControls && (
            <GeneratorControlsSection value="shamsa" title="Shamsa">
              <GeneratorControlsShamsa
                config={config}
                onChange={updateConfig}
              />
            </GeneratorControlsSection>
          )}

          {showTawriqControls && (
            <GeneratorControlsSection value="tawriq" title="Tawriq">
              <GeneratorControlsTawriq
                config={config}
                onChange={updateConfig}
              />
            </GeneratorControlsSection>
          )}

          {showTastirControls && (
            <GeneratorControlsSection value="tastir" title="Tastir">
              <GeneratorControlsTastir
                config={config}
                onChange={updateConfig}
              />
            </GeneratorControlsSection>
          )}

          {showCachemireControls && (
            <GeneratorControlsSection value="cachemire" title="Cachemire (Paisley)">
              <GeneratorControlsCachemire
                config={config}
                onChange={updateConfig}
              />
            </GeneratorControlsSection>
          )}

          {!hideGeometryControls && (
            <GeneratorControlsSection value="geometry" title="Geometry">
              <GeneratorControlsGeometry
                config={config}
                onChange={updateConfig}
              />
            </GeneratorControlsSection>
          )}

          {/* Standard shared properties valid across almost all patterns */}
          <GeneratorControlsSection value="tiling" title="Tiling & Symmetry">
            <GeneratorControlsTiling config={config} onChange={updateConfig} />
          </GeneratorControlsSection>

          <GeneratorControlsSection value="lines" title="Lines">
            <GeneratorControlsLines config={config} onChange={updateConfig} />
          </GeneratorControlsSection>

          <GeneratorControlsSection value="colors" title="Colors">
            <GeneratorControlsColors config={config} onChange={onChange} />
          </GeneratorControlsSection>
        </Accordion>
      </div>

      {/* Global Actions Footer */}
      <div className={styles.footer}>
        <div className={styles.shapesCount}>{shapesCount} shapes generated</div>
        <div className={styles.buttonGroup}>
          <Button
            variant="outline"
            onClick={onReset}
            className={styles.actionButton}
          >
            <RotateCcw size={16} />
            Reset
          </Button>
          <Button onClick={onExport} className={styles.actionButton}>
            <Download size={16} />
            Export SVG
          </Button>
        </div>

        <div className={styles.credit}>
          designed by{" "}
          <a
            href="https://etienne.design/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Étienne Mineur
          </a>{" "}
          with{" "}
          <a
            href="https://floot.com?fpr=etienne"
            target="_blank"
            rel="noopener noreferrer"
          >
            Floot
          </a>
        </div>
      </div>
    </div>
  );
};
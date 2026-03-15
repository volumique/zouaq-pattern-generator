/**
 * @file generator.tsx
 * @description Main application page for the Pattern Generator.
 * Acts as the top-level container connecting the configuration state with the rendering engine.
 */

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "../helpers/useDebounce";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "../components/Button";
import { GeneratorControls } from "../components/GeneratorControls";
import { PatternPreview } from "../components/PatternPreview";
import { FullscreenPattern } from "../components/FullscreenPattern";

import {
  generatePattern,
  PatternConfig,
} from "../helpers/patternGenerator";
import { exportPatternSvg } from "../helpers/exportPatternSvg";

import styles from "./generator.module.css";

const DEFAULT_CONFIG: PatternConfig = {
  type: "amazigh",
  branches: 8,
  colors: {
    primary: "#C35831", // Terracotta
    secondary: "#E4A010", // Saffron yellow
    accent: "#1E4D8C", // Blue
    background: "#F5F0E6", // White/Cream
    line: "#1a1a1a", // Black
  },
  tiling: 2,
  lineWidth: 1.5,
  kaleidoscope: true,
  kaleidoscopeSegments: 18,
};

/**
 * GeneratorPage Component
 * 
 * Orchestrates the application logic:
 * 1. State Management: Maintains the source-of-truth `PatternConfig` via `useState`.
 * 2. Optimization: Debounces user input to prevent excessive heavy computational calls.
 * 3. Side Effects: Manages SVG exports and fullscreen toggles.
 * 4. Layout: Divides the UI into a control sidebar and an interactive preview canvas.
 */
export default function GeneratorPage() {
  const [config, setConfig] = useState<PatternConfig>(DEFAULT_CONFIG);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Store wallpaper group setting strictly for toggling fullscreen state recovery
  const prevWallpaperGroupsRef = React.useRef(config.useWallpaperGroups);

  // Debounce config for pattern generation to reduce computation
  // This ensures rapid sliding doesn't block the UI thread completely.
  const debouncedConfig = useDebounce(config, 150);

  // Memoize pattern generation to avoid unnecessary recalculations
  // Uses the debounced config to avoid regenerating the complex mathematical pattern on every keystroke.
  const pattern = useMemo(() => generatePattern(debouncedConfig), [debouncedConfig]);

  /**
   * Toggles immersive full-screen display.
   * Auto-enables wallpaper groups if suitable to create endless patterns.
   */
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const newFullscreen = !prev;

      if (newFullscreen) {
        // Store current value before potential modification
        prevWallpaperGroupsRef.current = config.useWallpaperGroups;

        // Automatically enable wallpaper groups when entering fullscreen
        // BUT ONLY if kaleidoscope is NOT active AND advanced tiling is NOT active
        if (!config.useWallpaperGroups && !config.kaleidoscope && !config.useAdvancedTiling) {
          setConfig((c) => ({ ...c, useWallpaperGroups: true }));
        }
      } else {
        // Revert to previous state when exiting fullscreen
        if (config.useWallpaperGroups !== prevWallpaperGroupsRef.current) {
          setConfig((c) => ({
            ...c,
            useWallpaperGroups: prevWallpaperGroupsRef.current ?? false,
          }));
        }
      }
      return newFullscreen;
    });
  };

  /** Orchestrates the flow of exporting the generated motif as a downloadable SVG. */
  const handleExport = () => {
    exportPatternSvg(config, pattern);
    toast.success("Pattern exported successfully!");
  };

  /** Resets the application parameters to initial loaded state. */
  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    toast.info("Configuration reset");
  };

  return (
    <>
      <Helmet>
        <title>Creation Studio | Moroccan Pattern Generator</title>
      </Helmet>

      <div className={styles.container}>
        {/* Navigation Bar */}
        <header className={`${styles.topBar} ${isFullscreen ? styles.hidden : ""}`}>
          <Link to="/" className={styles.brand}>Zouaq generator</Link>
          <a
            href="https://buymeacoffee.com/etienneminr"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.coffeeLink}
            onClick={(e) => {
              e.preventDefault();
              window.open("https://buymeacoffee.com/etienneminr", "_blank");
            }}
          >
            <span style={{ fontSize: "1.2em", lineHeight: 1 }}>☕</span> Buy me a coffee
          </a>
        </header>

        {/* Core Layout Split */}
        <div className={styles.contentRow}>
          {/* Controls Sidebar */}
          <div className={`${styles.sidebar} ${isFullscreen ? styles.hidden : ""}`}>
            <GeneratorControls
              config={config}
              onChange={setConfig}
              onExport={handleExport}
              onReset={handleReset}
              shapesCount={pattern.shapes.length}
            />
          </div>

          {/* Interactive Rendering Canvas */}
          <main
            className={`${styles.mainArea} ${isFullscreen ? styles.fullscreenContainer : ""}`}
            style={
              isFullscreen
                ? ({
                    "--surface": config.colors.background,
                    "--background": config.colors.background,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <button
              onClick={toggleFullscreen}
              className={isFullscreen ? styles.exitFullscreenButton : styles.fullscreenButton}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>

            {/* Render immersive fullscreen node OR typical preview pane based on state */}
            {isFullscreen ? (
              <FullscreenPattern
                pattern={pattern}
                backgroundColor={config.colors.background}
                kaleidoscope={config.kaleidoscope}
                kaleidoscopeSegments={config.kaleidoscopeSegments}
                kaleidoscopeMirror={config.kaleidoscopeMirror}
                kaleidoscopeRotation={config.kaleidoscopeRotation}
                kaleidoscopeBlend={config.kaleidoscopeBlend}
                kaleidoscopeCenterX={config.kaleidoscopeCenterX}
                kaleidoscopeCenterY={config.kaleidoscopeCenterY}
                kaleidoscopeTiling={config.kaleidoscopeTiling}
                kaleidoscopeTileShape={config.kaleidoscopeTileShape}
                kaleidoscopeTileOverflow={config.kaleidoscopeTileOverflow}
              />
            ) : (
              <PatternPreview
                pattern={pattern}
                backgroundColor={config.colors.background}
                zoom={config.patternZoom ?? 1}
                kaleidoscope={config.kaleidoscope}
                kaleidoscopeSegments={config.kaleidoscopeSegments}
                kaleidoscopeMirror={config.kaleidoscopeMirror}
                kaleidoscopeRotation={config.kaleidoscopeRotation}
                kaleidoscopeBlend={config.kaleidoscopeBlend}
                kaleidoscopeCenterX={config.kaleidoscopeCenterX}
                kaleidoscopeCenterY={config.kaleidoscopeCenterY}
                kaleidoscopeTiling={config.kaleidoscopeTiling}
                kaleidoscopeTileShape={config.kaleidoscopeTileShape}
                kaleidoscopeTileOverflow={config.kaleidoscopeTileOverflow}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
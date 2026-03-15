/**
 * @file exportPatternSvg.tsx
 * @description Direct export utility of the geometric view to a downloadable SVG file.
 * Preserves the accuracy of all transformations (especially for the kaleidoscope).
 */

import { PatternConfig, GeneratedPattern } from "./patternConfig";
import {
  getKaleidoscopeTransforms,
  buildSegmentTransformString,
  getKaleidoscopeWedgeClipPath,
  computeKaleidoscopeTileLayout,
} from "./kaleidoscopeGeometry";

/**
 * Converts the logical canvas into a textual SVG file blob and triggers a browser download
 * by artificially creating an `<a>` anchor tag.
 *
 * Handles 3 major export flows:
 * 1. Tiled Kaleidoscope Export (Tiled Kaleidoscope): Cuts into tiles (e.g., hexagonal) and repeats the global rosette.
 * 2. Single Kaleidoscope Export (Single): Isolates a wedge (cake slice) of the pattern and mirrors it.
 * 3. Classic Export (Normal): The default render, simply a direct traversal of the flat `pattern.shapes` list.
 * 
 * @param config The active configuration state at the time of download
 * @param pattern The in-memory result calculated by patternGenerator
 */
export function exportPatternSvg(
  config: PatternConfig,
  pattern: GeneratedPattern
): void {
  // ─── DEFINITIONS GENERATION (Defs) ───
  // Extracts all ClipPaths from the shapes list.
  // Note: Historically, the "zouaq-clip-" ID remains for backward compatibility (even if
  // patterns other than zouaq use it).
  let clipPathDefs = pattern.shapes
    .map((shape, index) => {
      if (shape.clipPath) {
        return `<clipPath id="zouaq-clip-${index}"><path d="${shape.clipPath}" /></clipPath>`;
      }
      return null;
    })
    .filter(Boolean)
    .join("");

  const kaleidoscope = config.kaleidoscope ?? false;
  const kaleidoscopeSegments = config.kaleidoscopeSegments ?? 12;
  const kaleidoscopeMirror = config.kaleidoscopeMirror ?? true;
  const kaleidoscopeRotation = config.kaleidoscopeRotation ?? 0;
  const kaleidoscopeBlend = config.kaleidoscopeBlend ?? "normal";
  const kaleidoscopeCenterX = config.kaleidoscopeCenterX ?? 0;
  const kaleidoscopeCenterY = config.kaleidoscopeCenterY ?? 0;
  const kaleidoscopeTiling = config.kaleidoscopeTiling ?? 1;
  const kaleidoscopeTileOverflow = config.kaleidoscopeTileOverflow ?? false;

  // Utility to convert a pure Shape into an SVG string fragment.
  const renderShapesForExport = (shapes: typeof pattern.shapes) => {
    return shapes
      .map((shape, index) => {
        const element = shape.path
          ? `<path d="${shape.path}" fill="${shape.color}" stroke="${
              shape.stroke || "none"
            }" stroke-width="${shape.strokeWidth || 0}" />`
          : `<polygon points="${shape.points
              .map((p) => `${p.x},${p.y}`)
              .join(" ")}" fill="${shape.color}" stroke="${
              shape.stroke || "none"
            }" stroke-width="${shape.strokeWidth || 0}" />`;

        if (shape.clipPath) {
          return `<g clip-path="url(#zouaq-clip-${index})">${element}</g>`;
        }
        return element;
      })
      .join("");
  };

  let shapeElements = "";

  if (kaleidoscope) {
    // ─── KALEIDOSCOPE EXPORT (Paths 1 and 2) ───
    
    // Central vanishing point calculation
    const baseCx = pattern.width / 2;
    const baseCy = pattern.height / 2;
    const offsetCx = baseCx + kaleidoscopeCenterX * pattern.width;
    const offsetCy = baseCy + kaleidoscopeCenterY * pattern.height;

    // Calculation of the transformation matrix for each "cake slice"
    const segmentTransforms = getKaleidoscopeTransforms({
      kaleidoscope: true,
      kaleidoscopeSegments,
      kaleidoscopeMirror,
      kaleidoscopeRotation,
    } as PatternConfig);

    // Physical shape of the slice
    const wedgeRadius = Math.max(pattern.width, pattern.height) * 1.5;
    const wedgeClipPath = getKaleidoscopeWedgeClipPath(
      offsetCx,
      offsetCy,
      wedgeRadius,
      kaleidoscopeSegments
    );

    clipPathDefs += `<clipPath id="kaleidoscope-wedge-clip"><path d="${wedgeClipPath}" /></clipPath>`;

    if (kaleidoscopeTiling > 1) {
      // Path 1: Kaleidoscope with complex grid repetition
      const tilingN = kaleidoscopeTiling;
      const tileShape = config.kaleidoscopeTileShape ?? "square";
      const tileLayout = computeKaleidoscopeTileLayout(
        tileShape,
        pattern.width,
        pattern.height,
        tilingN
      );

      const tileElements: string[] = [];
      tileLayout.tiles.forEach((tile, tileIndex) => {
        // Each tile has its own mask geometry (to prevent segments from overflowing onto the neighbor)
        const tileClipId = `kaleid-tile-clip-${tileIndex}`;
        clipPathDefs += `<clipPath id="${tileClipId}"><path d="${tile.clipPathD}" /></clipPath>`;

        const shapesContent = renderShapesForExport(pattern.shapes);

        // If we accept overflow, we do not draw a local background that would hide the other tiles
        const bgRect = kaleidoscopeTileOverflow
          ? ""
          : `<rect x="${-pattern.width}" y="${
              -pattern.height
            }" width="${pattern.width * 3}" height="${
              pattern.height * 3
            }" fill="${config.colors.background}" />`;

        const segmentShapes = segmentTransforms
          .map((transform) => {
            const transformStr = buildSegmentTransformString(
              transform,
              offsetCx,
              offsetCy
            );
            return `<g transform="${transformStr}" style="mix-blend-mode: ${kaleidoscopeBlend}"><g clip-path="url(#kaleidoscope-wedge-clip)">${bgRect}${shapesContent}</g></g>`;
          })
          .join("");

        tileElements.push(`<g>
            <g transform="translate(${tile.x},${tile.y})">
              <g ${
                kaleidoscopeTileOverflow
                  ? ""
                  : `clip-path="url(#${tileClipId})"`
              }>
                ${segmentShapes}
              </g>
            </g>
          </g>`);
      });

      shapeElements = tileElements.join("");

      // SVG header structure (xmlns, viewBox, defs, styles)
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${
        tileLayout.totalWidth
      } ${tileLayout.totalHeight}" width="${
        tileLayout.totalWidth
      }" height="${tileLayout.totalHeight}">
  <defs>
    ${clipPathDefs}
  </defs>
  <style>
    polygon { vector-effect: non-scaling-stroke; }
    path { vector-effect: non-scaling-stroke; }
  </style>
  <rect width="100%" height="100%" fill="${config.colors.background}" />
  ${shapeElements}
</svg>`;

      triggerDownload(svgContent, `moroccan-pattern-${config.type}-kaleidoscope-tiled.svg`);
    } else {
      // Path 2: Simple centered kaleidoscope (single block)
      const shapesContent = renderShapesForExport(pattern.shapes);

      const bgRect = `<rect x="${-pattern.width}" y="${-pattern.height}" width="${
        pattern.width * 3
      }" height="${pattern.height * 3}" fill="${config.colors.background}" />`;

      const segmentShapes = segmentTransforms
        .map((transform) => {
          const transformStr = buildSegmentTransformString(
            transform,
            offsetCx,
            offsetCy
          );
          return `<g transform="${transformStr}" style="mix-blend-mode: ${kaleidoscopeBlend}"><g clip-path="url(#kaleidoscope-wedge-clip)">${bgRect}${shapesContent}</g></g>`;
        })
        .join("");

      shapeElements = segmentShapes;

      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${pattern.viewBox}" width="${pattern.width}" height="${pattern.height}">
  <defs>
    ${clipPathDefs}
  </defs>
  <style>
    polygon { vector-effect: non-scaling-stroke; }
    path { vector-effect: non-scaling-stroke; }
  </style>
  <rect width="100%" height="100%" fill="${config.colors.background}" />
  ${shapeElements}
</svg>`;

      triggerDownload(svgContent, `moroccan-pattern-${config.type}-kaleidoscope.svg`);
    }
  } else {
    // ─── CLASSIC EXPORT (Path 3) ───
    shapeElements = renderShapesForExport(pattern.shapes);

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${pattern.viewBox}" width="${pattern.width}" height="${pattern.height}">
  <defs>
    ${clipPathDefs}
  </defs>
  <style>
    polygon { vector-effect: non-scaling-stroke; }
    path { vector-effect: non-scaling-stroke; }
  </style>
  <rect width="100%" height="100%" fill="${config.colors.background}" />
  ${shapeElements}
</svg>`;

    triggerDownload(svgContent, `moroccan-pattern-${config.type}.svg`);
  }
}

/** Utility sub-function simulating a user click to inject the SVG file */
function triggerDownload(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
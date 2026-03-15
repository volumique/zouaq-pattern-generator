/**
 * @file cachemirePattern.tsx
 * @description Helper for generating authentic Kashmir (Paisley/Boteh) patterns.
 * 
 * The Boteh motif is a droplet-shaped vegetal motif of Persian origin, 
 * which later became known globally as the Paisley pattern. It is characterized 
 * by a rounded bulb tapering into a curved, elegantly bent tip. 
 * This module constructs the outline using cubic Bézier curves and fills the 
 * interior with dense, concentric mathematical rosettes.
 */

import {
  Point,
  polarToCartesian,
  createRoundedPolygonPath
} from "./geometryUtils";

export interface CachemireOptions {
  cachemireDensity: number; // 2 to 6
  cachemireCurvature: number; // 0.3 to 1.0
  cachemireFillInterior: boolean;
  cachemirePetalCount: number; // 5 to 12
  cachemireShowDots: boolean;
  cachemireScale: number; // 0.5 to 1.0
}

const DEFAULT_OPTIONS: CachemireOptions = {
  cachemireDensity: 4,
  cachemireCurvature: 0.7,
  cachemireFillInterior: true,
  cachemirePetalCount: 8,
  cachemireShowDots: true,
  cachemireScale: 0.8,
};

interface ShapeResult {
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  path?: string;
  closed?: boolean;
}

/**
 * Generates a Kashmir (Paisley/Boteh) pattern tile.
 */
export function generateCachemireTile(
  size: number,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    line: string;
  },
  lineWidth: number,
  options: Partial<CachemireOptions> = {}
): ShapeResult[] {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const shapes: ShapeResult[] = [];

  const cx = size / 2;
  const cy = size / 2;
  
  // Calculate base dimensions based on scale
  const baseScale = (size / 2) * config.cachemireScale;
  // Boteh usually is taller than wide, let's say ratio 1:1.5 approx
  // We'll define it within a bounding box
  
  // --- 1. Draw Boteh Outline (Cubic Bezier) ---
  // The Boteh shape resembles a droplet with a bent tip.
  // We can construct it using a few control points.
  // Let's assume the "bulb" is at the bottom and the "tail" curves up and right/left.
  
  // Control parameter for the "bend" of the tip
  const bendFactor = config.cachemireCurvature; 
  
  // Key points relative to center (0,0 is center of tile)
  // We want the visual center of the boteh to be roughly at (cx, cy)
  // The bulb center roughly at (cx, cy + offset)
  
  const bulbRadius = baseScale * 0.5;
  const tailHeight = baseScale * 1.0;
  
  // Shift everything down a bit so it looks centered
  const verticalShift = baseScale * 0.2;
  const bCx = cx;
  const bCy = cy + verticalShift;

  // Bulb bottom arc
  // We'll construct the path string directly
  // Start at bottom center of bulb
  const pBottom = { x: bCx, y: bCy + bulbRadius };
  
  // Left side of bulb
  const pLeftAnchor = { x: bCx - bulbRadius, y: bCy };
  // Right side of bulb
  const pRightAnchor = { x: bCx + bulbRadius, y: bCy };

  // The tip (tail)
  // It curves upwards. Tip position depends on curvature.
  // Higher curvature -> more bent to the side (e.g. right)
  const tipX = bCx + bulbRadius * (bendFactor * 1.5); 
  const tipY = bCy - tailHeight;

  // Constructing the path commands
  // We use two main curves: Left side going up to tip, Right side going up to tip (shorter, inner curve)
  
  // Left side control points
  const c1Left = { x: bCx - bulbRadius * 1.4, y: bCy + bulbRadius * 0.2 };
  const c2Left = { x: bCx - bulbRadius * 0.8, y: tipY + tailHeight * 0.5 };
  
  // Right side control points (the inner curve of the paisley)
  // Needs to be "tucked in"
  const c1Right = { x: bCx + bulbRadius * 1.4, y: bCy + bulbRadius * 0.2 };
  const c2Right = { x: bCx + bulbRadius * (0.2 - bendFactor * 0.5), y: tipY + tailHeight * 0.3 };

  // Let's refine the path to be continuous.
  // Start at bottom P(0, R) relative to center
  // Go counter-clockwise
  
  const pathParts: string[] = [];
  pathParts.push(`M ${bCx},${bCy + bulbRadius}`);
  
  // Curve 1: Bottom Right Quadrant
  // Bezier to Right Anchor
  pathParts.push(`C ${bCx + bulbRadius * 0.55},${bCy + bulbRadius} ${bCx + bulbRadius},${bCy + bulbRadius * 0.55} ${pRightAnchor.x},${pRightAnchor.y}`);
  
  // Curve 2: Inner curve to Tip (The "stomach")
  // This needs to curve inward if curvature is high
  const stomachCP1 = { x: bCx + bulbRadius, y: bCy - bulbRadius * 0.5 };
  const stomachCP2 = { x: bCx + bulbRadius * (1 - bendFactor), y: tipY + tailHeight * 0.3 };
  pathParts.push(`C ${stomachCP1.x},${stomachCP1.y} ${stomachCP2.x},${stomachCP2.y} ${tipX},${tipY}`);
  
  // Curve 3: Outer curve from Tip down to Left Anchor (The "back")
  const backCP1 = { x: tipX - bulbRadius * (0.5 + bendFactor * 0.5), y: tipY - bulbRadius * 0.2 }; 
  const backCP2 = { x: bCx - bulbRadius * 1.1, y: bCy - bulbRadius * 0.8 };
  pathParts.push(`C ${backCP1.x},${backCP1.y} ${backCP2.x},${backCP2.y} ${pLeftAnchor.x},${pLeftAnchor.y}`);

  // Curve 4: Bottom Left Quadrant
  // Bezier from Left Anchor to Bottom
  pathParts.push(`C ${bCx - bulbRadius},${bCy + bulbRadius * 0.55} ${bCx - bulbRadius * 0.55},${bCy + bulbRadius} ${bCx},${bCy + bulbRadius}`);
  
  pathParts.push("Z");
  const botehPath = pathParts.join(" ");

  // Add the main Boteh shape
  shapes.push({
    points: [], // Path-based shape
    path: botehPath,
    fill: config.cachemireFillInterior ? colors.background : "none",
    stroke: colors.line,
    strokeWidth: lineWidth * 2,
    closed: true
  });

  // --- 2. Internal Decorative Fill (Rosettes) - DENSE VERSION ---
  if (config.cachemireFillInterior) {
    // Calculate total number of concentric rings
    // Each density unit produces 3-4 rings for packed decoration
    const totalRings = Math.floor(config.cachemireDensity * 3.5);
    
    // Much tighter spacing between layers
    const step = bulbRadius * 0.95 / (totalRings * 0.4);
    
    // 2.1 Central filled flower (multi-petal, not just circle)
    const centerPetalCount = 6;
    const centerRadius = step * 1.2;
    const centerPetals = getFilledPetalPoints(bCx, bCy, centerRadius, centerPetalCount);
    for (let i = 0; i < centerPetals.length; i++) {
      addShape(
        centerPetals[i],
        colors.primary,
        colors.line,
        lineWidth * 0.5
      );
    }
    
    // 2.2 Dense concentric rings with variety
    const colorPalette = [colors.primary, colors.secondary, colors.accent];
    let colorIndex = 0;
    
    for (let ringIdx = 0; ringIdx < totalRings; ringIdx++) {
      const currentRadius = centerRadius + step * (ringIdx + 1);
      
      // Stop if we exceed the bulb radius
      if (currentRadius > bulbRadius * 0.85) break;
      
      // Scale petal count proportional to radius (more petals for larger rings)
      const basePetalCount = Math.max(5, Math.floor(config.cachemirePetalCount * (currentRadius / bulbRadius)));
      
      // Determine decoration type for this ring (cycle through patterns)
      const decorationType = ringIdx % 4;
      
      if (decorationType === 0) {
        // Filled rosette/petal shapes with large amplitude
        const amplitude = step * 0.85;
        const petalCount = basePetalCount;
        const rosacePts = getRosacePoints(bCx, bCy, currentRadius, amplitude, petalCount, 128);
        
        // Create filled petal shapes
        const filledPetals = getFilledPetalPoints(bCx, bCy, currentRadius, petalCount, amplitude);
        for (let i = 0; i < filledPetals.length; i++) {
          addShape(
            filledPetals[i],
            colorPalette[colorIndex % colorPalette.length],
            colors.line,
            lineWidth * 0.5
          );
        }
        colorIndex++;
        
      } else if (decorationType === 1) {
        // Scalloped/festooned border (inverted petals)
        const amplitude = step * 0.75;
        const petalCount = basePetalCount + 2;
        const scallops = getScallopedBorder(bCx, bCy, currentRadius, amplitude, petalCount);
        addShape(
          scallops,
          "none",
          colors.secondary,
          lineWidth
        );
        
        // Add dense dots if enabled
        if (config.cachemireShowDots) {
          const dotCount = petalCount * 3;
          for (let d = 0; d < dotCount; d++) {
            const angle = (d * 360) / dotCount;
            const dotPos = polarToCartesian(bCx, bCy, currentRadius, angle);
            addShape(
              getCirclePoints(dotPos.x, dotPos.y, lineWidth * 1.2),
              colors.accent,
              "none",
              0
            );
          }
        }
        
      } else if (decorationType === 2) {
        // Rosette outline with larger amplitude
        const amplitude = step * 0.9;
        const petalCount = basePetalCount;
        const rosacePts = getRosacePoints(bCx, bCy, currentRadius, amplitude, petalCount);
        addShape(rosacePts, "none", colors.secondary, lineWidth);
        
      } else {
        // Simple circle as separator with optional dots
        addShape(
          getCirclePoints(bCx, bCy, currentRadius),
          "none",
          colors.primary,
          lineWidth * 0.75
        );
        
        if (config.cachemireShowDots) {
          const dotCount = basePetalCount * 2;
          for (let d = 0; d < dotCount; d++) {
            const angle = (d * 360) / dotCount;
            const dotPos = polarToCartesian(bCx, bCy, currentRadius, angle);
            addShape(
              getCirclePoints(dotPos.x, dotPos.y, lineWidth * 1.5),
              colors.accent,
              "none",
              0
            );
          }
        }
      }
    }
    
    // 2.3 Festooned outer border just inside the boteh outline
    const outerBorderRadius = bulbRadius * 0.92;
    const outerPetalCount = Math.floor(config.cachemirePetalCount * 1.5);
    const outerScallops = getScallopedBorder(bCx, bCy, outerBorderRadius, step * 0.6, outerPetalCount);
    addShape(
      outerScallops,
      "none",
      colors.line,
      lineWidth * 1.5
    );
  }

  // --- 3. Tail/Neck Decoration ---
  if (config.cachemireDensity >= 3 && config.cachemireFillInterior) {
    // Decorate the narrow tail area with diminishing rosettes
    const tailSegments = Math.floor(config.cachemireDensity * 1.5);
    
    for (let seg = 0; seg < tailSegments; seg++) {
      const t = (seg + 1) / (tailSegments + 1);
      
      // Calculate position along the tail curve (quadratic bezier approximation)
      const midX = bCx;
      const midY = bCy - bulbRadius * 0.5;
      const cpX = bCx + bulbRadius * (0.5 - bendFactor * 0.8);
      const cpY = tipY + tailHeight * 0.6;
      const endX = tipX - bulbRadius * 0.2;
      const endY = tipY + bulbRadius * 0.2;
      
      const mt = 1 - t;
      const posX = mt * mt * midX + 2 * mt * t * cpX + t * t * endX;
      const posY = mt * mt * midY + 2 * mt * t * cpY + t * t * endY;
      
      // Diminishing radius as we approach the tip
      const localRadius = bulbRadius * 0.15 * (1 - t * 0.7);
      const petalCount = Math.max(4, Math.floor(6 - t * 3));
      
      // Small filled rosettes
      const smallPetals = getFilledPetalPoints(posX, posY, localRadius, petalCount, localRadius * 0.5);
      for (let i = 0; i < smallPetals.length; i++) {
        addShape(
          smallPetals[i],
          colors.accent,
          colors.line,
          lineWidth * 0.5
        );
      }
      
      // Optional dots between rosettes
      if (config.cachemireShowDots && seg % 2 === 0) {
        addShape(
          getCirclePoints(posX, posY, lineWidth * 1.5),
          colors.primary,
          "none",
          0
        );
      }
    }
    
    // Add a spine curve
    const midX = bCx;
    const midY = bCy - bulbRadius * 0.5;
    const cpX = bCx + bulbRadius * (0.5 - bendFactor * 0.8);
    const cpY = tipY + tailHeight * 0.6;
    const endX = tipX - bulbRadius * 0.2;
    const endY = tipY + bulbRadius * 0.2;
    
    const spinePath = `M ${midX},${midY} Q ${cpX},${cpY} ${endX},${endY}`;
    
    shapes.push({
      points: [],
      path: spinePath,
      fill: "none",
      stroke: colors.secondary,
      strokeWidth: lineWidth,
      closed: false
    });
  }

  function addShape(
    points: Point[], 
    fill: string, 
    stroke: string, 
    strokeW: number
  ) {
    shapes.push({
      points,
      path: createRoundedPolygonPath(points, 1), // Use rounding for smooth circles
      fill,
      stroke,
      strokeWidth: strokeW,
      closed: true
    });
  }

  return shapes;
}

// --- Helpers ---

function getCirclePoints(cx: number, cy: number, r: number, steps: number = 32): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < steps; i++) {
    pts.push(polarToCartesian(cx, cy, r, (i * 360) / steps));
  }
  return pts;
}

function getRosacePoints(cx: number, cy: number, radius: number, amplitude: number, petals: number, steps: number = 128): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < steps; i++) {
    const angleDeg = (i * 360) / steps;
    const angleRad = (angleDeg * Math.PI) / 180;
    
    // r = R + a * |sin(n*theta)|  (using abs for flower shape, or just sin for wavy)
    // Traditional rosette uses cos(n*theta) usually
    const r = radius + amplitude * Math.cos(petals * angleRad);
    
    pts.push(polarToCartesian(cx, cy, r, angleDeg));
  }
  return pts;
}

/**
 * Generates individual filled petal shapes arranged in a circle
 */
function getFilledPetalPoints(
  cx: number, 
  cy: number, 
  radius: number, 
  petalCount: number,
  amplitude: number = radius * 0.3
): Point[][] {
  const petals: Point[][] = [];
  const angleStep = 360 / petalCount;
  
  for (let i = 0; i < petalCount; i++) {
    const baseAngle = i * angleStep;
    const petal: Point[] = [];
    
    // Create a petal shape using points
    // Petal spans from baseAngle - angleStep/2 to baseAngle + angleStep/2
    const steps = 16;
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const angle = baseAngle - angleStep * 0.4 + angleStep * 0.8 * t;
      const angleRad = (angle * Math.PI) / 180;
      
      // Petal extends outward with a bulge
      // Distance from center varies: starts at radius, bulges out, returns to radius
      const bulgeFactor = Math.sin(t * Math.PI); // 0 -> 1 -> 0
      const r = radius + amplitude * bulgeFactor;
      
      petal.push(polarToCartesian(cx, cy, r, angle));
    }
    
    // Close the petal by returning to center area
    const centerPoint = polarToCartesian(cx, cy, radius * 0.7, baseAngle);
    petal.push(centerPoint);
    
    petals.push(petal);
  }
  
  return petals;
}

/**
 * Generates a scalloped/festooned border (inverted petals pointing inward)
 */
function getScallopedBorder(
  cx: number, 
  cy: number, 
  radius: number, 
  amplitude: number, 
  scallops: number
): Point[] {
  const pts: Point[] = [];
  const steps = scallops * 16;
  
  for (let i = 0; i < steps; i++) {
    const angleDeg = (i * 360) / steps;
    const angleRad = (angleDeg * Math.PI) / 180;
    
    // Inverted rosette: r = R - a * |sin(n*theta)|
    // This creates scallops that curve inward
    const r = radius - amplitude * Math.abs(Math.sin(scallops * angleRad));
    
    pts.push(polarToCartesian(cx, cy, r, angleDeg));
  }
  
  return pts;
}
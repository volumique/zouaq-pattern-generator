/**
 * @file geometryUtils.tsx
 * @description 2D math library. Contains basic equations
 * needed for vector drawing (polar coordinates, line intersections, rotations).
 */

/**
 * A point in 2D Euclidean space.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A finite line segment defined by two points.
 */
export interface Line {
  start: Point;
  end: Point;
}

/**
 * Converts polar coordinates (radius + angle) into Cartesian coordinates (X/Y).
 * By default, angle 0 is defined at the top (North, -90 mathematical degrees) for 
 * convenience when drawing upward-oriented stars.
 * 
 * ASCII Diagram:
 *         Angle 0°
 *           |
 *           * (x,y)
 *          /
 *   Radius/
 *        / 
 *      (cx,cy) --- Angle 90°
 * 
 * @param centerX Origin X center
 * @param centerY Origin Y center
 * @param radius Distance from the center
 * @param angleInDegrees Tilt angle in degrees.
 * @returns The calculated X/Y point
 * 
 * @example
 * const p = polarToCartesian(100, 100, 50, 90); // Points to the right
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Point {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Rotates a point by a given angle around a specific pivot.
 * 
 * ASCII Diagram:
 *          * p2 (rotated)
 *         /
 *        / Angle
 * Center*-------* p1 (original)
 * 
 * @param point The point to rotate
 * @param center The center of rotation
 * @param angleInDegrees Angle in degrees
 * @returns The new rotated point
 * 
 * @example
 * const p2 = rotatePoint({x: 10, y: 0}, {x: 0, y: 0}, 90); // Returns {x: ~0, y: 10}
 */
export function rotatePoint(
  point: Point,
  center: Point,
  angleInDegrees: number
): Point {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  const cos = Math.cos(angleInRadians);
  const sin = Math.sin(angleInRadians);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: cos * dx - sin * dy + center.x,
    y: sin * dx + cos * dy + center.y,
  };
}

/**
 * Calculates the exact intersection point of two line segments (p1-p2) and (p3-p4).
 * Returns `null` if the segments are strictly parallel or coincident.
 * 
 * @returns The X/Y point where the lines cross.
 */
export function getIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point | null {
  const x1 = p1.x,
    y1 = p1.y;
  const x2 = p2.x,
    y2 = p2.y;
  const x3 = p3.x,
    y3 = p3.y;
  const x4 = p4.x,
    y4 = p4.y;

  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  if (denom === 0) {
    return null; // Parallel
  }

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;

  return {
    x: x1 + ua * (x2 - x1),
    y: y1 + ua * (y2 - y1),
  };
}

/**
 * Creates a polygonal clipping path with smoothed corners.
 * Implements an algorithm inspired by Catmull-Rom curves to
 * harmoniously smooth the abrupt intersections of oriental stars.
 * 
 * @param points Array of sharp polygon vertices
 * @param rounding Rounding factor between 0 (sharp) and 1 (full curve)
 * @returns An SVG Path string (d="M ... C ... Z")
 */
export function createRoundedPolygonPath(points: Point[], rounding: number): string {
  if (rounding === 0 || points.length < 3) {
    return '';
  }

  const pathParts: string[] = [];
  const numPoints = points.length;
  
  const roundingDistance = rounding * 1.0;
  const smoothness = 0.4;

  for (let i = 0; i < numPoints; i++) {
    const prevPoint = points[(i - 1 + numPoints) % numPoints];
    const currentPoint = points[i];
    const nextPoint = points[(i + 1) % numPoints];
    
    // Incoming and outgoing vectors
    const incomingDx = currentPoint.x - prevPoint.x;
    const incomingDy = currentPoint.y - prevPoint.y;
    const incomingLength = Math.sqrt(incomingDx * incomingDx + incomingDy * incomingDy);
    
    const outgoingDx = nextPoint.x - currentPoint.x;
    const outgoingDy = nextPoint.y - currentPoint.y;
    const outgoingLength = Math.sqrt(outgoingDx * outgoingDx + outgoingDy * outgoingDy);
    
    const incomingNormX = incomingDx / incomingLength;
    const incomingNormY = incomingDy / incomingLength;
    const outgoingNormX = outgoingDx / outgoingLength;
    const outgoingNormY = outgoingDy / outgoingLength;
    
    // Curve anchor points
    const curveStartDistance = Math.min(incomingLength * roundingDistance, incomingLength * 0.5);
    const curveEndDistance = Math.min(outgoingLength * roundingDistance, outgoingLength * 0.5);
    
    const curveStartX = currentPoint.x - incomingNormX * curveStartDistance;
    const curveStartY = currentPoint.y - incomingNormY * curveStartDistance;
    
    const curveEndX = currentPoint.x + outgoingNormX * curveEndDistance;
    const curveEndY = currentPoint.y + outgoingNormY * curveEndDistance;
    
    // Tension controllers (Tangents for cubic Bezier)
    const control1Distance = curveStartDistance * smoothness;
    const control2Distance = curveEndDistance * smoothness;
    
    const control1X = curveStartX + incomingNormX * control1Distance;
    const control1Y = curveStartY + incomingNormY * control1Distance;
    
    const control2X = curveEndX - outgoingNormX * control2Distance;
    const control2Y = curveEndY - outgoingNormY * control2Distance;
    
    if (i === 0) {
      pathParts.push(`M ${curveStartX},${curveStartY}`);
    } else {
      pathParts.push(`L ${curveStartX},${curveStartY}`);
    }
    
    pathParts.push(
      `C ${control1X},${control1Y} ${control2X},${control2Y} ${curveEndX},${curveEndY}`
    );
  }

  pathParts.push('Z');

  return pathParts.join(' ');
}

/**
 * Generates the vertices of a regular polygon (e.g., pentagon, hexagon, octagon).
 * 
 * @param centerX Center X
 * @param centerY Center Y
 * @param radius Circumscribed circle radius
 * @param sides Number of sides
 * @param rotationOffset Initial tilt offset in degrees
 * @returns List of points
 * 
 * @example
 * const hexagon = getPolygonPoints(100, 100, 50, 6, 30);
 */
export function getPolygonPoints(
  centerX: number,
  centerY: number,
  radius: number,
  sides: number,
  rotationOffset: number = 0
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < sides; i++) {
    points.push(
      polarToCartesian(
        centerX,
        centerY,
        radius,
        (i * 360) / sides + rotationOffset
      )
    );
  }
  return points;
}
import type { FeatureCollection, Position } from "geojson"
import * as turf from '@turf/turf'

export const get_point = (coordinates: Position) => {
  const point: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        properties: {},
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coordinates
        }
      }
    ]
  }
  return point;
}
interface PositionResult {
  coordinates: Position;
  lastPassedIndex: number;
}

export function getCurrentPositionWithIndex(
  coordinates: Position[],
  progress: number,
  unit: turf.Units = 'millimeters'
): PositionResult {
  const line = turf.lineString(coordinates);
  const currentPoint = turf.along(line, progress, { units: unit });

  let distanceSoFar = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const seg = turf.lineString([coordinates[i], coordinates[i + 1]]);
    const segLength = turf.length(seg, { units: unit });

    if (distanceSoFar + segLength >= progress) {
      return {
        coordinates: currentPoint.geometry.coordinates,
        lastPassedIndex: i
      };
    }

    distanceSoFar += segLength;
  }

  return {
    coordinates: coordinates[coordinates.length - 1],
    lastPassedIndex: coordinates.length - 2
  };
}

export function getRemainingDistance(
  route: Position[],
  currentPosition: Position
): number {
  const fullLine = turf.lineString(route);

  const endPoint = turf.point(route[route.length - 1]);
  const currentPoint = turf.point(currentPosition);

  // Slice from current position to the end
  const remainingLine = turf.lineSlice(currentPoint, endPoint, fullLine);

  // Get length in meters
  const distance = turf.length(remainingLine, { units: 'meters' });

  return distance;
}

export function getCurrentPositionInMillimeters(
  coords: Position[],
  totalTime: number,
  elapsedTime: number
): number[] | null {
  if (totalTime <= 0 || elapsedTime <= 0) return null;
  const line = turf.lineString(coords);
  const totalDistMm = turf.length(line, { units: "millimeters" });
  if (totalDistMm <= 0) {
    return null;
  }
  const traveledDistMm = (elapsedTime / totalTime) * totalDistMm;

  const x = turf.along(line, totalDistMm - traveledDistMm, { units: "millimeters" });
  return x.geometry.coordinates;
}

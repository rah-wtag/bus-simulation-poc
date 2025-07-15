import type { FeatureCollection, Position } from "geojson";

export interface StopTime {
  trip_id: string;
  arrival_time: string;         // Format: "HH:MM:SS"
  departure_time: string;       // Format: "HH:MM:SS"
  stop_id: string;
  stop_sequence: number;
  pickup_type: number;
  drop_off_type: number;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  location_type: string;        // You might want to use `string | null` if "nan" represents missing data
  parent_station: string;
}
export interface Trip {
  trip_id: string;
  stops: StopTime[]
}

export interface Stop {
  stop_name: string;
  stop_id: string;
  position: Position;
}

export const get_trips = async () => {
  const response = await fetch('http://localhost:8000/trips');
  const json = await response.json() as StopTime[];
  // json[0].arrival_time = getAdjustedZurichTime(-30)
  // json[0].departure_time = getAdjustedZurichTime(-30)
  // json[1].arrival_time = getAdjustedZurichTime(10);
  // json[1].departure_time = getAdjustedZurichTime(10);
  // json[2].arrival_time = getAdjustedZurichTime(30);
  // json[2].departure_time = getAdjustedZurichTime(30);
  // json[3].arrival_time = getAdjustedZurichTime(40);
  // json[3].departure_time = getAdjustedZurichTime(40);
  // console.log(json)
  return json
}



export const get_stations = (stopTimes: StopTime[]): Stop[] => {
  const seen = new Set<string>();
  const uniqueStops: Stop[] = [];

  for (const item of stopTimes) {
    if (!seen.has(item.stop_id)) {
      seen.add(item.stop_id);
      uniqueStops.push({
        stop_name: item.stop_name,
        stop_id: item.stop_id,
        position: [item.stop_lon, item.stop_lat],
      });
    }
  }

  return uniqueStops;
};

export function stopsToGeoJSON(stops: Stop[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: stops.map((stop) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [stop.position[0], stop.position[1]],
      },
      properties: {
        stop_id: stop.stop_id,
        stop_name: stop.stop_name,
      },
    })),
  };
}
export const getTripIds = (stops: StopTime[]) => {
  const trips: string[] = [];
  for (let i = 0; i < stops.length; i++) {
    if (trips.indexOf(stops[i].trip_id) == -1) {
      trips.push(stops[i].trip_id)
    }
  }
  return trips;

}
export const getTripStops = (stops: StopTime[], trip_id: string) => {
  let trips = stops.filter(item => item.trip_id == trip_id);
  trips = trips.sort((a, b) => {
    return a.stop_sequence - b.stop_sequence;
  })
  return trips
}

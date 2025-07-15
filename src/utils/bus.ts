import type { Position } from "geojson";
import type { StopTime } from "./get_trips";
import * as turf from '@turf/turf'
import { get_route } from "./get_route";
import { Map } from "mapbox-gl";
import { getCurrentZurichTime, getRandomHexColor, getTimeDifference } from "./utils";
import type { Point } from "geojson";
import { getCurrentPositionInMillimeters } from "./geo";

class Bus {
  trip_id: String;
  stops: StopTime[];
  route_coordinates: Position[][] = []
  map: Map
  geojsonLayerId: string;
  geojsonSourceId: string;
  color: string;
  distances: number[] = []
  busSourceId: string;
  busLayerId: string;
  bearing: number = 0;
  speed: number = 0;
  current: number = 0;
  current_stop_id = 0;
  current_point: Point = {
    type: "Point",
    coordinates: [0, 0]
  };
  listeners: ((index: number) => void)[] = [];
  get_route_coordinates = async () => {
    for (let i = 0; i < this.stops.length - 1; i++) {
      let routes = await get_route([this.stops[i].stop_lon, this.stops[i].stop_lat], [this.stops[i + 1].stop_lon, this.stops[i + 1].stop_lat]);
      if (!routes) {
        continue
      }
      if (routes.geojson.features[0].geometry.type == "LineString") {
        this.distances.push(turf.length(turf.lineString(routes.geojson.features[0].geometry.coordinates), { units: "meters" }))
      }
      if (routes?.geojson.type == "FeatureCollection") {
        if (routes.geojson.features[0].type == "Feature") {
          if (routes.geojson.features[0].geometry.type == "LineString") {
            routes.geojson.features[0].geometry.coordinates.forEach((item) => {
              if (this.route_coordinates[i] === undefined) {
                this.route_coordinates[i] = [];
              }
              this.route_coordinates[i].push(item);
            })
          }
        }
      }
      this.route_coordinates[i] = this.route_coordinates[i];
    }
  }
  current_stop = () => {
    for (let i = 0; i < this.stops.length - 1; i++) {
      const current_zurich_time = getCurrentZurichTime();
      if (current_zurich_time >= this.stops[i].departure_time && current_zurich_time <= this.stops[i + 1].arrival_time) {
        return i;
      }
    }
    return this.stops.length;
  }

  printBusDetails = () => {
    this.stops.forEach((item) => {
      console.log(`${item.trip_id} ${item.stop_name} ${item.arrival_time} ${item.departure_time}`);
    })
  }
  constructor(stops: StopTime[], trip_id: string, map: Map) {
    this.stops = stops;
    this.trip_id = trip_id
    this.map = map;
    this.geojsonLayerId = trip_id + "geojsonLayerbus";
    this.geojsonSourceId = trip_id + "geojsonsourcebus"
    this.busSourceId = trip_id + "bussourceid";
    this.busLayerId = trip_id + "buslayerid"
    this.color = getRandomHexColor();
    this.printBusDetails();
    this.get_route_coordinates().then(() => {
      this.add_line_to_map();
      this.add_bus_to_map();
      this.move(this.current_stop());
    })
  }

  calculate_speed = (duration: number, distance: number) => {
    return (distance / duration);
  }

  add_line_to_map = () => {
    if (this.map.getSource(this.geojsonSourceId) != undefined || this.map.getSource(this.geojsonLayerId) != undefined) {
      return;
    }
    let cooridnates: Position[] = []
    this.route_coordinates.forEach(item => {
      cooridnates = [...cooridnates, ...item];
    })
    this.map.addSource(this.geojsonSourceId, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              "type": "LineString",
              "coordinates": cooridnates
            }
          }
        ]
      }
    })
    this.map.addLayer({
      id: this.geojsonLayerId,
      type: "line",
      source: this.geojsonSourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "purple",
        "line-width": 1,
      },
    });
  }
  add_bus_to_map = () => {

    this.map.addSource(this.busSourceId, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            properties: {},
            "type": 'Feature',
            "geometry": {
              type: "Point",
              coordinates: this.route_coordinates[0][0]
            }
          }
        ]
      }
    })
    this.map.addLayer({
      id: this.busLayerId,
      source: this.busSourceId,
      type: 'circle',
      paint: {
        'circle-radius': 6, // adjust size as needed
        'circle-color': '#ff0000', // red color
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff' // optional white border
      },
    });
  }
  move = (current_stop_index: number) => {
    if ((current_stop_index + 1) === this.stops.length) {
      return;
    }
    this.listeners.forEach((item) => {
      item(current_stop_index);
    })
    this.current_stop_id = current_stop_index;
    this.start_move().then(() => {
      if (this.current_stop_id < (this.stops.length - 1)) {
        this.move(current_stop_index + 1)
      }
    })

  }
  start_move = () => {
    return new Promise((resolve) => {
      const departure_time = this.stops[this.current_stop_id].departure_time;
      const arrival_time = this.stops[this.current_stop_id + 1].arrival_time;
      const diff = getTimeDifference(departure_time, arrival_time);
      const __move = () => {
        const source = this.map.getSource(this.busSourceId);
        if (!source || !(source.type === "geojson")) {
          return resolve(1);
        }
        const currentTime = getCurrentZurichTime();
        const allreadyPassedTime = getTimeDifference(currentTime, arrival_time);
        const currentPosition = getCurrentPositionInMillimeters(this.route_coordinates[this.current_stop_id], diff, allreadyPassedTime);
        if (currentPosition === null) {
          return resolve(1);
        }
        source.setData({
          "type": "Point",
          coordinates: [currentPosition[0], currentPosition[1]]
        })
        requestAnimationFrame(__move);
      }
      __move();
    })
  };
  addListener = (callback: (index: number) => void) => {
    this.listeners.push(callback);
  }

}


export default Bus

import type { Position } from "geojson";
import { Map } from "mapbox-gl";
import { type Point } from 'geojson'
import * as turf from '@turf/turf'

export interface Details {
  speed: number;
  bearing: number;
  current_point: Point;
}


interface Listener {
  func: (details: Details) => void;
}

class Bike {
  speed: number;
  route_coordinates: Position[];
  static id: number = 1;
  my_route_id: string;
  my_bike_id: string;
  my_layer_id: string;
  my_layer_bike_id: string;
  current: number = 0;
  current_point: Point;
  map: Map;
  listeners: Listener[] = [];
  bearing: number = 0;
  static calculate_speed = (duration: number, distance: number) => {
    return (distance / duration);
  }
  constructor(speed: number, route_coordinates: Position[], map: Map) {
    this.speed = speed;
    this.route_coordinates = route_coordinates;
    Bike.id = Bike.id + 1;
    this.my_bike_id = `bike-${Bike.id}`;
    this.my_route_id = `bike-${Bike.id}-route`
    this.my_layer_id = `bike-layer-${Bike.id}-route`
    this.my_layer_bike_id = `bike-point-layer-${Bike.id}`;
    this.map = map;
    this.current_point = {
      type: "Point",
      coordinates: route_coordinates[0]
    }
    map.addSource(this.my_route_id, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              "type": "LineString",
              "coordinates": route_coordinates
            }
          }
        ]
      }
    })
    map.addSource(this.my_bike_id, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            properties: {},
            "type": 'Feature',
            "geometry": {
              type: "Point",
              coordinates: route_coordinates[0]
            }
          }
        ]
      }
    })
    map.addLayer({
      id: this.my_layer_id,
      type: "line",
      source: this.my_route_id,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "purple",
        "line-width": 4,
      },
    });
    map.addLayer({
      id: this.my_layer_bike_id,
      source: this.my_bike_id,
      type: 'symbol',
      layout: {
        'icon-image': 'airport-15',
        'icon-size': 1.5,
        'icon-rotate': ['get', 'bearing'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });
    setInterval(() => this.call_listeners(), 1000)
  }


  start_move = () => {
    const source = this.map.getSource(this.my_bike_id);
    if (!source || !(source.type === "geojson")) {
      return
    }
    if ((this.current + 1) === this.route_coordinates.length) {
      return;
    }
    const dirction = turf.bearing(this.current_point, this.route_coordinates[this.current + 1]);
    this.bearing = dirction;
    const distance_should_go = (this.speed / 100) / 1000;
    let d = turf.destination(this.current_point, distance_should_go, dirction)

    d.properties = {};
    d.properties.bearing = dirction
    if (turf.distance(this.current_point, this.route_coordinates[this.current + 1]) < distance_should_go) {
      d.geometry.coordinates = this.route_coordinates[this.current + 1]
      this.current += 1;
    }
    source.setData(d);
    this.current_point = d.geometry;
    setTimeout(this.start_move, 10)
  };
  call_listeners = () => {
    this.listeners.forEach(item => {
      item.func({ speed: this.speed, current_point: this.current_point, bearing: this.bearing })
    })
  }
  addListener = (func: (details: Details) => void) => {
    this.listeners.push({ func: func })
  }

}


export default Bike;

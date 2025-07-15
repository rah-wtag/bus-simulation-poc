import type { Position } from "geojson";
import { Map } from "mapbox-gl";
import { type Stop } from './get_trips.ts'


class StopInMap {
  stop_id: string;
  stop_name: string;
  position: Position;
  map: Map;
  source_id: string;
  layer_id: string;

  constructor(details: Stop, map: Map) {
    this.stop_id = details.stop_id;
    this.stop_name = details.stop_name;
    this.position = details.position;
    this.map = map;
    this.source_id = `stop-source-${this.stop_id}`;
    this.layer_id = `stop-layer-${this.stop_id}`;

    this.addStopToMap();
  }

  private addStopToMap() {
    if (this.map.getSource(this.source_id) != undefined || this.map.getLayer(this.layer_id) != undefined) {
      return;
    }
    // Add stop as a GeoJSON point source
    this.map.addSource(this.source_id, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: this.position,
            },
            properties: {
              stop_id: this.stop_id,
              stop_name: this.stop_name,
            },
          },
        ],
      },
    });

    // Add layer to show stop icon or symbol
    this.map.addLayer({
      id: this.layer_id,
      source: this.source_id,
      type: 'circle',
      paint: {
        'circle-radius': 6, // adjust size as needed
        'circle-color': 'green', // red color
        'circle-stroke-width': 1,
        'circle-stroke-color': 'green' // optional white border
      }
    });
  }

  removeFromMap() {
    if (this.map.getLayer(this.layer_id)) {
      this.map.removeLayer(this.layer_id);
    }
    if (this.map.getSource(this.source_id)) {
      this.map.removeSource(this.source_id);
    }
  }
}

export default StopInMap;

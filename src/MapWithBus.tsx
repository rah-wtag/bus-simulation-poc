import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { Map } from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { get_stations, get_trips, getTripIds, getTripStops } from "./utils/get_trips";
import StopInMap from "./utils/stop";
import Bus from "./utils/bus";
import ZurichClockPopup from "./clock";
import StationBoard from "./stationboard";
import Legend from "./legend";

const MapComponent: React.FC = ({ }) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<Map>(null)
  const [theBus, setTheBus] = useState<Bus | null>(null);
  useEffect(() => {
    if (mapContainer.current) {
      mapboxgl.accessToken = "";
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/faizajarin12/cm8pfng64006y01sh6hjsgmc6",
        zoom: 13,
        center: [7.6413148, 47.5504727],
        maxZoom: 20,
      });
      get_trips().then(resp => {
        const stations = get_stations(resp);
        if (map.current) {
          map.current.flyTo({
            center: [stations[0].position[0], stations[0].position[1]]
          })
        }
        stations.forEach(station => {
          if (map.current) {
            new StopInMap(station, map.current);
          }
        });

        const trip_ids = [getTripIds(resp)[0]];
        trip_ids.forEach((item) => {
          if (map.current) {
            setTheBus(new Bus(getTripStops(resp, item), item, map.current));
          }
        })

      })
      return () => map.current?.remove();
    }
  }, []);
  return (
    <>
      <ZurichClockPopup />
      <StationBoard bus={theBus ?? undefined} /> :
      <Legend />
      <div
        ref={mapContainer}
        style={{ position: "absolute", top: 0, bottom: 0, width: "100%", height: "100vh" }}
      />
    </>
  );
};

export default MapComponent;

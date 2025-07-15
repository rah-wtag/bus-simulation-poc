import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { get_route } from "./utils/get_route";
import type { Map } from "mapbox-gl";
import Bike from "./utils/Bike";
import type { Position } from "geojson";
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Details } from "./utils/Bike";

const MapComponent: React.FC = ({ }) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<Map>(null)
  const bikeRef = useRef<Bike>(null)
  const from = useRef<Position | undefined>(undefined)
  const to = useRef<Position | undefined>(undefined)
  const [details, setDetails] = useState<Details & { duration: number; total_distance: number } | undefined>(undefined)
  useEffect(() => {
    if (mapContainer.current) {
      mapboxgl.accessToken = "";
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 13,
        center: [7.6413148, 47.5504727],
        maxZoom: 20,
      });
      map.current.on("click", (e) => {
        if (from.current === undefined) {
          from.current = [e.lngLat.lng, e.lngLat.lat];
          new mapboxgl.Marker()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current!);
        }
        else {
          to.current = [e.lngLat.lng, e.lngLat.lat]
          new mapboxgl.Marker()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current!);

        }
        if (from.current !== undefined && to.current !== undefined) {
          map.current?.flyTo({ center: [from.current[0], from.current[1]] })
          get_route(from.current, to.current).then(resp => {
            if (!resp || !(resp.geojson.features[0].geometry.type === "LineString") || !map.current || bikeRef.current) return
            console.log("Total time: ", resp.duration / 60);
            console.log("Total distance ", resp.distance)
            bikeRef.current = new Bike(Bike.calculate_speed(resp.duration, resp.distance), resp.geojson.features[0].geometry.coordinates, map.current);
            bikeRef.current.start_move();
            bikeRef.current.addListener((details) => {
              setDetails({ ...details, duration: resp.duration / 60, total_distance: resp.distance / 1000 })
            })
          })
        }
      })
      return () => map.current?.remove();
    }
  }, []);
  return (
    <>
      {details &&
        <div style={{
          position: "absolute",
          top: 20,
          left: 20,
          height: 100,
          width: 1000,
          background: "white",
          zIndex: "100",
          padding: "20px"

        }}>
          Bearing: {details?.bearing}
          <br />
          Speed: {details?.speed}
          <br />
          Current Position: {details?.current_point.coordinates.join(' , ')}
          <br />
          total distance: {details?.total_distance} KM
          <br />
          total duration: {details?.duration} Minutes
          <br />
        </div>
      }
      <div
        ref={mapContainer}
        style={{ position: "absolute", top: 0, bottom: 0, width: "100%", height: "100vh" }}
      />
    </>
  );
};

export default MapComponent;

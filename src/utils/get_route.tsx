import type { FeatureCollection } from "geojson"

export const get_route = async (coor1: number[], coor2: number[]) => {
  if (coor1.length < 2 || coor2.length < 2) {
    return null
  }
  const start = `${coor1[0]},${coor1[1]}`
  const end = `${coor2[0]},${coor2[1]}`

  const res = await fetch(`http://localhost:8000/directions?start=${start}&end=${end}`);
  const data: {
    geojson: FeatureCollection,
    duration: number,
    distance: number
  } = (await res.json());
  return data
}






from fastapi import FastAPI, Query, HTTPException
import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import requests
import os

from gtfs import current_zurich_time, main

MAPBOX_TOKEN = ""

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

coordinates = [
    [7.65325995, 47.39873273],
    [7.66296175, 47.39698756],
    [7.67211558, 47.40107979],
    [7.68735999, 47.39644636],
    [7.69184259, 47.39739497],
]


@app.get("/directions")
async def get_directions(
    start: str = Query(),
    end: str = Query(),
    profile: str = Query("driving", enum=["driving", "walking", "cycling"]),
):
    if not MAPBOX_TOKEN:
        raise HTTPException(status_code=500, detail="Mapbox token not set")

    url = f"https://api.mapbox.com/directions/v5/mapbox/{profile}/{start};{end}"
    params = {
        "geometries": "geojson",
        "access_token": MAPBOX_TOKEN,
        "language": "en",
        "overview": "full",
        "steps": "true",
    }
    cache_file = f"./cachex/{profile};{start};{end}.json"
    if os.path.exists(cache_file):
        with open(cache_file, "r") as f:
            return json.load(f)

    try:
        response = requests.get(url, params=params)
        geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": response.json().get("routes")[0].get("geometry"),
                }
            ],
        }
        ret = {
            "geojson": geojson,
            "duration": response.json().get("routes")[0].get("duration"),
            "distance": response.json().get("routes")[0].get("distance"),
        }
        with open(cache_file, "w") as f:
            json.dump(ret, f, indent=4)
        return ret

    except Exception as e:
        print(e)
        raise HTTPException(status_code=401)


@app.get("/trips")
def trips():
    current = current_zurich_time()
    if os.path.exists(f"./boardcache/x{current.minute}.json"):
        with open(f"./boardcache/x{current.minute}.json", "r") as f:
            return json.load(f)
    x = main()
    with open(f"./boardcache/x{current.minute}.json", "w") as f:
        json.dump(x, f, indent=4)
    return x


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True, port=8000, host="0.0.0.0")

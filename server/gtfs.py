import pandas as pd
from date import parse_gtfs_time
import zipfile
import pytz
from datetime import datetime


def current_zurich_time():
    dhaka = pytz.timezone("Asia/Dhaka")
    zurich = pytz.timezone("Europe/Zurich")

    dhaka_time = datetime.now(dhaka)

    zurich_time = dhaka_time.astimezone(zurich)
    print("Zurich Time:", zurich_time.replace(tzinfo=None))
    return zurich_time


def get_trip_schedule(gtfs_zip_path, trip_ids):
    try:
        with zipfile.ZipFile(gtfs_zip_path, "r") as z:
            required_files = ["trips.txt", "stop_times.txt", "stops.txt"]
            for f in required_files:
                if f not in z.namelist():
                    print(f"Error: Required file '{f}' not found in the GTFS archive.")
                    return None

            with z.open("stop_times.txt") as stop_times_file:
                stop_times_df = pd.read_csv(stop_times_file)

    except FileNotFoundError:
        print(f"Error: GTFS file not found at '{gtfs_zip_path}'")
        return None
    except Exception as e:
        print(f"An error occurred while reading the GTFS file: {e}")
        return None

    trip_stop_times = stop_times_df[stop_times_df["trip_id"].isin(trip_ids)]
    return trip_stop_times


def get_trip_ids_from_gtfs(gtfs_zip_path, agency_id_to_find, route_short_name_to_find):
    with zipfile.ZipFile(gtfs_zip_path, "r") as z:
        # Read the necessary GTFS files into pandas DataFrames
        with z.open("routes.txt") as routes_file:
            routes_df = pd.read_csv(routes_file, dtype=str)
        with z.open("trips.txt") as trips_file:
            trips_df = pd.read_csv(trips_file, dtype=str)

        # Find the route_id(s) that match the agency_id and route_short_name
        matching_routes = routes_df[
            (routes_df["agency_id"] == agency_id_to_find)
            & (routes_df["route_short_name"] == route_short_name_to_find)
        ]

        if matching_routes.empty:
            print(
                f"Could not find any routes for agency_id '{agency_id_to_find}' and route_short_name '{route_short_name_to_find}'."
            )
            return []

        matching_route_ids = matching_routes["route_id"].tolist()

        # Find all trip_ids associated with the found route_id(s)
        matching_trips = trips_df[trips_df["route_id"].isin(matching_route_ids)]

        if matching_trips.empty:
            print("Found matching routes but no associated trips.")
            return []

        return matching_trips["trip_id"].tolist()


def main():
    gtfs_file = "./gtfs.zip"

    agency_id = "811"
    zurich_time = current_zurich_time()
    line_short_name = "70"
    trip_ids = get_trip_ids_from_gtfs(gtfs_file, agency_id, line_short_name)
    xyz = get_trip_schedule(gtfs_file, trip_ids)
    current_dics = {}
    if xyz is None:
        return []
    pd_dict = xyz.to_dict(orient="records")
    for item in pd_dict:
        if item["stop_sequence"] == 1:
            current_dics[item["trip_id"]] = {
                "start_time": item["arrival_time"],
                "end_time": {"sequence": 1, "time": item["departure_time"]},
            }

    for item in pd_dict:
        if item["stop_sequence"] >= current_dics.get(item["trip_id"]).get(
            "end_time"
        ).get("sequence"):
            current_dics[item["trip_id"]]["end_time"] = {
                "sequence": item["stop_sequence"],
                "end_time": item["departure_time"],
            }

    current_trip_ids = []
    _zurich_time = zurich_time.replace(tzinfo=None)
    for id in current_dics:
        item = current_dics[id]
        start_time = parse_gtfs_time(item["start_time"], zurich_time)
        end_time = parse_gtfs_time(item["end_time"]["end_time"], zurich_time)
        if start_time <= _zurich_time and end_time >= _zurich_time:
            current_trip_ids.append(id)
    xyz = xyz[xyz["trip_id"].isin(current_trip_ids)]
    with zipfile.ZipFile(gtfs_file, "r") as z:
        with z.open("stops.txt", "r") as stop_file:
            stops = pd.read_csv(stop_file)
        merged = pd.merge(xyz, stops, how="left")
    return merged.fillna("nan").to_dict(
        orient="records",
    )


if __name__ == "__main__":
    print(len(main()))

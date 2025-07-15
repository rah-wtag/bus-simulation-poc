import requests
import json

# VITE_MAPBOX_ACCESS_TOKEN=
# VITE_MAPBOX_STYLE_URL=
# VITE_MAPBOX_TRAFFIC_LAYER_STYLE_URL=
api_key = ""
api = f"https://api.mapbox.com/styles/v1/faizajarin12/cm8pfng64006y01sh6hjsgmc6?access_token={api_key}"


response = requests.get(api)

with open("./data.json", "w") as f:
    f.write(response.text)

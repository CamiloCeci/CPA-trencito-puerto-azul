import urllib.request
import time


historial_telemetria = [
    {
        "id": 1,
        "latitude": 10.619511464440855,
        "longitude": -66.74293503406028,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.61890678780435,
        "longitude": -66.74330329769225,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.618454511380225,
        "longitude": -66.74392815458005,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.618674640597796,
        "longitude": -66.74466442095233,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.61881831766544,
        "longitude": -66.74510027991367,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.61864905256746,
        "longitude": -66.74456625280268,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.618244536553892,
        "longitude": -66.74378674659518,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.61894750234188,
        "longitude": -66.74262013794494,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.620336338144025,
        "longitude": -66.74154201865804,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.617796927028476,
        "longitude": -66.74011941150091,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.61987548363244,
        "longitude": -66.74122623810969,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.621957161128227,
        "longitude": -66.74263927609333,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.621967921798733,
        "longitude": -66.74494268082569,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.622683738935674,
        "longitude": -66.74619444218962,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.622023845068554,
        "longitude": -66.74368333299488,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.62096875755926,
        "longitude": -66.74193845348397,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
    {
        "id": 1,
        "latitude": 10.619511464440855,
        "longitude": -66.74293503406028,
        "speed": 13.0,
        "timestamp": "2026-05-25T23:58:00.206789",
    },
]

try:
    while True:
        for ubicacion in historial_telemetria:
            print(f"Enviando ubicación: {ubicacion['id']}")
            lon = ubicacion["longitude"]
            lat = ubicacion["latitude"]
            urllib.request.urlopen(
                f"http://openclaw.telemo.com.ve:8030/api/v1/gps/{lat}/{lon}/"
            )
            print(
                f"Request GET enviado (http://openclaw.telemo.com.ve:8030/api/v1/gps/{lat}/{lon}/)\nCon latitud: {lat}\nCon longitud: {lon}"
            )
            time.sleep(5)
except KeyboardInterrupt:
    print("\nSaliendo del programa")
    exit()

from classes.CoordenadasGps import CoordenadasGps

gps = CoordenadasGps()
try:
    gps.run_auto_cycle()
except KeyboardInterrupt:
    print("Proceso detenido.")

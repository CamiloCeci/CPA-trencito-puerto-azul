from CoordenadasGps import *

gps = CoordenadasGps()
try:
    gps.run_auto_cycle()
except KeyboardInterrupt:
    print("Proceso detenido.")

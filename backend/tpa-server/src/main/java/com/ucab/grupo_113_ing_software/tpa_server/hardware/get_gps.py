import machine
import time

# Pines confirmados por la placa / firmware de fábrica.
TX_PIN = 11
RX_PIN = 10
PWRKEY_PIN = 18
POWERON_PIN = 12
RESET_PIN = 17
DTR_PIN = 9
BAUD = 115200

uart = machine.UART(1, baudrate=BAUD, tx=TX_PIN, rx=RX_PIN, timeout=100)
`

def ts():
    try:
        y, mo, d, h, mi, s, _, _ = time.localtime()
        return "%04d-%02d-%02d %02d:%02d:%02d" % (y, mo, d, h, mi, s)
    except Exception:
        return "0000-00-00 00:00:00"


def log(msg):
    print("[%s] %s" % (ts(), msg))


def flush_uart():
    try:
        while uart.any():
            uart.read()
    except Exception:
        pass


def http_get_coords(coords):
    if not coords:
        return
    lat = float(coords[0].split(' ')[0])
    lon = float(coords[1].split(' ')[0])
    print(lat, lon)
    if coords[0].split(' ')[1] != 'N':
        lat *= -1
    if coords[1].split(' ')[1] != 'E':
        lon *= -1
    send_at(f'AT+HTTPPARA="URL","http://openclaw.telemo.com.ve:8030/api/gps/{lat}/{lon}"', 1000)
    send_at('AT+HTTPACTION=0', 800)

def read_uart(wait_ms=1200, quiet_ms=150):
    deadline = time.ticks_add(time.ticks_ms(), wait_ms)
    chunks = []
    saw_data = False

    while time.ticks_diff(deadline, time.ticks_ms()) > 0:
        try:
            available = uart.any()
        except Exception:
            available = 0

        if available:
            try:
                data = uart.read()
            except Exception:
                data = None
            if data:
                saw_data = True
                try:
                    text = data.decode("utf-8", "ignore")
                except Exception:
                    text = str(data)
                chunks.append(text)
                deadline = time.ticks_add(time.ticks_ms(), quiet_ms)
                continue

        time.sleep_ms(20)

    text = "".join(chunks)
    if saw_data:
        compact = text.strip().replace("\r\n", " | ")
        log("AT < %s" % compact)
    else:
        log("AT < (sin respuesta)")
    return text


def send_at(cmd, wait_ms=1200):
    flush_uart()
    log("AT > %s" % cmd)
    uart.write(cmd + "\r\n")
    return read_uart(wait_ms)


def boot_factory_like():
    log("Inicializando modem al estilo factory")

    machine.Pin(POWERON_PIN, machine.Pin.OUT).value(1)
    machine.Pin(DTR_PIN, machine.Pin.OUT).value(0)

    rst = machine.Pin(RESET_PIN, machine.Pin.OUT)
    log("Aplicando reset de hardware")
    rst.value(1)
    time.sleep_ms(100)
    rst.value(0)
    time.sleep_ms(2600)
    rst.value(1)

    pwrkey = machine.Pin(PWRKEY_PIN, machine.Pin.OUT)
    log("Aplicando pulso PWRKEY")
    pwrkey.value(0)
    time.sleep_ms(100)
    pwrkey.value(1)
    time.sleep_ms(1200)
    pwrkey.value(0)

    time.sleep(3)


def sync_modem():
    for i in range(6):
        res = send_at("AT", 600)
        if "OK" in res:
            log("Modem listo en intento %d" % (i + 1))
            return True
        time.sleep(1)
    return False


def init_gnss_factory_sequence():
    log("Aplicando secuencia GNSS ganadora")
    send_at("AT+CGNSSPWR?", 800)
    send_at("AT+CGNSSPWR=0", 1200)
    send_at("AT+CGNSSTST=0", 800)
    send_at("AT+CGNSSPORTSWITCH=1,0", 1200)
    send_at("AT+CGNSSIPR=115200", 1000)
    send_at("AT+CGNSSMODE=3", 1000)
    send_at("AT+CGNSSNMEA=1,1,1,1,1,1,0,0", 1200)
    send_at("AT+CGNSSTST=1", 1000)
    send_at("AT+CGNSSPORTSWITCH=0,1", 1200)
    send_at("AT+CGNSSPWR=1", 2000)
    log("Inicializando secuencia para activar datos móviles y apuntar el request HTTP")
    send_at("AT+CSQ", 1000)
    send_at("AT+CREG?", 2000)
    send_at('AT+CGDCONT=1,"IP","internet.digitel.ve"', 2000)
    send_at("AT+CGACT=1,1", 1000)
    send_at("AT+HTTPINIT", 500)
    log("Disparando adquisicion GNSS con CGDRT=4,1")
    send_at("AT+CGDRT=4,1", 1000)
    send_at("AT+CGSETV=4,1", 1000)
    log("Secuencia GNSS aplicada")


def parse_gps(raw):
    try:
        if "+CGNSSINFO:" not in raw:
            return None
        data = raw.split("+CGNSSINFO:", 1)[1].strip()
        if not data or ",,,,,,,," in data or "ERROR" in data:
            return None
        fields = [x.strip() for x in data.split(",")]
        if len(fields) < 13:
            return None

        return {
            "lat": fields[5] + " " + fields[6],
            "lon": fields[7] + " " + fields[8],
            "datetime": fields[9] + " " + fields[10],
            "alt": fields[11],
            "speed": fields[12],
            "sats": fields[-1],
        }
    except Exception:
        return None


def auto_cycle():
    log("Modo AUTO: consultando CGNSSINFO")
    res = send_at("AT+CGNSSINFO", 2200)
    gps_data = parse_gps(res)
    coords = ()
    if gps_data:
        print(">>> FIX GNSS")
        print(" Latitud:   {}".format(gps_data["lat"]))
        print(" Longitud:  {}".format(gps_data["lon"]))
        print(" Altitud:   {} m".format(gps_data["alt"]))
        print(" Velocidad: {}".format(gps_data["speed"]))
        print(" Fecha/Hora: {}".format(gps_data["datetime"]))
        print(" Satelites: {}".format(gps_data["sats"]))
        coords = (gps_data["lat"], gps_data["lon"])
    else:
        print("[AUTO] Sin fix GNSS")
    
    return coords


def main():
    log("Iniciando get_gps.py")
    boot_factory_like()

    if not sync_modem():
        log("El modem no respondio a AT")
        return

    init_gnss_factory_sequence()
    log("MODO ACTUAL: AUTO (CGNSSINFO cada 10s)")

    while True:
        coords = auto_cycle()
        http_get_coords(coords)
        time.sleep(10)
        


try:
    main()
except KeyboardInterrupt:
    print("\nProceso detenido.")

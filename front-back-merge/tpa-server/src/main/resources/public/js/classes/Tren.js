export class Tren {
    constructor(id, latitud, longitud, asientosDisponibles = 9) {
        this.id = id;
        this.latitud = latitud;
        this.longitud = longitud;
        this.asientosDisponibles = asientosDisponibles;
    }
}

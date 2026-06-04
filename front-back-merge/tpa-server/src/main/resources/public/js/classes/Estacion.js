export class Estacion {
    constructor(id, nombre, latitud, longitud, contador = 0) {
        this.id = id;
        this.nombre = nombre;
        this.latitud = latitud;
        this.longitud = longitud;
        this.contador = contador;
    }
}

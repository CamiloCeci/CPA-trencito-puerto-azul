const BASE_URL = 'http://localhost:8080/api/v1';

export const MapService = {
    async fetchTrenPosition() {
        const response = await fetch(`${BASE_URL}/gps/`);
        if (!response.ok) return null;
        return await response.json();
    },

    async fetchEstaciones() {
        const response = await fetch(`${BASE_URL}/estaciones/`);
        if (!response.ok) throw new Error('Error al cargar estaciones');
        return await response.json();
    },

    async fetchTrenSeats() {
        const response = await fetch(`${BASE_URL}/tren/`);
        if (!response.ok) throw new Error('Error al cargar puestos del tren');
        return await response.json();
    },

    async createEstacion(nombre, latitud, longitud) {
        const payload = { nombre, latitude: latitud, longitude: longitud };
        const response = await fetch(`${BASE_URL}/estaciones/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Error al crear estación');
        return await response.json();
    },

    async deleteEstacion(id) {
        const response = await fetch(`${BASE_URL}/estaciones/${id}/`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar estación');
        return true;
    }
};

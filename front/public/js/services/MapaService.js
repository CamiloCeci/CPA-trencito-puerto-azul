const BASE_URL = 'http://localhost:8080/api/v1';

export const MapaService = {
    async obtenerPosicionTren() {
        const response = await fetch(`${BASE_URL}/gps/`);
        if (!response.ok) return null;
        return await response.json();
    },

    async obtenerEstaciones() {
        const response = await fetch(`${BASE_URL}/estaciones/`);
        if (!response.ok) throw new Error('Error al cargar estaciones');
        return await response.json();
    },

    async obtenerPuestosTren() {
        const response = await fetch(`${BASE_URL}/tren/`);
        if (!response.ok) throw new Error('Error al cargar puestos del tren');
        return await response.json();
    },

    async crearEstacion(nombre, latitud, longitud) {
        const payload = { nombre, latitude: latitud, longitude: longitud };
        const response = await fetch(`${BASE_URL}/estaciones/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Error al crear estación');
        return await response.json();
    },

    async actualizarEstacion(id, payload) {
        const response = await fetch(`${BASE_URL}/estaciones/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            let errorMsg = `Error ${response.status} al actualizar estación`;
            try {
                const errBody = await response.json();
                if (errBody && errBody.error) errorMsg = errBody.error;
            } catch (_) {}
            throw new Error(errorMsg);
        }
        return await response.json();
    },

    async eliminarEstacion(id) {
        const response = await fetch(`${BASE_URL}/estaciones/${id}/`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar estación');
        return true;
    }
};

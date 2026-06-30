const BASE_URL = 'http://localhost:8080/api/v1';

export const RutaService = {
    // ─── Rutas ────────────────────────────────────────────────────────────────
    
    async obtenerRutas() {
        const response = await fetch(`${BASE_URL}/rutas/`);
        if (!response.ok) throw new Error('Error al cargar rutas');
        return await response.json();
    },

    async _handleResponse(response) {
        const text = await response.text();
        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            data = text; // Es texto plano
        }

        if (!response.ok) {
            const errorMsg = (typeof data === 'object' ? data.error : data) || `Error ${response.status}`;
            throw new Error(errorMsg);
        }
        return data;
    },

    async crearRuta(nombre, estacionesIds) {
        const payload = { nombre, estacionesIds };
        const response = await fetch(`${BASE_URL}/rutas/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return this._handleResponse(response);
    },

    async editarRuta(id, nombre, estacionesIds) {
        const payload = { nombre, estacionesIds };
        const response = await fetch(`${BASE_URL}/rutas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return this._handleResponse(response);
    },

    async eliminarRuta(id) {
        const response = await fetch(`${BASE_URL}/rutas/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            await this._handleResponse(response); // Lanzará error si !ok
        }
        return true;
    },

    async activarRuta(id) {
        const response = await fetch(`${BASE_URL}/rutas/${id}/activar`, {
            method: 'PUT'
        });
        return this._handleResponse(response);
    }
};

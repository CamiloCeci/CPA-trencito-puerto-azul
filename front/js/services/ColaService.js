const BASE_URL = 'http://localhost:8080/api/v1';

export const ColaService = {
    async unirseACola(socioId, estacionId) {
        const response = await fetch(`${BASE_URL}/socio-estacion/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ socioId, estacionId })
        });
        
        if (response.status === 409) {
            throw new Error('No te puedes unir a una estación si ya estás en otra.');
        }
        
        if (!response.ok) throw new Error('Error al unirse a la cola');
        return await response.json();
    },

    async salirDeCola(socioId) {
        const response = await fetch(`${BASE_URL}/socio-estacion/socio/${socioId}/desasignar/`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Error al salir de la cola');
        return true;
    },

    async obtenerEstadoSocio(socioId) {
        const response = await fetch(`${BASE_URL}/socio-estacion/socio/${socioId}/`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Error al obtener estado del socio');
        return await response.json();
    }
};
